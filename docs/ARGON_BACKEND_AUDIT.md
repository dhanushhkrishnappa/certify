# CERTIFY — Rigorous Engineering Re-Audit & Technical Specification: Argon Backend Implementation

**Audit Target:** `Argon/certify-main/backend`  
**Base Reference:** `backend/` (Root Project)  
**Git Commit:** `63a88f6f4a148efbc415d3282292144134d83ffe` (branch `main`)  
**Audit Date:** October 22, 2026  
**Auditor:** Antigravity AI Engineering & Security Systems  
**Audited Environment:** Windows 11 x64, Node.js `v22.23.2` (Active LTS), Python `3.13.9`  
**Overall Status:** `PARTIALLY IMPLEMENTED — NOT PRODUCTION-READY`

---

## 1. Executive Summary & Audit Methodology

This re-audit replaces and invalidates the previous preliminary assessment that categorized `Argon/certify-main/backend` as `"VERIFIED & PRODUCTION-HARDENED"`. Empirical testing and line-by-line inspection of the actual repository code reveal that while substantial architectural scaffolding and security patterns were introduced, several critical claims were either unverified, partially implemented, or reliant on simulations and flawed heuristics.

### Audit Summary Matrix

| Domain | Prior Audit Claim | Re-Audit Finding | Status |
| :--- | :--- | :--- | :--- |
| **Python Sandbox Execution** | "Isolated Python 3 Subprocess Sandbox ... blocks forbidden modules and file/network access before execution" | **CRITICAL SECURITY RISK**: Regex blacklist is trivially bypassed via `pathlib`, `importlib`, `globals()["__builtins__"]`, and MRO traversal (`().__class__.__base__.__subclasses__()`). POSIX `rlimit` silently fails on Windows (`try ... except: pass`). Direct RCE endpoint `POST /api/v1/execute` is exposed to all authenticated users. | **PARTIALLY IMPLEMENTED (Insecure)** |
| **Node.js Runtime Target** | "Node.js (v18.20+ / v20 LTS)" | Node.js 18 reached End-of-Life (EOL) on **April 30, 2025**. Node.js 20 is in Maintenance LTS (EOL April 2026). The supported target must be updated to **Node.js 22 LTS (Active)** or **Node.js 20 LTS (Maintenance minimum)**. | **VERIFIED COMPLETE (Target Updated)** |
| **Prisma Database Architecture** | "PostgreSQL ready via connection-string swap" | **FALSE**: `schema.prisma` statically sets `provider = "sqlite"`. Prisma cannot switch to PostgreSQL via connection string alone. Zero PostgreSQL migrations exist. `package.json` relies on `prisma db push` (prohibited in production). | **MISSING (Postgres Migrations)** |
| **AI Provider Integration** | "Vendor-Neutral AI Provider Adapter (Anthropic & OpenAI)" | **MOCKED/SIMULATED**: `AIProvider` contains **zero** HTTP or SDK calls to Anthropic or OpenAI. It returns identical hardcoded text and local keyword matching regardless of whether real API keys are configured. If `ALLOW_DEV_AI_FALLBACK="true"` is set, fallbacks run in production silently. | **MOCKED/HARDCODED** |
| **Remediation & BKT Math** | "Targeted Concept Remediation Plan & Recovery Check Loop" | **HEURISTIC HACK**: Line 643 in `assessment.controller.ts` calls `BayesianKnowledgeTracer.update(..., true)` **twice** for a single observation if $p < 0.75$, corrupting the mathematical integrity of the student model. | **PARTIALLY IMPLEMENTED (Flawed Math)** |
| **Certification Evidence Gating** | "100% Persisted Evidence ... zero mocks / zero hardcoding" | **PARTIALLY SOUND, PARTIALLY GAMED**: Eliminates the hardcoded scores (`0.92`, `0.88`, etc.), but `interactionDepth` (10% of composite score) is directly inflated by raw message counts (`userMessageCount * 0.03`), allowing spam to substitute for competence. Retake policies and score normalization are undefined. | **PARTIALLY IMPLEMENTED** |
| **Ed25519 Credential Signatures** | "RFC 8032 Asymmetric Ed25519 ... zero PII leakage" | **PARTIALLY IMPLEMENTED with PII & Ephemeral Key Risks**: Public endpoint exposes `recipientName` and `enrollmentId`. If `ED25519_PRIVATE_KEY_PEM` is unset, an in-memory key is generated on the fly, causing all historical certificates to fail verification on server restart. No Key ID (`kid`) or rotation mechanism exists. | **PARTIALLY IMPLEMENTED** |
| **Cross-User IDOR Protection** | "Completely cures IDOR" | `verifyEnrollmentOwnership` protects assessments, sessions, and certificate issuance. However, `POST /api/v1/execute` allows arbitrary Python execution without task binding, and `POST /api/v1/certificates/:id/revoke` allows **any** instructor to revoke **any** credential across the system without tenant/course scoping. | **PARTIALLY IMPLEMENTED** |
| **State-Changing Endpoints & Ops** | "Sliding-Window Rate Limiting & Structured Logging" | In-memory `Map` rate limiter is instance-local, resets on restart, has no key eviction (memory leak risk), and cannot support multi-instance deployments. `GET /api/v1/courses/:slug/session` violates RFC 7231/9110 by mutating database state (creates enrollments, sessions, and messages on HTTP GET). | **PARTIALLY IMPLEMENTED** |
| **Automated Test Suite** | "100% of unit, integration, security, sandbox, and E2E journey tests execute and pass" | **BLOCKED IN CURRENT STATE**: `Argon/certify-main/backend` has no `node_modules` installed. The offline runner `run-offline-tests.cjs` hardcodes Debian paths (`/usr/share/nodejs/@babel/core`) and crashes on non-Debian environments. | **UNVERIFIED / BLOCKED** |

