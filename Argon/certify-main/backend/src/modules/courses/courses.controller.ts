import { Request, Response } from "express";
import { prisma } from "../../shared/prisma.js";
import { AuthenticatedRequest } from "../../shared/middleware/auth.js";

export class CoursesController {
  public static async listCourses(_req: Request, res: Response): Promise<void> {
    try {
      const courses = await prisma.course.findMany({
        where: { status: "PUBLISHED" },
        include: {
          versions: {
            where: { isActive: true },
            include: {
              modules: {
                include: {
                  chapters: {
                    select: { id: true, title: true, sequenceOrder: true },
                  },
                },
              },
            },
          },
        },
      });

      const catalog = courses.map((c: any) => {
        const activeVersion = c.versions[0];
        const chapterCount = activeVersion
          ? activeVersion.modules.reduce((acc: number, m: any) => acc + m.chapters.length, 0)
          : 0;

        return {
          id: c.id,
          slug: c.slug,
          title: c.title,
          summary: c.summary,
          version: activeVersion?.versionNumber || "1.0.0",
          moduleCount: activeVersion?.modules.length || 0,
          chapterCount,
          tierOfferings: ["Foundation (Easy)", "Proficient (Medium)", "Advanced (Hard)"],
        };
      });

      res.json({ courses: catalog });
    } catch (err) {
      console.error("Error fetching courses:", err);
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  }

  public static async getCourseBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const course = await prisma.course.findUnique({
        where: { slug },
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
                        select: { id: true, slug: true, name: true, description: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!course) {
        res.status(404).json({ error: "Course not found" });
        return;
      }

      const activeVersion = course.versions[0];
      res.json({
        course: {
          id: course.id,
          slug: course.slug,
          title: course.title,
          summary: course.summary,
          description: course.description,
          version: activeVersion?.versionNumber || "1.0.0",
          modules: activeVersion?.modules || [],
          certificationRequirements: {
            foundationTier: "Consistent chapter completion, basic concept checks (Mastery >= 0.70)",
            proficientTier: "Applied problem solving, reasoning depth, few remediations (Mastery >= 0.85)",
            advancedTier: "High-order reasoning, practical task execution, and verified AI Viva oral defense (Mastery >= 0.92)",
          },
        },
      });
    } catch (err) {
      console.error("Error fetching course detail:", err);
      res.status(500).json({ error: "Failed to fetch course detail" });
    }
  }

  public static async enroll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const userId = req.user!.id;

      const course = await prisma.course.findUnique({
        where: { slug },
        include: {
          versions: {
            where: { isActive: true },
            include: {
              modules: {
                orderBy: { sequenceOrder: "asc" },
                include: {
                  chapters: {
                    orderBy: { sequenceOrder: "asc" },
                    include: { concepts: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!course || !course.versions[0]) {
        res.status(404).json({ error: "Course not found or has no active version" });
        return;
      }

      const activeVersion = course.versions[0];

      let enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseVersionId: {
            userId,
            courseVersionId: activeVersion.id,
          },
        },
      });

      if (!enrollment) {
        enrollment = await prisma.$transaction(async (tx: any) => {
          const created = await tx.enrollment.create({
            data: {
              userId,
              courseVersionId: activeVersion.id,
              status: "ACTIVE",
              currentTier: "EASY",
            },
          });

          const allConcepts = activeVersion.modules.flatMap((m: any) =>
            m.chapters.flatMap((c: any) => c.concepts)
          );

          for (const concept of allConcepts) {
            await tx.conceptMastery.create({
              data: {
                enrollmentId: created.id,
                conceptId: concept.id,
                pMastery: 0.15,
                confidence: 0.20,
                state: "UNENCOUNTERED",
              },
            });
          }

          const firstChapter = activeVersion.modules[0]?.chapters[0];
          if (firstChapter) {
            await tx.learningSession.create({
              data: {
                enrollmentId: created.id,
                chapterId: firstChapter.id,
                phase: "TEACHING",
                isActive: true,
              },
            });
          }

          return created;
        });
      }

      res.status(200).json({
        message: "Enrollment successful",
        enrollmentId: enrollment.id,
        courseSlug: course.slug,
      });
    } catch (err) {
      console.error("Enrollment error:", err);
      res.status(500).json({ error: "Failed to enroll in course" });
    }
  }
}
