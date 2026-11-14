import { Hono } from "hono";
import { prisma } from "../../shared/prisma.js";
import { honoAuthMiddleware } from "../../shared/middleware/honoAuth.js";

export const coursesHonoRouter = new Hono();

// List Published Courses
coursesHonoRouter.get("/", async (c) => {
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

    const catalog = courses.map((course) => {
      const activeVersion = course.versions[0];
      const chapterCount = activeVersion
        ? activeVersion.modules.reduce((acc, m) => acc + m.chapters.length, 0)
        : 0;

      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        summary: course.summary,
        version: activeVersion?.versionNumber || "1.0.0",
        moduleCount: activeVersion?.modules.length || 0,
        chapterCount,
        tierOfferings: ["Foundation (Easy)", "Proficient (Medium)", "Advanced (Hard)"],
      };
    });

    return c.json({ courses: catalog });
  } catch (err: any) {
    return c.json({ error: "Failed to fetch courses", details: err?.message }, 500);
  }
});

// Get Course by Slug
coursesHonoRouter.get("/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
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
      return c.json({ error: "Course not found" }, 404);
    }

    const activeVersion = course.versions[0];
    return c.json({
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
  } catch (err: any) {
    return c.json({ error: "Failed to fetch course details", details: err?.message }, 500);
  }
});

// Explicit Enrollment Endpoint (Atomic Transaction)
coursesHonoRouter.post("/:slug/enroll", honoAuthMiddleware, async (c) => {
  try {
    const slug = c.req.param("slug");
    const user = c.get("user");

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
      return c.json({ error: "Course not found or has no active version" }, 404);
    }

    const activeVersion = course.versions[0];

    // Check existing enrollment (Idempotent)
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseVersionId: {
          userId: user.id,
          courseVersionId: activeVersion.id,
        },
      },
    });

    if (existingEnrollment) {
      return c.json({
        message: "Already enrolled",
        enrollmentId: existingEnrollment.id,
        courseSlug: course.slug,
      });
    }

    // Atomic transaction initializing enrollment, concept masteries, and first chapter session
    const newEnrollment = await prisma.$transaction(async (tx) => {
      const firstChapter = activeVersion.modules[0]?.chapters[0];
      const enrollment = await tx.enrollment.create({
        data: {
          userId: user.id,
          courseVersionId: activeVersion.id,
          currentChapterId: firstChapter?.id || null,
          status: "ACTIVE",
          currentTier: "EASY",
        },
      });

      const allConcepts = activeVersion.modules.flatMap((m) =>
        m.chapters.flatMap((ch) => ch.concepts)
      );

      for (const concept of allConcepts) {
        await tx.conceptMastery.create({
          data: {
            enrollmentId: enrollment.id,
            conceptId: concept.id,
            pMastery: 0.15,
            confidence: 0.20,
            state: "UNENCOUNTERED",
          },
        });
      }

      if (firstChapter) {
        await tx.learningSession.create({
          data: {
            enrollmentId: enrollment.id,
            chapterId: firstChapter.id,
            phase: "TEACHING",
            isActive: true,
          },
        });
      }

      return enrollment;
    });

    return c.json(
      {
        message: "Enrollment successful",
        enrollmentId: newEnrollment.id,
        courseSlug: course.slug,
      },
      201
    );
  } catch (err: any) {
    return c.json({ error: "Enrollment failed", details: err?.message }, 500);
  }
});