---

## 2. Deep Technical Breakdown by Priority Area

### 2.1 Issue 1: Hostile-Code Execution Boundary (Python Sandbox)

#### Empirical Verification & Reproduction
- **Inspected Code:** `Argon/certify-main/backend/src/modules/sandbox/sandbox.service.ts:31-85`
- **Verification Script:** Executed hostile Python payload verification against the static inspection regex (`test_sandbox_bypass.cjs`).
- **Observed Results:**
  ```
  - [CRITICAL BYPASS] Pathlib traversal / read: import pathlib; print(pathlib.Path('.env').read_text())
  - [CRITICAL BYPASS] Importlib dynamic OS import: import importlib; m = importlib.import_module('os'); print(m.listdir('.'))
  - [CRITICAL BYPASS] Builtins getattr bypass of open(): b = globals()['__builtins__']; getattr(b, 'op' + 'en')('dev.db', 'rb').read(16)
  - [CRITICAL BYPASS] MRO subclass traversal for RCE: ().__class__.__bases__[0].__subclasses__()
  - [BLOCKED] Direct socket import: import http.client
  ```

#### Vulnerability Analysis
1. **Blacklist Regex Inadequacy:** Regex pattern matching (`FORBIDDEN_PATTERNS`) is fundamentally incapable of preventing arbitrary code execution in Python. The Python runtime enables dynamic attribute lookup, runtime imports, and object hierarchy navigation that bypass lexical pattern matching without using forbidden literal tokens.
2. **Platform Incompatibility of `resource.setrlimit`:** Lines 75–81 wrap `resource.setrlimit` in `try ... except: pass`. The `resource` module is POSIX-only. On Windows, `setrlimit` is completely ignored, providing **zero** CPU, memory, or process constraints.
3. **Host-Level Process Execution:** `child_process.spawn("python3", ...)` executes directly on the host machine. An attacker who bypasses the regex can read files accessible to the application process (`.env`, SQLite databases, source files) and exhaust host resources.
4. **Arbitrary Code Execution Route:** `POST /api/v1/execute` accepts unconstrained Python code from any authenticated student without binding to an authorized task or exercise.

