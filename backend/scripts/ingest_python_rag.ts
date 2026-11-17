import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { prisma } from "../src/shared/prisma.js";
import { EmbeddingService } from "../src/modules/ai/embedding.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface IngestionChunk {
  id: string;
  moduleSlug: string;
  moduleOrder: number;
  conceptSlug: string | null;
  sectionOrder: number | null; // 1 = Intuition, 2 = Mechanics, 3 = Pitfalls, 4 = Summary
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

function inferSectionOrderFromHeading(sectionText: string): number {
  const m = sectionText.match(/^##\s+(\d+)\./);
  if (!m) return 1;
  const num = parseInt(m[1], 10);
  if (num <= 5) return 1; // CONCEPT_INTUITION
  if (num <= 12) return 2; // TECHNICAL_MECHANICS
  if (num <= 17) return 3; // PITFALLS_AND_DEBUGGING
  return 4; // CHAPTER_CHECKPOINT / SUMMARY
}

function chunkLessonMarkdown(
  content: string,
  moduleSlug: string,
  moduleOrder: number,
  conceptSlug: string | null,
  fileName: string
): IngestionChunk[] {
  if (fileName.toLowerCase().includes("research")) {
    throw new Error("Security Policy Violation: research/ must never be ingested into RAG.");
  }

  const prefix = `[Course: Python Fundamentals | Module ${String(moduleOrder).padStart(2, "0")}: ${moduleSlug}${
    conceptSlug ? ` | Concept: ${conceptSlug}` : ""
  }]\n\n`;

  const headingBlocks = content.split(/\n(?=##\s+)/g);
  const groupedBySection = new Map<number, string[]>();

  for (const block of headingBlocks) {
    const trimmed = block.trim();
    if (!trimmed || trimmed.startsWith("## Lesson Metadata") || trimmed.startsWith("# ")) continue;
    const secOrder = inferSectionOrderFromHeading(trimmed);
    const list = groupedBySection.get(secOrder) || [];
    list.push(trimmed);
    groupedBySection.set(secOrder, list);
  }

  const chunks: IngestionChunk[] = [];
  for (const [secOrder, parts] of groupedBySection.entries()) {
    const body = parts.join("\n\n");
    const fullText = prefix + body;
    const chunkId = crypto
      .createHash("sha256")
      .update(`${moduleSlug}:${fileName}:sec${secOrder}`)
      .digest("hex")
      .slice(0, 32);

    chunks.push({
      id: `chunk-les-${chunkId}`,
      moduleSlug,
      moduleOrder,
      conceptSlug,
      sectionOrder: secOrder,
      chunkType: "LESSON",
      content: fullText,
      sourceFile: fileName,
    });
  }

  return chunks;
}

function chunkCommonMistakes(
  content: string,
  moduleSlug: string,
  moduleOrder: number,
  fileName: string
): IngestionChunk[] {
  if (fileName.toLowerCase().includes("research")) {
    throw new Error("Security Policy Violation: research/ must never be ingested into RAG.");
  }

  const prefix = `[Course: Python Fundamentals | Module ${String(moduleOrder).padStart(2, "0")}: ${moduleSlug} | Type: Common Mistake & Socratic Guidance]\n\n`;
  const mistakes = content.split(/\n(?=##\s+Mistake\s+\d+:)/gi);
  const chunks: IngestionChunk[] = [];

  let index = 0;
  for (const m of mistakes) {
    const trimmed = m.trim();
    if (!trimmed || trimmed.startsWith("# Module")) continue;

    const fullText = prefix + trimmed;
    const chunkId = crypto
      .createHash("sha256")
      .update(`${moduleSlug}:mistake:${index}`)
      .digest("hex")
      .slice(0, 32);

    chunks.push({
      id: `chunk-mst-${chunkId}`,
      moduleSlug,
      moduleOrder,
      conceptSlug: null,
      sectionOrder: 3, // Pitfalls & Debugging section
      chunkType: "COMMON_MISTAKE",
      content: fullText,
      sourceFile: fileName,
    });
    index++;
  }

  return chunks;
}

export async function runIngestion(options: { isMock?: boolean } = {}) {
  const isMock = options.isMock ?? (process.argv.includes("--mock") || process.argv.includes("--dry-run"));
  console.log(`Starting Section-Aware RAG Ingestion Pipeline (Mode: ${isMock ? "MOCK" : "LIVE GEMINI 1536-DIM"})...`);

  const courseBaseDir = resolveCourseDir();
  const modulesDir = path.join(courseBaseDir, "modules");
  const modDirNames = fs
    .readdirSync(modulesDir)
    .filter((f) => fs.statSync(path.join(modulesDir, f)).isDirectory())
    .sort();

  // Load Concept + Chapter + Section foreign keys from Neon
  const dbConcepts = await prisma.concept.findMany({
    select: {
      id: true,
      slug: true,
      chapterId: true,
      chapter: {
        select: {
          sections: {
            select: { id: true, sequenceOrder: true },
          },
        },
      },
    },
  });

  const conceptMap = new Map<
    string,
    { id: string; chapterId: string; sectionMap: Map<number, string> }
  >();
  for (const c of dbConcepts) {
    const sMap = new Map<number, string>();
    for (const s of c.chapter.sections) {
      sMap.set(s.sequenceOrder, s.id);
    }
    conceptMap.set(c.slug, { id: c.id, chapterId: c.chapterId, sectionMap: sMap });
  }

  const allChunks: IngestionChunk[] = [];

  for (const modDirName of modDirNames) {
    const modDir = path.join(modulesDir, modDirName);
    const modJsonPath = path.join(modDir, "module.json");
    if (!fs.existsSync(modJsonPath)) continue;

    const modMeta = JSON.parse(fs.readFileSync(modJsonPath, "utf-8"));
    const moduleSlug = modMeta.slug || modDirName.replace(/^module-\d+-/, "");
    const moduleOrder = modMeta.sequenceOrder || parseInt(modDirName.match(/\d+/)?.[0] || "1", 10);

    const lessonsDir = path.join(modDir, "lessons");
    if (fs.existsSync(lessonsDir)) {
      const lessonFiles = fs.readdirSync(lessonsDir).filter((f) => f.endsWith(".md")).sort();
      for (const lf of lessonFiles) {
        const text = fs.readFileSync(path.join(lessonsDir, lf), "utf-8");
        const conceptMatch = text.match(/Concept ID:[^`\n]*`?([a-zA-Z0-9_-]+)`?/i);
        const conceptSlug = conceptMatch ? conceptMatch[1].trim() : null;
        allChunks.push(...chunkLessonMarkdown(text, moduleSlug, moduleOrder, conceptSlug, lf));
      }
    }

    const mistakesPath = path.join(modDir, "common-mistakes", "COMMON_MISTAKES.md");
    if (fs.existsSync(mistakesPath)) {
      const text = fs.readFileSync(mistakesPath, "utf-8");
      allChunks.push(...chunkCommonMistakes(text, moduleSlug, moduleOrder, "COMMON_MISTAKES.md"));
    }
  }

  console.log(`Generated ${allChunks.length} section-scoped chunks across 10 modules.`);

  // Remove only stale/legacy chunks not in current chunk set (makes ingestion resumable!)
  const validIds = allChunks.map((c) => c.id);
  const existingLive = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `SELECT id FROM "course_embeddings" WHERE embedding_model = 'gemini-embedding-001' AND embedding IS NOT NULL;`
  );
  const existingSet = new Set(existingLive.map((r) => r.id));

  // Delete any old mock/unscoped chunks
  await prisma.$executeRawUnsafe(
    `DELETE FROM "course_embeddings" WHERE embedding_model != 'gemini-embedding-001' OR id != ALL($1::text[]);`,
    validIds
  );

  const pendingChunks = isMock ? allChunks : allChunks.filter((c) => !existingSet.has(c.id));
  console.log(
    `Already embedded (live): ${existingSet.size} | Pending to embed: ${pendingChunks.length}`
  );

  const BATCH_SIZE = 20;
  let upsertedCount = existingSet.size;

  for (let i = 0; i < pendingChunks.length; i += BATCH_SIZE) {
    const batch = pendingChunks.slice(i, i + BATCH_SIZE);
    let embedBatchRes: { vectors: number[][]; model: string } | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        embedBatchRes = await EmbeddingService.generateBatchEmbeddings(
          batch.map((c) => c.content),
          { isMock }
        );
        break;
      } catch (err: any) {
        if (String(err?.message || "").includes("429") && attempt < 3) {
          console.log(`\n[RAG Ingestion] Hit Gemini 100/min quota — waiting 62s before retrying batch (attempt ${attempt}/3)...`);
          await new Promise((r) => setTimeout(r, 62000));
        } else {
          throw err;
        }
      }
    }
    if (!embedBatchRes) throw new Error("Failed to embed batch after retries");
    const { vectors, model } = embedBatchRes;

    for (let j = 0; j < batch.length; j++) {
      const chunk = batch[j];
      const embeddingSql = `[${vectors[j].join(",")}]`;
      const matched = chunk.conceptSlug ? conceptMap.get(chunk.conceptSlug) : null;
      const chapterId = matched?.chapterId || null;
      const conceptId = matched?.id || null;
      const sectionId =
        matched && chunk.sectionOrder ? matched.sectionMap.get(chunk.sectionOrder) || null : null;

      await prisma.$executeRawUnsafe(
        `INSERT INTO "course_embeddings"
          ("id", "chapter_id", "section_id", "concept_id", "module_slug", "module_order", "chunk_type", "embedding_model", "content", "embedding", "created_at")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::vector, NOW())
         ON CONFLICT ("id") DO UPDATE SET
           "chapter_id" = EXCLUDED."chapter_id",
           "section_id" = EXCLUDED."section_id",
           "concept_id" = EXCLUDED."concept_id",
           "module_order" = EXCLUDED."module_order",
           "embedding_model" = EXCLUDED."embedding_model",
           "content" = EXCLUDED."content",
           "embedding" = EXCLUDED."embedding";`,
        chunk.id,
        chapterId,
        sectionId,
        conceptId,
        chunk.moduleSlug,
        chunk.moduleOrder,
        chunk.chunkType,
        model,
        chunk.content,
        embeddingSql
      );

      upsertedCount++;
    }

    process.stdout.write(`\rUpserted ${upsertedCount} / ${allChunks.length} chunks (${model})...`);
  }

  console.log(`\n\n[RAG Ingestion] Successfully upserted ${upsertedCount} section-fenced live embeddings!`);
}

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
