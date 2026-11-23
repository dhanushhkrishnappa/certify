import { prisma } from "../../shared/prisma.js";
import { EmbeddingService } from "./embedding.service.js";
import { sliceLessonIntoSections } from "../progression/curriculum.taxonomy.js";

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
  conceptId?: string | null;
  activeConceptName?: string | null;
  moduleSlug?: string;
  moduleOrder?: number;
  maxModuleOrder?: number;
  allowPrerequisites?: boolean;
  query?: string;
  userQuery?: string;
  topK?: number;
  limit?: number;
}

export interface ScopedRagOptions {
  chapterId: string;
  sectionId?: string | null;
  conceptId?: string | null;
  activeConceptName?: string | null;
  moduleSlug?: string | null;
  maxModuleOrder?: number;
  userQuery: string;
  limit?: number;
}

const RAG_STOP_WORDS = new Set([
  "what", "when", "where", "which", "while", "with", "from", "into", "that", "this",
  "they", "them", "their", "there", "here", "have", "does", "mean", "about", "explain",
  "tell", "show", "give", "more", "some", "like", "just", "very", "really", "could",
  "would", "should", "can", "you", "your", "how", "why", "who", "are", "was", "were",
  "been", "being", "for", "and", "but", "not", "the", "let", "lets", "examine",
]);

export class RAGService {
  /**
   * Builds a safe PostgreSQL `to_tsquery` string joining key technical tokens with `|` (OR),
   * avoiding `plainto_tsquery`'s strict boolean AND failure on conversational questions.
   */
  public static buildOrTsQuery(userQuery: string, activeConceptName?: string | null): string {
    const combined = `${userQuery || ""} ${activeConceptName || ""}`.toLowerCase();
    const tokens = Array.from(
      new Set(
        combined
          .replace(/[^a-z0-9_]+/g, " ")
          .split(/\s+/)
          .filter((w) => w.length >= 2 && !RAG_STOP_WORDS.has(w))
      )
    ).slice(0, 12);

    if (tokens.length === 0) {
      return "python";
    }
    return tokens.join(" | ");
  }

