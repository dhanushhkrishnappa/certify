import { prisma } from "../src/shared/prisma.js";
import { ProgressionService } from "../src/modules/progression/progression.service.js";
import {
  PYTHON_SKILL_DIMENSIONS,
  PYTHON_MODULE_TAXONOMY,
  sliceLessonIntoSections,
  deriveCriterionTaxonomy,
} from "../src/modules/progression/curriculum.taxonomy.js";

/**
 * Non-destructive Phase 1 Enrichment & Progression Backfill Script.
 * - Preserves ALL existing users, accounts, sessions, and enrollments.
 * - Enriches Modules with canonical slugs, prerequisite chain, and practicalTaskId.
 * - Slices all 29 Chapters into ordered LessonSections (S1..S4 + S5 on final module chapter).
 * - Seeds 8 canonical SkillDimensions & maps all 66 RubricCriteria with cognitiveLevel & misconceptions.
 * - Backfills ModuleProgress, ChapterProgress, SectionProgress, RubricCriterionMastery, and LearnerSkillProfile
 *   for every existing enrollment.
 */
export async function runEnrichmentAndBackfill() {
  console.log("=== PHASE 1: Non-Destructive Curriculum Enrichment & Progression Backfill ===");

  const course = await prisma.course.findUnique({
    where: { slug: "python-fundamentals" },
    include: {
      versions: {
        where: { isActive: true },
        include: {
          modules: {
            orderBy: { sequenceOrder: "asc" },
            include: {
              chapters: {
                orderBy: { sequenceOrder: "asc" },
                include: {
                  concepts: {
                    orderBy: { sequenceOrder: "asc" },
                    include: {
                      rubrics: {
                        include: {
                          criteria: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course || !course.versions[0]) {
    throw new Error("Active python-fundamentals course version not found in database.");
  }

  const activeVersion = course.versions[0];

  // 1. Upsert 8 Canonical Skill Dimensions
  const skillDimBySlug = new Map<string, string>();
  for (const dim of PYTHON_SKILL_DIMENSIONS) {
    const upserted = await prisma.skillDimension.upsert({
      where: {
        courseSlug_slug: {
          courseSlug: course.slug,
          slug: dim.slug,
        },
      },
      update: {
        name: dim.name,
        description: dim.description,
        displayOrder: dim.displayOrder,
      },
      create: {
        courseSlug: course.slug,
        slug: dim.slug,
        name: dim.name,
        description: dim.description,
        displayOrder: dim.displayOrder,
      },
    });
    skillDimBySlug.set(dim.slug, upserted.id);
  }
  console.log(`Upserted ${skillDimBySlug.size} SkillDimensions.`);

  // 2. Enrich Modules, LessonSections, RubricCriteria, and SkillMappings
  let sectionsUpserted = 0;
  let criteriaEnriched = 0;
  let skillMappingsCreated = 0;
  let prevModuleId: string | null = null;

  for (const mod of activeVersion.modules) {
    const tax = PYTHON_MODULE_TAXONOMY[mod.sequenceOrder] || {
      order: mod.sequenceOrder,
      slug: mod.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      practicalTaskId: `practical-m${String(mod.sequenceOrder).padStart(2, "0")}`,
      practicalDescription: `Complete the practical coding verification for ${mod.title}.`,
      primarySkillSlug: "execution-and-memory",
      secondarySkillSlugs: [],
      keywords: [],
    };

    await prisma.module.update({
      where: { id: mod.id },
      data: {
        slug: tax.slug,
        prerequisiteModuleId: prevModuleId,
        practicalTaskId: tax.practicalTaskId,
        minMasteryThreshold: 0.70,
      },
    });
    prevModuleId = mod.id;

    // Slice every chapter in this module into ordered LessonSections
    for (let chIdx = 0; chIdx < mod.chapters.length; chIdx++) {
      const ch = mod.chapters[chIdx];
      const isFinalChapterOfModule = chIdx === mod.chapters.length - 1;
      const primaryConceptName = ch.concepts[0]?.name || ch.title;

      const slicedSections = sliceLessonIntoSections({
        lessonMarkdown: ch.teachingContent,
        chapterTitle: ch.title,
        conceptName: primaryConceptName,
        isFinalChapterOfModule,
        practicalTask: isFinalChapterOfModule
          ? { taskId: tax.practicalTaskId, description: tax.practicalDescription }
          : null,
      });

      for (const sec of slicedSections) {
        await prisma.lessonSection.upsert({
          where: {
            chapterId_sequenceOrder: {
              chapterId: ch.id,
              sequenceOrder: sec.sequenceOrder,
            },
          },
          update: {
            sectionType: sec.sectionType,
            title: sec.title,
            objective: sec.objective,
            content: sec.content,
            minTurns: sec.minTurns,
            requiredForAdvance: sec.requiredForAdvance,
          },
          create: {
            chapterId: ch.id,
            sectionType: sec.sectionType,
            title: sec.title,
            objective: sec.objective,
            sequenceOrder: sec.sequenceOrder,
            content: sec.content,
            minTurns: sec.minTurns,
            requiredForAdvance: sec.requiredForAdvance,
          },
        });
        sectionsUpserted++;
      }

      // Enrich RubricCriteria & Skill Mappings
      for (const concept of ch.concepts) {
        for (const rubric of concept.rubrics) {
          for (let rIdx = 0; rIdx < rubric.criteria.length; rIdx++) {
            const crit = rubric.criteria[rIdx];
            const derived = deriveCriterionTaxonomy({
              moduleOrder: mod.sequenceOrder,
              conceptSlug: concept.slug,
              statement: crit.criterionStatement,
              tierRequired: crit.tierRequired,
              indexInConcept: rIdx,
            });

            await prisma.rubricCriterion.update({
              where: { id: crit.id },
              data: {
                criterionCode: derived.criterionCode,
                cognitiveLevel: derived.cognitiveLevel,
                passingThreshold: 0.70,
                expectedConceptsJson: JSON.stringify(derived.expectedConcepts),
                misconceptionsJson: JSON.stringify(derived.misconceptions),
              },
            });
            criteriaEnriched++;

            for (const skillSlug of derived.skillSlugs) {
              const skillDimId = skillDimBySlug.get(skillSlug);
              if (!skillDimId) continue;
              await prisma.rubricCriterionSkillMap.upsert({
                where: {
                  rubricCriterionId_skillDimensionId: {
                    rubricCriterionId: crit.id,
                    skillDimensionId: skillDimId,
                  },
                },
                update: {
                  contributionWeight: skillSlug === tax.primarySkillSlug ? 1.0 : 0.6,
                },
                create: {
                  rubricCriterionId: crit.id,
                  skillDimensionId: skillDimId,
                  contributionWeight: skillSlug === tax.primarySkillSlug ? 1.0 : 0.6,
                },
              });
              skillMappingsCreated++;
            }
          }
        }
      }
    }
  }

  console.log(
    `Enriched ${activeVersion.modules.length} modules, ${sectionsUpserted} lesson sections, ` +
      `${criteriaEnriched} rubric criteria, ${skillMappingsCreated} skill mappings.`
  );

  // 3. Fast batch backfill for all existing Enrollments
  const enrollments = await prisma.enrollment.findMany({
    where: { courseVersionId: activeVersion.id },
    include: {
      sessions: { where: { isActive: true }, take: 1 },
    },
  });

  for (const enrollment of enrollments) {
    await ProgressionService.initializeEnrollmentProgression(
      enrollment.id,
      activeVersion.id
    );

    if (enrollment.sessions[0] && !enrollment.sessions[0].currentSectionId) {
      const firstSec = await prisma.lessonSection.findFirst({
        where: { chapterId: enrollment.sessions[0].chapterId },
        orderBy: { sequenceOrder: "asc" },
      });
      if (firstSec) {
        await prisma.learningSession.update({
          where: { id: enrollment.sessions[0].id },
          data: { currentSectionId: firstSec.id },
        });
      }
    }
  }

  console.log(`Backfilled progression & rubric telemetry for ${enrollments.length} existing enrollment(s).`);
  console.log("=== PHASE 1 COMPLETE ===");
}

if (process.argv[1] && process.argv[1].endsWith("enrich_curriculum_and_progression.ts")) {
  runEnrichmentAndBackfill()
    .catch((err) => {
      console.error("[Enrichment] Fatal error:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
