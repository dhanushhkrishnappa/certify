# CERTIFY — Certification Pipeline & Cryptographic Verification Audit
**Document ID:** `docs/audit/08_CERTIFICATION_AUDIT.md`  
**Audit Date:** 2026-10-03  
**Auditor:** Antigravity Agentic Verification Engine  
**Classification:** Certification Engine, Credential Authority, & Cryptographic Integrity Audit  

---

## 1. Executive Summary

The canonical specification for CERTIFY mandates:
> *"Certification is based on accumulated evidence... Deterministic backend rules decide certification outcomes... The LLM MUST NOT be the certification authority... Credentials have a unique credential ID and public verification... Certification evidence must be traceable and auditable."*

**Key Findings:**
1. **Deterministic Authority Separation is Preserved (Pass):** The LLM does not decide certification outcomes. Certification is executed by deterministic backend code in `CertificationEvaluator.evaluateCredential()`.
2. **Fabricated Inputs to Certification Pipeline (Critical - P0):** Because 4 of the 5 input parameters (`practicalScore = 0.92`, `vivaScore = 0.88`, `consistency = 0.86`, `interactionDepth = 0.82`) are hardcoded constants in `certificates.controller.ts:51-56`, every student whose chapter mastery reaches 0.70 is automatically awarded a certificate with fake multi-modal scores.
3. **Cryptographic Signing Claim is False (High - P1):** Platform documentation and design systems claim credentials use *Ed25519 asymmetric public-key cryptography*. The actual implementation uses symmetric `crypto.createHmac("sha256", config.jwtSecret)`. Furthermore, the public verification endpoint never verifies the hash.
4. **Public Verification Catch-All Vulnerability (Critical - P0):** If an invalid, non-existent, or revoked credential ID is queried, the frontend `PublicVerifyView.tsx:28-54` catches the 404 error and displays a verified credential for "Sophia Chen" in "Distributed Systems" with a 94.8% score.

---

## 2. End-to-End Certification Pipeline Trace

```
[ Learner Requests Issue ] ──► POST /api/v1/certificates/issue
                                      │
                                      ▼
                      [ Step 1: Ownership Verification ]
                      enrollment.userId === req.user.id
                                      │
                                      ▼
                      [ Step 2: Evidence Aggregation ]
                      meanMastery = sum(pMastery) / count
                      practicalScore = 0.92 (HARDCODED)
                      vivaScore = 0.88      (HARDCODED)
                      consistency = 0.86    (HARDCODED)
                      interactionDepth = 0.82 (HARDCODED)
                                      │
                                      ▼
                      [ Step 3: Evaluation & Tier Award ]
                      CertificationEvaluator.evaluateCredential()
                      Composite = 0.30*Chap + 0.25*Prac + 0.20*Viva + 0.15*Cons + 0.10*Depth
                                      │
                                      ▼
                      [ Step 4: Credential ID Generation ]
                      `CERT-${year}-PY-${randomBytes(3)}`
                                      │
                                      ▼
                      [ Step 5: Signature Calculation ]
                      HMAC-SHA256(payload, jwtSecret)
                                      │
                                      ▼
                      [ Step 6: Database Persistence ]
                      Prisma creates Certificate row
                      Enrollment marked COMPLETED
```

---

## 3. Evaluation Rules & Tiering Formula Audit

The deterministic logic is implemented in `backend/src/modules/mastery/bkt.ts:55-111`:

```typescript
const compositeScore = Number(
  (
    0.30 * evidence.chapterMasteryScore +
    0.25 * evidence.practicalPerformance +
    0.20 * evidence.vivaDefenseScore +
    0.15 * evidence.consistencyIndex +
    0.10 * evidence.interactionDepthScore
  ).toFixed(4)
);
```

### Tier Award Criteria:
1. **Gating Rule:** If `chapterMasteryScore < 0.70`, return `tier: "NONE"`, `isCertified: false`.
2. **ADVANCED Tier Requirements:**
   - `compositeScore >= 0.92` AND
   - `practicalPerformance >= 0.90` AND
   - `vivaDefenseScore >= 0.90` AND
   - `consistencyIndex >= 0.85`
3. **PROFICIENT Tier Requirements:**
   - `compositeScore >= 0.85` AND
   - `practicalPerformance >= 0.80` AND
   - `vivaDefenseScore >= 0.75`
4. **FOUNDATION Tier Requirements:**
   - `compositeScore >= 0.70`
5. **Failing / Ineligible:**
   - `compositeScore < 0.70` $\rightarrow$ `tier: "NONE"`.

### Mathematical Impact of Hardcoded Constants:
With hardcoded values $Prac=0.92$, $Viva=0.88$, $Cons=0.86$, $Depth=0.82$:
$$\text{Fixed Component Sum} = (0.25 \times 0.92) + (0.20 \times 0.88) + (0.15 \times 0.86) + (0.10 \times 0.82) = 0.617$$
$$\text{Composite Score} = (0.30 \times \text{meanMastery}) + 0.617$$

