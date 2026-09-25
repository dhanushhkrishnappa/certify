import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../../shared/prisma.js";
import { config } from "../../config/index.js";
import { AuthenticatedRequest } from "../../shared/middleware/auth.js";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, fullName } = RegisterSchema.parse(req.body);

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json({ error: "Email is already registered" });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          role: "STUDENT",
        },
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: "7d" }
      );

      res.status(201).json({
        user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
        token,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: err.errors });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = LoginSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: "7d" }
      );

      res.json({
        user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
        token,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: err.errors });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }

  public static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
          enrollments: {
            include: {
              courseVersion: {
                include: { course: true },
              },
              certificate: true,
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
