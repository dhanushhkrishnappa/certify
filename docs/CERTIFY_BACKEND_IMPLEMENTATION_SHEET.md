# CERTIFY — Backend Implementation Task Sheet (Locked Target Stack)

**Document Version:** `3.0-LOCKED-TARGET`  
**Status:** `LOCKED ENGINEERING SPECIFICATION`  
**Date:** October 22, 2026  
**Target Topology:** Cloudflare Pages + Cloudflare Workers + Neon PostgreSQL + Better Auth + Resend + Cloudflare R2 + Cloudflare Sandboxes  

---

## 1. Master Implementation Task Matrix

| Task ID | Title | Epic / Phase | Priority | Status | Verification Evidence / Command |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TASK-001** | Cloudflare Workers Runtime & Environment Secrets Config | Core Runtime | `P0` | `BLOCKED (Target Stack)` | `wrangler.toml`, `wrangler secret put` |
| **TASK-002** | Neon PostgreSQL Datasource & Prisma Driver Adapter | Database & ORM | `P0` | `BLOCKED (Target Stack)` | `schema.prisma`, `npx prisma migrate dev` |
| **TASK-003** | Better Auth Single Authority with Prisma Adapter | Auth & Identity | `P0` | `BLOCKED (Target Stack)` | `@better-auth/prisma-adapter`, auth tests |
| **TASK-004** | Resend Transactional Email (Verification & Password Reset)| Auth & Identity | `P0` | `BLOCKED (Target Stack)` | Resend Workers client, email delivery test |
| **TASK-005** | Cloudflare R2 Private Bucket Integration for Artifacts | Storage & Assets | `P1` | `BLOCKED (Target Stack)` | R2 bucket binding, put/get integration test |
| **TASK-006** | Cloudflare Sandbox Isolated Python 3 Execution Worker | Code Execution | `P0` | `BLOCKED (Target Stack)` | Sandbox microVM/container client, test harness |
| **TASK-007** | Real AI Providers (Anthropic & OpenAI) with Native Fetch | Pedagogical AI | `P0` | `BLOCKED (Target Stack)` | Real API streaming, fail-closed assertions |
| **TASK-008** | BKT Single-Observation Calculus (Double-Update Fix) | Mastery Engine | `P0` | `BLOCKED (Target Stack)` | `assessment.controller.ts`, mathematical unit test |
| **TASK-009** | Interaction Depth Anti-Gaming & Retake Cooldown Rules | Certification | `P1` | `BLOCKED (Target Stack)` | `certificates.controller.ts`, scoring test |
| **TASK-010** | Ed25519 Signing via Web Crypto, Key IDs & Zero-PII Verify | Cryptography | `P0` | `BLOCKED (Target Stack)` | `crypto.service.ts`, public verify test |
| **TASK-011** | Refactor State-Mutating GET Routes to Explicit POST Routes | API Design | `P1` | `BLOCKED (Target Stack)` | `sessions.controller.ts`, route safety test |
| **TASK-012** | Assessment Idempotency Keys & Concurrency Locks | Data Integrity | `P1` | `BLOCKED (Target Stack)` | `Idempotency-Key` middleware, double-submit test |
| **TASK-013** | Scoped Certificate Revocation (Course/Tenant Scoping) | Authorization | `P1` | `BLOCKED (Target Stack)` | RBAC ownership test across organizations |
| **TASK-014** | Cloudflare Pages & Frontend Client API Re-Wiring | Frontend | `P0` | `BLOCKED (Target Stack)` | `api.ts`, Better Auth React client, Pages build |
| **TASK-015** | Staging & Production CI/CD Pipelines (GitHub Actions) | DevOps & CI/CD | `P1` | `BLOCKED (Target Stack)` | `.github/workflows/deploy.yml` |

---

## 2. Detailed Task Specifications (All 16 Required Engineering Fields)

