import { prisma } from "../../shared/prisma.js";
import { EmbeddingService } from "./embedding.service.js";

export interface RAGChunk {
  id: string;
  chapterId: string | null;
  sectionId: string | null;
  conceptId: string | null;
  moduleSlug: string;
  moduleOrder: number;
  chunkType: string;
  content: string;
  score: number;
}

export interface RetrieveContextParams {
  chapterId?: string;
  sectionId?: string;
  moduleSlug?: string;
  moduleOrder?: number;
  allowPrerequisites?: boolean;
  query: string;
  topK?: number;
}

export class RAGService {
  /**
   * Hard-Fenced Hybrid Retrieval combining pgvector cosine similarity + PostgreSQL tsvector FTS.
   *
   * SECURITY & PEDAGOGICAL INVARIANT:
   * - When scoped (chapterId / sectionId / moduleSlug / moduleOrder provided), NEVER retrieves
   *   chunks from future modules (module_order > activeModuleOrder) or locked sibling chapters.
   * - Unfiltered global fallback has been permanently eliminated.
   * - Applies deterministic hierarchical boosts:
   *     exact active section_id (1.60x) > active chapter_id (1.25x) >
   *     active module COMMON_MISTAKE (1.05x) > completed prerequisite modules (0.75x).
   */
  public static async retrieveContext(params: RetrieveContextParams): Promise<RAGChunk[]> {
    const query = (params.query || "").trim();
    if (!query) return [];

    const topK = params.topK || 3;
    const chapterId = params.chapterId || null;
    const sectionId = params.sectionId || null;
    const moduleSlug = params.moduleSlug || null;
    const moduleOrder = typeof params.moduleOrder === "number" ? params.moduleOrder : null;
    const allowPrereqs = params.allowPrerequisites !== false;
    const isScoped = Boolean(chapterId || sectionId || moduleSlug || moduleOrder !== null);

    try {
      const embedResult = await EmbeddingService.generateEmbedding(query);

      if (embedResult?.vector) {
        const embeddingSql = `[${embedResult.vector.join(",")}]`;

        if (isScoped) {
          const results = await prisma.$queryRawUnsafe<any[]>(
            `SELECT
               id,
               chapter_id AS "chapterId",
               section_id AS "sectionId",
               concept_id AS "conceptId",
               module_slug AS "moduleSlug",
               module_order AS "moduleOrder",
               chunk_type AS "chunkType",
               content,
               (
                 (
                   COALESCE(1 - (embedding <=> $1::vector), 0.0) * 0.70 +
                   COALESCE(ts_rank_cd(fts, plainto_tsquery('english', $2)), 0.0) * 0.30
                 ) * CASE
                   WHEN $4::text IS NOT NULL AND section_id = $4 THEN 1.60
                   WHEN $3::text IS NOT NULL AND chapter_id = $3 THEN 1.25
                   WHEN $5::text IS NOT NULL AND module_slug = $5 AND chunk_type = 'COMMON_MISTAKE' THEN 1.05
                   WHEN $6::int IS NOT NULL AND module_order < $6 THEN 0.75
                   ELSE 1.00
                 END
               ) AS score
             FROM course_embeddings
             WHERE
               chunk_type != 'ASSESSMENT_SOLUTION'
               AND (
                 -- Exact active chapter match
                 ($3::text IS NOT NULL AND chapter_id = $3)
                 -- Active module common mistakes (only when chapterId is scoped or module-only scope)
                 OR ($5::text IS NOT NULL AND module_slug = $5 AND ($3::text IS NULL OR (chapter_id IS NULL AND chunk_type = 'COMMON_MISTAKE')))
                 -- Already-completed prerequisite modules ONLY (strictly < activeModuleOrder)
                 OR ($7::boolean = true AND $6::int IS NOT NULL AND module_order < $6 AND chunk_type = 'LESSON')
               )
               AND ($6::int IS NULL OR module_order <= $6)
             ORDER BY score DESC
             LIMIT $8;`,
            embeddingSql,
            query,
            chapterId,
            sectionId,
            moduleSlug,
            moduleOrder,
            allowPrereqs,
            topK
          );

          return (results || []).map((r) => ({
            id: r.id,
            chapterId: r.chapterId,
            sectionId: r.sectionId ?? null,
            conceptId: r.conceptId,
            moduleSlug: r.moduleSlug,
            moduleOrder: Number(r.moduleOrder) || 1,
            chunkType: r.chunkType,
            content: r.content,
            score: Number(r.score) || 0,
          }));
        }

        // Unscoped search (used only by explicit course-wide diagnostics/tests with no scope parameters)
        const unscopedResults = await prisma.$queryRawUnsafe<any[]>(
          `SELECT
             id,
             chapter_id AS "chapterId",
             section_id AS "sectionId",
             concept_id AS "conceptId",
             module_slug AS "moduleSlug",
             module_order AS "moduleOrder",
             chunk_type AS "chunkType",
             content,
             (
               COALESCE(1 - (embedding <=> $1::vector), 0.0) * 0.70 +
               COALESCE(ts_rank_cd(fts, plainto_tsquery('english', $2)), 0.0) * 0.30
             ) AS score
           FROM course_embeddings
           WHERE chunk_type != 'ASSESSMENT_SOLUTION'
           ORDER BY score DESC
           LIMIT $3;`,
          embeddingSql,
          query,
          topK
        );

        return (unscopedResults || []).map((r) => ({
          id: r.id,
          chapterId: r.chapterId,
          sectionId: r.sectionId ?? null,
          conceptId: r.conceptId,
          moduleSlug: r.moduleSlug,
          moduleOrder: Number(r.moduleOrder) || 1,
          chunkType: r.chunkType,
          content: r.content,
          score: Number(r.score) || 0,
        }));
      }

      // Hard-fenced FTS-only fallback if embedding API is momentarily unreachable
      const ftsResults = await prisma.$queryRawUnsafe<any[]>(
        `SELECT
           id,
           chapter_id AS "chapterId",
           section_id AS "sectionId",
           concept_id AS "conceptId",
           module_slug AS "moduleSlug",
           module_order AS "moduleOrder",
           chunk_type AS "chunkType",
           content,
           ts_rank_cd(fts, plainto_tsquery('english', $1)) AS score
         FROM course_embeddings
         WHERE fts @@ plainto_tsquery('english', $1)
           AND chunk_type != 'ASSESSMENT_SOLUTION'
           AND (
             NOT $6::boolean
             OR ($2::text IS NOT NULL AND chapter_id = $2)
             OR ($3::text IS NOT NULL AND module_slug = $3 AND ($2::text IS NULL OR (chapter_id IS NULL AND chunk_type = 'COMMON_MISTAKE')))
             OR ($5::boolean = true AND $4::int IS NOT NULL AND module_order < $4 AND chunk_type = 'LESSON')
           )
           AND ($4::int IS NULL OR module_order <= $4)
         ORDER BY score DESC
         LIMIT $7;`,
        query,
        chapterId,
        moduleSlug,
        moduleOrder,
        allowPrereqs,
        isScoped,
        topK
      );

      return (ftsResults || []).map((r) => ({
        id: r.id,
        chapterId: r.chapterId,
        sectionId: r.sectionId ?? null,
        conceptId: r.conceptId,
        moduleSlug: r.moduleSlug,
        moduleOrder: Number(r.moduleOrder) || 1,
        chunkType: r.chunkType,
        content: r.content,
        score: Number(r.score) || 0,
      }));
    } catch (err: any) {
      console.warn("[RAGService] Scoped retrieval fallback triggered:", err.message || err);
      return [];
    }
  }
}