- If a student barely meets the 0.70 mastery threshold:
  $$\text{Composite Score} = (0.30 \times 0.70) + 0.617 = 0.210 + 0.617 = 0.827$$
  Since $0.827 \ge 0.70$, they are immediately awarded **FOUNDATION**.
- If a student reaches 0.78 chapter mastery:
  $$\text{Composite Score} = (0.30 \times 0.78) + 0.617 = 0.234 + 0.617 = 0.851$$
  Since $0.851 \ge 0.85$, and the hardcoded practical ($0.92 \ge 0.80$) and viva ($0.88 \ge 0.75$) conditions pass, the student is automatically awarded **PROFICIENT**!
- If a student reaches 1.0 mastery:
  $$\text{Composite Score} = 0.30 + 0.617 = 0.917 < 0.92$$
  They can never reach ADVANCED because viva ($0.88 < 0.90$) fails the gating check!

**Conclusion:** The certification engine is mathematically locked into awarding either FOUNDATION or PROFICIENT solely based on chapter mastery, while claiming to evaluate multi-modal evidence.

---

## 4. Cryptographic Claims vs Reality

| Feature | Claimed / Documented | Actual Implementation | Security & Validity Verdict |
|---|---|---|---|
| **Algorithm** | Ed25519 (Asymmetric) | HMAC-SHA256 (Symmetric) | **MISMATCH (P1).** HMAC uses a shared secret (`jwtSecret`). Verifiers cannot check signatures without knowing the private server secret. |
| **Key Management** | Public / Private Keypair | Single server environment variable `JWT_SECRET` | Insecure. Any leak of `JWT_SECRET` allows forging arbitrary certificates and JWTs. |
| **Signature Payload** | Canonical JSON canonicalization | Template string: `${credentialId}:${enrollment.id}:${tier}:${compositeScore}` | Fragile. Does not include issue timestamp, learner ID, or evidence hash. |
| **Lookup Verification** | Signature cryptographically checked on query | `verifyPublicCredential` simply returns `certificate.signatureHash` | **UNVERIFIED (P1).** The server does not re-compute or verify the hash on lookup. |
| **Revocation Check** | Certificate status checked against revocation list | `status: certificate.status === "VALID"` | Verified in DB query. No CRL or revocation reason tracked. |

---

## 5. Public Verification Frontend Flaw (`PublicVerifyView.tsx`)

In `frontend/src/components/PublicVerifyView.tsx:28-54`:

```typescript
api.verifyPublicCredential(credentialId.trim())
  .then((data) => {
    if (mounted) setVerification(data);
  })
  .catch(() => {
    // CRITICAL SECURITY FLAW:
    if (mounted) {
      setVerification({
        id: credentialId.trim(),
        credentialId: credentialId.trim(),
        courseTitle: "Distributed Systems & Consensus Architecture",
        learnerName: "Sophia Chen",
        issueDate: "2026-09-22T00:00:00.000Z",
        verified: true, // Claims the credential is authentic!
        masteryLevel: "Advanced Tier (L4 Proven)",
        ...
      });
    }
  });
```

### Exploit & Integrity Risk:
- Anyone can navigate to `http://localhost:5173/verify/CERT-FAKE-FORGED-1234`.
- The backend returns `404 Not Found`.
- The frontend `.catch()` handler intercepts the 404 and displays a verified badge, emerald checkmark, and full credential breakdown for "Sophia Chen".
- **Verdict:** Under no circumstances should an error or 404 render a valid credential badge.

---

## 6. Required Certification Remediation Tasks

1. **[P0] Remove Synthetic Catch Block in `PublicVerifyView.tsx`:** Display an explicit "Credential Not Found / Invalid" alert when `api.verifyPublicCredential` returns 404 or errors.
2. **[P0] Replace Hardcoded Evidence in `CertificatesController.issueCertificate`:**
   - Compute `practicalPerformance` by querying passed tests from `AssessmentAttempt` (type: `PRACTICAL`).
   - Compute `vivaDefenseScore` by querying rubric ratings from `AssessmentAttempt` (type: `VIVA`).
   - Calculate genuine `consistencyIndex` from chapter assessment score variance.
   - Calculate `interactionDepthScore` from dialogue evidence count.
3. **[P1] Implement Genuine Ed25519 Signatures:**
   - Generate an Ed25519 keypair (`crypto.generateKeyPairSync("ed25519")`).
   - Sign credential payloads using the private key.
   - Expose the public key at `GET /api/v1/certificates/public-key`.
   - Re-verify signatures inside `verifyPublicCredential` before confirming authenticity.
4. **[P1] Standardize Credential ID Format:**
   - Format: `CERT-${YYYY}-${COURSE_CODE}-${NANOID}`.
   - Ensure globally unique index and collision prevention.
5. **[P2] Certificate Revocation Endpoint:**
   - Implement `POST /api/v1/certificates/:id/revoke` with admin role requirement and audit log.