### TASK-001: Cloudflare Workers Runtime & Environment Secrets Config
1. **Task ID:** `TASK-001`
2. **Title:** Cloudflare Workers Runtime & Environment Secrets Configuration
3. **Phase / Epic:** Core Runtime & Platform Scaffolding
4. **Priority:** `P0`
5. **Current Status:** `BLOCKED (Target Stack Migration)`
6. **Problem Statement:** Current backend runs on Express inside a standalone Node.js process, which is incompatible with Cloudflare Workers' edge V8 isolate architecture.
7. **Evidence from Audit:** `backend/src/server.ts`, `backend/src/app.ts` (Express server entrypoint).
8. **Files to Create or Modify:**
   - Create: `wrangler.toml` (Cloudflare Workers configuration with `nodejs_compat`).
   - Create: `src/index.ts` (Workers fetch handler or Hono routing entrypoint).
   - Modify: `src/config/index.ts` (Extract variables from Workers `env` bindings rather than `process.env`).
9. **Database Changes:** None.
10. **API Changes:** None (transparent routing preservation).
11. **Frontend Changes:** None.
12. **Security Requirements:** All production secrets (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `RESEND_API_KEY`, `ED25519_PRIVATE_KEY_PEM`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) must be configured via `wrangler secret put` and never committed to source control.
13. **Test Cases Required:** Workers local execution via `wrangler dev` responding to `/api/v1/health` with `status: "ok"`.
14. **Dependencies:** Cloudflare Wrangler CLI.
15. **Acceptance Criteria:** Backend boots cleanly inside `workerd` runtime with zero Node.js process dependencies.
16. **Verification Procedure:** `npx wrangler dev`

---

### TASK-002: Neon PostgreSQL Datasource & Prisma Driver Adapter
1. **Task ID:** `TASK-002`
2. **Title:** Neon PostgreSQL Datasource & Prisma Driver Adapter Integration
3. **Phase / Epic:** Database & ORM
4. **Priority:** `P0`
5. **Current Status:** `BLOCKED (Target Stack Migration)`
6. **Problem Statement:** `schema.prisma` is locked to SQLite (`provider = "sqlite"`). Prisma cannot run SQLite inside Cloudflare Workers, and SQLite cannot support serverless pooling or production concurrency.
7. **Evidence from Audit:** `Argon/certify-main/backend/prisma/schema.prisma:6-9` (statically set to `sqlite`).
8. **Files to Create or Modify:**
   - Modify: `prisma/schema.prisma` (Set `provider = "postgresql"`, add `previewFeatures = ["driverAdapters"]`).
   - Create: `src/shared/db.ts` (Instantiate `PrismaNeon` with `@neondatabase/serverless`).
   - Create: `prisma/migrations/*` (Generate versioned PostgreSQL migrations).
9. **Database Changes:** Full migration of 16 domain models and Better Auth tables to PostgreSQL 16 schema with appropriate composite indexes.
10. **API Changes:** None.
11. **Frontend Changes:** None.
12. **Security Requirements:** Enforce SSL connection (`sslmode=require`) to Neon pooler; separate unpooled `DIRECT_URL` for migration scripts.
13. **Test Cases Required:** CRUD transactions over WebSocket/HTTP connection; transactional rollback on assessment failure.
14. **Dependencies:** `@prisma/adapter-neon`, `@neondatabase/serverless`.
15. **Acceptance Criteria:** `npx prisma migrate dev` succeeds; Prisma Client queries execute without socket errors inside Workers isolate.
16. **Verification Procedure:** `npx prisma migrate deploy && npm run test:db`

---

### TASK-003: Better Auth Single Authority with Prisma Adapter
1. **Task ID:** `TASK-003`
2. **Title:** Better Auth Single Authority with Prisma Adapter Integration
3. **Phase / Epic:** Authentication, Identity & Sessions
4. **Priority:** `P0`
5. **Current Status:** `BLOCKED (Target Stack Migration)`
6. **Problem Statement:** The legacy backend uses manual bcrypt password hashing and unencrypted JWTs, lacking session revocation, refresh tokens, and rate-limited auth endpoints.
7. **Evidence from Audit:** `src/modules/auth/auth.controller.ts`, `src/shared/middleware/auth.ts`.
8. **Files to Create or Modify:**
   - Create: `src/shared/auth.ts` (Better Auth server setup with `prismaAdapter`).
   - Modify: `src/modules/auth/auth.routes.ts` (Mount Better Auth handler `/api/v1/auth/*`).
   - Modify: `src/shared/middleware/auth.ts` (Replace custom JWT verification with `auth.api.getSession`).
   - Create: `scripts/migrate-legacy-users.ts` (Data-preserving migration script).
