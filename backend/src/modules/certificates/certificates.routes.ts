import { Router } from "express";
import { CertificatesController } from "./certificates.controller.js";
import { requireAuth } from "../../shared/middleware/auth.js";

export const certificatesRouter = Router();

certificatesRouter.post("/issue", requireAuth, CertificatesController.issueCertificate);
certificatesRouter.get("/:credentialId/verify", CertificatesController.verifyPublicCredential);
