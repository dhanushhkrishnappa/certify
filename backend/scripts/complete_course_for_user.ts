import { prisma } from "../src/shared/prisma.js";
import { CredentialCryptoService } from "../src/modules/certificates/crypto.service.js";
import { CertificationEvaluator } from "../src/modules/mastery/bkt.js";

async function completeCourseForUser(userEmail: string) {
  console.log(`\n======================================================`);
  console.log(`Completing Python Fundamentals Course for: ${userEmail}`);
  console.log(`======================================================`);

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    console.error(`User not found: ${userEmail}`);
    return;
  }

  // Find Python course and active version
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
                  sections: { orderBy: { sequenceOrder: "asc" } },
                  concepts: {
                    include: {
                      rubrics: {
                        include: { criteria: true },
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
    console.error("Course or active version not found.");
    return;
  }

  const activeVersion = course.versions[0];

  // Find or create enrollment
  let enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseVersionId: {
        userId: user.id,
        courseVersionId: activeVersion.id,
      },
    },
    include: { certificate: true },
  });

  if (!enrollment) {
    enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseVersionId: activeVersion.id,
        status: "ACTIVE",
        currentTier: "ADVANCED",
      },
      include: { certificate: true },
    });
  }

  const now = new Date();
  const pastWeek = new Date(Date.now() - 7 * 24 * 3600 * 1000);

  // 1. Complete all ModuleProgresses
  console.log("Updating ModuleProgress records...");
  for (const mod of activeVersion.modules) {
    await prisma.moduleProgress.upsert({
      where: {
        enrollmentId_moduleId: {
          enrollmentId: enrollment.id,
          moduleId: mod.id,
        },
      },
      update: {
        status: "COMPLETED",
        chaptersCompleted: mod.chapters.length,
        totalChapters: mod.chapters.length,
        practicalPassed: true,
        practicalScore: 0.96,
        moduleRubricScore: 0.95,
        unlockedAt: pastWeek,
        completedAt: now,
      },
      create: {
        enrollmentId: enrollment.id,
        moduleId: mod.id,
        status: "COMPLETED",
        chaptersCompleted: mod.chapters.length,
        totalChapters: mod.chapters.length,
        practicalPassed: true,
        practicalScore: 0.96,
        moduleRubricScore: 0.95,
        unlockedAt: pastWeek,
        completedAt: now,
      },
    });
  }

  // 2. Complete all ChapterProgresses and SectionProgresses
  console.log("Updating ChapterProgress and SectionProgress records...");
  for (const mod of activeVersion.modules) {
    for (const ch of mod.chapters) {
      await prisma.chapterProgress.upsert({
        where: {
          enrollmentId_chapterId: {
            enrollmentId: enrollment.id,
            chapterId: ch.id,
          },
        },
        update: {
          status: "COMPLETED",
          currentSectionOrder: ch.sections.length || 1,
          checkpointScore: 0.96,
          checkpointAttempts: 1,
          remediationCycles: 0,
          unlockedAt: pastWeek,
          completedAt: now,
        },
        create: {
          enrollmentId: enrollment.id,
          chapterId: ch.id,
          status: "COMPLETED",
          currentSectionOrder: ch.sections.length || 1,
          checkpointScore: 0.96,
          checkpointAttempts: 1,
          remediationCycles: 0,
          unlockedAt: pastWeek,
          completedAt: now,
        },
      });

      for (const sec of ch.sections) {
        await prisma.sectionProgress.upsert({
          where: {
            enrollmentId_sectionId: {
              enrollmentId: enrollment.id,
              sectionId: sec.id,
            },
          },
          update: {
            status: "COMPLETED",
            turnsCompleted: 4,
            rubricPassRatio: 1.0,
            startedAt: pastWeek,
            completedAt: now,
          },
          create: {
            enrollmentId: enrollment.id,
            sectionId: sec.id,
            status: "COMPLETED",
            turnsCompleted: 4,
            rubricPassRatio: 1.0,
            startedAt: pastWeek,
            completedAt: now,
          },
        });
      }
    }
  }

  // 3. Complete all ConceptMasteries & RubricCriterionMasteries
  console.log("Updating ConceptMastery and RubricCriterionMastery records...");
  for (const mod of activeVersion.modules) {
    for (const ch of mod.chapters) {
      for (const concept of ch.concepts) {
        await prisma.conceptMastery.upsert({
          where: {
            enrollmentId_conceptId: {
              enrollmentId: enrollment.id,
              conceptId: concept.id,
            },
          },
          update: {
            pMastery: 0.96,
            confidence: 0.95,
            state: "ADVANCED",
            lastAssessedAt: now,
          },
          create: {
            enrollmentId: enrollment.id,
            conceptId: concept.id,
            pMastery: 0.96,
            confidence: 0.95,
            state: "ADVANCED",
            lastAssessedAt: now,
          },
        });

        for (const rubric of concept.rubrics) {
          for (const crit of rubric.criteria) {
            await prisma.rubricCriterionMastery.upsert({
              where: {
                enrollmentId_rubricCriterionId: {
                  enrollmentId: enrollment.id,
                  rubricCriterionId: crit.id,
                },
              },
              update: {
                status: "MASTERED",
                pCriterion: 0.96,
                bestScore: 1.0,
                latestScore: 1.0,
                demonstratedCount: 3,
                failedCount: 0,
                misconceptionCount: 0,
                lastEvaluatedAt: now,
              },
              create: {
                enrollmentId: enrollment.id,
                rubricCriterionId: crit.id,
                status: "MASTERED",
                pCriterion: 0.96,
                bestScore: 1.0,
                latestScore: 1.0,
                demonstratedCount: 3,
                failedCount: 0,
                misconceptionCount: 0,
                lastEvaluatedAt: now,
              },
            });
          }
        }
      }
    }
  }

  // 4. Record Evaluated Practical & Viva Assessment Attempts
  console.log("Recording practical and viva assessment records...");
  const existingPractical = await prisma.assessmentAttempt.findFirst({
    where: {
      enrollmentId: enrollment.id,
      assessmentType: "PRACTICAL",
    },
  });
  if (!existingPractical) {
    await prisma.assessmentAttempt.create({
      data: {
        enrollmentId: enrollment.id,
        assessmentType: "PRACTICAL",
        status: "EVALUATED",
        score: 0.96,
        completedAt: now,
      },
    });
  }

  const existingViva = await prisma.assessmentAttempt.findFirst({
    where: {
      enrollmentId: enrollment.id,
      assessmentType: "VIVA",
    },
  });
  if (!existingViva) {
    await prisma.assessmentAttempt.create({
      data: {
        enrollmentId: enrollment.id,
        assessmentType: "VIVA",
        status: "EVALUATED",
        score: 0.94,
        completedAt: now,
      },
    });
  }

  // 5. Populate LearnerSkillProfile for all 8 Skill Dimensions
  console.log("Updating LearnerSkillProfile records...");
  const skillDimensions = await prisma.skillDimension.findMany();
  for (const sd of skillDimensions) {
    await prisma.learnerSkillProfile.upsert({
      where: {
        enrollmentId_skillDimensionId: {
          enrollmentId: enrollment.id,
          skillDimensionId: sd.id,
        },
      },
      update: {
        compositeScore: 0.95,
        rubricPassRate: 0.96,
        bktMeanMastery: 0.96,
        practicalScore: 0.96,
        criteriaEvaluated: 8,
        criteriaTotal: 8,
        misconceptionCount: 0,
        classification: "STRENGTH",
        computedAt: now,
      },
      create: {
        enrollmentId: enrollment.id,
        skillDimensionId: sd.id,
        compositeScore: 0.95,
        rubricPassRate: 0.96,
        bktMeanMastery: 0.96,
        practicalScore: 0.96,
        criteriaEvaluated: 8,
        criteriaTotal: 8,
        misconceptionCount: 0,
        classification: "STRENGTH",
        computedAt: now,
      },
    });
  }

  // 6. Generate and Sign Cryptographic Certificate
  console.log("Generating Ed25519 Signed Certificate...");
  const evidence = {
    chapterMasteryScore: 0.96,
    practicalPerformance: 0.96,
    vivaDefenseScore: 0.94,
    consistencyIndex: 1.0,
    interactionDepthScore: 0.92,
  };

  const evaluation = CertificationEvaluator.evaluateCredential(evidence);
  const year = new Date().getFullYear();
  const credentialId = `CERT-${year}-PY-${user.id.slice(0, 6).toUpperCase()}`;

  const canonicalPayload = {
    compositeScore: evaluation.compositeScore,
    courseSlug: course.slug,
    courseTitle: course.title,
    courseVersion: activeVersion.versionNumber,
    credentialId,
    enrollmentId: enrollment.id,
    issuedAt: now.toISOString(),
    recipientName: user.fullName || user.name || "Dhanush K",
    ruleVersion: "2026.1",
    tier: evaluation.tier, // ADVANCED
  };

  const { signature, keyId } = CredentialCryptoService.signCredential(canonicalPayload);

  const evidenceSummary = JSON.stringify({
    ruleVersion: "2026.1",
    courseTitle: course.title,
    version: activeVersion.versionNumber,
    chapterMastery: 0.96,
    practicalPerformance: 0.96,
    vivaDefenseScore: 0.94,
    consistencyIndex: 1.0,
    interactionDepthScore: 0.92,
    compositeScore: evaluation.compositeScore,
    evaluatedAt: now.toISOString(),
    keyId,
  });

  await prisma.certificate.upsert({
    where: { enrollmentId: enrollment.id },
    update: {
      credentialId,
      tier: evaluation.tier,
      compositeScore: evaluation.compositeScore,
      evidenceSummary,
      signatureHash: signature,
      keyId,
      status: "VALID",
      issuedAt: now,
    },
    create: {
      credentialId,
      enrollmentId: enrollment.id,
      tier: evaluation.tier,
      compositeScore: evaluation.compositeScore,
      evidenceSummary,
      signatureHash: signature,
      keyId,
      status: "VALID",
      issuedAt: now,
    },
  });

  // 7. Update Enrollment to COMPLETED
  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      status: "COMPLETED",
      currentTier: evaluation.tier,
      completedAt: now,
    },
  });

  console.log(`\nSUCCESS! Course marked as COMPLETED.`);
  console.log(`User: ${user.name} (${user.email})`);
  console.log(`Credential ID: ${credentialId}`);
  console.log(`Tier: ${evaluation.tier}`);
  console.log(`Composite Score: ${evaluation.compositeScore}`);
  console.log(`Verification URL: /verify/${credentialId}`);
}

async function main() {
  await completeCourseForUser("dhanushk2204@gmail.com");
  await completeCourseForUser("learner@certify.edu");
}

main()
  .catch((e) => {
    console.error("Error completing course:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
