import crypto from "crypto";
import { prisma } from "../../shared/prisma.js";
import { config } from "../../config/index.js";

export interface RAGChunk {
  id: string;
  chapterId: string | null;
  conceptId: string | null;
  moduleSlug: string;
  chunkType: string;
  content: string;
  score: number;
}

export interface RetrieveContextParams {
  chapterId?: string;
  moduleSlug?: string;
  query: string;
  topK?: number;
}

/**
 * Generates an embedding for retrieval.
 * Uses OpenAI text-embedding-3-small if configured, otherwise falls back to deterministic mock or null.
 */
async function generateQueryEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY || (config as any).openaiApiKey;
  if (!apiKey) {
    if (config.allowDevAiFallback || config.nodeEnv === "test") {
      // Deterministic synthetic 1536-dim unit vector for test/dev
      const hash = crypto.createHash("sha256").update(text).digest();
      const vec = new Array<number>(1536);
      let sumSq = 0;
      for (let i = 0; i < 1536; i++) {
        const byte = hash[i % hash.length];
        const val = Math.sin(byte * (i + 1) + (i % 7));
        vec[i] = val;
        sumSq += val * val;
      }
      const norm = Math.sqrt(sumSq) || 1;
      return vec.map((v) => v / norm);
    }
    return null;
  }

  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text.slice(0, 4000),
      }),
    });

    if (!res.ok) {
      console.warn(`[RAGService] OpenAI embedding error (HTTP ${res.status}). Falling back to FTS.`);
      return null;
    }

    const data: any = await res.json();
    return data.data?.[0]?.embedding || null;
  } catch (err) {
    console.warn("[RAGService] Error generating query embedding:", err);
    return null;
  }
}

export class RAGService {
  /**
   * Hybrid retrieval combining pgvector HNSW cosine similarity + tsvector FTS.
   * Scoped to the learner's active chapter and module, with graceful fallback.
   */
  public static async retrieveContext(params: RetrieveContextParams): Promise<RAGChunk[]> {
    const query = (params.query || "").trim();
    if (!query) return [];

    const topK = params.topK || 3;
    const chapterId = params.chapterId || null;
    const moduleSlug = params.moduleSlug || null;

    try {
      const embedding = await generateQueryEmbedding(query);

      if (embedding) {
        const embeddingSql = `[${embedding.join(",")}]`;

        // 1. Primary: Chapter/Module scoped hybrid search
        const results = await prisma.$queryRawUnsafe<any[]>(
          `SELECT
             id,
             chapter_id as "chapterId",
             concept_id as "conceptId",
             module_slug as "moduleSlug",
             chunk_type as "chunkType",
             content,
             (
               COALESCE(1 - (embedding <=> $1::vector), 0.0) * 0.75 +
               COALESCE(ts_rank_cd(fts, plainto_tsquery('english', $2)), 0.0) * 0.25
             ) as score
           FROM course_embeddings
           WHERE ($3::text IS NULL OR chapter_id = $3 OR module_slug = $4)
           ORDER BY score DESC
           LIMIT $5;`,
          embeddingSql,
          query,
          chapterId,
          moduleSlug,
          topK
        );

        if (results && results.length > 0) {
          return results.map((r) => ({
            id: r.id,
            chapterId: r.chapterId,
            conceptId: r.conceptId,
            moduleSlug: r.moduleSlug,
            chunkType: r.chunkType,
            content: r.content,
            score: Number(r.score) || 0,
          }));
        }

        // 2. Global fallback across course if no chapter chunks matched
        const fallbackResults = await prisma.$queryRawUnsafe<any[]>(
          `SELECT
             id,
             chapter_id as "chapterId",
             concept_id as "conceptId",
             module_slug as "moduleSlug",
             chunk_type as "chunkType",
             content,
             (1 - (embedding <=> $1::vector)) as score
           FROM course_embeddings
           ORDER BY embedding <=> $1::vector
           LIMIT $2;`,
          embeddingSql,
          topK
        );

        return (fallbackResults || []).map((r) => ({
          id: r.id,
          chapterId: r.chapterId,
          conceptId: r.conceptId,
          moduleSlug: r.moduleSlug,
          chunkType: r.chunkType,
          content: r.content,
          score: Number(r.score) || 0,
        }));
      }

      // FTS-only path if embeddings unavailable
      const ftsResults = await prisma.$queryRawUnsafe<any[]>(
        `SELECT
           id,
           chapter_id as "chapterId",
           concept_id as "conceptId",
           module_slug as "moduleSlug",
           chunk_type as "chunkType",
           content,
           ts_rank_cd(fts, plainto_tsquery('english', $1)) as score
         FROM course_embeddings
         WHERE fts @@ plainto_tsquery('english', $1)
           AND ($2::text IS NULL OR chapter_id = $2 OR module_slug = $3)
         ORDER BY score DESC
         LIMIT $4;`,
        query,
        chapterId,
        moduleSlug,
        topK
      );

      if (ftsResults && ftsResults.length > 0) {
        return ftsResults.map((r) => ({
          id: r.id,
          chapterId: r.chapterId,
          conceptId: r.conceptId,
          moduleSlug: r.moduleSlug,
          chunkType: r.chunkType,
          content: r.content,
          score: Number(r.score) || 0,
        }));
      }

      // If FTS has no term match, return empty array gracefully
      return [];
    } catch (err: any) {
      // Graceful fallback: return empty without throwing if table or extension is unavailable
      console.warn("[RAGService] Hybrid retrieval fallback triggered:", err.message || err);
      return [];
    }
  }
}
