# CERTIFY — End-to-End Production Test Plan & Quality Gates

**Document Path:** `docs/CERTIFY_END_TO_END_TEST_PLAN.md`  
**Version:** `2026.10-PRODUCTION`  
**Status:** `ACTIVE VERIFICATION SPECIFICATION`

---

## 1. Testing Philosophy & Release Standard
CERTIFY must be tested as an end-to-end connected system rather than isolated UI screens or math functions. No release is production-ready unless:
1. Every certification score component is proven to come from persisted, attributable database records.
2. Horizontal privilege escalation (`IDOR`) across sessions, assessments, practical runs, viva turns, and credentials is blocked with `403 Forbidden`.
3. Negated or keyword-stuffed learner answers do not falsely trigger mastery or pass assessments.
4. Untrusted Python code runs inside an isolated, resource-limited subprocess that blocks network access, filesystem escape, secret leakage, and infinite loops.
5. Issued credentials use genuine `Ed25519` digital signatures that fail verification if the database record is tampered with or revoked.

---

## 2. Test Layers & Coverage Matrix

| Layer | Suite File / Location | Target Scope | Release Gate |
| :--- | :--- | :--- | :--- |
| **1. Unit Tests** | `backend/src/modules/mastery/bkt.test.ts` | BKT probability transitions, clamping `[0.01, 0.99]`, `CertificationEvaluator` deterministic composite formula & tier gates (`NONE`, `FOUNDATION`, `PROFICIENT`, `ADVANCED`), Ed25519 signing/verification & tamper detection. | 100% pass required on every build. |
| **2. Access-Control & IDOR Security Suite** | `backend/src/app.test.ts` (`describe("Security & IDOR Protection")`) | Cross-user (`Learner A` vs `Learner B`) attacks on `POST /sessions/:id/messages`, `POST /sessions/:id/advance`, `POST /assessments/chapters/:id/submit`, `POST /assessments/diagnostic/submit`, `POST /assessments/remediation/submit`, `POST /assessments/practical/submit`, `POST /assessments/final/viva`, `POST /certificates/issue`, and non-admin `POST /certificates/:id/revoke`. | 100% of cross-user mutations must return `403` or `404` with zero DB mutation. |
| **3. AI Orchestration & Rubric Evaluator Suite** | `backend/src/app.test.ts` (`describe("AI Provider & Rubric Evaluation Quality")`) | Negation rejection (`"I don't understand pointers"`, `"variables are not references"`), short/keyword-stuffed rejection, per-question concept scoping (no nested-loop multiplication), conversational tutor non-authority (chat turns never mutate `ConceptMastery`), malformed evaluator schema fail-closed handling. | 0 false-positive mastery grants on negated or adversarial inputs. |
| **4. Practical Code Sandbox Isolation Suite** | `backend/src/app.test.ts` (`describe("Practical Code Sandbox Isolation")`) | Valid Python 3 solution execution & unit test verification; syntax error handling; infinite loop (`while True: pass`) timeout enforcement; memory exhaustion cap; blocked imports (`import socket`, `import subprocess`, `import urllib.request`); environment secret isolation (`os.environ` contains zero API keys/JWT secrets); output truncation (`>16KB`). | All hostile payloads contained within `<3.5s` with temp directory cleanup verified. |
| **5. Credential Lifecycle & Cryptographic Suite** | `backend/src/app.test.ts` (`describe("Credential Issuance, Ed25519 Signing & Verification")`) | Premature issuance rejection when practical/viva/chapter evidence is missing; idempotent issuance on duplicate requests; public key PEM export (`GET /certificates/public-key`); Ed25519 signature verification (`signatureVerified: true`); database tamper detection (modifying `tier` or `compositeScore` in DB causes `isValid: false, signatureVerified: false`); admin revocation (`status: "REVOKED"` causes `isValid: false`). | 100% deterministic reproducibility and cryptographic tamper detection. |
| **6. Full End-to-End Learner Journey Suite** | `backend/src/app.test.ts` (`describe("End-to-End Connected Learner Journey")`) | Complete vertical journey from a clean database: Register new learner → Browse catalog → Enroll in `python-fundamentals` → Complete Baseline Diagnostic → Stream Socratic AI tutor dialogue over SSE → Trigger & resolve Misconception Remediation → Complete Chapter Assessments across curriculum & advance chapters via server gates → Submit Practical LRU Cache code in sandbox → Complete 3-turn persisted AI Viva defense → Issue Certificate → Verify publicly without PII leakage. | Full journey passes end-to-end without manual DB edits (`updateMany`) or hardcoded scores. |

---

## 3. Detailed Test Cases by Category (Phase 10 Specification)

