-- ==============================================================================
-- CERTIFY PLATFORM — PGVECTOR & HYBRID RAG SCHEMA MIGRATION
-- ==============================================================================
-- Enables PostgreSQL vector extension for dense embedding search
-- Combines 1536-dimensional HNSW cosine indexing with tsvector GIN full-text search

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create course_embeddings table
CREATE TABLE IF NOT EXISTS "course_embeddings" (
    "id" TEXT NOT NULL,
    "chapter_id" TEXT,
    "concept_id" TEXT,
    "module_slug" TEXT NOT NULL,
    "chunk_type" TEXT NOT NULL, -- 'LESSON' | 'COMMON_MISTAKE' | 'EXAMPLE'
    "content" TEXT NOT NULL,
    "embedding" vector(1536),
    "fts" tsvector GENERATED ALWAYS AS (to_tsvector('english', "content")) STORED,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_embeddings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "course_embeddings_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "course_embeddings_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concepts"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 3. HNSW cosine similarity index for fast approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS "course_embeddings_embedding_hnsw_idx"
ON "course_embeddings" USING hnsw ("embedding" vector_cosine_ops);

-- 4. GIN index for high-speed full-text keyword retrieval (FTS)
CREATE INDEX IF NOT EXISTS "course_embeddings_fts_gin_idx"
ON "course_embeddings" USING gin ("fts");

-- 5. Scope-filtering indexes
CREATE INDEX IF NOT EXISTS "course_embeddings_module_slug_idx"
ON "course_embeddings" ("module_slug");

CREATE INDEX IF NOT EXISTS "course_embeddings_chapter_id_idx"
ON "course_embeddings" ("chapter_id");

CREATE INDEX IF NOT EXISTS "course_embeddings_chunk_type_idx"
ON "course_embeddings" ("chunk_type");
