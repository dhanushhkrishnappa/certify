import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../src/shared/prisma.js";
import { auth } from "../src/lib/auth.js";
import { runEnrichmentAndBackfill } from "../scripts/enrich_curriculum_and_progression.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RubricCriterionData {
  statement: string;
  weight: number;
  tierRequired: string;
}

interface ConceptData {
  conceptId: string;
  name: string;
  defaultP0: number;
  criteria: RubricCriterionData[];
}

interface LessonData {
  fileName: string;
  title: string;
  conceptId: string | null;
  estimatedMins: number;
  content: string;
}

interface QuestionData {
  questionType: string;
  conceptSlug: string;
  tier: string;
  prompt: string;
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

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_SEED !== "true") {
    throw new Error("CRITICAL: Destructive seed.ts execution is forbidden when NODE_ENV=production.");
  }

  console.log("Seeding CERTIFY database with Python Fundamentals Curriculum v2.0.0...");

  const courseBaseDir = resolveCourseDir();
  console.log(`Resolved course root: ${courseBaseDir}`);

  // 1. Read course.json
  const courseJsonRaw = fs.readFileSync(path.join(courseBaseDir, "course.json"), "utf-8");
  const courseMeta = JSON.parse(courseJsonRaw);

  // 2. Clean existing relational curriculum data for pristine state
  console.log("Clearing previous curriculum & session state...");
  await prisma.certificate.deleteMany();
  await prisma.rubricEvaluation.deleteMany();
  await prisma.assessmentAnswer.deleteMany();
  await prisma.assessmentAttempt.deleteMany();
  await prisma.masteryEvidence.deleteMany();
  await prisma.conceptMastery.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.learningSession.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.question.deleteMany();
  await prisma.rubricCriterion.deleteMany();
  await prisma.rubric.deleteMany();
  await prisma.concept.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.module.deleteMany();
  await prisma.courseVersion.deleteMany();
  await prisma.course.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();

  // 3. Create Default Users (Instructor & Student) via Better Auth & Prisma
  console.log("Creating default seed users...");
  try {
    await auth.api.signUpEmail({
      body: {
        email: "instructor@certify.edu",
        password: "Password123!",
        name: "Dr. Eleanor Vance",
        // @ts-ignore
        fullName: "Dr. Eleanor Vance",
      },
    });
  } catch {
    // Handled by upsert below
  }

  try {
    await auth.api.signUpEmail({
      body: {
        email: "learner@certify.edu",
        password: "Password123!",
        name: "Alex Chen",
        // @ts-ignore
        fullName: "Alex Chen",
      },
    });
  } catch {
    // Handled by upsert below
  }

  await prisma.user.upsert({
    where: { email: "instructor@certify.edu" },
    update: { role: "INSTRUCTOR", fullName: "Dr. Eleanor Vance", name: "Dr. Eleanor Vance" },
    create: {
      email: "instructor@certify.edu",
      role: "INSTRUCTOR",
      fullName: "Dr. Eleanor Vance",
      name: "Dr. Eleanor Vance",
    },
  });

  await prisma.user.upsert({
    where: { email: "learner@certify.edu" },
    update: { role: "STUDENT", fullName: "Alex Chen", name: "Alex Chen" },
    create: {
      email: "learner@certify.edu",
      role: "STUDENT",
      fullName: "Alex Chen",
      name: "Alex Chen",
    },
  });

  console.log("Created users: instructor@certify.edu, learner@certify.edu");

  // 4. Create Course & CourseVersion 2.0.0
  const course = await prisma.course.create({
    data: {
      slug: courseMeta.courseSlug || "python-fundamentals",
      title: courseMeta.title || "CERTIFY – Python Fundamentals",
      summary: courseMeta.summary || "Independently authored, first-principles Python engineering qualification course.",
      description: courseMeta.summary || "Master modern Python through interactive Socratic AI dialogue, conceptual problem-solving, and verified defense.",
      level: courseMeta.level || "BEGINNER",
      category: courseMeta.category || "Software Engineering",
      durationHours: courseMeta.estimatedHours || 42,
      status: courseMeta.status || "PUBLISHED",
    },
  });

  // Mark any older course versions as inactive if they exist
  await prisma.courseVersion.updateMany({
    where: { courseId: course.id },
    data: { isActive: false },
  });

  const courseVersion = await prisma.courseVersion.create({
    data: {
      courseId: course.id,
      versionNumber: courseMeta.version || "2.0.0",
      changelog: "Curriculum v2.0: 10 structured modules, 29 first-principles lessons, atomic BKT rubrics, and sandbox harnesses.",
      isActive: true,
    },
  });

  console.log(`Created Course: "${course.title}" (Version ${courseVersion.versionNumber})`);

  // 5. Discover and load all 10 modules dynamically
  const modulesDir = path.join(courseBaseDir, "modules");
  const modDirNames = fs
    .readdirSync(modulesDir)
    .filter((f) => fs.statSync(path.join(modulesDir, f)).isDirectory())
    .sort();

  let totalModules = 0;
  let totalChapters = 0;
  let totalConcepts = 0;
  let totalCriteria = 0;
  let totalQuestions = 0;

  for (const modDirName of modDirNames) {
    const modDir = path.join(modulesDir, modDirName);
    const modJsonPath = path.join(modDir, "module.json");
    if (!fs.existsSync(modJsonPath)) continue;

    const modMeta = JSON.parse(fs.readFileSync(modJsonPath, "utf-8"));
    const sequenceOrder = modMeta.sequenceOrder || parseInt(modDirName.match(/\d+/)?.[0] || "1", 10);

    const createdModule = await prisma.module.create({
      data: {
        courseVersionId: courseVersion.id,
        title: modMeta.title,
        sequenceOrder,
        description: `Covers ${modMeta.title} with interactive Socratic dialogue, code sandboxes, and verified defense.`,
      },
    });
    totalModules++;

    // Load concepts dictionary for this module
    const conceptsMap = new Map<string, ConceptData>();

    // From module.json
    if (Array.isArray(modMeta.concepts)) {
      for (const mc of modMeta.concepts) {
        const slug = mc.slug || mc.conceptId;
        const criteriaList = Array.isArray(mc.criteria)
          ? mc.criteria.map((c: any) => ({
              statement: c.statement,
              weight: c.weight ?? 0.5,
              tierRequired: c.tierRequired || "EASY",
            }))
          : [];
        conceptsMap.set(slug, {
          conceptId: slug,
          name: mc.name,
          defaultP0: mc.defaultP0 ?? 0.15,
          criteria: criteriaList,
        });
      }
    }

    // From concepts/*.json directory (may contain refined keywords and criteria)
    const conceptsDir = path.join(modDir, "concepts");
    if (fs.existsSync(conceptsDir)) {
      const cFiles = fs.readdirSync(conceptsDir).filter((f) => f.endsWith(".json"));
      for (const cf of cFiles) {
        const cRaw = JSON.parse(fs.readFileSync(path.join(conceptsDir, cf), "utf-8"));
        const slug = cRaw.conceptId || path.basename(cf, ".json");
        const existing = conceptsMap.get(slug);
        const criteriaFromRaw = Array.isArray(cRaw.rubricCriteria)
          ? cRaw.rubricCriteria.map((c: any) => ({
              statement: c.statement,
              weight: c.weight ?? 0.5,
              tierRequired: c.tierRequired || "EASY",
            }))
          : [];

        conceptsMap.set(slug, {
          conceptId: slug,
          name: cRaw.name || existing?.name || slug,
          defaultP0: cRaw.defaultP0 ?? existing?.defaultP0 ?? 0.15,
          criteria: criteriaFromRaw.length > 0 ? criteriaFromRaw : existing?.criteria || [],
        });
      }
    }

    // Read lessons/*.md
    const lessonsDir = path.join(modDir, "lessons");
    const lessonFiles = fs.existsSync(lessonsDir)
      ? fs.readdirSync(lessonsDir).filter((f) => f.endsWith(".md")).sort()
      : [];

    const lessonsData: LessonData[] = [];
    for (const lf of lessonFiles) {
      const fullPath = path.join(lessonsDir, lf);
      const content = fs.readFileSync(fullPath, "utf-8");

      const titleMatch = content.match(/^#\s+(.+)$/m);
      const lessonTitleMatch = content.match(/Lesson Title:\s*(.+)$/m);
      const title = lessonTitleMatch ? lessonTitleMatch[1].trim() : titleMatch ? titleMatch[1].trim() : lf;

      // Extract concept ID from metadata e.g. - **Concept ID:** `variables-and-object-references`
      const conceptMatch = content.match(/Concept ID:[^`\n]*`?([a-zA-Z0-9_-]+)`?/i);
      const conceptId = conceptMatch ? conceptMatch[1].trim() : null;

      // Extract duration e.g. - **Estimated Duration:** 35 mins
      const durationMatch = content.match(/Estimated Duration:\D*(\d+)/i);
      const estimatedMins = durationMatch ? parseInt(durationMatch[1], 10) : 45;

      lessonsData.push({
        fileName: lf,
        title,
        conceptId,
        estimatedMins,
        content,
      });
    }

    // Track concept-to-chapter created entities for Question mapping
    const conceptEntities = new Map<string, { id: string; chapterId: string }>();
    const attachedConcepts = new Set<string>();

    let lessonSequence = 1;
    let firstChapterId: string | null = null;

    for (const lesson of lessonsData) {
      const chapter = await prisma.chapter.create({
        data: {
          moduleId: createdModule.id,
          title: lesson.title,
          sequenceOrder: lessonSequence++,
          teachingContent: lesson.content,
          estimatedMins: lesson.estimatedMins,
        },
      });
      totalChapters++;
      if (!firstChapterId) firstChapterId = chapter.id;

      // Match concept for this chapter
      const targetSlug = lesson.conceptId || Array.from(conceptsMap.keys()).find((k) => !attachedConcepts.has(k));
      if (targetSlug && conceptsMap.has(targetSlug)) {
        const conc = conceptsMap.get(targetSlug)!;
        attachedConcepts.add(targetSlug);

        const createdConcept = await prisma.concept.create({
          data: {
            chapterId: chapter.id,
            slug: conc.conceptId,
            name: conc.name,
            description: conc.name,
            sequenceOrder: 1,
            defaultP0: conc.defaultP0,
          },
        });
        totalConcepts++;
        conceptEntities.set(conc.conceptId, { id: createdConcept.id, chapterId: chapter.id });

        // Create Rubric
        const rubric = await prisma.rubric.create({
          data: {
            conceptId: createdConcept.id,
            title: `Evaluation Rubric for ${conc.name}`,
          },
        });

        // Ensure at least one rubric criterion exists
        const criteriaToSeed = conc.criteria.length > 0
          ? conc.criteria
          : [
              {
                statement: `Demonstrates mastery of core concepts in ${conc.name}.`,
                weight: 1.0,
                tierRequired: "EASY",
              },
            ];

        for (const crit of criteriaToSeed) {
          await prisma.rubricCriterion.create({
            data: {
              rubricId: rubric.id,
              criterionStatement: crit.statement,
              weight: crit.weight,
              tierRequired: crit.tierRequired,
            },
          });
          totalCriteria++;
        }
      }
    }

    // Attach any remaining concepts in this module that weren't directly named in a lesson
    for (const [slug, conc] of conceptsMap.entries()) {
      if (!attachedConcepts.has(slug) && firstChapterId) {
        const createdConcept = await prisma.concept.create({
          data: {
            chapterId: firstChapterId,
            slug: conc.conceptId,
            name: conc.name,
            description: conc.name,
            sequenceOrder: 2,
            defaultP0: conc.defaultP0,
          },
        });
        totalConcepts++;
        conceptEntities.set(conc.conceptId, { id: createdConcept.id, chapterId: firstChapterId });

        const rubric = await prisma.rubric.create({
          data: {
            conceptId: createdConcept.id,
            title: `Evaluation Rubric for ${conc.name}`,
          },
        });

        const criteriaToSeed = conc.criteria.length > 0
          ? conc.criteria
          : [
              {
                statement: `Demonstrates mastery of core concepts in ${conc.name}.`,
                weight: 1.0,
                tierRequired: "EASY",
              },
            ];

        for (const crit of criteriaToSeed) {
          await prisma.rubricCriterion.create({
            data: {
              rubricId: rubric.id,
              criterionStatement: crit.statement,
              weight: crit.weight,
              tierRequired: crit.tierRequired,
            },
          });
          totalCriteria++;
        }
      }
    }

    // Read and seed assessment questions
    const assessBankPath = path.join(modDir, "assessment", "ASSESSMENT_BANK.json");
    if (fs.existsSync(assessBankPath)) {
      const bankData = JSON.parse(fs.readFileSync(assessBankPath, "utf-8"));
      const questionsList: QuestionData[] = bankData.questions || [];

      for (const q of questionsList) {
        const matchedConcept = conceptEntities.get(q.conceptSlug) || Array.from(conceptEntities.values())[0];
        if (matchedConcept) {
          await prisma.question.create({
            data: {
              chapterId: matchedConcept.chapterId,
              conceptId: matchedConcept.id,
              questionType: q.questionType,
              prompt: q.prompt,
              tier: q.tier || "EASY",
            },
          });
          totalQuestions++;
        }
      }
    }
  }

  // Enrich with structured LessonSections, SkillDimensions, cognitive taxonomy & progression metadata
  await runEnrichmentAndBackfill();

  console.log(`\n============================================================`);
  console.log(`SEEDING COMPLETED SUCCESSFULLY:`);
  console.log(`- Course: ${course.title} (v${courseVersion.versionNumber})`);
  console.log(`- Modules: ${totalModules}`);
  console.log(`- Chapters (Lessons): ${totalChapters}`);
  console.log(`- Concepts: ${totalConcepts}`);
  console.log(`- Rubric Criteria: ${totalCriteria}`);
  console.log(`- Assessment Bank Questions: ${totalQuestions}`);
  console.log(`============================================================\n`);
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