#### Required Remediation Plan
- **Immediate Mitigation:** Disable `POST /api/v1/execute` or restrict it to authenticated instructors/admins behind an explicit feature flag (`ENABLE_DIRECT_SANDBOX_EXECUTION=false`).
- **Production Architecture:** Replace local subprocess spawning with a containerized or microVM execution boundary:
  - Docker container with `--network=none`, `--read-only`, `--cap-drop=ALL`, `--security-opt=no-new-privileges`, seccomp profile, memory limit (`128m`), and CPU quota (`0.5`).
  - Alternatively, integrate an isolated runner service (e.g., Judge0 or AWS Lambda in a private VPC with zero egress).

---

### 2.2 Issue 2: Supported Node.js Runtime Specification

#### Verification & Analysis
- **Inspected Files:** `backend/package.json`, `.github/workflows/ci.yml`, `docs/CERTIFY_ARCHITECTURE_DECISIONS.md`.
- **Runtime Check:** Local environment is running Node.js `v22.23.2`.
- **Release Schedule Facts:**
  - Node.js 18 (Hydrogen) reached official End-of-Life on **April 30, 2025**. It receives zero security patches and must not be specified in production contracts.
  - Node.js 20 (Iron) is in Maintenance LTS until April 30, 2026.
  - Node.js 22 (Jod) is the current Active LTS (supported until April 30, 2027).
- **Required Action:** Update all documentation, Dockerfiles, and CI configurations to:
  ```json
  "engines": {
    "node": ">=20.18.0 <23.0.0"
  }
  ```
  Designate **Node.js 22 LTS** as the canonical target.

---

### 2.3 Issue 3: Prisma SQLite-to-PostgreSQL Migration Architecture

#### Empirical Verification & Reproduction
- **Inspected Code:** `Argon/certify-main/backend/prisma/schema.prisma:6-9`
- **Observed Configuration:**
  ```prisma
  datasource db {
    provider = "sqlite"
    url      = env("DATABASE_URL")
  }
  ```
- **Observed Filesystem:** Directory `Argon/certify-main/backend/prisma/migrations` does not exist.

#### Gap Analysis
1. **Datasource Provider Lock:** Prisma requires `provider = "postgresql"` in `schema.prisma` to generate PostgreSQL-compatible SQL and client queries. Simply overriding `DATABASE_URL` with a `postgresql://` connection string causes Prisma to error or malfunction.
2. **Missing PostgreSQL Migrations:** There are zero versioned SQL migrations for PostgreSQL. Schema differences (e.g., PostgreSQL native enums, timestamp precision, JSONB versus SQLite TEXT strings, index constraints) have not been generated or tested.
3. **Inappropriate Deployment Commands:** `package.json` specifies `"db:push": "prisma db push"`. Running `db push` in production can result in silent schema drift, data loss, and unrecorded migrations.

#### Required Remediation Plan
1. Create a production schema or multi-provider workflow (or standardize on PostgreSQL for all staging and production environments).
2. Generate official PostgreSQL migrations using `npx prisma migrate dev --name init_postgres` against a real PostgreSQL 16 container.
3. Establish production deployment script:
   ```bash
   npx prisma migrate deploy
   ```
4. Prohibit `prisma db push` in production CI/CD pipelines.

---

### 2.4 Issue 4: AI Provider Integration & Production Fallback Leakage

#### Empirical Verification & Reproduction
- **Inspected Code:** `Argon/certify-main/backend/src/modules/ai/ai.provider.ts:64-116, 118-212`
- **Observed Implementation:**
  - `streamTutorReply`: Generates a static template string (lines 95–99) and simulates streaming by slicing the string into 28-character chunks.
  - `evaluateRubricCriteria`: Evaluates answers using local regex matching against `CONCEPT_VOCABULARY` arrays and keyword hit counts.
  - There are **zero** `fetch`, `axios`, or official SDK calls to Anthropic (`@anthropic-ai/sdk`) or OpenAI (`openai`).
- **Configuration Analysis (`src/config/index.ts:31-33`):**
  ```typescript
  allowDevAiFallback:
    process.env.ALLOW_DEV_AI_FALLBACK === "true" ||
    (nodeEnv !== "production" && process.env.ALLOW_DEV_AI_FALLBACK !== "false"),
  ```
