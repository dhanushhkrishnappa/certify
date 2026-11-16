import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { prisma } from "../src/shared/prisma.js";
import { config } from "../src/config/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface IngestionChunk {
  id: string;
  moduleSlug: string;
  conceptId: string | null;
  chunkType: "LESSON" | "COMMON_MISTAKE" | "EXAMPLE";
  content: string;
  sourceFile: string;
}

function resolveCourseDir(): string {
  const candidates = [
    path.resolve(__dirname, "../../courses/python-fundamentals"),
    path.resolve(process.cwd(), "courses/python-fundamentals"),
    path.resolve(process.cwd(), "../courses/python-fundamentals"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, "course.json"))) {
      return candidate;
    }
  }

  throw new Error("Could not locate courses/python-fundamentals directory.");
}

/**
 * Structure-aware chunking for lessons:
 * Breaks lesson markdown into 350-500 token semantic sections while preserving
 * code blocks (```python ... ```) completely intact.
 */
function chunkLessonMarkdown(
  content: string,
  moduleSlug: string,
  conceptSlug: string | null,
  fileName: string
): IngestionChunk[] {
  // Explicit security assertion: research directory is never ingested
  if (fileName.toLowerCase().includes("research")) {
    throw new Error("Security Policy Violation: research/ must never be ingested into RAG.");
  }

  const prefix = `[Course: Python Fundamentals | Module: ${moduleSlug}${conceptSlug ? ` | Concept: ${conceptSlug}` : ""}]\n\n`;

  // Split on top-level section headings (e.g. ## 1. What is this concept?)
  const sections = content.split(/\n(?=##\s+)/g);
  const chunks: IngestionChunk[] = [];

  let currentChunk = "";
  let chunkIndex = 0;

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    // Skip metadata section from embedding chunks if too dry
    if (trimmed.startsWith("## Lesson Metadata")) {
      continue;
    }

    if ((currentChunk + "\n\n" + trimmed).length > 1800 && currentChunk.length > 400) {
      const fullText = prefix + currentChunk.trim();
      const chunkId = crypto.createHash("sha256").update(`${moduleSlug}:${fileName}:${chunkIndex}`).digest("hex").slice(0, 32);
      chunks.push({
        id: `chunk-les-${chunkId}`,
        moduleSlug,
        conceptId: conceptSlug,
        chunkType: "LESSON",
        content: fullText,
        sourceFile: fileName,
      });
      chunkIndex++;
      currentChunk = trimmed;
    } else {
      currentChunk = currentChunk ? currentChunk + "\n\n" + trimmed : trimmed;
    }
  }

  if (currentChunk.trim().length > 0) {
    const fullText = prefix + currentChunk.trim();
    const chunkId = crypto.createHash("sha256").update(`${moduleSlug}:${fileName}:${chunkIndex}`).digest("hex").slice(0, 32);
    chunks.push({
      id: `chunk-les-${chunkId}`,
      moduleSlug,
      conceptId: conceptSlug,
      chunkType: "LESSON",
      content: fullText,
      sourceFile: fileName,
    });
  }

  return chunks;
}

/**
 * Structure-aware chunking for common mistakes:
 * Breaks on ## Mistake N: headings.
 */
function chunkCommonMistakes(
  content: string,
  moduleSlug: string,
  fileName: string
): IngestionChunk[] {
  if (fileName.toLowerCase().includes("research")) {
    throw new Error("Security Policy Violation: research/ must never be ingested into RAG.");
  }

  const prefix = `[Course: Python Fundamentals | Module: ${moduleSlug} | Type: Common Mistake & Socratic Guidance]\n\n`;
  const mistakes = content.split(/\n(?=##\s+Mistake\s+\d+:)/gi);
  const chunks: IngestionChunk[] = [];

  let index = 0;
  for (const m of mistakes) {
    const trimmed = m.trim();
    if (!trimmed || trimmed.startsWith("# Module")) continue;

    const fullText = prefix + trimmed;
    const chunkId = crypto.createHash("sha256").update(`${moduleSlug}:mistake:${index}`).digest("hex").slice(0, 32);
    chunks.push({
      id: `chunk-mst-${chunkId}`,
      moduleSlug,
      conceptId: null,
      chunkType: "COMMON_MISTAKE",
      content: fullText,
      sourceFile: fileName,
    });
    index++;
  }

  return chunks;
}

/**
 * Generates 1536-dim embedding vector via OpenAI text-embedding-3-small or deterministic mock.
 */
async function generateEmbeddingsBatch(
  texts: string[],
  apiKey: string | undefined,
  isMock: boolean
): Promise<number[][]> {
  if (isMock || !apiKey) {
    if (!isMock && !apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not configured. Please set OPENAI_API_KEY in your environment or .env file (or pass --mock for offline testing)."
      );
    }

    // Generate normalized deterministic 1536-dim vectors for tests/offline
    return texts.map((t) => {
      const hash = crypto.createHash("sha256").update(t).digest();
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
    });
  }

  // Real OpenAI Embeddings API (batches of up to 40)
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: texts.map((t) => t.slice(0, 8000)),
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI Embeddings API error (HTTP ${response.status}): ${errText}`);
  }

  const resJson: any = await response.json();
  return resJson.data.map((d: any) => d.embedding);
}

export async function runIngestion(options: { isMock?: boolean } = {}) {
  const isMock = options.isMock ?? (process.argv.includes("--mock") || process.argv.includes("--dry-run"));
  const apiKey = process.env.OPENAI_API_KEY || (config as any).openaiApiKey;

  if (!apiKey && !isMock) {
    console.error(
      "\n[RAG Ingestion] Error: OPENAI_API_KEY is not configured.\n" +
        "Please set OPENAI_API_KEY in backend/.env to generate production 1536-dim embeddings.\n" +
        "(To run in offline/test mode with synthetic embeddings, use: npm run rag:ingest -- --mock)\n"
    );
    process.exit(1);
  }

  console.log(`Starting RAG Ingestion Pipeline (Mode: ${isMock ? "MOCK / SYNTHETIC" : "LIVE OPENAI"})...`);

  const courseBaseDir = resolveCourseDir();
  const modulesDir = path.join(courseBaseDir, "modules");
  const modDirNames = fs
    .readdirSync(modulesDir)
    .filter((f) => fs.statSync(path.join(modulesDir, f)).isDirectory())
    .sort();

  // Load database metadata for chapter and concept foreign key mappings
  const dbConcepts = await prisma.concept.findMany({
    select: { id: true, slug: true, chapterId: true },
  });
  const conceptMap = new Map<string, { id: string; chapterId: string }>();
  for (const c of dbConcepts) {
    conceptMap.set(c.slug, { id: c.id, chapterId: c.chapterId });
  }

  const dbModules = await prisma.module.findMany({
    include: { chapters: { select: { id: true, sequenceOrder: true }, orderBy: { sequenceOrder: "asc" } } },
  });
  const moduleFirstChapterMap = new Map<string, string>();
  for (const m of dbModules) {
    if (m.chapters.length > 0) {
      moduleFirstChapterMap.set(m.title, m.chapters[0].id);
    }
  }

  const allChunks: IngestionChunk[] = [];

  for (const modDirName of modDirNames) {
    const modDir = path.join(modulesDir, modDirName);
    const modJsonPath = path.join(modDir, "module.json");
    if (!fs.existsSync(modJsonPath)) continue;

    const modMeta = JSON.parse(fs.readFileSync(modJsonPath, "utf-8"));
    const moduleSlug = modMeta.slug || modDirName.replace(/^module-\d+-/, "");

    // 1. Ingest lessons/*.md
    const lessonsDir = path.join(modDir, "lessons");
    if (fs.existsSync(lessonsDir)) {
      const lessonFiles = fs.readdirSync(lessonsDir).filter((f) => f.endsWith(".md")).sort();
      for (const lf of lessonFiles) {
        const filePath = path.join(lessonsDir, lf);
        const text = fs.readFileSync(filePath, "utf-8");

        const conceptMatch = text.match(/Concept ID:[^`\n]*`?([a-zA-Z0-9_-]+)`?/i);
        const conceptSlug = conceptMatch ? conceptMatch[1].trim() : null;

        const chunks = chunkLessonMarkdown(text, moduleSlug, conceptSlug, lf);
        allChunks.push(...chunks);
      }
    }

    // 2. Ingest common-mistakes/COMMON_MISTAKES.md
    const mistakesPath = path.join(modDir, "common-mistakes", "COMMON_MISTAKES.md");
    if (fs.existsSync(mistakesPath)) {
      const text = fs.readFileSync(mistakesPath, "utf-8");
      const chunks = chunkCommonMistakes(text, moduleSlug, "COMMON_MISTAKES.md");
      allChunks.push(...chunks);
    }
  }

  console.log(`Generated ${allChunks.length} structure-aware chunks across 10 modules.`);
  console.log("Generating 1536-dim embeddings and upserting into course_embeddings...");

  const BATCH_SIZE = 20;
  let upsertedCount = 0;

  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map((c) => c.content);
    const embeddings = await generateEmbeddingsBatch(texts, apiKey, isMock);

    for (let j = 0; j < batch.length; j++) {
      const chunk = batch[j];
      const embedding = embeddings[j];
      const embeddingSql = `[${embedding.join(",")}]`;

      const matchedConcept = chunk.conceptId ? conceptMap.get(chunk.conceptId) : null;
      const chapterId = matchedConcept ? matchedConcept.chapterId : null;
      const conceptId = matchedConcept ? matchedConcept.id : null;

      await prisma.$executeRawUnsafe(
        `INSERT INTO "course_embeddings" ("id", "chapter_id", "concept_id", "module_slug", "chunk_type", "content", "embedding", "created_at")
         VALUES ($1, $2, $3, $4, $5, $6, $7::vector, NOW())
         ON CONFLICT ("id") DO UPDATE SET
           "chapter_id" = EXCLUDED."chapter_id",
           "concept_id" = EXCLUDED."concept_id",
           "content" = EXCLUDED."content",
           "embedding" = EXCLUDED."embedding";`,
        chunk.id,
        chapterId,
        conceptId,
        chunk.moduleSlug,
        chunk.chunkType,
        chunk.content,
        embeddingSql
      );

      upsertedCount++;
    }

    process.stdout.write(`\rUpserted ${upsertedCount} / ${allChunks.length} chunks...`);
  }

  console.log(`\n\n[RAG Ingestion] Successfully upserted ${upsertedCount} chunks into Neon course_embeddings table!`);
}

// Run if called directly as script
if (process.argv[1] && process.argv[1].endsWith("ingest_python_rag.ts")) {
  runIngestion()
    .catch((err) => {
      console.error("\n[RAG Ingestion] Fatal error:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