9. **Database Changes:** Add `Session`, `Account`, and `Verification` tables; update `User` schema.
10. **API Changes:** Replace custom login/register endpoints with standard Better Auth endpoints (`/api/v1/auth/sign-in/email`, `/api/v1/auth/sign-up/email`, `/api/v1/auth/sign-out`).
11. **Frontend Changes:** Update `frontend/src/services/api.ts` and `AuthView.tsx` to use `@better-auth/react` client.
12. **Security Requirements:** Secure `HttpOnly`, `SameSite=Lax`, `Secure` session cookies; CSRF token validation; 7-day session lifetime with daily rotation.
13. **Test Cases Required:** Registration, email verification callback, login, session validation, cross-user session invalidation.
14. **Dependencies:** `better-auth`, `@better-auth/prisma-adapter`.
15. **Acceptance Criteria:** Better Auth handles 100% of authentication; legacy user accounts remain accessible without password reset requirement.
16. **Verification Procedure:** `npm run test:auth`

---

### TASK-004: Resend Transactional Email (Verification & Password Reset)
1. **Task ID:** `TASK-004`
2. **Title:** Resend Transactional Email Integration
3. **Phase / Epic:** Authentication & Learner Communications
4. **Priority:** `P0`
5. **Current Status:** `BLOCKED (Target Stack Migration)`
6. **Problem Statement:** No automated transactional email delivery exists for verifying learner emails, resetting forgotten passwords, or sending credential award notices.
7. **Evidence from Audit:** Missing email integration in `backend/`.
8. **Files to Create or Modify:**
   - Create: `src/shared/email.ts` (Resend client wrapper).
   - Create: `src/shared/templates/verification-email.ts`.
   - Create: `src/shared/templates/password-reset.ts`.
   - Create: `src/shared/templates/certificate-issued.ts`.
9. **Database Changes:** None (`Verification` token stored via Better Auth).
10. **API Changes:** Better Auth hooks trigger emails on sign-up and password reset requests.
11. **Frontend Changes:** Add email verification notice and password recovery modal to `AuthView.tsx`.
12. **Security Requirements:** Store `RESEND_API_KEY` in Worker secrets; sign email links with short-lived (1-hour) cryptographic tokens.
13. **Test Cases Required:** Mocked delivery in test environment; live test to designated QA inbox in staging.
14. **Dependencies:** `resend`.
15. **Acceptance Criteria:** Verification and password reset emails dispatch reliably within 3 seconds of user action.
16. **Verification Procedure:** `npm run test:email`

---

### TASK-005: Cloudflare R2 Private Bucket Integration for Artifacts
1. **Task ID:** `TASK-005`
2. **Title:** Cloudflare R2 Private Bucket Integration for Artifacts
3. **Phase / Epic:** Storage, Documents & Digital Receipts
4. **Priority:** `P1`
5. **Current Status:** `BLOCKED (Target Stack Migration)`
6. **Problem Statement:** Certificates and verification assets are generated purely in database JSON fields, lacking immutable off-database storage for visual certificates and transcripts.
7. **Evidence from Audit:** `src/modules/certificates/certificates.controller.ts:98-105`.
8. **Files to Create or Modify:**
   - Create: `src/shared/r2.ts` (R2 bucket put/get/delete helper).
   - Modify: `src/modules/certificates/certificates.controller.ts` (Upload canonical SVG and JSON evidence snapshot to R2 upon issuance).
9. **Database Changes:** Add `r2ObjectKey` and `r2ArtifactUrl` columns to `Certificate` model.
10. **API Changes:** Add `GET /api/v1/certificates/:credentialId/download` serving R2 stream with proper Content-Disposition.
11. **Frontend Changes:** Update `CredentialDetailsView.tsx` to download high-resolution SVG/PDF artifacts.
12. **Security Requirements:** R2 bucket must be strictly private (zero public S3 access); assets are served exclusively via Worker authentication or pre-signed URLs.
13. **Test Cases Required:** Upload valid SVG; verify Content-Type header; reject unauthenticated access to private paths.
14. **Dependencies:** Cloudflare R2 Worker binding (`env.CERTIFY_R2_BUCKET`).
15. **Acceptance Criteria:** Every issued credential generates an immutable SVG/JSON archive in R2.
16. **Verification Procedure:** `npm run test:r2`

