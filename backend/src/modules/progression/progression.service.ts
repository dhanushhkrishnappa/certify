import { prisma } from "../../shared/prisma.js";

export class ProgressionLockedError extends Error {
  public readonly statusCode = 403;
  public readonly code: string;
  public readonly lockedEntity: { type: string; id: string; title: string };
  public readonly prerequisites: Array<{
    type: string;
    id: string;
    title: string;
    status: string;
    missingCriteria?: string[];
  }>;

  constructor(params: {
    code?: string;
    message: string;
    lockedEntity: { type: string; id: string; title: string };
    prerequisites: Array<{
      type: string;
      id: string;
      title: string;
      status: string;
      missingCriteria?: string[];
    }>;
  }) {
    super(params.message);
    this.name = "ProgressionLockedError";
    this.code = params.code || "PROGRESSION_LOCKED";
    this.lockedEntity = params.lockedEntity;
    this.prerequisites = params.prerequisites;
  }

  public toJSON() {
    return {
      error: this.code,
      message: this.message,
      lockedEntity: this.lockedEntity,
      prerequisites: this.prerequisites,
    };
  }
}

export class ProgressionService {
  /**
   * Idempotently initializes ModuleProgress, ChapterProgress, SectionProgress,
   * RubricCriterionMastery, and LearnerSkillProfile for an enrollment.
   * Only Module 1 -> Chapter 1 -> Section 1 starts UNLOCKED; everything else starts LOCKED.
   */
  public static async initializeEnrollmentProgression(
    enrollmentId: string,
    courseVersionId: string
  ): Promise<void> {
    const courseVersion = await prisma.courseVersion.findUnique({
      where: { id: courseVersionId },
      include: {
        course: { select: { slug: true } },
        modules: {
          orderBy: { sequenceOrder: "asc" },
          include: {
            chapters: {
              orderBy: { sequenceOrder: "asc" },
              include: {
                sections: { orderBy: { sequenceOrder: "asc" } },
                concepts: {
                  orderBy: { sequenceOrder: "asc" },
                  include: {
                    rubrics: { include: { criteria: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!courseVersion) return;

    const existingModCount = await prisma.moduleProgress.count({
      where: { enrollmentId },
    });
    if (existingModCount >= courseVersion.modules.length && existingModCount > 0) {
      return;
    }

    const now = new Date();
    const modRows: any[] = [];
    const chRows: any[] = [];
    const secRows: any[] = [];
    const conceptRows: any[] = [];
    const critRows: any[] = [];

    for (let mIdx = 0; mIdx < courseVersion.modules.length; mIdx++) {
      const mod = courseVersion.modules[mIdx];
      const isFirstMod = mIdx === 0;
      modRows.push({
        enrollmentId,
        moduleId: mod.id,
        status: isFirstMod ? "UNLOCKED" : "LOCKED",
        chaptersCompleted: 0,
        totalChapters: mod.chapters.length,
        unlockedAt: isFirstMod ? now : null,
      });

      for (let cIdx = 0; cIdx < mod.chapters.length; cIdx++) {
        const ch = mod.chapters[cIdx];
        const isFirstChapter = isFirstMod && cIdx === 0;
        chRows.push({
          enrollmentId,
          chapterId: ch.id,
          status: isFirstChapter ? "UNLOCKED" : "LOCKED",
          currentSectionOrder: 1,
          unlockedAt: isFirstChapter ? now : null,
        });

        for (let sIdx = 0; sIdx < ch.sections.length; sIdx++) {
          const sec = ch.sections[sIdx];
          const isFirstSec = isFirstChapter && sIdx === 0;
          secRows.push({
            enrollmentId,
            sectionId: sec.id,
            status: isFirstSec ? "UNLOCKED" : "LOCKED",
            turnsCompleted: 0,
            rubricPassRatio: 0.0,
          });
        }

        for (const concept of ch.concepts) {
          conceptRows.push({
            enrollmentId,
            conceptId: concept.id,
            pMastery: concept.defaultP0 ?? 0.15,
            confidence: 0.2,
            state: "UNENCOUNTERED",
          });

          for (const rubric of concept.rubrics) {
            for (const crit of rubric.criteria) {
              critRows.push({
                enrollmentId,
                rubricCriterionId: crit.id,
                status: "NOT_STARTED",
                pCriterion: concept.defaultP0 ?? 0.15,
              });
            }
          }
        }
      }
    }

    const dimensions = await prisma.skillDimension.findMany({
      where: { courseSlug: courseVersion.course.slug },
      include: { _count: { select: { criterionMappings: true } } },
    });

    const skillRows = dimensions.map((dim) => ({
      enrollmentId,
      skillDimensionId: dim.id,
      compositeScore: 0.0,
      rubricPassRate: 0.0,
      bktMeanMastery: 0.15,
      criteriaEvaluated: 0,
      criteriaTotal: dim._count.criterionMappings,
      classification: "UNASSESSED",
    }));

    await prisma.$transaction([
      prisma.moduleProgress.createMany({ data: modRows, skipDuplicates: true }),
      prisma.chapterProgress.createMany({ data: chRows, skipDuplicates: true }),
      prisma.sectionProgress.createMany({ data: secRows, skipDuplicates: true }),
      prisma.conceptMastery.createMany({ data: conceptRows, skipDuplicates: true }),
      prisma.rubricCriterionMastery.createMany({ data: critRows, skipDuplicates: true }),
      prisma.learnerSkillProfile.createMany({ data: skillRows, skipDuplicates: true }),
    ]);
  }

  /**
   * Lazy self-healing guard for any enrollment created prior to progression rollout.
   */
  public static async ensureInitialized(enrollmentId: string): Promise<void> {
    const existing = await prisma.moduleProgress.findFirst({
      where: { enrollmentId },
      select: { id: true },
    });
    if (existing) return;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: { courseVersionId: true },
    });
    if (enrollment) {
      await this.initializeEnrollmentProgression(enrollmentId, enrollment.courseVersionId);
    }
  }

  /**
   * Hard backend gate: verifies that a Chapter (and its parent Module) are UNLOCKED
   * for the given enrollment. Throws ProgressionLockedError (HTTP 403) otherwise.
   */
  public static async assertChapterUnlocked(
    enrollmentId: string,
    chapterId: string
  ): Promise<{ chapterProgress: any; moduleProgress: any }> {
    await this.ensureInitialized(enrollmentId);

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { module: true },
    });

    if (!chapter) {
      throw new ProgressionLockedError({
        code: "CHAPTER_NOT_FOUND",
        message: "Requested chapter does not exist.",
        lockedEntity: { type: "CHAPTER", id: chapterId, title: "Unknown Chapter" },
        prerequisites: [],
      });
    }

    const [modProg, chProg] = await Promise.all([
      prisma.moduleProgress.findUnique({
        where: { enrollmentId_moduleId: { enrollmentId, moduleId: chapter.moduleId } },
      }),
      prisma.chapterProgress.findUnique({
        where: { enrollmentId_chapterId: { enrollmentId, chapterId } },
      }),
    ]);

    if (!modProg || modProg.status === "LOCKED") {
      // Find the currently active or incomplete prerequisite module
      const priorModules = await prisma.moduleProgress.findMany({
        where: {
          enrollmentId,
          status: { not: "COMPLETED" },
          module: { sequenceOrder: { lt: chapter.module.sequenceOrder } },
        },
        include: { module: true },
        orderBy: { module: { sequenceOrder: "asc" } },
      });

      throw new ProgressionLockedError({
        message: `Module "${chapter.module.title}" is locked. Complete previous modules and their practical tasks first.`,
        lockedEntity: {
          type: "MODULE",
          id: chapter.module.id,
          title: chapter.module.title,
        },
        prerequisites: priorModules.map((pm) => ({
          type: "MODULE",
          id: pm.moduleId,
          title: pm.module.title,
          status: pm.status,
          missingCriteria: pm.practicalPassed
            ? ["Complete all chapters in this module"]
            : [
                "Complete all chapters in this module",
                `Pass module practical task (${pm.module.practicalTaskId || "required"})`,
              ],
        })),
      });
    }

    if (!chProg || chProg.status === "LOCKED") {
      const priorChapters = await prisma.chapterProgress.findMany({
        where: {
          enrollmentId,
          status: { not: "COMPLETED" },
          chapter: {
            moduleId: chapter.moduleId,
            sequenceOrder: { lt: chapter.sequenceOrder },
          },
        },
        include: { chapter: true },
        orderBy: { chapter: { sequenceOrder: "asc" } },
      });

      throw new ProgressionLockedError({
        message: `Chapter "${chapter.title}" is locked. Complete previous chapters and pass their conceptual checkpoints first.`,
        lockedEntity: {
          type: "CHAPTER",
          id: chapter.id,
          title: chapter.title,
        },
        prerequisites: priorChapters.map((pc) => ({
          type: "CHAPTER",
          id: pc.chapterId,
          title: pc.chapter.title,
          status: pc.status,
          missingCriteria: ["Complete all lesson sections and pass Chapter Checkpoint (>= 70%)"],
        })),
      });
    }

    return { chapterProgress: chProg, moduleProgress: modProg };
  }

  /**
   * Hard backend gate for Module Practical submission:
   * Ensures parent module is UNLOCKED/IN_PROGRESS and all chapters up to checkpoint S4 are done.
   */
  public static async assertPracticalUnlocked(
    enrollmentId: string,
    moduleId: string
  ): Promise<void> {
    await this.ensureInitialized(enrollmentId);

    const mod = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        chapters: {
          orderBy: { sequenceOrder: "asc" },
          include: { sections: { orderBy: { sequenceOrder: "asc" } } },
        },
      },
    });
    if (!mod) {
      throw new ProgressionLockedError({
        message: "Module not found.",
        lockedEntity: { type: "MODULE", id: moduleId, title: "Unknown Module" },
        prerequisites: [],
      });
    }

    const modProg = await prisma.moduleProgress.findUnique({
      where: { enrollmentId_moduleId: { enrollmentId, moduleId } },
    });

    if (!modProg || modProg.status === "LOCKED") {
      throw new ProgressionLockedError({
        message: `Practical task for "${mod.title}" is locked. Complete prerequisite modules first.`,
        lockedEntity: { type: "PRACTICAL", id: mod.practicalTaskId || mod.id, title: mod.title },
        prerequisites: [],
      });
    }

    const finalChapter = mod.chapters[mod.chapters.length - 1];
    const practicalSection = finalChapter?.sections.find((s) => s.sectionType === "MODULE_PRACTICAL");
    if (practicalSection) {
      const secProg = await prisma.sectionProgress.findUnique({
        where: {
          enrollmentId_sectionId: { enrollmentId, sectionId: practicalSection.id },
        },
      });
      if (!secProg || secProg.status === "LOCKED") {
        throw new ProgressionLockedError({
          message: `Complete all lesson sections and conceptual checkpoints in "${mod.title}" before submitting the practical task.`,
          lockedEntity: {
            type: "PRACTICAL",
            id: mod.practicalTaskId || mod.id,
            title: `${mod.title} — Practical Task`,
          },
          prerequisites: [
            {
              type: "CHAPTER",
              id: finalChapter.id,
              title: finalChapter.title,
              status: "IN_PROGRESS",
              missingCriteria: ["Pass all chapter checkpoints in this module"],
            },
          ],
        });
      }
    }
  }

  /**
   * Resolves the active unlocked section for a chapter, transitioning UNLOCKED -> IN_PROGRESS.
   */
  public static async resolveActiveSection(
    enrollmentId: string,
    chapterId: string,
    preferredSectionId?: string | null
  ) {
    await this.ensureInitialized(enrollmentId);

    const sections = await prisma.lessonSection.findMany({
      where: { chapterId },
      orderBy: { sequenceOrder: "asc" },
      include: {
        sectionProgresses: { where: { enrollmentId } },
      },
    });

    if (sections.length === 0) return null;

    let active = preferredSectionId
      ? sections.find((s) => s.id === preferredSectionId && s.sectionProgresses[0]?.status !== "LOCKED")
      : undefined;

    if (!active) {
      // Pick first non-completed unlocked section, or fall back to last section if reviewing
      active =
        sections.find((s) => {
          const st = s.sectionProgresses[0]?.status;
          return st === "IN_PROGRESS" || st === "UNLOCKED";
        }) || sections[0];
    }

    return active;
  }

  /**
   * Records a learner's substantive dialogue turn within the active section.
   * Pure deterministic state update (never trusted to LLM).
   */
  public static async recordSectionTurn(params: {
    enrollmentId: string;
    chapterId: string;
    moduleId: string;
    sectionId: string;
    sessionId: string;
    rubricPassRatio?: number;
  }): Promise<{
    turnsCompleted: number;
    minTurns: number;
    readyToAdvanceSection: boolean;
    sectionStatus: string;
  }> {
    const section = await prisma.lessonSection.findUnique({
      where: { id: params.sectionId },
    });
    if (!section) {
      return { turnsCompleted: 0, minTurns: 1, readyToAdvanceSection: false, sectionStatus: "LOCKED" };
    }

    const now = new Date();
    const existing = await prisma.sectionProgress.findUnique({
      where: {
        enrollmentId_sectionId: {
          enrollmentId: params.enrollmentId,
          sectionId: params.sectionId,
        },
      },
    });

    const nextTurns = (existing?.turnsCompleted || 0) + 1;
    const nextRatio = Math.max(existing?.rubricPassRatio || 0, params.rubricPassRatio || 0);
    const nextStatus = existing?.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS";

    await prisma.$transaction([
      prisma.sectionProgress.upsert({
        where: {
          enrollmentId_sectionId: {
            enrollmentId: params.enrollmentId,
            sectionId: params.sectionId,
          },
        },
        update: {
          turnsCompleted: nextTurns,
          rubricPassRatio: nextRatio,
          status: nextStatus,
          startedAt: existing?.startedAt || now,
        },
        create: {
          enrollmentId: params.enrollmentId,
          sectionId: params.sectionId,
          turnsCompleted: nextTurns,
          rubricPassRatio: nextRatio,
          status: "IN_PROGRESS",
          startedAt: now,
        },
      }),
      prisma.chapterProgress.updateMany({
        where: {
          enrollmentId: params.enrollmentId,
          chapterId: params.chapterId,
          status: "UNLOCKED",
        },
        data: { status: "IN_PROGRESS" },
      }),
      prisma.moduleProgress.updateMany({
        where: {
          enrollmentId: params.enrollmentId,
          moduleId: params.moduleId,
          status: "UNLOCKED",
        },
        data: { status: "IN_PROGRESS" },
      }),
      prisma.learningSession.update({
        where: { id: params.sessionId },
        data: { turnCount: { increment: 1 } },
      }),
    ]);

    const isInteractiveSection =
      section.sectionType === "CONCEPT_INTUITION" ||
      section.sectionType === "TECHNICAL_MECHANICS" ||
      section.sectionType === "PITFALLS_AND_DEBUGGING";

    const readyToAdvanceSection = isInteractiveSection && nextTurns >= section.minTurns;

    return {
      turnsCompleted: nextTurns,
      minTurns: section.minTurns,
      readyToAdvanceSection,
      sectionStatus: nextStatus,
    };
  }

  /**
   * Deterministically advances from Section S_k to S_{k+1} ONLY if S_k meets its backend gate.
   * Rejects skipping CHAPTER_CHECKPOINT or MODULE_PRACTICAL without passing them!
   */
  public static async advanceSection(
    enrollmentId: string,
    sessionId: string
  ): Promise<{
    completedSection: { id: string; title: string; sectionType: string };
    nextSection: { id: string; title: string; sectionType: string; sequenceOrder: number; objective: string } | null;
    chapterStatus: string;
  }> {
    const session = await prisma.learningSession.findUnique({
      where: { id: sessionId },
      include: {
        chapter: {
          include: {
            sections: { orderBy: { sequenceOrder: "asc" } },
          },
        },
      },
    });

    if (!session || session.enrollmentId !== enrollmentId) {
      throw new ProgressionLockedError({
        code: "SESSION_NOT_FOUND",
        message: "Learning session not found.",
        lockedEntity: { type: "SESSION", id: sessionId, title: "Session" },
        prerequisites: [],
      });
    }

    const sections = session.chapter.sections;
    const currentSection =
      sections.find((s) => s.id === session.currentSectionId) || sections[0];

    if (!currentSection) {
      throw new ProgressionLockedError({
        code: "SECTION_NOT_FOUND",
        message: "No sections configured for this chapter.",
        lockedEntity: { type: "CHAPTER", id: session.chapterId, title: session.chapter.title },
        prerequisites: [],
      });
    }

    const secProg = await prisma.sectionProgress.findUnique({
      where: {
        enrollmentId_sectionId: { enrollmentId, sectionId: currentSection.id },
      },
    });

    // Gate 1: Checkpoint & Practical sections CANNOT be manually skipped via advanceSection
    if (currentSection.sectionType === "CHAPTER_CHECKPOINT") {
      if (secProg?.status !== "COMPLETED") {
        throw new ProgressionLockedError({
          code: "CHECKPOINT_REQUIRED",
          message: "You must submit and pass the Chapter Conceptual Checkpoint (>= 70%) before advancing.",
          lockedEntity: { type: "SECTION", id: currentSection.id, title: currentSection.title },
          prerequisites: [
            {
              type: "CHECKPOINT",
              id: session.chapterId,
              title: `${session.chapter.title} — Checkpoint`,
              status: secProg?.status || "IN_PROGRESS",
              missingCriteria: ["Submit and pass conceptual checkpoint assessment (>= 70%)"],
            },
          ],
        });
      }
    }

    if (currentSection.sectionType === "MODULE_PRACTICAL") {
      if (secProg?.status !== "COMPLETED") {
        throw new ProgressionLockedError({
          code: "PRACTICAL_REQUIRED",
          message: "You must submit and pass the Module Practical Coding Task before unlocking the next module.",
          lockedEntity: { type: "SECTION", id: currentSection.id, title: currentSection.title },
          prerequisites: [
            {
              type: "PRACTICAL",
              id: session.chapter.moduleId,
              title: "Module Practical Harness",
              status: secProg?.status || "IN_PROGRESS",
              missingCriteria: ["Pass practical unit tests (>= 75%)"],
            },
          ],
        });
      }
    }

    // Gate 2: S1..S3 require minimum substantive engagement turns
    const turns = secProg?.turnsCompleted || 0;
    if (turns < currentSection.minTurns && secProg?.status !== "COMPLETED") {
      throw new ProgressionLockedError({
        code: "SECTION_INCOMPLETE",
        message: `Engage with "${currentSection.title}" first (at least ${currentSection.minTurns} substantive response required before moving on).`,
        lockedEntity: { type: "SECTION", id: currentSection.id, title: currentSection.title },
        prerequisites: [
          {
            type: "SECTION",
            id: currentSection.id,
            title: currentSection.title,
            status: secProg?.status || "UNLOCKED",
            missingCriteria: [
              `Complete ${currentSection.minTurns - turns} more guided Socratic turn(s) in this section`,
            ],
          },
        ],
      });
    }

    const currentIdx = sections.findIndex((s) => s.id === currentSection.id);
    const nextSection = sections[currentIdx + 1] || null;
    const now = new Date();

    const nextChapterStatus =
      nextSection?.sectionType === "CHAPTER_CHECKPOINT"
        ? "AWAITING_CHECKPOINT"
        : "IN_PROGRESS";

    await prisma.$transaction(async (tx) => {
      await tx.sectionProgress.upsert({
        where: { enrollmentId_sectionId: { enrollmentId, sectionId: currentSection.id } },
        update: { status: "COMPLETED", completedAt: secProg?.completedAt || now },
        create: {
          enrollmentId,
          sectionId: currentSection.id,
          status: "COMPLETED",
          turnsCompleted: Math.max(turns, currentSection.minTurns),
          startedAt: now,
          completedAt: now,
        },
      });

      if (nextSection) {
        const nextExisting = await tx.sectionProgress.findUnique({
          where: { enrollmentId_sectionId: { enrollmentId, sectionId: nextSection.id } },
        });
        await tx.sectionProgress.upsert({
          where: { enrollmentId_sectionId: { enrollmentId, sectionId: nextSection.id } },
          update: {
            status:
              nextExisting?.status === "COMPLETED" ? "COMPLETED" : "UNLOCKED",
          },
          create: {
            enrollmentId,
            sectionId: nextSection.id,
            status: "UNLOCKED",
          },
        });

        await tx.chapterProgress.updateMany({
          where: {
            enrollmentId,
            chapterId: session.chapterId,
            status: { not: "COMPLETED" },
          },
          data: {
            currentSectionOrder: nextSection.sequenceOrder,
            status: nextChapterStatus,
          },
        });

        await tx.learningSession.update({
          where: { id: sessionId },
          data: {
            currentSectionId: nextSection.id,
            phase:
              nextSection.sectionType === "CHAPTER_CHECKPOINT"
                ? "CHECKING"
                : nextSection.sectionType === "MODULE_PRACTICAL"
                ? "ASSESSING"
                : "TEACHING",
          },
        });
      }
    });

    return {
      completedSection: {
        id: currentSection.id,
        title: currentSection.title,
        sectionType: currentSection.sectionType,
      },
      nextSection: nextSection
        ? {
            id: nextSection.id,
            title: nextSection.title,
            sectionType: nextSection.sectionType,
            sequenceOrder: nextSection.sequenceOrder,
            objective: nextSection.objective,
          }
        : null,
      chapterStatus: nextChapterStatus,
    };
  }

  /**
   * Called deterministically after Chapter Checkpoint evaluation.
   * Unlocks S5 (MODULE_PRACTICAL) if final module chapter, OR completes chapter & unlocks C+1.
   */
  public static async evaluateChapterCheckpointOutcome(params: {
    enrollmentId: string;
    chapterId: string;
    score: number;
    hasCriticalMisconception: boolean;
  }): Promise<{
    passed: boolean;
    chapterCompleted: boolean;
    unlockedPractical: boolean;
    practicalTaskId: string | null;
    nextChapterId: string | null;
    remediating: boolean;
  }> {
    await this.ensureInitialized(params.enrollmentId);

    const chapter = await prisma.chapter.findUnique({
      where: { id: params.chapterId },
      include: {
        module: {
          include: {
            chapters: {
              orderBy: { sequenceOrder: "asc" },
              include: { sections: { orderBy: { sequenceOrder: "asc" } } },
            },
          },
        },
        sections: { orderBy: { sequenceOrder: "asc" } },
      },
    });

    if (!chapter) {
      return {
        passed: false,
        chapterCompleted: false,
        unlockedPractical: false,
        practicalTaskId: null,
        nextChapterId: null,
        remediating: false,
      };
    }

    const passed = params.score >= 0.70 && !params.hasCriticalMisconception;
    const now = new Date();
    const checkpointSec = chapter.sections.find((s) => s.sectionType === "CHAPTER_CHECKPOINT");
    const practicalSec = chapter.sections.find((s) => s.sectionType === "MODULE_PRACTICAL");

    if (!passed) {
      await prisma.chapterProgress.updateMany({
        where: { enrollmentId: params.enrollmentId, chapterId: params.chapterId },
        data: {
          status: "REMEDIATING",
          checkpointScore: params.score,
          checkpointAttempts: { increment: 1 },
          remediationCycles: { increment: 1 },
        },
      });
      return {
        passed: false,
        chapterCompleted: false,
        unlockedPractical: false,
        practicalTaskId: null,
        nextChapterId: null,
        remediating: true,
      };
    }

    // Passed Checkpoint!
    // Mark all sections S1..S4 completed so state is completely consistent
    const sectionsUpToCheckpoint = chapter.sections.filter((s) => s.sequenceOrder <= 4);
    for (const sec of sectionsUpToCheckpoint) {
      await prisma.sectionProgress.upsert({
        where: {
          enrollmentId_sectionId: { enrollmentId: params.enrollmentId, sectionId: sec.id },
        },
        update: { status: "COMPLETED", completedAt: now, rubricPassRatio: params.score },
        create: {
          enrollmentId: params.enrollmentId,
          sectionId: sec.id,
          status: "COMPLETED",
          turnsCompleted: Math.max(sec.minTurns, 1),
          rubricPassRatio: params.score,
          startedAt: now,
          completedAt: now,
        },
      });
    }

    // Case A: Final chapter of module has a mandatory MODULE_PRACTICAL section (S5)
    if (practicalSec) {
      await prisma.$transaction([
        prisma.sectionProgress.upsert({
          where: {
            enrollmentId_sectionId: { enrollmentId: params.enrollmentId, sectionId: practicalSec.id },
          },
          update: { status: "UNLOCKED" },
          create: {
            enrollmentId: params.enrollmentId,
            sectionId: practicalSec.id,
            status: "UNLOCKED",
          },
        }),
        prisma.chapterProgress.updateMany({
          where: { enrollmentId: params.enrollmentId, chapterId: params.chapterId },
          data: {
            status: "IN_PROGRESS",
            currentSectionOrder: practicalSec.sequenceOrder,
            checkpointScore: params.score,
            checkpointAttempts: { increment: 1 },
          },
        }),
        prisma.learningSession.updateMany({
          where: {
            enrollmentId: params.enrollmentId,
            chapterId: params.chapterId,
            isActive: true,
          },
          data: { currentSectionId: practicalSec.id, phase: "ASSESSING" },
        }),
      ]);

      return {
        passed: true,
        chapterCompleted: false,
        unlockedPractical: true,
        practicalTaskId: chapter.module.practicalTaskId,
        nextChapterId: null,
        remediating: false,
      };
    }

    // Case B: Standard chapter — mark COMPLETED & unlock next chapter in same module!
    const modChapters = chapter.module.chapters;
    const chIdx = modChapters.findIndex((c) => c.id === chapter.id);
    const nextChapter = modChapters[chIdx + 1] || null;

    await prisma.$transaction(async (tx) => {
      await tx.chapterProgress.updateMany({
        where: { enrollmentId: params.enrollmentId, chapterId: params.chapterId },
        data: {
          status: "COMPLETED",
          checkpointScore: params.score,
          checkpointAttempts: { increment: 1 },
          completedAt: now,
        },
      });

      const completedCount = await tx.chapterProgress.count({
        where: {
          enrollmentId: params.enrollmentId,
          status: "COMPLETED",
          chapter: { moduleId: chapter.moduleId },
        },
      });

      await tx.moduleProgress.updateMany({
        where: { enrollmentId: params.enrollmentId, moduleId: chapter.moduleId },
        data: { chaptersCompleted: completedCount },
      });

      if (nextChapter) {
        await tx.chapterProgress.upsert({
          where: {
            enrollmentId_chapterId: {
              enrollmentId: params.enrollmentId,
              chapterId: nextChapter.id,
            },
          },
          update: { status: "UNLOCKED", unlockedAt: now },
          create: {
            enrollmentId: params.enrollmentId,
            chapterId: nextChapter.id,
            status: "UNLOCKED",
            currentSectionOrder: 1,
            unlockedAt: now,
          },
        });

        const nextFirstSec = nextChapter.sections[0];
        if (nextFirstSec) {
          await tx.sectionProgress.upsert({
            where: {
              enrollmentId_sectionId: {
                enrollmentId: params.enrollmentId,
                sectionId: nextFirstSec.id,
              },
            },
            update: { status: "UNLOCKED" },
            create: {
              enrollmentId: params.enrollmentId,
              sectionId: nextFirstSec.id,
              status: "UNLOCKED",
            },
          });
        }

        await tx.enrollment.update({
          where: { id: params.enrollmentId },
          data: { currentChapterId: nextChapter.id },
        });
      }
    });

    return {
      passed: true,
      chapterCompleted: true,
      unlockedPractical: false,
      practicalTaskId: null,
      nextChapterId: nextChapter?.id || null,
      remediating: false,
    };
  }

  /**
   * Called deterministically after Module Practical Harness evaluation.
   * When passed, completes S5, final chapter, and Module M, and unlocks Module M+1 (C1, S1)!
   */
  public static async evaluatePracticalOutcomeAndUnlockModule(params: {
    enrollmentId: string;
    moduleId: string;
    score: number;
    passed: boolean;
  }): Promise<{
    moduleCompleted: boolean;
    nextModuleId: string | null;
    nextChapterId: string | null;
    courseCompleted: boolean;
  }> {
    await this.ensureInitialized(params.enrollmentId);

    const mod = await prisma.module.findUnique({
      where: { id: params.moduleId },
      include: {
        courseVersion: {
          include: {
            modules: {
              orderBy: { sequenceOrder: "asc" },
              include: {
                chapters: {
                  orderBy: { sequenceOrder: "asc" },
                  include: { sections: { orderBy: { sequenceOrder: "asc" } } },
                },
              },
            },
          },
        },
        chapters: {
          orderBy: { sequenceOrder: "asc" },
          include: { sections: { orderBy: { sequenceOrder: "asc" } } },
        },
      },
    });

    if (!mod) {
      return { moduleCompleted: false, nextModuleId: null, nextChapterId: null, courseCompleted: false };
    }

    const now = new Date();
    const isPassing = params.passed && params.score >= 0.70;

    if (!isPassing) {
      await prisma.moduleProgress.updateMany({
        where: { enrollmentId: params.enrollmentId, moduleId: mod.id },
        data: { practicalScore: params.score },
      });
      return { moduleCompleted: false, nextModuleId: null, nextChapterId: null, courseCompleted: false };
    }

    const finalChapter = mod.chapters[mod.chapters.length - 1];
    const practicalSec = finalChapter?.sections.find((s) => s.sectionType === "MODULE_PRACTICAL");

    const allMods = mod.courseVersion.modules;
    const modIdx = allMods.findIndex((m) => m.id === mod.id);
    const nextMod = allMods[modIdx + 1] || null;
    const nextChapter = nextMod?.chapters[0] || null;
    const nextSection = nextChapter?.sections[0] || null;

    // Compute module rubric score deterministically from RubricCriterionMastery
    const modCriteriaMasteries = await prisma.rubricCriterionMastery.findMany({
      where: {
        enrollmentId: params.enrollmentId,
        rubricCriterion: {
          rubric: { concept: { chapter: { moduleId: mod.id } } },
        },
      },
      include: { rubricCriterion: true },
    });

    let moduleRubricScore = params.score;
    if (modCriteriaMasteries.length > 0) {
      let wSum = 0;
      let sSum = 0;
      for (const cm of modCriteriaMasteries) {
        const w = cm.rubricCriterion.weight || 1.0;
        wSum += w;
        sSum += w * Math.max(cm.bestScore, cm.pCriterion);
      }
      moduleRubricScore = Number((sSum / (wSum || 1)).toFixed(4));
    }

    await prisma.$transaction(async (tx) => {
      if (practicalSec) {
        await tx.sectionProgress.upsert({
          where: {
            enrollmentId_sectionId: {
              enrollmentId: params.enrollmentId,
              sectionId: practicalSec.id,
            },
          },
          update: { status: "COMPLETED", completedAt: now, rubricPassRatio: params.score },
          create: {
            enrollmentId: params.enrollmentId,
            sectionId: practicalSec.id,
            status: "COMPLETED",
            turnsCompleted: 1,
            rubricPassRatio: params.score,
            startedAt: now,
            completedAt: now,
          },
        });
      }

      if (finalChapter) {
        await tx.chapterProgress.updateMany({
          where: { enrollmentId: params.enrollmentId, chapterId: finalChapter.id },
          data: { status: "COMPLETED", completedAt: now },
        });
      }

      await tx.moduleProgress.updateMany({
        where: { enrollmentId: params.enrollmentId, moduleId: mod.id },
        data: {
          status: "COMPLETED",
          chaptersCompleted: mod.chapters.length,
          practicalPassed: true,
          practicalScore: params.score,
          moduleRubricScore,
          completedAt: now,
        },
      });

      if (nextMod && nextChapter) {
        await tx.moduleProgress.upsert({
          where: {
            enrollmentId_moduleId: { enrollmentId: params.enrollmentId, moduleId: nextMod.id },
          },
          update: { status: "UNLOCKED", unlockedAt: now },
          create: {
            enrollmentId: params.enrollmentId,
            moduleId: nextMod.id,
            status: "UNLOCKED",
            totalChapters: nextMod.chapters.length,
            unlockedAt: now,
          },
        });

        await tx.chapterProgress.upsert({
          where: {
            enrollmentId_chapterId: {
              enrollmentId: params.enrollmentId,
              chapterId: nextChapter.id,
            },
          },
          update: { status: "UNLOCKED", unlockedAt: now },
          create: {
            enrollmentId: params.enrollmentId,
            chapterId: nextChapter.id,
            status: "UNLOCKED",
            currentSectionOrder: 1,
            unlockedAt: now,
          },
        });

        if (nextSection) {
          await tx.sectionProgress.upsert({
            where: {
              enrollmentId_sectionId: {
                enrollmentId: params.enrollmentId,
                sectionId: nextSection.id,
              },
            },
            update: { status: "UNLOCKED" },
            create: {
              enrollmentId: params.enrollmentId,
              sectionId: nextSection.id,
              status: "UNLOCKED",
            },
          });
        }

        await tx.enrollment.update({
          where: { id: params.enrollmentId },
          data: { currentChapterId: nextChapter.id },
        });
      } else {
        // Final module (Module 10) completed!
        await tx.enrollment.update({
          where: { id: params.enrollmentId },
          data: { status: "COMPLETED", completedAt: now },
        });
      }
    });

    return {
      moduleCompleted: true,
      nextModuleId: nextMod?.id || null,
      nextChapterId: nextChapter?.id || null,
      courseCompleted: !nextMod,
    };
  }

  /**
   * Returns the complete authoritative progression lock tree for an enrollment.
   */
  public static async getProgressionTree(enrollmentId: string) {
    await this.ensureInitialized(enrollmentId);

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        courseVersion: {
          include: {
            course: { select: { id: true, slug: true, title: true } },
            modules: {
              orderBy: { sequenceOrder: "asc" },
              include: {
                chapters: {
                  orderBy: { sequenceOrder: "asc" },
                  include: {
                    sections: { orderBy: { sequenceOrder: "asc" } },
                    concepts: {
                      orderBy: { sequenceOrder: "asc" },
                      include: {
                        rubrics: { include: { criteria: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        moduleProgresses: true,
        chapterProgresses: true,
        sectionProgresses: true,
        conceptMasteries: true,
        rubricCriterionMasteries: true,
      },
    });

    if (!enrollment) return null;

    const modProgMap = new Map(enrollment.moduleProgresses.map((p) => [p.moduleId, p]));
    const chProgMap = new Map(enrollment.chapterProgresses.map((p) => [p.chapterId, p]));
    const secProgMap = new Map(enrollment.sectionProgresses.map((p) => [p.sectionId, p]));
    const conceptMap = new Map(enrollment.conceptMasteries.map((m) => [m.conceptId, m]));
    const critMap = new Map(
      enrollment.rubricCriterionMasteries.map((m) => [m.rubricCriterionId, m])
    );

    let totalSections = 0;
    let completedSections = 0;
    let totalChapters = 0;
    let completedChapters = 0;
    let completedModules = 0;

    const modules = enrollment.courseVersion.modules.map((mod) => {
      const mp = modProgMap.get(mod.id);
      const modStatus = mp?.status || "LOCKED";
      if (modStatus === "COMPLETED") completedModules++;

      const chapters = mod.chapters.map((ch) => {
        totalChapters++;
        const cp = chProgMap.get(ch.id);
        const chStatus = cp?.status || "LOCKED";
        if (chStatus === "COMPLETED") completedChapters++;

        const sections = ch.sections.map((sec) => {
          totalSections++;
          const sp = secProgMap.get(sec.id);
          const secStatus = sp?.status || "LOCKED";
          if (secStatus === "COMPLETED") completedSections++;

          return {
            id: sec.id,
            sectionType: sec.sectionType,
            title: sec.title,
            objective: sec.objective,
            sequenceOrder: sec.sequenceOrder,
            minTurns: sec.minTurns,
            status: secStatus,
            turnsCompleted: sp?.turnsCompleted || 0,
            rubricPassRatio: sp?.rubricPassRatio || 0,
            readyToAdvance:
              secStatus === "COMPLETED" ||
              ((sec.sectionType === "CONCEPT_INTUITION" ||
                sec.sectionType === "TECHNICAL_MECHANICS" ||
                sec.sectionType === "PITFALLS_AND_DEBUGGING") &&
                (sp?.turnsCompleted || 0) >= sec.minTurns),
          };
        });

        const concepts = ch.concepts.map((cn) => {
          const cm = conceptMap.get(cn.id);
          const criteria = cn.rubrics.flatMap((r) =>
            r.criteria.map((cr) => {
              const crm = critMap.get(cr.id);
              return {
                id: cr.id,
                criterionCode: cr.criterionCode,
                statement: cr.criterionStatement,
                weight: cr.weight,
                tierRequired: cr.tierRequired,
                cognitiveLevel: cr.cognitiveLevel,
                status: crm?.status || "NOT_STARTED",
                pCriterion: crm?.pCriterion ?? 0.15,
                latestScore: crm?.latestScore ?? 0,
                bestScore: crm?.bestScore ?? 0,
                demonstratedCount: crm?.demonstratedCount ?? 0,
                failedCount: crm?.failedCount ?? 0,
                misconceptionCount: crm?.misconceptionCount ?? 0,
                lastMisconception: crm?.lastMisconception || null,
              };
            })
          );

          return {
            id: cn.id,
            slug: cn.slug,
            name: cn.name,
            pMastery: cm?.pMastery ?? cn.defaultP0,
            state: cm?.state || "UNENCOUNTERED",
            criteria,
          };
        });

        return {
          id: ch.id,
          title: ch.title,
          sequenceOrder: ch.sequenceOrder,
          estimatedMins: ch.estimatedMins,
          status: chStatus,
          currentSectionOrder: cp?.currentSectionOrder || 1,
          checkpointScore: cp?.checkpointScore ?? null,
          checkpointAttempts: cp?.checkpointAttempts || 0,
          remediationCycles: cp?.remediationCycles || 0,
          sections,
          concepts,
        };
      });

      return {
        id: mod.id,
        slug: mod.slug,
        title: mod.title,
        sequenceOrder: mod.sequenceOrder,
        practicalTaskId: mod.practicalTaskId,
        status: modStatus,
        chaptersCompleted: mp?.chaptersCompleted || 0,
        totalChapters: mod.chapters.length,
        practicalPassed: mp?.practicalPassed || false,
        practicalScore: mp?.practicalScore ?? null,
        moduleRubricScore: mp?.moduleRubricScore ?? null,
        chapters,
      };
    });

    const percentComplete =
      totalSections > 0 ? Number(((completedSections / totalSections) * 100).toFixed(1)) : 0;

    return {
      enrollmentId: enrollment.id,
      course: enrollment.courseVersion.course,
      status: enrollment.status,
      currentTier: enrollment.currentTier,
      currentChapterId: enrollment.currentChapterId,
      summary: {
        modulesCompleted: completedModules,
        modulesTotal: modules.length,
        chaptersCompleted: completedChapters,
        chaptersTotal: totalChapters,
        sectionsCompleted: completedSections,
        sectionsTotal: totalSections,
        percentComplete,
      },
      modules,
    };
  }
}