- **Failure Mode:** If `ALLOW_DEV_AI_FALLBACK="true"` is set in `.env` (which is the default in `.env.example:21`), or if an operator copies `.env.example` into production without modifications, the backend will silently run the simulated pedagogical generator in production **without ever contacting an LLM API**.

#### Required Remediation Plan
1. Implement real external HTTP/SDK adapters in `AIProvider` using native `fetch` or official SDKs with configurable timeouts and retries.
2. Hardcode a fail-fast production assertion:
   ```typescript
   if (config.nodeEnv === "production" && config.allowDevAiFallback) {
     throw new Error("SECURITY MISCONFIGURATION: ALLOW_DEV_AI_FALLBACK cannot be enabled in production.");
   }
   ```
3. Clearly mark simulated responses in development with `provider: "simulated-local"` rather than labeling them with production model identifiers (`claude-3-5-sonnet`).

---

### 2.5 Issue 5: Remediation-to-BKT Bayesian Update Path

#### Empirical Verification & Reproduction
- **Inspected Code:** `Argon/certify-main/backend/src/modules/assessment/assessment.controller.ts:637-646`
- **Observed Implementation:**
  ```typescript
  let updatedP = existingMastery.pMastery;
  if (isResolved) {
    updatedP = BayesianKnowledgeTracer.update(existingMastery.pMastery, true);
    // Ensure a successful remediation recovery brings a low prior into at least LEARNING/MASTERED
    if (updatedP < 0.75) {
      updatedP = BayesianKnowledgeTracer.update(updatedP, true);
    }
  }
  ```
- **Mathematical Impact:**
  - For a prior $p = 0.30$:
    - Legitimate single observation update: $p = 0.8423$ (using $P(L_0)=0.15, P(T)=0.20, P(G)=0.10, P(S)=0.05$).
    - Double-update hack: If the prior was $0.20$, update 1 produces $0.7297$. Because $0.7297 < 0.75$, the controller executes a second Bayesian update on the **same single evidence item**, artificially pushing $p$ to $0.9634$.
- **Violation:** A Bayesian update represents the posterior probability conditioned on an observable event:
  $$P(L_t | \text{Obs}) = \frac{P(L_{t-1}) \cdot P(\text{Obs} | L)}{P(\text{Obs})}$$
  Executing the transition equation twice for one student action fabricates observations and distorts the student model.

#### Required Remediation Plan
1. Eliminate the double-update conditional (lines 642–644).
2. If remediation requires multiple demonstrations to establish mastery, the curriculum must prompt the learner for **two distinct demonstration tasks** (e.g., an explanation followed by a debug task), recording two separate `MasteryEvidence` records.

---

### 2.6 Issue 6: Certification Score Integrity, Retakes & Gaming

#### Empirical Verification & Reproduction
- **Inspected Code:** `Argon/certify-main/backend/src/modules/certificates/certificates.controller.ts:172-191`
- **Observed Formula:**
  ```typescript
  const interactionDepth =
    demonstratedEvidenceCount > 0
      ? Number(Math.min(1.0, 0.55 + demonstratedEvidenceCount * 0.03 + userMessageCount * 0.03).toFixed(4))
      : 0;
  ```
- **Test Observation:**
  - A learner who demonstrated 1 rubric criterion and sent 0 messages receives `interactionDepth = 0.58`.
  - The same learner, after sending 15 arbitrary one-word messages ("hi", "yes", "cool"), receives `interactionDepth = 1.0` (the maximum possible score).
  - Because `interactionDepth` has a 10% weight in `CertificationEvaluator`, sending 15 chat messages adds +4.2% directly to the final certification composite score.

#### Retake and Consistency Deficiencies
1. **Unbounded Retakes:** `practicalScore` and `vivaScore` use `Math.max(...)` across all historical attempts without retake cooldowns, penalty factors, or attempt caps.
2. **Distorted Consistency Metric:**
   ```typescript
   consistency = Number(Math.max(0, Math.min(1, meanChapScore * (1 - stdDev))).toFixed(4));
   ```
   If a learner initially failed an assessment multiple times before passing, all failed attempts remain in the standard deviation calculation, permanently penalizing their consistency index regardless of subsequent mastery.
