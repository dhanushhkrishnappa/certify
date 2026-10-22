import { describe, it, expect, vi } from "vitest";
import crypto from "crypto";
import { CredentialCryptoService } from "./crypto.service.js";
import { app } from "../../app.js";
import { prisma } from "../../shared/prisma.js";
import { config } from "../../config/index.js";

describe("RFC 8032 Ed25519 Cryptographic Credential Signing & Key Lifecycle", () => {
  const samplePayload = {
    compositeScore: 0.942,
    courseSlug: "python-fundamentals",
    courseTitle: "Python Fundamentals",
    courseVersion: "1.0.0",
    credentialId: "CERT-2026-PY-A1B2C3",
    enrollmentId: "enrollment-uuid-1234",
    issuedAt: "2026-10-22T12:00:00.000Z",
    recipientName: "Alice Learner",
    ruleVersion: "2026.1",
    tier: "ADVANCED",
  };

  it("signs a canonical credential payload and produces a 64-byte Ed25519 hex signature", () => {
    const { signature, keyId } = CredentialCryptoService.signCredential(samplePayload);
    expect(signature).toBeDefined();
    expect(signature).toHaveLength(128); // 64 bytes = 128 hex chars
    expect(keyId).toBeDefined();
  });

  it("successfully verifies an unaltered canonical credential payload", () => {
    const { signature, keyId } = CredentialCryptoService.signCredential(samplePayload);
    const isValid = CredentialCryptoService.verifyCredential(samplePayload, signature, keyId);
    expect(isValid).toBe(true);
  });

  it("rejects verification if any field in the payload is tampered with", () => {
    const { signature, keyId } = CredentialCryptoService.signCredential(samplePayload);

    // Tamper with recipient name
    const tamperedPayload = { ...samplePayload, recipientName: "Eve Attacker" };
    expect(CredentialCryptoService.verifyCredential(tamperedPayload, signature, keyId)).toBe(false);

    // Tamper with composite score
    const tamperedScore = { ...samplePayload, compositeScore: 0.999 };
    expect(CredentialCryptoService.verifyCredential(tamperedScore, signature, keyId)).toBe(false);

    // Tamper with tier
    const tamperedTier = { ...samplePayload, tier: "ADVANCED_PLUS" };
    expect(CredentialCryptoService.verifyCredential(tamperedTier, signature, keyId)).toBe(false);
  });

  it("rejects altered or corrupted signature hashes", () => {
    const { signature, keyId } = CredentialCryptoService.signCredential(samplePayload);
    const corruptedSig = signature.slice(0, -1) + (signature.endsWith("0") ? "1" : "0");
    expect(CredentialCryptoService.verifyCredential(samplePayload, corruptedSig, keyId)).toBe(false);
  });

  it("exports public key metadata including Ed25519 algorithm, fingerprint, and Key ID", () => {
    const meta = CredentialCryptoService.getPublicKeyMetadata();
    expect(meta.algorithm).toBe("Ed25519");
    expect(meta.keyId).toBeDefined();
    expect(meta.publicKeyPem).toContain("BEGIN PUBLIC KEY");
    expect(meta.keyFingerprint).toMatch(/^ed25519:[a-f0-9]{16}$/);
  });

  it("proves that a credential signed with Key A remains verifiable after rotation to Key B", () => {
    // Generate Key A (Historical Key)
    const keyPairA = crypto.generateKeyPairSync("ed25519", {
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    const keyIdA = "certify-2025-key-historical";

    // Sign payload with Key A
    const messageBuffer = Buffer.from(
      JSON.stringify(
        Object.keys(samplePayload)
          .sort()
          .reduce((acc: any, k) => {
            acc[k] = (samplePayload as any)[k];
            return acc;
          }, {})
      ),
      "utf8"
    );
    const signatureA = crypto.sign(null, messageBuffer, keyPairA.privateKey).toString("hex");

    // Register Key A into trusted historical registry
    CredentialCryptoService.registerHistoricalPublicKey({
      keyId: keyIdA,
      algorithm: "Ed25519",
      publicKeyPem: keyPairA.publicKey,
      keyFingerprint: `ed25519:testfp1`,
      status: "HISTORICAL",
      validFrom: "2025-01-01T00:00:00.000Z",
    });

    // Verify: even though active key is Key B (from config), verification of Key A's signature succeeds!
    const isValidUnderHistoricalKey = CredentialCryptoService.verifyCredential(
      samplePayload,
      signatureA,
      keyIdA
    );
    expect(isValidUnderHistoricalKey).toBe(true);

    // Assert public key registry contains both keys
    const allKeys = CredentialCryptoService.getAllPublicKeys();
    expect(allKeys.some((k) => k.keyId === keyIdA)).toBe(true);
  });

  it("fails closed in production if persistent keys are missing (no ephemeral fallback)", () => {
    const originalEnv = config.nodeEnv;
    const originalPriv = config.ed25519PrivateKeyPem;
    const originalPub = config.ed25519PublicKeyPem;

    try {
      (config as any).nodeEnv = "production";
      (config as any).ed25519PrivateKeyPem = "";
      (config as any).ed25519PublicKeyPem = "";
      CredentialCryptoService.resetKeyCache();

      expect(() => CredentialCryptoService.getPublicKeyMetadata()).toThrow(
        /CRITICAL CRYPTO ERROR: ED25519_PRIVATE_KEY_PEM and ED25519_PUBLIC_KEY_PEM must be explicitly set/
      );
    } finally {
      (config as any).nodeEnv = originalEnv;
      (config as any).ed25519PrivateKeyPem = originalPriv;
      (config as any).ed25519PublicKeyPem = originalPub;
      CredentialCryptoService.resetKeyCache();
    }
  });

  it("correctly reports revoked credentials as revoked", async () => {
    const issuedDate = new Date("2026-10-22T12:00:00.000Z");
    const { signature, keyId } = CredentialCryptoService.signCredential(samplePayload);

    vi.spyOn(prisma.certificate, "findUnique").mockResolvedValue({
      id: "cert-revoked-1",
      credentialId: "CERT-2026-PY-REVOKED",
      enrollmentId: "enrollment-uuid-1234",
      tier: "ADVANCED",
      compositeScore: 0.942,
      evidenceSummary: JSON.stringify({ keyId }),
      signatureHash: signature,
      status: "REVOKED",
      issuedAt: issuedDate,
      keyId,
      revokedAt: new Date(),
      revocationReason: "Academic integrity violation",
      enrollment: {
        id: "enrollment-uuid-1234",
        user: { fullName: "Alice Learner" },
        courseVersion: {
          versionNumber: "1.0.0",
          course: { title: "Python Fundamentals", slug: "python-fundamentals" },
        },
      },
    } as any);

    const res = await app.request("/api/v1/certificates/CERT-2026-PY-REVOKED/verify");
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.isValid).toBe(false); // Revoked credentials are NOT valid
    expect(body.status).toBe("REVOKED");

    vi.restoreAllMocks();
  });

  it("enforces public verification privacy: pseudonymizes recipient and conceals internal database IDs", async () => {
    const issuedDate = new Date("2026-10-22T12:00:00.000Z");
    const { signature, keyId } = CredentialCryptoService.signCredential(samplePayload);

    vi.spyOn(prisma.certificate, "findUnique").mockResolvedValue({
      id: "internal-cert-db-id-9999",
      credentialId: "CERT-2026-PY-A1B2C3",
      enrollmentId: "enrollment-uuid-1234",
      tier: "ADVANCED",
      compositeScore: 0.942,
      evidenceSummary: JSON.stringify({ keyId }),
      signatureHash: signature,
      status: "VALID",
      issuedAt: issuedDate,
      keyId,
      revokedAt: null,
      revocationReason: null,
      enrollment: {
        id: "enrollment-uuid-1234",
        user: { fullName: "Alice Learner" },
        courseVersion: {
          versionNumber: "1.0.0",
          course: { title: "Python Fundamentals", slug: "python-fundamentals" },
        },
      },
    } as any);

    const res = await app.request("/api/v1/certificates/CERT-2026-PY-A1B2C3/verify");
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.isValid).toBe(true);
    expect(body.credentialId).toBe("CERT-2026-PY-A1B2C3");
    // Pseudonymized name (NOT zero-PII)
    expect(body.recipientName).toBe("A***e L.");
    expect(body.courseTitle).toBe("Python Fundamentals");
    expect(body.tier).toBe("ADVANCED");

    // CRITICAL PRIVACY CHECKS: Proves internal identifiers are NEVER exposed
    expect(body.id).toBeUndefined();
    expect(body.enrollmentId).toBeUndefined();
    expect(body.internalId).toBeUndefined();
    expect(body.rawAnswers).toBeUndefined();
    expect(body.evidenceSummary).toBeUndefined();

    vi.restoreAllMocks();
  });
});
