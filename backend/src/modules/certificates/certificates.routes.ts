import { Router } from "express";
import { CertificatesController } from "./certificates.controller.js";
import { requireAuth, requireRole } from "../../shared/middleware/auth.js";
import { rateLimitMiddleware } from "../../shared/middleware/rateLimit.js";

export const certificatesRouter = Router();

// Public key registry endpoint for external verifiers
certificatesRouter.get("/keys", CertificatesController.getPublicKeyMetadata);

// Public verification endpoint with zero-PII
certificatesRouter.get(
  "/:credentialId/verify",
  rateLimitMiddleware(60, 60), // 60 requests per minute
  CertificatesController.verifyPublicCredential
);

// Authenticated issue endpoint
certificatesRouter.post(
  "/issue",
  requireAuth,
  rateLimitMiddleware(10, 60), // 10 issuance requests per minute
  CertificatesController.issueCertificate
);

// Scoped revocation endpoint (ADMIN or INSTRUCTOR only)
certificatesRouter.post(
  "/:credentialId/revoke",
  requireAuth,
  requireRole(["ADMIN", "INSTRUCTOR"]),
  CertificatesController.revokeCredential
);
