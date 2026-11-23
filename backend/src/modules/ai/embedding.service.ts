import crypto from "crypto";
import { config } from "../../config/index.js";

/**
 * Embedding Service (1536-Dimensional Vector Space)
 *
 * Uses Google's `gemini-embedding-001` with `outputDimensionality: 1536`
 * to match the Neon PostgreSQL `vector(1536)` column and HNSW index.
 *
 * CRITICAL RAG INTEGRITY RULE:
 * Never return synthetic SHA-256 sine-wave vectors during live runtime RAG queries
 * (`allowSynthetic` defaults to `false` outside test/mock environments), because comparing
 * a synthetic query vector against real `gemini-embedding-001` vectors in pgvector
 * produces random cosine similarity noise and masks the PostgreSQL FTS fallback.
 */
export class EmbeddingService {
  public static readonly MODEL_NAME = "gemini-embedding-001";
  public static readonly DIMENSIONS = 1536;

  /**
   * Generates a 1536-dimensional embedding vector for a single text string.
   */
  public static async generateEmbedding(
    text: string,
    options: { isMock?: boolean; allowSynthetic?: boolean } = {}
  ): Promise<{ vector: number[]; model: string }> {
    const cleanText = text.replace(/\s+/g, " ").trim();
    const useSyntheticFallback =
      Boolean(options.isMock) ||
      Boolean(options.allowSynthetic) ||
      config.nodeEnv === "test";

    if (options.isMock) {
      return {
        vector: this.generateDeterministicSyntheticVector(cleanText),
        model: "deterministic-synthetic-1536",
      };
    }

    const apiKey = config.geminiApiKey;
    if (!apiKey) {
      if (useSyntheticFallback) {
        return {
          vector: this.generateDeterministicSyntheticVector(cleanText),
          model: "deterministic-synthetic-1536",
        };
      }
      throw new Error(
        "GEMINI_API_KEY is required for live 1536-dimensional embedding generation."
      );
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.MODEL_NAME}:embedContent?key=${apiKey}`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: `models/${this.MODEL_NAME}`,
          content: {
            parts: [{ text: cleanText.slice(0, 8000) }],
          },
          outputDimensionality: this.DIMENSIONS,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        throw new Error(
          `Gemini Embedding API error (${response.status}): ${errBody.slice(0, 300)}`
        );
      }

      const data = (await response.json()) as {
        embedding?: { values?: number[] };
      };

      const values = data?.embedding?.values;
      if (!Array.isArray(values) || values.length !== this.DIMENSIONS) {
        throw new Error(
          `Invalid embedding dimensions returned: expected ${this.DIMENSIONS}, got ${values?.length ?? 0}`
        );
      }

      return {
        vector: this.normalizeL2(values),
        model: this.MODEL_NAME,
      };
    } catch (err) {
      if (useSyntheticFallback) {
        return {
          vector: this.generateDeterministicSyntheticVector(cleanText),
          model: "deterministic-synthetic-1536",
        };
      }
      throw err;
    }
  }

  /**
   * Batch generates 1536-dimensional embeddings using `batchEmbedContents`
   * to minimize round-trips during curriculum ingestion.
   */
  public static async generateBatchEmbeddings(
    texts: string[],
    options: { isMock?: boolean; allowSynthetic?: boolean } = {}
  ): Promise<{ vectors: number[][]; model: string }> {
    const useSyntheticFallback =
      Boolean(options.isMock) ||
      Boolean(options.allowSynthetic) ||
      config.nodeEnv === "test";

    if (options.isMock) {
      return {
        vectors: texts.map((t) => this.generateDeterministicSyntheticVector(t)),
        model: "deterministic-synthetic-1536",
      };
    }

    const apiKey = config.geminiApiKey;
    if (!apiKey) {
      if (useSyntheticFallback) {
        return {
          vectors: texts.map((t) => this.generateDeterministicSyntheticVector(t)),
          model: "deterministic-synthetic-1536",
        };
      }
      throw new Error("GEMINI_API_KEY is required for live batch embeddings.");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.MODEL_NAME}:batchEmbedContents?key=${apiKey}`;

    const requests = texts.map((text) => ({
      model: `models/${this.MODEL_NAME}`,
      content: {
        parts: [{ text: text.replace(/\s+/g, " ").trim().slice(0, 8000) }],
      },
      outputDimensionality: this.DIMENSIONS,
    }));

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requests }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      throw new Error(
        `Gemini Batch Embedding API error (${response.status}): ${errBody.slice(0, 300)}`
      );
    }

    const data = (await response.json()) as {
      embeddings?: Array<{ values?: number[] }>;
    };

    if (!Array.isArray(data.embeddings) || data.embeddings.length !== texts.length) {
      throw new Error("Batch embedding count mismatch from Gemini API");
    }

    const vectors = data.embeddings.map((e) => {
      if (!Array.isArray(e.values) || e.values.length !== this.DIMENSIONS) {
        throw new Error(`Invalid dimension in batch item: ${e.values?.length}`);
      }
      return this.normalizeL2(e.values);
    });

    return { vectors, model: this.MODEL_NAME };
  }

  /**
   * L2-normalizes a vector so cosine similarity and inner product are unit-consistent.
   */
  public static normalizeL2(vec: number[]): number[] {
    let sumSq = 0;
    for (let i = 0; i < vec.length; i++) {
      sumSq += vec[i] * vec[i];
    }
    const norm = Math.sqrt(sumSq);
    if (norm === 0) return vec;
    return vec.map((v) => Number((v / norm).toFixed(6)));
  }

  /**
   * Deterministic 1536-dim synthetic vector used ONLY in explicit `--mock` or unit test runs.
   */
  public static generateDeterministicSyntheticVector(seedText: string): number[] {
    const hash = crypto.createHash("sha256").update(seedText).digest();
    const vector: number[] = new Array(this.DIMENSIONS);
    for (let i = 0; i < this.DIMENSIONS; i++) {
      const byte = hash[i % hash.length];
      const angle = (byte / 255) * Math.PI * 2 + i * 0.013;
      vector[i] = Math.sin(angle);
    }
    return this.normalizeL2(vector);
  }
}
