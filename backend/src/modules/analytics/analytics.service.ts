import { prisma } from "../../shared/prisma.js";
import { ProgressionService } from "../progression/progression.service.js";

export interface SkillReportEntry {
  skillDimensionId: string;
  skillSlug: string;
  skillName: string;
  description: string;
  compositeScore: number;
  rubricPassRate: number;
  bktMeanMastery: number;
  practicalScore: number | null;
  criteriaEvaluated: number;
  criteriaTotal: number;
  misconceptionCount: number;
  classification: "UNASSESSED" | "WEAKPOINT" | "DEVELOPING" | "STRENGTH";
  evidenceSummary: string;
  weakestCriteria: Array<{
    criterionId: string;
    criterionCode: string | null;
    statement: string;
    cognitiveLevel: string;
    latestScore: number;
    pCriterion: number;
    lastMisconception: string | null;
    chapterId: string;
    chapterTitle: string;
    moduleTitle: string;
  }>;
}

export class AnalyticsService {
  /**
   * Deterministically recomputes and persists LearnerSkillProfile rows for an enrollment
   * based purely on persisted RubricCriterionMastery, ConceptMastery, and Practical scores.
   */
  public static async recomputeSkillProfile(enrollmentId: string): Promise<SkillReportEntry[]> {
    await ProgressionService.ensureInitialized(enrollmentId);

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        courseVersion: {
          include: {
            course: { select: { slug: true } },
          },
        },
        rubricCriterionMasteries: {
          include: {
            rubricCriterion: {
              include: {
                rubric: {
                  include: {
                    concept: {
                      include: {
                        chapter: {
                          include: { module: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        conceptMasteries: true,
        moduleProgresses: true,
      },
    });

    if (!enrollment) return [];

    const dimensions = await prisma.skillDimension.findMany({
      where: { courseSlug: enrollment.courseVersion.course.slug },
      orderBy: { displayOrder: "asc" },
      include: {
        criterionMappings: true,
      },
    });

    const critMasteryById = new Map(
      enrollment.rubricCriterionMasteries.map((m) => [m.rubricCriterionId, m])
    );
    const conceptMasteryById = new Map(
      enrollment.conceptMasteries.map((m) => [m.conceptId, m])
    );
    const modProgressById = new Map(
      enrollment.moduleProgresses.map((m) => [m.moduleId, m])
    );

    const results: SkillReportEntry[] = [];
    const now = new Date();

    for (const dim of dimensions) {
      const mappings = dim.criterionMappings;
      const criteriaTotal = mappings.length;

      let evaluatedCount = 0;
      let demonstratedCriteriaCount = 0;
      let weightedRubricNum = 0;
      let weightedRubricDen = 0;
      let totalDemoObs = 0;
      let totalFailObs = 0;
      let misconceptionCount = 0;

      const conceptIds = new Set<string>();
      const moduleIds = new Set<string>();
      const weakestCandidates: Array<{
        priority: number;
        item: SkillReportEntry["weakestCriteria"][0];
      }> = [];

      for (const mapping of mappings) {
        const cm = critMasteryById.get(mapping.rubricCriterionId);
        if (!cm) continue;

        const crit = cm.rubricCriterion;
        const concept = crit.rubric.concept;
        const chapter = concept.chapter;
        const mod = chapter.module;

        conceptIds.add(concept.id);
        moduleIds.add(mod.id);

        const isEvaluated =
          cm.status !== "NOT_STARTED" ||
          cm.demonstratedCount > 0 ||
          cm.failedCount > 0 ||
          cm.misconceptionCount > 0;

        if (isEvaluated) {
          evaluatedCount++;
          const w = (crit.weight || 1.0) * (mapping.contributionWeight || 1.0);
          weightedRubricNum += w * Math.max(cm.latestScore, cm.pCriterion * 0.85);
          weightedRubricDen += w;

          if (cm.status === "DEMONSTRATED" || cm.status === "MASTERED") {
            demonstratedCriteriaCount++;
          }

          totalDemoObs += cm.demonstratedCount;
          totalFailObs += cm.failedCount;
          misconceptionCount += cm.misconceptionCount;

          if (cm.latestScore < 0.70 || cm.misconceptionCount > 0 || cm.status === "ATTEMPTED" || cm.status === "PARTIAL") {
            weakestCandidates.push({
              priority: w * (1 - cm.latestScore) + cm.misconceptionCount * 0.4,
              item: {
                criterionId: crit.id,
                criterionCode: crit.criterionCode,
                statement: crit.criterionStatement,
                cognitiveLevel: crit.cognitiveLevel,
                latestScore: Number(cm.latestScore.toFixed(3)),
                pCriterion: Number(cm.pCriterion.toFixed(4)),
                lastMisconception: cm.lastMisconception,
                chapterId: chapter.id,
                chapterTitle: chapter.title,
                moduleTitle: mod.title,
              },
            });
          }
        }
      }

      // Mean BKT across mapped concepts
      const bktValues: number[] = [];
      for (const cid of conceptIds) {
        const cMastery = conceptMasteryById.get(cid);
        if (cMastery) bktValues.push(cMastery.pMastery);
      }
      const bktMeanMastery =
        bktValues.length > 0
          ? Number((bktValues.reduce((a, b) => a + b, 0) / bktValues.length).toFixed(4))
          : 0.15;

      // Practical scores across mapped modules
      const pracScores: number[] = [];
      for (const mid of moduleIds) {
        const mp = modProgressById.get(mid);
        if (mp && typeof mp.practicalScore === "number") {
          pracScores.push(mp.practicalScore);
        }
      }
      const practicalScore =
        pracScores.length > 0
          ? Number((pracScores.reduce((a, b) => a + b, 0) / pracScores.length).toFixed(4))
          : null;

      const rubricScore =
        weightedRubricDen > 0 ? weightedRubricNum / weightedRubricDen : 0;
      const rubricPassRate =
        evaluatedCount > 0
          ? Number((demonstratedCriteriaCount / evaluatedCount).toFixed(4))
          : 0;

      const compositeScore =
        evaluatedCount === 0
          ? 0
          : Number(
              (practicalScore !== null
                ? 0.55 * rubricScore + 0.25 * bktMeanMastery + 0.20 * practicalScore
                : 0.65 * rubricScore + 0.35 * bktMeanMastery
              ).toFixed(4)
            );

      const totalObs = totalDemoObs + totalFailObs;
      const failRate = totalObs > 0 ? totalFailObs / totalObs : 0;

      let classification: SkillReportEntry["classification"] = "UNASSESSED";
      if (evaluatedCount > 0) {
        if (
          evaluatedCount >= 2 &&
          compositeScore >= 0.80 &&
          misconceptionCount === 0 &&
          failRate <= 0.15
        ) {
          classification = "STRENGTH";
        } else if (
          compositeScore < 0.65 ||
          misconceptionCount >= 2 ||
          failRate >= 0.40
        ) {
          classification = "WEAKPOINT";
        } else {
          classification = "DEVELOPING";
        }
      }

      weakestCandidates.sort((a, b) => b.priority - a.priority);
      const weakestCriteria = weakestCandidates.slice(0, 5).map((c) => c.item);

      const evidenceSummary =
        evaluatedCount === 0
          ? "Not yet assessed — unlock and complete mapped modules to evaluate."
          : `${demonstratedCriteriaCount}/${evaluatedCount} evaluated criteria demonstrated` +
            (misconceptionCount > 0 ? ` · ${misconceptionCount} misconception(s) flagged` : " · 0 misconceptions");

      await prisma.learnerSkillProfile.upsert({
        where: {
          enrollmentId_skillDimensionId: {
            enrollmentId,
            skillDimensionId: dim.id,
          },
        },
        update: {
          compositeScore,
          rubricPassRate,
          bktMeanMastery,
          practicalScore,
          criteriaEvaluated: evaluatedCount,
          criteriaTotal,
          misconceptionCount,
          classification,
          weakestCriteriaJson: JSON.stringify(weakestCriteria),
          computedAt: now,
        },
        create: {
          enrollmentId,
          skillDimensionId: dim.id,
          compositeScore,
          rubricPassRate,
          bktMeanMastery,
          practicalScore,
          criteriaEvaluated: evaluatedCount,
          criteriaTotal,
          misconceptionCount,
          classification,
          weakestCriteriaJson: JSON.stringify(weakestCriteria),
          computedAt: now,
        },
      });

      results.push({
        skillDimensionId: dim.id,
        skillSlug: dim.slug,
        skillName: dim.name,
        description: dim.description,
        compositeScore,
        rubricPassRate,
        bktMeanMastery,
        practicalScore,
        criteriaEvaluated: evaluatedCount,
        criteriaTotal,
        misconceptionCount,
        classification,
        evidenceSummary,
        weakestCriteria,
      });
    }

    return results;
  }

  /**
   * Produces the complete, auditable Learner Performance, Strengths & Weakpoints Report.
   */
  public static async getLearnerSkillsReport(enrollmentId: string) {
    return this.getSkillsReport(enrollmentId);
  }

  public static async getSkillsReport(enrollmentId: string) {
    const skillProfiles = await this.recomputeSkillProfile(enrollmentId);
    const progression = await ProgressionService.getProgressionTree(enrollmentId);
    if (!progression) return null;

    const [criterionMasteries, driftEvents] = await Promise.all([
      prisma.rubricCriterionMastery.findMany({
        where: { enrollmentId },
        include: {
          rubricCriterion: {
            include: {
              rubric: {
                include: {
                  concept: {
                    include: {
                      chapter: {
                        include: { module: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.topicDriftEvent.findMany({
        where: { enrollmentId },
        select: { driftType: true, detectedTargetSlug: true, createdAt: true },
      }),
    ]);

    // Cognitive Breakdown across RECALL | EXPLAIN | APPLY | DEBUG | REASON
    const cogBuckets: Record<string, { sum: number; count: number }> = {
      RECALL: { sum: 0, count: 0 },
      EXPLAIN: { sum: 0, count: 0 },
      APPLY: { sum: 0, count: 0 },
      DEBUG: { sum: 0, count: 0 },
      REASON: { sum: 0, count: 0 },
    };

    const remediationQueue: Array<{
      priority: number;
      criterionId: string;
      criterionCode: string | null;
      statement: string;
      cognitiveLevel: string;
      status: string;
      latestScore: number;
      misconceptionCount: number;
      lastMisconception: string | null;
      chapterId: string;
      chapterTitle: string;
      moduleTitle: string;
    }> = [];

    const rubricMatrix = criterionMasteries.map((cm) => {
      const cr = cm.rubricCriterion;
      const concept = cr.rubric.concept;
      const chapter = concept.chapter;
      const mod = chapter.module;

      const isEval =
        cm.status !== "NOT_STARTED" || cm.demonstratedCount > 0 || cm.failedCount > 0;

      if (isEval && cogBuckets[cr.cognitiveLevel]) {
        cogBuckets[cr.cognitiveLevel].sum += cm.latestScore;
        cogBuckets[cr.cognitiveLevel].count += 1;
      }

      if (
        isEval &&
        (cm.latestScore < 0.70 || cm.misconceptionCount > 0 || cm.status === "ATTEMPTED")
      ) {
        remediationQueue.push({
          priority: (cr.weight || 1.0) * (1 - cm.latestScore) + cm.misconceptionCount * 0.5,
          criterionId: cr.id,
          criterionCode: cr.criterionCode,
          statement: cr.criterionStatement,
          cognitiveLevel: cr.cognitiveLevel,
          status: cm.status,
          latestScore: Number(cm.latestScore.toFixed(3)),
          misconceptionCount: cm.misconceptionCount,
          lastMisconception: cm.lastMisconception,
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          moduleTitle: mod.title,
        });
      }

      return {
        criterionId: cr.id,
        criterionCode: cr.criterionCode,
        statement: cr.criterionStatement,
        weight: cr.weight,
        tierRequired: cr.tierRequired,
        cognitiveLevel: cr.cognitiveLevel,
        conceptName: concept.name,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        moduleOrder: mod.sequenceOrder,
        moduleTitle: mod.title,
        status: cm.status,
        pCriterion: Number(cm.pCriterion.toFixed(4)),
        latestScore: Number(cm.latestScore.toFixed(3)),
        bestScore: Number(cm.bestScore.toFixed(3)),
        demonstratedCount: cm.demonstratedCount,
        failedCount: cm.failedCount,
        misconceptionCount: cm.misconceptionCount,
        lastMisconception: cm.lastMisconception,
        lastEvidenceQuote: cm.lastEvidenceQuote,
      };
    });

    const cognitiveBreakdown: Record<string, { score: number | null; evaluatedCount: number }> = {};
    for (const [level, bucket] of Object.entries(cogBuckets)) {
      cognitiveBreakdown[level] = {
        score: bucket.count > 0 ? Number((bucket.sum / bucket.count).toFixed(4)) : null,
        evaluatedCount: bucket.count,
      };
    }

    remediationQueue.sort((a, b) => b.priority - a.priority);

    const strengths = skillProfiles.filter((s) => s.classification === "STRENGTH");
    const weakpoints = skillProfiles.filter((s) => s.classification === "WEAKPOINT");
    const developing = skillProfiles.filter((s) => s.classification === "DEVELOPING");
    const unassessed = skillProfiles.filter((s) => s.classification === "UNASSESSED");

    const evaluatedSkills = skillProfiles.filter((s) => s.criteriaEvaluated > 0);
    const overallSkillScore =
      evaluatedSkills.length > 0
        ? Number(
            (
              evaluatedSkills.reduce((acc, s) => acc + s.compositeScore, 0) /
              evaluatedSkills.length
            ).toFixed(4)
          )
        : 0;

    return {
      enrollmentId,
      course: progression.course,
      overallProgress: {
        ...progression.summary,
        currentTier: progression.currentTier,
        overallSkillScore,
      },
      strengths,
      developing,
      weakpoints,
      unassessed,
      cognitiveBreakdown,
      remediationQueue: remediationQueue.slice(0, 10),
      rubricMatrix,
      driftSummary: {
        totalDriftEvents: driftEvents.length,
        futureTopicRedirects: driftEvents.filter((d) => d.driftType === "FUTURE_TOPIC_AHEAD").length,
        skipAttemptsBlocked: driftEvents.filter((d) => d.driftType === "SKIP_ATTEMPT").length,
        offTopicRedirects: driftEvents.filter((d) => d.driftType === "OFF_TOPIC").length,
      },
    };
  }
}
