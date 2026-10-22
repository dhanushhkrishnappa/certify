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

export interface PublicKeyRecord {
  keyId: string;
  algorithm: "Ed25519";
  publicKeyPem: string;
  keyFingerprint: string;
  status: "ACTIVE" | "HISTORICAL" | "REVOKED";
  validFrom: string;
}

// Trusted Public Key Registry supporting Key Rotation and Historical Verification
const HISTORICAL_KEY_REGISTRY = new Map<string, PublicKeyRecord>();

let cachedActiveKeyPair: {
  privateKeyPem: string;
  publicKeyPem: string;
  keyFingerprint: string;
  keyId: string;
} | null = null;

function computeFingerprint(pem: string): string {
  const fp = crypto.createHash("sha256").update(pem).digest("hex").slice(0, 16);
  return `ed25519:${fp}`;
}

function ensureActiveKeyPair(): {
  privateKeyPem: string;
  publicKeyPem: string;
  keyFingerprint: string;
  keyId: string;
} {
  if (cachedActiveKeyPair) return cachedActiveKeyPair;

  if (config.ed25519PrivateKeyPem && config.ed25519PublicKeyPem) {
    const fingerprint = computeFingerprint(config.ed25519PublicKeyPem);
    cachedActiveKeyPair = {
      privateKeyPem: config.ed25519PrivateKeyPem,
      publicKeyPem: config.ed25519PublicKeyPem,
      keyFingerprint: fingerprint,
      keyId: config.ed25519KeyId,
    };

    // Register in public registry
    HISTORICAL_KEY_REGISTRY.set(config.ed25519KeyId, {
      keyId: config.ed25519KeyId,
      algorithm: "Ed25519",
      publicKeyPem: config.ed25519PublicKeyPem,
      keyFingerprint: fingerprint,
      status: "ACTIVE",
      validFrom: "2026-01-01T00:00:00.000Z",
    });

    return cachedActiveKeyPair;
  }

  // Production must fail closed if persistent keys are missing
  if (config.nodeEnv === "production") {
    throw new Error(
      "CRITICAL CRYPTO ERROR: ED25519_PRIVATE_KEY_PEM and ED25519_PUBLIC_KEY_PEM must be explicitly set in production."
    );
  }

  // Development/Test ephemeral key generation
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519", {
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  const fingerprint = computeFingerprint(publicKey);
  cachedActiveKeyPair = {
    privateKeyPem: privateKey,
    publicKeyPem: publicKey,
    keyFingerprint: fingerprint,
    keyId: config.ed25519KeyId,
  };

  HISTORICAL_KEY_REGISTRY.set(config.ed25519KeyId, {
    keyId: config.ed25519KeyId,
    algorithm: "Ed25519",
    publicKeyPem: publicKey,
    keyFingerprint: fingerprint,
    status: "ACTIVE",
    validFrom: new Date().toISOString(),
  });

  return cachedActiveKeyPair;
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
  /**
   * Registers a historical public key into the trusted registry for rotation support.
   */
  public static registerHistoricalPublicKey(record: PublicKeyRecord): void {
    HISTORICAL_KEY_REGISTRY.set(record.keyId, record);
  }

  /**
   * Retrieves all active and historical public keys in the registry.
   */
  public static getAllPublicKeys(): PublicKeyRecord[] {
    ensureActiveKeyPair();
    return Array.from(HISTORICAL_KEY_REGISTRY.values());
  }

  /**
   * Retrieves active signing public key metadata.
   */
  public static getPublicKeyMetadata(): {
    algorithm: "Ed25519";
    publicKeyPem: string;
    keyFingerprint: string;
    keyId: string;
  } {
    const kp = ensureActiveKeyPair();
    return {
      algorithm: "Ed25519",
      publicKeyPem: kp.publicKeyPem,
      keyFingerprint: kp.keyFingerprint,
      keyId: kp.keyId,
    };
  }

  /**
   * Signs a canonical credential payload using the active private key.
   */
  public static signCredential(payload: CanonicalCredentialPayload | Record<string, any>): {
    signature: string;
    keyId: string;
  } {
    const kp = ensureActiveKeyPair();
    const messageBuffer = canonicalize(payload);
    const sig = crypto.sign(null, messageBuffer, kp.privateKeyPem);
    return {
      signature: sig.toString("hex"),
      keyId: kp.keyId,
    };
  }

  /**
   * Verifies a credential signature against either:
   * 1. The historical public key associated with the specified keyId
   * 2. The active public key
   * 3. An explicit publicKeyPemOverride
   */
  public static verifyCredential(
    payload: CanonicalCredentialPayload | Record<string, any>,
    signatureHex: string,
    keyId?: string,
    publicKeyPemOverride?: string
  ): boolean {
    if (!signatureHex || typeof signatureHex !== "string") return false;
    try {
      const activeKp = ensureActiveKeyPair();
      const messageBuffer = canonicalize(payload);
      const sigBuffer = Buffer.from(signatureHex, "hex");
      if (sigBuffer.length !== 64) return false;

      // Select public key: explicit override -> historical registry by keyId -> active key
      let keyToUse = publicKeyPemOverride;
      if (!keyToUse && keyId && HISTORICAL_KEY_REGISTRY.has(keyId)) {
        keyToUse = HISTORICAL_KEY_REGISTRY.get(keyId)!.publicKeyPem;
      }
      if (!keyToUse) {
        keyToUse = activeKp.publicKeyPem;
      }

      return crypto.verify(null, messageBuffer, keyToUse, sigBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Clears in-memory keys (for test isolation).
   */
  public static resetKeyCache(): void {
    cachedActiveKeyPair = null;
    HISTORICAL_KEY_REGISTRY.clear();
  }
}
