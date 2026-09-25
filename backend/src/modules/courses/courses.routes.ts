import { Router } from "express";
import { CoursesController } from "./courses.controller.js";
import { requireAuth } from "../../shared/middleware/auth.js";

export const coursesRouter = Router();

coursesRouter.get("/", CoursesController.listCourses);
coursesRouter.get("/:slug", CoursesController.getCourseBySlug);
coursesRouter.post("/:slug/enroll", requireAuth, CoursesController.enroll);
