import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { requireAuth } from "../../shared/middleware/auth.js";
import { createRateLimiter } from "../../shared/middleware/rateLimit.js";

export const authRouter = Router();

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 30,
  keyPrefix: "auth",
});

authRouter.post("/register", authLimiter, AuthController.register);
authRouter.post("/login", authLimiter, AuthController.login);
authRouter.get("/me", requireAuth, AuthController.getMe);