3. **Non-Reproducible Decision Snapshot:** The exact scoring rules and weightings are not versioned in the database alongside the issued certificate.

#### Required Remediation Plan
1. Replace `userMessageCount` with substantive dialogue evaluation (e.g., count of tutor probes successfully answered with substantiated reasoning).
2. Define a formal Retake Policy: Cap assessment attempts per 24 hours; evaluate consistency using the learner's most recent valid attempt per chapter rather than pooling all failed attempts.
3. Store the immutable scoring snapshot in `Certificate.evidenceSummary`.

---

### 2.7 Issue 7: Credential Cryptography, Key Management & Privacy

#### Empirical Verification & Reproduction
- **Inspected Code:** `Argon/certify-main/backend/src/modules/certificates/crypto.service.ts:20-52` and `certificates.controller.ts:375-405`
- **Key Storage Analysis:**
  ```typescript
  function ensureKeyPair() {
    if (cachedKeyPair) return cachedKeyPair;
    if (config.ed25519PrivateKeyPem && config.ed25519PublicKeyPem) { ... }
    // Ephemeral Fallback:
    const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519", ...);
    cachedKeyPair = { privateKeyPem: privateKey, publicKeyPem: publicKey, ... };
    return cachedKeyPair;
  }
  ```
- **Observed Failure:** When `ED25519_PRIVATE_KEY_PEM` is not set, the server generates a new keypair in memory. On process restart, a new keypair is generated. Any certificate issued prior to the restart fails signature verification (`signatureVerified: false`) on `/verify`.

#### PII Exposure Analysis
- **Inspected Code:** `certificates.controller.ts:402-404`
- **Exposed Response Fields:**
  ```json
  {
    "credentialId": "CERT-2026-PY-100001",
    "recipientName": "Alice Learner",
    "courseTitle": "Python Fundamentals",
    "compositeScore": 0.89,
    "evidenceSummary": { ... }
  }
  ```
- **Privacy Conflict:** The public verification route is unauthenticated. Anyone who enumerates or acquires a `credentialId` obtains the recipient's full legal name and detailed assessment history. If zero-PII verification is required, `recipientName` must be hashed or replaced with an anonymized proof or recipient consent token.

#### Key Rotation Deficiencies
- The signed payload and certificate record do not contain a Key Identifier (`kid`). If the platform rotates its signing key, previously issued credentials cannot specify which historical public key should verify them.

---

### 2.8 Issue 8: Ownership & Authorization Audit (IDOR / BOLA)

#### Endpoint Authorization Review

