import crypto from "crypto";
import { config } from "../../config/index.js";

export const ACTIVE_EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSION = 1536;

function generateDeterministicVector(text: string): number[] {
  const hash = crypto.createHash("sha256").update(text).digest();
  const vec = new Array<number>(EMBEDDING_DIMENSION);
  let sumSq = 0;
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    const byte = hash[i % hash.length];
    const val = Math.sin(byte * (i + 1) + (i % 7));
    vec[i] = val;
    sumSq += val * val;
  }
  const norm = Math.sqrt(sumSq) || 1;
  return vec.map((v) => v / norm);
}

export class EmbeddingService {
  /**
   * Generates a 1536-dim semantic embedding using Gemini `gemini-embedding-001`
   * (unified across both ingestion and runtime Cloudflare Workers).
   * Falls back to OpenAI `text-embedding-3-small` if configured, or deterministic vectors in test mode.
   */
  public static async generateEmbedding(
    text: string,
    options: { allowSynthetic?: boolean } = {}
  ): Promise<{ vector: number[]; model: string } | null> {
    const cleaned = (text || "").trim().slice(0, 6000);
    if (!cleaned) return null;

    const geminiKey = process.env.GEMINI_API_KEY || config.geminiApiKey;
    if (geminiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${ACTIVE_EMBEDDING_MODEL}:embedContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: `models/${ACTIVE_EMBEDDING_MODEL}`,
              content: { parts: [{ text: cleaned }] },
              outputDimensionality: EMBEDDING_DIMENSION,
            }),
          }
        );

        if (res.ok) {
          const data: any = await res.json();
          const values = data?.embedding?.values;
          if (Array.isArray(values) && values.length === EMBEDDING_DIMENSION) {
            return { vector: values, model: ACTIVE_EMBEDDING_MODEL };
          }
        } else {
          console.warn(`[EmbeddingService] Gemini embedding HTTP ${res.status}`);
        }
      } catch (err: any) {
        console.warn("[EmbeddingService] Gemini embedding error:", err?.message || err);
      }
    }

    const openaiKey = process.env.OPENAI_API_KEY || config.openaiApiKey;
    if (openaiKey) {
      try {
        const res = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "text-embedding-3-small",
            input: cleaned,
          }),
        });

        if (res.ok) {
          const data: any = await res.json();
          const values = data?.data?.[0]?.embedding;
          if (Array.isArray(values) && values.length === EMBEDDING_DIMENSION) {
            return { vector: values, model: "text-embedding-3-small" };
          }
        }
      } catch (err: any) {
        console.warn("[EmbeddingService] OpenAI embedding error:", err?.message || err);
      }
    }

    if (options.allowSynthetic || config.nodeEnv === "test" || config.allowDevAiFallback) {
      return {
        vector: generateDeterministicVector(cleaned),
        model: "deterministic-synthetic-1536",
      };
    }

    return null;
  }

  /**
   * Batch embedding via Gemini `batchEmbedContents` (with per-item fallback).
   */
  public static async generateBatchEmbeddings(
    texts: string[],
    options: { isMock?: boolean } = {}
  ): Promise<{ vectors: number[][]; model: string }> {
    if (options.isMock) {
      return {
        vectors: texts.map((t) => generateDeterministicVector(t)),
        model: "deterministic-synthetic-1536",
      };
    }

    const geminiKey = process.env.GEMINI_API_KEY || config.geminiApiKey;
    if (geminiKey) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${ACTIVE_EMBEDDING_MODEL}:batchEmbedContents?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: texts.map((t) => ({
              model: `models/${ACTIVE_EMBEDDING_MODEL}`,
              content: { parts: [{ text: t.slice(0, 6000) }] },
              outputDimensionality: EMBEDDING_DIMENSION,
            })),
          }),
        }
      );

      if (res.ok) {
        const data: any = await res.json();
        const embeddings = (data?.embeddings || []).map((e: any) => e?.values);
        if (embeddings.length === texts.length && embeddings.every((v: any) => Array.isArray(v) && v.length === EMBEDDING_DIMENSION)) {
          return { vectors: embeddings, model: ACTIVE_EMBEDDING_MODEL };
        }
      } else {
        const errText = await res.text().catch(() => "");
        throw new Error(`Gemini batchEmbedContents HTTP ${res.status}: ${errText}`);
      }
    }

    const openaiKey = process.env.OPENAI_API_KEY || config.openaiApiKey;
    if (openaiKey) {
      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: texts.map((t) => t.slice(0, 8000)),
        }),
      });
      if (!res.ok) {
        throw new Error(`OpenAI Embeddings HTTP ${res.status}: ${await res.text()}`);
      }
      const data: any = await res.json();
      return {
        vectors: data.data.map((d: any) => d.embedding),
        model: "text-embedding-3-small",
      };
    }

    throw new Error("Neither GEMINI_API_KEY nor OPENAI_API_KEY is configured for embedding ingestion.");
  }
}