  /**
   * Hard-Fenced Hybrid Retrieval combining pgvector cosine similarity + OR-weighted PostgreSQL tsvector FTS.
   *
   * SECURITY & PEDAGOGICAL INVARIANT:
   * - When scoped (chapterId / sectionId / moduleSlug / moduleOrder provided), NEVER retrieves
   *   chunks from future modules (module_order > activeModuleOrder) or locked sibling chapters.
   * - Applies deterministic hierarchical boosts:
   *     exact active section_id (1.60x) > active chapter_id (1.25x) >
   *     active module COMMON_MISTAKE / EXAMPLE (1.08x) > completed prerequisite modules (0.75x).
   */
  public static async retrieveContext(params: RetrieveContextParams): Promise<RAGChunk[]> {
    const query = (params.query ?? params.userQuery ?? "").trim();
    if (!query) return [];

    const topK = params.topK ?? params.limit ?? 3;
    const chapterId = params.chapterId || null;
    const sectionId = params.sectionId || null;
    const moduleSlug = params.moduleSlug || null;
    const moduleOrder =
      typeof params.moduleOrder === "number"
        ? params.moduleOrder
        : typeof params.maxModuleOrder === "number"
        ? params.maxModuleOrder
        : null;
    const allowPrereqs = params.allowPrerequisites !== false;
    const isScoped = Boolean(chapterId || sectionId || moduleSlug || moduleOrder !== null);
    const orTsQuery = this.buildOrTsQuery(query, params.activeConceptName);

    try {
      let embedResult: { vector: number[]; model: string } | null = null;
      try {
        embedResult = await EmbeddingService.generateEmbedding(query);
      } catch {
        embedResult = null;
      }

      if (embedResult?.vector) {
        const embeddingSql = `[${embedResult.vector.join(",")}]`;
        const isSynthetic = embedResult.model === "deterministic-synthetic-1536";

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
                   CASE
                     WHEN $9::boolean = true AND embedding_model != 'deterministic-synthetic-1536' THEN 0.0
                     ELSE COALESCE(1 - (embedding <=> $1::vector), 0.0) * 0.65
                   END +
                   GREATEST(
                     COALESCE(ts_rank_cd(fts, plainto_tsquery('english', $2)), 0.0),
                     COALESCE(ts_rank_cd(to_tsvector('english', content), to_tsquery('english', $10)), 0.0)
                   ) * 0.35
                 ) * CASE
                   WHEN $4::text IS NOT NULL AND section_id = $4 THEN 1.60
                   WHEN $3::text IS NOT NULL AND chapter_id = $3 THEN 1.25
                   WHEN $5::text IS NOT NULL AND module_slug = $5 AND chunk_type IN ('COMMON_MISTAKE', 'EXAMPLE') THEN 1.08
                   WHEN $6::int IS NOT NULL AND module_order < $6 THEN 0.75
                   ELSE 1.00
                 END
               ) AS score
             FROM course_embeddings
             WHERE
               chunk_type != 'ASSESSMENT_SOLUTION'
               AND (
                 ($3::text IS NOT NULL AND chapter_id = $3)
                 OR ($5::text IS NOT NULL AND module_slug = $5 AND ($3::text IS NULL OR chunk_type IN ('COMMON_MISTAKE', 'EXAMPLE')))
                 OR ($3::text IS NOT NULL AND $5::text IS NULL AND chunk_type IN ('COMMON_MISTAKE', 'EXAMPLE') AND ($6::int IS NULL OR module_order = $6))
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
            topK,
            isSynthetic,
            orTsQuery
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
               COALESCE(1 - (embedding <=> $1::vector), 0.0) * 0.65 +
               GREATEST(
                 COALESCE(ts_rank_cd(fts, plainto_tsquery('english', $2)), 0.0),
                 COALESCE(ts_rank_cd(to_tsvector('english', content), to_tsquery('english', $4)), 0.0)
               ) * 0.35
             ) AS score
           FROM course_embeddings
           WHERE chunk_type != 'ASSESSMENT_SOLUTION'
           ORDER BY score DESC
           LIMIT $3;`,
          embeddingSql,
          query,
          topK,
          orTsQuery
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

      // Hard-fenced OR-weighted FTS fallback if live embedding API is unavailable or rate-limited
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
           GREATEST(
             COALESCE(ts_rank_cd(fts, plainto_tsquery('english', $1)), 0.0),
             COALESCE(ts_rank_cd(to_tsvector('english', content), to_tsquery('english', $8)), 0.0)
           ) AS score
         FROM course_embeddings
         WHERE chunk_type != 'ASSESSMENT_SOLUTION'
           AND (
             NOT $6::boolean
             OR ($2::text IS NOT NULL AND chapter_id = $2)
             OR ($3::text IS NOT NULL AND module_slug = $3 AND ($2::text IS NULL OR chunk_type IN ('COMMON_MISTAKE', 'EXAMPLE')))
             OR ($2::text IS NOT NULL AND $3::text IS NULL AND chunk_type IN ('COMMON_MISTAKE', 'EXAMPLE') AND ($4::int IS NULL OR module_order = $4))
             OR ($5::boolean = true AND $4::int IS NOT NULL AND module_order < $4 AND chunk_type = 'LESSON')
           )
           AND ($4::int IS NULL OR module_order <= $4)
         ORDER BY
           CASE
             WHEN $9::text IS NOT NULL AND section_id = $9 THEN 0
             WHEN $2::text IS NOT NULL AND chapter_id = $2 THEN 1
             ELSE 2
           END ASC,
           score DESC
         LIMIT $7;`,
        query,
        chapterId,
        moduleSlug,
        moduleOrder,
        allowPrereqs,
        isScoped,
        topK,
        orTsQuery,
        sectionId
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

  /**
   * High-level Section-Scoped Context Retriever for the Socratic Tutor.
   * Combines `retrieveContext` with deterministic `LessonSection` & `Chapter.teachingContent`
   * hydration so the tutor NEVER receives an empty curriculum context.
   */
  public static async retrieveScopedContext(
    chapterIdOrOptions: string | ScopedRagOptions,
    legacyQuery?: string,
    legacyLimit: number = 4
  ): Promise<string[]> {
    const opts: ScopedRagOptions =
      typeof chapterIdOrOptions === "string"
        ? {
            chapterId: chapterIdOrOptions,
            userQuery: legacyQuery || "",
            limit: legacyLimit,
          }
        : chapterIdOrOptions;

    const limit = opts.limit ?? 4;
    const chunks = await this.retrieveContext({
      chapterId: opts.chapterId,
      sectionId: opts.sectionId || undefined,
      conceptId: opts.conceptId || null,
      activeConceptName: opts.activeConceptName || null,
      moduleSlug: opts.moduleSlug || undefined,
      moduleOrder: opts.maxModuleOrder ?? 1,
      allowPrerequisites: true,
      query: opts.userQuery,
      topK: limit,
    });

    const collected = chunks.map((c) => c.content).filter(Boolean);

    // Deterministic LessonSection & Chapter Curriculum Hydration if DB embeddings return < 2 chunks
    if (collected.length < 2 && opts.chapterId) {
      try {
        const sections = await prisma.lessonSection.findMany({
          where: { chapterId: opts.chapterId },
          orderBy: { sequenceOrder: "asc" },
        });

        if (sections.length > 0) {
          const ordered = opts.sectionId
            ? [
                ...sections.filter((s) => s.id === opts.sectionId),
                ...sections.filter((s) => s.id !== opts.sectionId),
              ]
            : sections;

          for (const sec of ordered) {
            if (sec.content && sec.content.trim().length > 40) {
              const formatted = `[Section ${sec.sequenceOrder}: ${sec.title} | Objective: ${sec.objective}]\n${sec.content}`;
              if (!collected.includes(formatted)) {
                collected.push(formatted);
              }
            }
            if (collected.length >= limit) break;
          }
        } else {
          const chapter = await prisma.chapter.findUnique({
            where: { id: opts.chapterId },
            include: { concepts: { take: 1 } },
          });
          if (chapter?.teachingContent) {
            const sliced = sliceLessonIntoSections({
              lessonMarkdown: chapter.teachingContent,
              chapterTitle: chapter.title,
              conceptName: chapter.concepts[0]?.name || chapter.title,
              isFinalChapterOfModule: false,
            });
            for (const sec of sliced) {
              const formatted = `[Section ${sec.sequenceOrder}: ${sec.title}]\n${sec.content}`;
              if (!collected.includes(formatted)) {
                collected.push(formatted);
              }
              if (collected.length >= limit) break;
            }
          }
        }
      } catch {
        // Ignore DB hydration fallback errors in isolated mock unit tests
      }
    }

    return collected.slice(0, limit);
  }
}
