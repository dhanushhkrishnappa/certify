import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../../config/index.js";
import { prisma } from "../prisma.js";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  requestId?: string;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication token required" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: "Forbidden: Insufficient role permissions",
        requiredRoles: allowedRoles,
      });
      return;
    }
    next();
  };
}

/**
 * Verifies that the specified enrollment exists and belongs to the authenticated user.
 * Returns the enrollment or a status of "not_found" / "forbidden".
 */
export async function verifyEnrollmentOwnership(
  enrollmentId: string,
  userId: string
): Promise<{ status: "ok"; enrollment: any } | { status: "not_found" | "forbidden" }> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
  });
  if (!enrollment) {
    return { status: "not_found" };
  }
  if (enrollment.userId !== userId) {
    return { status: "forbidden" };
  }
  return { status: "ok", enrollment };
}