---

### TASK-006: Cloudflare Sandbox Isolated Python 3 Execution Worker
1. **Task ID:** `TASK-006`
2. **Title:** Cloudflare Sandbox Isolated Python 3 Execution Worker
3. **Phase / Epic:** Hostile-Code Execution Boundary
4. **Priority:** `P0`
5. **Current Status:** `BLOCKED (Target Stack Migration)`
6. **Problem Statement:** Current sandbox uses local host subprocess spawning with a trivially bypassable regex blacklist (`pathlib`, `importlib`, MRO traversal bypasses verified in audit).
7. **Evidence from Audit:** `ARGON_BACKEND_AUDIT.md` Section 2.1; `sandbox.service.ts:31-85`.
8. **Files to Create or Modify:**
   - Create: `src/modules/sandbox/sandbox.client.ts` (RPC client communicating with Cloudflare Sandboxes / Container runner).
   - Modify: `src/modules/sandbox/sandbox.routes.ts` (Deprecate arbitrary `POST /execute` or restrict to admin; route practical submissions through container).
   - Create: Container specification (`Dockerfile` for isolated runner with no network, non-root user, Python 3.11).
9. **Database Changes:** None.
10. **API Changes:** Deprecate unassociated `POST /api/v1/execute` for students; enforce task ID requirement.
11. **Frontend Changes:** Wire `LearningStudio.tsx` and `FinalAssessmentView.tsx` to the secured practical submission endpoint.
12. **Security Requirements:** Container must run with `--network=none`, `read-only` root filesystem, memory cap (128 MB), CPU quota (0.5 vCPU), wall-clock timeout (2.5s), and non-root execution (`uid=1000`).
13. **Test Cases Required:** Submit hostile payloads (`pathlib`, `importlib`, network socket, infinite loop, memory bomb) and verify 100% containment without host leakage.
14. **Dependencies:** Cloudflare Sandboxes / Container runtime.
15. **Acceptance Criteria:** Hostile code cannot access host filesystem, environment variables, network sockets, or other tenants.
16. **Verification Procedure:** `npm run test:sandbox-adversarial`

---

### TASK-007: Real AI Providers (Anthropic & OpenAI) with Native Fetch
1. **Task ID:** `TASK-007`
2. **Title:** Real AI Providers (Anthropic & OpenAI) with Native Fetch
3. **Phase / Epic:** Pedagogical AI & Socratic Orchestration
4. **Priority:** `P0`
5. **Current Status:** `BLOCKED (Target Stack Migration)`
6. **Problem Statement:** `ai.provider.ts` in the current repository contains zero HTTP calls to external LLMs, running local mock text generators in all cases.
7. **Evidence from Audit:** `ARGON_BACKEND_AUDIT.md` Section 2.4; `src/modules/ai/ai.provider.ts:80-116`.
8. **Files to Create or Modify:**
   - Modify: `src/modules/ai/ai.provider.ts` (Implement real streaming fetch calls to Anthropic `/v1/messages` and OpenAI `/v1/chat/completions`).
   - Modify: `src/config/index.ts` (Add strict production assertion prohibiting simulated fallback when `NODE_ENV === "production"`).
9. **Database Changes:** None.
10. **API Changes:** Streaming responses emit true LLM tokens with real latency and token usage metadata.
11. **Frontend Changes:** Handle real-time token stream via `fetch-event-source` in `LearningStudio.tsx`.
12. **Security Requirements:** Server-side API keys never exposed to client; fail closed (`503 Service Unavailable`) if LLM API is unavailable.
13. **Test Cases Required:** Stream token response; abort stream on client disconnect; validate JSON rubric output against Zod schema.
14. **Dependencies:** Web standard `fetch` and `ReadableStream`.
15. **Acceptance Criteria:** Real Anthropic/OpenAI models respond to learner queries; simulated responses are rejected in staging and production.
16. **Verification Procedure:** `npm run test:ai-integration`

---