| Endpoint | Method | Ownership Check Present? | Implementation Analysis |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/me` | `GET` | **YES** | Scoped to `req.user.id`. |
| `/api/v1/courses/:slug/session` | `GET` | **YES** | Scoped to `req.user.id`. |
| `/api/v1/sessions/:id/messages` | `POST` | **YES** | Checks `session.enrollment.userId === req.user.id`. |
| `/api/v1/sessions/:id/advance` | `POST` | **YES** | Checks `session.enrollment.userId === req.user.id`. |
| `/api/v1/sessions/:id/remediation` | `GET` | **YES** | Checks `session.enrollment.userId === req.user.id`. |
| `/api/v1/assessments/diagnostic/submit` | `POST` | **YES** | Uses `verifyEnrollmentOwnership`. |
| `/api/v1/assessments/chapters/:id/submit`| `POST` | **YES** | Uses `verifyEnrollmentOwnership`. |
| `/api/v1/assessments/remediation/submit` | `POST` | **YES** | Uses `verifyEnrollmentOwnership`. |
| `/api/v1/assessments/practical/submit` | `POST` | **YES** | Uses `verifyEnrollmentOwnership`. |
| `/api/v1/assessments/final/viva` | `POST` | **YES** | Uses `verifyEnrollmentOwnership`. |
| `/api/v1/certificates/issue` | `POST` | **YES** | Checks `enrollment.userId === req.user.id`. |
| `/api/v1/certificates/:id/revoke` | `POST` | **PARTIAL** | Checks `requireRole(["ADMIN", "INSTRUCTOR"])`, but **fails** to verify whether the instructor is assigned to the course/organization of the certificate recipient. |
| `/api/v1/execute` | `POST` | **NO** | Executes code in sandbox with **no** resource or assignment ownership check. |

---

### 2.9 Issue 9: Rate Limiting, Concurrency & Idempotency

#### Analysis of `rateLimit.ts`
1. **In-Memory Volatility:**
   ```typescript
   const buckets = new Map<string, { count: number; resetAt: number }>();
   ```
   Limits are stored in process memory. If multiple backend replicas run behind a load balancer, rate limits are divided by $N$ instances.
2. **Memory Leak Risk:** Entries are added to `buckets` on every new IP/user key, but there is no periodic cleanup job to purge expired keys.
3. **Missing Concurrency / Idempotency Controls:**
   - If a learner double-submits `/assessments/chapters/:chapterId/submit` simultaneously, both requests execute concurrently. Although wrapped in `prisma.$transaction`, both transactions read the current mastery, evaluate criteria, and create duplicate `AssessmentAttempt` records.
   - Assessment submission endpoints require a unique idempotency key header (`Idempotency-Key`) or database-level constraint (`unique` on `enrollmentId + targetId + in_progress_status`).

---

### 2.10 Issue 10: Architectural State Mutations in GET Endpoints

#### Analysis of `SessionsController.getSessionContext`
- **Location:** `Argon/certify-main/backend/src/modules/sessions/sessions.controller.ts:13-170`
- **Method & Route:** `GET /api/v1/courses/:slug/session`
- **Observed Behavior:**
  - If the user is not enrolled, lines 61–86 execute `prisma.enrollment.create(...)` and create multiple `ConceptMastery` rows.
  - If no active session exists, lines 110–146 execute `prisma.learningSession.create(...)` and `prisma.chatMessage.create(...)`.
- **Standards Violation:** Under RFC 7231 / RFC 9110, HTTP `GET` must be safe (read-only) and idempotent. Automated web pre-fetchers, browser extensions, or search spiders making `GET` requests will trigger state creation, creating orphaned enrollments and sessions.
- **Required Remediation:** Move enrollment and session initialization to explicit `POST /api/v1/courses/:slug/enroll` and `POST /api/v1/courses/:slug/session` endpoints.

---

### 2.11 Issue 11: Test Suite Segregation & Execution Status

#### Current State of Test Assets

```
Test Classification Matrix
├── Unit Tests
│   ├── BKT Probability Calculus: VERIFIED COMPLETE (in backend/src/modules/mastery/bkt.test.ts)
│   ├── Ed25519 Signing / Verify: VERIFIED COMPLETE (in scratch/verify_audit_claims.cjs)
│   └── Sandbox AST Security: FAILED / BYPASSED (Hostile bypass verified)
├── Integration Tests
│   ├── Express API Routes: UNVERIFIED in Argon (node_modules absent)
│   └── SQLite In-Memory DB: PARTIALLY VERIFIED in root backend
├── External Provider Smoke Tests
│   ├── Anthropic Claude API: BLOCKED / NOT IMPLEMENTED (No SDK calls in code)
│   └── OpenAI GPT-4o API: BLOCKED / NOT IMPLEMENTED (No SDK calls in code)
├── Security & Isolation Tests
│   ├── IDOR Ownership: PARTIALLY VERIFIED (Code verified, execution blocked)
│   └── Hostile Code Sandbox Escape: REPRODUCED CRITICAL FAILURE
└── Database Migration Tests
    └── PostgreSQL 16 Deployment: BLOCKED (No postgres schema/migrations exist)