### 3.1 Evidence Integrity Test Cases
- **TC-EVID-01 (No Hardcoded Fallbacks):** Enroll a learner, set chapter mastery to `0.90`, but do not submit a `PRACTICAL` or `VIVA` attempt. Call `POST /api/v1/certificates/issue`. **Expected:** `400 Bad Request` (`"Certificate Requirements Not Met"`), proving hardcoded `0.92` / `0.88` constants are gone.
- **TC-EVID-02 (Tutor Non-Authority):** Send 10 chat messages containing every technical keyword (`pointer`, `reference`, `lazy`, `closure`, `immutable`, `hash`, `o(1)`) to `POST /api/v1/sessions/:sessionId/messages`. Query `ConceptMastery`. **Expected:** `pMastery` remains unchanged from prior (`0.15` or post-diagnostic prior); tutor dialogue cannot award mastery or certification credit.
- **TC-EVID-03 (Idempotent Issuance):** Call `POST /api/v1/certificates/issue` twice concurrently/sequentially for an eligible enrollment. **Expected:** Exactly one `Certificate` record is created and returned with the same `credentialId` and `signatureHash`.

### 3.2 Access-Control & IDOR Test Cases
- **TC-SEC-01:** Learner B calls `POST /api/v1/sessions/<Learner_A_SessionId>/messages`. **Expected:** `403 Forbidden`.
- **TC-SEC-02:** Learner B calls `POST /api/v1/sessions/<Learner_A_SessionId>/advance`. **Expected:** `403 Forbidden`.
- **TC-SEC-03:** Learner B calls `POST /api/v1/assessments/chapters/:chapterId/submit` with `enrollmentId: <Learner_A_EnrollmentId>`. **Expected:** `403 Forbidden`.
- **TC-SEC-04:** Learner B calls `POST /api/v1/assessments/final/viva` with `enrollmentId: <Learner_A_EnrollmentId>`. **Expected:** `403 Forbidden`.
- **TC-SEC-05:** Learner B calls `POST /api/v1/certificates/issue` with `enrollmentId: <Learner_A_EnrollmentId>`. **Expected:** `403` / `404`.
- **TC-SEC-06:** Student calls `POST /api/v1/certificates/:credentialId/revoke`. **Expected:** `403 Forbidden` (requires `ADMIN` or `INSTRUCTOR` role).
- **TC-SEC-07:** Unauthenticated verifier calls `GET /api/v1/certificates/:credentialId/verify`. **Expected:** `200 OK` containing only allowlisted public fields (`credentialId`, `recipientName`, `courseTitle`, `tier`, `compositeScore`, `status`, `issuedAt`, `evidenceSummary`, `signatureHash`, `signatureVerified`, `publicKeyFingerprint`) and **zero** `email`, `passwordHash`, or `ChatMessage` transcripts.

### 3.3 AI & Evaluator Quality Test Cases
- **TC-AI-01 (Negation Detection):** Submit chapter assessment answer `"I do not know what a pointer or reference in memory is, and I don't understand mutable objects."` **Expected:** `isDemonstrated = false`, score `0`, concept transitions to `NEEDS_REMEDIATION`.
- **TC-AI-02 (Keyword Stuffing Rejection):** Submit `"pointer reference lazy yield return immutable hash memory closure scope"`. **Expected:** Rejected for lacking coherent conceptual explanation (`isDemonstrated = false`).
- **TC-AI-03 (Schema Validation Fail-Closed):** Pass malformed JSON or unknown `criterionId` into `validateEvaluatorOutput()`. **Expected:** Throws validation error and records zero mastery credit.

### 3.4 Practical Code Sandbox Test Cases
- **TC-SBX-01 (Valid Python Execution):** Execute valid `LRUCache` / function implementation against test assertions. **Expected:** `status: "success"`, `testsPassed === totalTests`.
- **TC-SBX-02 (Infinite Loop Containment):** Execute `while True:
    pass`. **Expected:** Terminated within `3,000ms` with `status: "error"`, `errorType: "TIMEOUT"`.
- **TC-SBX-03 (Network & Subprocess Block):** Execute `import socket; s = socket.socket()` and `import subprocess; subprocess.run(['ls'])`. **Expected:** Blocked immediately by sandbox security guard (`status: "error"`, `errorType: "SECURITY_VIOLATION"`).
- **TC-SBX-04 (Secret Isolation):** Execute `import os; print(os.environ.get('JWT_SECRET', 'NONE'))`. **Expected:** Blocked or prints `NONE`; `JWT_SECRET` is never present in child environment.
- **TC-SBX-05 (Output Flood Cap):** Execute `print("A" * 100000)`. **Expected:** Output truncated cleanly at `16,384` bytes without crashing the host process.

### 3.5 Credential & Cryptographic Verification Test Cases
- **TC-CRED-01 (Ed25519 Verification):** Verify an issued credential via `GET /api/v1/certificates/:credentialId/verify` and independently verify `signatureHash` using the PEM from `GET /api/v1/certificates/public-key`. **Expected:** `isValid: true`, `signatureVerified: true`.
- **TC-CRED-02 (Tamper Detection):** Directly alter `Certificate.tier` from `"PROFICIENT"` to `"ADVANCED"` in the database without re-signing, then call `/verify`. **Expected:** `signatureVerified: false`, `isValid: false`.
- **TC-CRED-03 (Revocation Enforcement):** Admin calls `POST /api/v1/certificates/:credentialId/revoke`. Subsequent call to `/verify` returns `status: "REVOKED"`, `isValid: false`.