### TASK-008: BKT Single-Observation Calculus (Double-Update Fix)
1. **Task ID:** `TASK-008`
2. **Title:** BKT Single-Observation Calculus & Remediation Integrity
3. **Phase / Epic:** Mastery Engine
4. **Priority:** `P0`
5. **Current Status:** `BLOCKED (Implementation)`
6. **Problem Statement:** `assessment.controller.ts:643` executes a second artificial Bayesian update on a single remediation observation if $p < 0.75$, corrupting the probabilistic student model.
7. **Evidence from Audit:** `ARGON_BACKEND_AUDIT.md` Section 2.5; `assessment.controller.ts:641-645`.
8. **Files to Create or Modify:**
   - Modify: `src/modules/assessment/assessment.controller.ts` (Remove artificial second update).
   - Modify: `src/modules/mastery/bkt.ts` (Ensure update formula is strictly single-observation).
9. **Database Changes:** None.
10. **API Changes:** None.
11. **Frontend Changes:** None.
12. **Security Requirements:** Maintain mathematical integrity of educational credentialing.
13. **Test Cases Required:** Assert that a single successful remediation check triggers exactly one Bayesian transition.
14. **Dependencies:** `bkt.ts`.
15. **Acceptance Criteria:** $P(L_t)$ accurately reflects single-observation posterior without artificial inflation.
16. **Verification Procedure:** `npm run test:bkt-math`

---

### TASK-009: Interaction Depth Anti-Gaming & Retake Cooldown Rules
1. **Task ID:** `TASK-009`
2. **Title:** Interaction Depth Anti-Gaming & Retake Cooldown Rules
3. **Phase / Epic:** Certification Engine & Evidence Integrity
4. **Priority:** `P1`
5. **Current Status:** `BLOCKED (Implementation)`
6. **Problem Statement:** `certificates.controller.ts` calculates `interactionDepth` using raw user message counts, allowing spamming 15 trivial messages to artificially boost the certification score by +4.2%.
7. **Evidence from Audit:** `ARGON_BACKEND_AUDIT.md` Section 2.6; `certificates.controller.ts:183-191`.
8. **Files to Create or Modify:**
   - Modify: `src/modules/certificates/certificates.controller.ts` (Compute interaction depth strictly from verified dialogue rubric demonstrations; enforce 12-hour retake cooldown on practical tasks).
9. **Database Changes:** Add `attemptCooldownUntil` to `AssessmentAttempt` or `Enrollment`.
10. **API Changes:** Return HTTP 429 / 400 with remaining cooldown duration if assessment is retaken prematurely.
11. **Frontend Changes:** Display cooldown timer in UI before allowing assessment retake.
12. **Security Requirements:** Prevent score manipulation via chat flooding.
13. **Test Cases Required:** Attempt to inflate score via empty chat messages (assert score unchanged); attempt assessment retake before cooldown expires (assert blocked).
14. **Dependencies:** None.
15. **Acceptance Criteria:** Certification composite score is 100% immune to raw message volume.
16. **Verification Procedure:** `npm run test:certification-gates`

---

### TASK-010: Ed25519 Signing via Web Crypto, Key IDs & Zero-PII Verify
1. **Task ID:** `TASK-010`
2. **Title:** Ed25519 Signing via Web Crypto, Key IDs & Zero-PII Public Verification
3. **Phase / Epic:** Cryptography & Public Registry
4. **Priority:** `P0`
5. **Current Status:** `BLOCKED (Implementation)`
6. **Problem Statement:** Current crypto service uses Node `crypto` with volatile in-memory fallback keys and exposes recipient full legal names and internal IDs on the unauthenticated public verification route.
7. **Evidence from Audit:** `ARGON_BACKEND_AUDIT.md` Section 2.7; `crypto.service.ts`, `certificates.controller.ts:375-405`.
8. **Files to Create or Modify:**
   - Modify: `src/modules/certificates/crypto.service.ts` (Use `crypto.subtle` with Ed25519; require persistent key in production; attach `kid`).
   - Modify: `src/modules/certificates/certificates.controller.ts` (Anonymize recipient name on public verify endpoint unless token is provided).
9. **Database Changes:** Add `keyId` column to `Certificate` table.
10. **API Changes:** Public verification endpoint returns anonymized name (`A***e L.`) by default; full name requires `?token=...`.
11. **Frontend Changes:** Update `PublicVerifyView.tsx` to handle blinded identities and token-authorized reveal.
12. **Security Requirements:** Zero unauthenticated PII leakage; persistent Ed25519 private key stored in Worker secrets; fail-closed boot guard.
13. **Test Cases Required:** Sign canonical payload; verify with public key; tamper with payload (verify rejection); verify public endpoint does not leak PII.
14. **Dependencies:** Web Crypto API (`crypto.subtle`).
15. **Acceptance Criteria:** Ed25519 signatures are verifiable across server reboots; public registry does not expose student PII to web scrapers.
16. **Verification Procedure:** `npm run test:ed25519-verify`

