import { Router } from "express";
import { CertificatesController } from "./certificates.controller.js";
import { requireAuth, requireRole } from "../../shared/middleware/auth.js";

export const certificatesRouter = Router();

certificatesRouter.get("/public-key", CertificatesController.getPublicKey);
certificatesRouter.get("/mine", requireAuth, CertificatesController.listMyCredentials);
certificatesRouter.post("/issue", requireAuth, CertificatesController.issueCertificate);
certificatesRouter.get("/:credentialId/verify", CertificatesController.verifyPublicCredential);
certificatesRouter.post(
  "/:credentialId/revoke",
  requireAuth,
  requireRole(["ADMIN", "INSTRUCTOR"]),
  CertificatesController.revokeCredential
);
