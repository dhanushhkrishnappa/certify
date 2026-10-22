import crypto from "crypto";
import { config } from "../../config/index.js";

export interface CanonicalCredentialPayload {
  credentialId: string;
  enrollmentId: string;
  recipientName: string;
  courseSlug: string;
  courseTitle: string;
  courseVersion: number | string;
  tier: string;
  compositeScore: number;
  issuedAt: string;
  ruleVersion: string;
}

let cachedKeyPair: { privateKeyPem: string; publicKeyPem: string; keyFingerprint: string } | null =
  null;

function ensureKeyPair(): {
  privateKeyPem: string;
  publicKeyPem: string;
  keyFingerprint: string;
} {
  if (cachedKeyPair) return cachedKeyPair;

  if (config.ed25519PrivateKeyPem && config.ed25519PublicKeyPem) {
    const fp = crypto
      .createHash("sha256")
      .update(config.ed25519PublicKeyPem)
      .digest("hex")
      .slice(0, 16);
    cachedKeyPair = {
      privateKeyPem: config.ed25519PrivateKeyPem,
      publicKeyPem: config.ed25519PublicKeyPem,
      keyFingerprint: `ed25519:${fp}`,
    };
    return cachedKeyPair;
  }

  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519", {
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  const fp = crypto.createHash("sha256").update(publicKey).digest("hex").slice(0, 16);
  cachedKeyPair = {
    privateKeyPem: privateKey,
    publicKeyPem: publicKey,
    keyFingerprint: `ed25519:${fp}`,
  };
  return cachedKeyPair;
}

function canonicalize(payload: Record<string, any>): Buffer {
  const sortedKeys = Object.keys(payload).sort();
  const ordered: Record<string, any> = {};
  for (const k of sortedKeys) {
    ordered[k] = payload[k];
  }
  return Buffer.from(JSON.stringify(ordered), "utf8");
}

export class CredentialCryptoService {
  public static getPublicKeyMetadata(): {
    algorithm: "Ed25519";
    publicKeyPem: string;
    keyFingerprint: string;
  } {
    const kp = ensureKeyPair();
    return {
      algorithm: "Ed25519",
      publicKeyPem: kp.publicKeyPem,
      keyFingerprint: kp.keyFingerprint,
    };
  }

  public static signCredential(payload: CanonicalCredentialPayload | Record<string, any>): string {
    const kp = ensureKeyPair();
    const messageBuffer = canonicalize(payload);
    const sig = crypto.sign(null, messageBuffer, kp.privateKeyPem);
    return sig.toString("hex");
  }

  public static verifyCredential(
    payload: CanonicalCredentialPayload | Record<string, any>,
    signatureHex: string
  ): boolean {
    if (!signatureHex || typeof signatureHex !== "string") return false;
    try {
      const kp = ensureKeyPair();
      const messageBuffer = canonicalize(payload);
      const sigBuffer = Buffer.from(signatureHex, "hex");
      if (sigBuffer.length !== 64) return false;
      return crypto.verify(null, messageBuffer, kp.publicKeyPem, sigBuffer);
    } catch {
      return false;
    }
  }
}