```

---

### 2.12 Issue 12: Production Deployment Readiness & Checklist

| Requirement | Current Status | Remediation Required |
| :--- | :--- | :--- |
| **Node.js Runtime** | Node.js 18 listed (EOL) | Update engine contract to Node.js 22 LTS. |
| **Database Migrations** | Missing (SQLite push only) | Generate PostgreSQL versioned migrations using `prisma migrate dev`. |
| **Hostile Code Sandbox** | Insecure regex subprocess | Deploy Docker/microVM isolated worker; disable public execution endpoint. |
| **Real AI Providers** | Simulated local mocks | Implement real Anthropic/OpenAI SDK clients with production fail-fast assertions. |
| **BKT Math Integrity** | Double-update hack present | Remove artificial duplicate update; require genuine multi-item evidence. |
| **PII & Key Management** | Ephemeral keys, raw PII | Enforce persistent Ed25519 PEM keys, Key IDs, and privacy-preserving proofs. |
| **Idempotency & Concurrency** | Missing | Add idempotency keys to assessment submissions. |
| **GET Endpoint Safety** | State mutation on GET | Move creation logic to explicit POST routes. |

---

## 3. Updated Master Task Sheet

All tasks from `CERTIFY_BACKEND_TASK_SHEET.md` are re-evaluated below with authoritative statuses:

| Task ID | Title | Priority | Status | Verification Evidence / Reason for Status |
| :--- | :--- | :--- | :--- | :--- |
| **TASK-001** | Production Secret Validation & Fail-Fast Boot Guard | `P0` | `PARTIALLY IMPLEMENTED` | Protects `JWT_SECRET` in `config/index.ts`, but allows `ALLOW_DEV_AI_FALLBACK="true"` in production, leaking simulated AI. |
| **TASK-002** | Cross-User Resource Ownership (IDOR / BOLA) Enforcement | `P0` | `PARTIALLY IMPLEMENTED` | Implemented via `verifyEnrollmentOwnership` across session/assessments; missing on `POST /execute` and tenant-scoped revocation. |
| **TASK-003** | Role-Based Access Control (`requireRole`) & Admin Revocation | `P0` | `PARTIALLY IMPLEMENTED` | `requireRole` exists, but revocation permits any `INSTRUCTOR` to revoke any user credential without course scoping. |
| **TASK-004** | Sliding-Window Rate Limiting & Structured Redacted Logging | `P1` | `PARTIALLY IMPLEMENTED` | In-memory limiter lacks key eviction and multi-replica sharing; logger redaction is verified. |
| **TASK-005** | Decouple Socratic Tutor Chat from BKT Mastery Mutation | `P0` | `VERIFIED COMPLETE` | Code inspection confirms `streamMessage` no longer updates `ConceptMastery`. |
| **TASK-006** | Vendor-Neutral AI Provider with Zod Validation & Anti-Gaming | `P0` | `MOCKED/HARDCODED` | Zero real provider API calls exist; all responses are generated from local templates and simulated keyword counts. |
| **TASK-007** | Baseline Diagnostic Calibration Engine ("Honest Skip" Support) | `P0` | `VERIFIED COMPLETE` | `submitDiagnostic` calibrates priors ($0.15$ for skip, $0.40$ for correct) without awarding formal mastery credit. |
| **TASK-008** | Fix Chapter Assessment Nested-Loop Bug & Atomic Transactions | `P0` | `VERIFIED COMPLETE` | Concepts are mapped 1-to-1 to answers; BKT updates once per concept inside `prisma.$transaction`. |
| **TASK-009** | Targeted Concept Remediation Plan & Recovery Check Loop | `P1` | `PARTIALLY IMPLEMENTED` | Endpoint exists, but applies a mathematically invalid double BKT update hack (lines 642–644). |
| **TASK-010** | Isolated Python 3 Subprocess Sandbox & Unit Test Harness | `P0` | `PARTIALLY IMPLEMENTED (Insecure)` | Failed security review. Hostile Python bypasses regex inspection; POSIX `rlimit` fails on Windows; unconstrained RCE risk. |
| **TASK-011** | Persisted Multi-Turn (3-Turn) Socratic Viva State Machine | `P0` | `VERIFIED COMPLETE` | Persists answers across 3 turns and completes viva attempt only on turn 3. |
| **TASK-012** | Eliminate Hardcoded Certificate Scores & Enforce Evidence Gates | `P0` | `PARTIALLY IMPLEMENTED` | Hardcoded constants removed, but `interactionDepth` is vulnerable to dialogue spam manipulation (+4.2% score boost). |
| **TASK-013** | Genuine Ed25519 Signing, Verification & Public Key API | `P0` | `PARTIALLY IMPLEMENTED` | Signs canonical payload with Ed25519, but falls back to volatile in-memory keys; exposes recipient PII on public `/verify`. |
| **TASK-014** | Frontend Auth, Public Verification Route & Python Studio Wiring | `P0` | `UNVERIFIED` | Backend audit only; frontend integration unverified due to lack of local container runtime. |
| **TASK-015** | Containerization (`Dockerfile`, `docker-compose.yml`) & CI Workflow | `P1` | `PARTIALLY IMPLEMENTED` | Dockerfile exists, but CI workflow references unverified Linux test runner script. |
| **TASK-016** | Live Networked PostgreSQL 16 Migration & External LLM Smoke Run | `P1` | `BLOCKED` | `schema.prisma` is locked to SQLite; no PostgreSQL migrations exist; no external LLM integration exists. |

---

## 4. Prioritized Engineering Action Plan

To advance `Argon/certify-main/backend` from its current prototype state to genuine production readiness, the following engineering tasks must be executed:

### Step 1: Sandbox Quarantine & MicroVM Isolation (Priority: `P0`)
- **Action:** Immediately disable the unauthenticated/unassociated `POST /api/v1/execute` endpoint.
- **Action:** Replace local `child_process.spawn("python3")` with a hardened container execution worker (Docker with network isolation, read-only root, seccomp filters, and non-root user).
- **Files:** `src/modules/sandbox/sandbox.service.ts`, `src/modules/sandbox/sandbox.routes.ts`.

### Step 2: Implement Real External LLM Adapters (Priority: `P0`)
- **Action:** Integrate real HTTP/SDK calls for Anthropic (`claude-3-5-sonnet`) and OpenAI (`gpt-4o`).
- **Action:** Hard-fail startup in production if `AI_PROVIDER` API keys are missing.
- **Files:** `src/modules/ai/ai.provider.ts`, `src/config/index.ts`.

### Step 3: Correct BKT Remediation Update Mathematics (Priority: `P0`)
- **Action:** Remove the artificial second update call `if (updatedP < 0.75) { updatedP = BKT.update(...) }`. Ensure each BKT state update reflects a distinct, authentic demonstration of competence.
- **Files:** `src/modules/assessment/assessment.controller.ts:641-645`.

### Step 4: Secure Key Management & Fix PII Exposure (Priority: `P0`)
- **Action:** Prohibit in-memory Ed25519 key generation when `NODE_ENV === "production"`. Require valid PEM environment variables or external KMS.
- **Action:** Anonymize or hash recipient identifiers on the public verification endpoint to avoid exposing full names to unauthenticated scrapers.
- **Files:** `src/modules/certificates/crypto.service.ts`, `src/modules/certificates/certificates.controller.ts`.

### Step 5: Generate PostgreSQL Schema & Versioned Migrations (Priority: `P0`)
- **Action:** Set up a PostgreSQL datasource configuration and generate migrations (`prisma migrate dev`).
- **Action:** Replace `prisma db push` in scripts with `prisma migrate deploy`.
- **Files:** `prisma/schema.prisma`, `package.json`.

### Step 6: Fix Interaction Depth Gaming & Define Retake Policies (Priority: `P1`)
- **Action:** Remove raw `userMessageCount` from certification scoring formulas. Replace with validated rubric evidence counts.
- **Action:** Implement retake cooldowns and attempt limits on practical and viva assessments.
- **Files:** `src/modules/certificates/certificates.controller.ts:172-191`.

### Step 7: Convert State-Mutating GET Routes to Explicit POST Routes (Priority: `P1`)
- **Action:** Refactor `GET /courses/:slug/session` to read-only; create `POST /courses/:slug/enroll` and `POST /sessions` for state initialization.
- **Files:** `src/modules/sessions/sessions.controller.ts`, `src/modules/sessions/sessions.routes.ts`.