---

### TASK-011: Refactor State-Mutating GET Routes to Explicit POST Routes
1. **Task ID:** `TASK-011`
2. **Title:** Refactor State-Mutating GET Routes to Explicit POST Routes
3. **Phase / Epic:** API Design & HTTP Compliance
4. **Priority:** `P1`
5. **Current Status:** `BLOCKED (Implementation)`
6. **Problem Statement:** `GET /api/v1/courses/:slug/session` creates enrollments, concept masteries, sessions, and chat messages on HTTP GET, violating RFC 7231 / RFC 9110.
7. **Evidence from Audit:** `ARGON_BACKEND_AUDIT.md` Section 2.10; `sessions.controller.ts:61-146`.
8. **Files to Create or Modify:**
   - Modify: `src/modules/sessions/sessions.controller.ts` (Make `getSessionContext` strictly read-only; return 404/not_enrolled if enrollment doesn't exist).
   - Create: `src/modules/courses/courses.controller.ts:enroll` (`POST /api/v1/courses/:slug/enroll`).
   - Create: `src/modules/sessions/sessions.controller.ts:createSession` (`POST /api/v1/courses/:slug/sessions`).
9. **Database Changes:** None.
10. **API Changes:** Add `POST /api/v1/courses/:slug/enroll` and `POST /api/v1/courses/:slug/sessions`.
11. **Frontend Changes:** Update frontend `LearningStudio.tsx` and `CourseDetailsView.tsx` to call explicit POST endpoints when enrolling or creating sessions.
12. **Security Requirements:** Prevent web crawlers or pre-fetchers from generating orphaned database records.
13. **Test Cases Required:** Assert `GET /api/v1/courses/:slug/session` performs zero database insertions.
14. **Dependencies:** None.
15. **Acceptance Criteria:** All HTTP GET routes are safe and read-only.
16. **Verification Procedure:** `npm run test:http-safety`

---

### TASK-012: Assessment Idempotency Keys & Concurrency Locks
1. **Task ID:** `TASK-012`
2. **Title:** Assessment Idempotency Keys & Concurrency Locks
3. **Phase / Epic:** Data Integrity & Assessment Engine
4. **Priority:** `P1`
5. **Current Status:** `BLOCKED (Implementation)`
6. **Problem Statement:** Double-clicking assessment submit buttons or network retries triggers concurrent assessment evaluations, creating duplicate attempts and race conditions in BKT updates.
7. **Evidence from Audit:** `ARGON_BACKEND_AUDIT.md` Section 2.9.
8. **Files to Create or Modify:**
   - Create: `src/shared/middleware/idempotency.ts` (Checks `Idempotency-Key` header against database or cache).
   - Modify: `src/modules/assessment/assessment.controller.ts` (Enforce idempotency key check).
9. **Database Changes:** Add `idempotencyKey` column to `AssessmentAttempt` table with unique constraint.
10. **API Changes:** Require `Idempotency-Key` header on all assessment submissions.
11. **Frontend Changes:** Generate unique UUID v4 idempotency keys on submission in `api.ts`.
12. **Security Requirements:** Prevent duplicate assessment evaluation and concurrent BKT state race conditions.
13. **Test Cases Required:** Submit two identical assessment requests concurrently (assert one succeeds and the other returns cached/duplicate response without duplicate DB records).
14. **Dependencies:** None.
15. **Acceptance Criteria:** Duplicate submissions return original response without re-executing grading.
16. **Verification Procedure:** `npm run test:idempotency`

---

### TASK-013: Scoped Certificate Revocation (Course/Tenant Scoping)
1. **Task ID:** `TASK-013`
2. **Title:** Scoped Certificate Revocation (Course & Organization Scoping)
3. **Phase / Epic:** Authorization & Governance
4. **Priority:** `P1`
5. **Current Status:** `BLOCKED (Implementation)`
6. **Problem Statement:** Current revocation endpoint allows any user with the `INSTRUCTOR` role to revoke any certificate across the entire platform, even for courses they do not teach.
7. **Evidence from Audit:** `ARGON_BACKEND_AUDIT.md` Section 2.8; `certificates.routes.ts:14-15`.
8. **Files to Create or Modify:**
   - Modify: `src/modules/certificates/certificates.controller.ts` (Verify that the instructor is specifically assigned to the course associated with the certificate, or has `ADMIN` role).
9. **Database Changes:** Add `CourseInstructor` join table or `instructorId` relation on `Course`.
10. **API Changes:** None.
11. **Frontend Changes:** None.
12. **Security Requirements:** Enforce tenant/course-level authorization boundaries.
13. **Test Cases Required:** Instructor A attempts to revoke certificate for Course B (assert 403 Forbidden); Admin attempts revocation (assert 200 OK).
14. **Dependencies:** Better Auth roles and session.
15. **Acceptance Criteria:** Instructors can only revoke credentials issued within their authorized courses.
16. **Verification Procedure:** `npm run test:rbac-scoping`

---

### TASK-014: Cloudflare Pages & Frontend Client API Re-Wiring
1. **Task ID:** `TASK-014`
2. **Title:** Cloudflare Pages Deployment & Frontend Client API Re-Wiring
3. **Phase / Epic:** Frontend Integration & Edge Hosting
4. **Priority:** `P0`
5. **Current Status:** `BLOCKED (Implementation)`
6. **Problem Statement:** Frontend API client (`services/api.ts`) expects local Express server with custom JWT bearer headers rather than Better Auth session cookies and Cloudflare Worker endpoints.
7. **Evidence from Audit:** `frontend/src/services/api.ts`, `frontend/src/App.tsx`.
8. **Files to Create or Modify:**
   - Modify: `frontend/src/services/api.ts` (Support Better Auth cookie credentials and configurable `VITE_API_URL`).
   - Create: `frontend/src/services/auth-client.ts` (Better Auth React client).
   - Modify: `frontend/src/components/AuthView.tsx` (Wire Better Auth forms).
   - Create: `frontend/public/_headers` (Cloudflare Pages security headers).
9. **Database Changes:** None.
10. **API Changes:** Frontend calls standard Better Auth and Workers endpoints.
11. **Frontend Changes:** Remove legacy simulated auth state; integrate real session management.
12. **Security Requirements:** No API secrets in client build; strict CSP and CORS policies.
13. **Test Cases Required:** `npm run build` succeeds; all 19 views render; authentication flow succeeds.
14. **Dependencies:** `@better-auth/react`.
15. **Acceptance Criteria:** Frontend deploys cleanly to Cloudflare Pages and connects to Cloudflare Workers API.
16. **Verification Procedure:** `npm run build && npm run test:frontend`

---

### TASK-015: Staging & Production CI/CD Pipelines (GitHub Actions)
1. **Task ID:** `TASK-015`
2. **Title:** Staging & Production CI/CD Pipelines (GitHub Actions)
3. **Phase / Epic:** DevOps, Release Automation & Quality Gates
4. **Priority:** `P1`
5. **Current Status:** `BLOCKED (Implementation)`
6. **Problem Statement:** No automated pipeline exists to deploy database migrations to Neon, deploy Workers API, and deploy Pages frontend across separate staging and production environments.
7. **Evidence from Audit:** `.github/workflows/ci.yml`.
8. **Files to Create or Modify:**
   - Create: `.github/workflows/deploy-staging.yml`.
   - Create: `.github/workflows/deploy-production.yml`.
9. **Database Changes:** Automates `npx prisma migrate deploy` on Neon branches.
10. **API Changes:** Deploys Worker via `wrangler deploy`.
11. **Frontend Changes:** Deploys Pages via `wrangler pages deploy`.
12. **Security Requirements:** GitHub Environment secrets with protected branches; no manual SSH or production credentials on local machines.
13. **Test Cases Required:** PR validation triggers lint, type-check, unit tests, and migration checks.
14. **Dependencies:** GitHub Actions, Cloudflare Wrangler Action.
15. **Acceptance Criteria:** Push to `main` deploys to staging; manual approval promotes to production.
16. **Verification Procedure:** GitHub Actions pipeline execution.
