# CERTIFY — End-to-End Implementation Audit & Gap Analysis

**Repository Commit:** `63a88f6f4a148efbc415d3282292144134d83ffe`  
**Audit Date:** October 22, 2026  
**Audited Target:** `backend/` and `Argon/certify-main/backend/`  
**Status:** `LOCKED TARGET GAP ANALYSIS & CANONICAL AUDIT`  

---

## 1. Repository Inventory & Environmental State

The CERTIFY repository contains two backend iterations:
1. `backend/`: The initial prototype baseline (Express, SQLite, hardcoded certification scores `0.92, 0.88, 0.86, 0.82`, broken HMAC signature, unverified tutor keywords).
2. `Argon/certify-main/backend/`: The remediated modular monolith (Express, SQLite, attributable evidence calculation, Ed25519 crypto service, isolated sandbox attempt, multi-turn viva).

### Local Environment Verification
- **Host OS:** Windows 11 x64
- **Node.js Runtime:** `v22.23.2` (Active LTS)
- **Python Runtime:** `Python 3.13.9`
- **Package Manager:** `npm 10.9.2`
- **Target Deployment Platform:** Cloudflare Pages + Cloudflare Workers + Neon PostgreSQL + Better Auth + Resend + Cloudflare R2 + Cloudflare Sandboxes.

---

## 2. Layer-by-Layer Detailed Implementation Audit

### Layer 1: Identity, Authentication & Sessions
- **Current State in Repository:**
  - `Argon/certify-main/backend/src/modules/auth/auth.controller.ts`: Custom bcrypt password hashing (`bcrypt.hash(password, 10)`), JWT issuance (`jwt.sign`), and `/me` profile lookup.
  - Rate limiting on `/register` and `/login` via in-memory `rateLimit.ts`.
  - IDOR ownership helper `verifyEnrollmentOwnership` in `shared/middleware/auth.ts`.
- **Target Stack Gap Analysis:**
  - Current custom JWT is incompatible with the locked Better Auth standard.
  - In-memory rate limiting fails across multi-worker deployments.
  - Email verification is absent; password reset flow is missing.
- **Audit Status:** `PARTIALLY IMPLEMENTED` (Functional locally; requires Better Auth + Resend migration).

### Layer 2: Course Curriculum & Progression Gating
- **Current State in Repository:**
  - `prisma/seed.ts`: Seeds `Python Fundamentals` (v1.0.0, 8 modules, 9 chapters, 10 concepts, 31 rubric criteria).
  - `src/modules/courses/courses.controller.ts`: Catalog listing, syllabus inspection, enrollment creation.
  - `src/modules/sessions/sessions.controller.ts`: Chapter progression gate enforces $P(L) \ge 0.70$ and zero `NEEDS_REMEDIATION` concepts before unlocking the next chapter.
- **Defects Identified:**
  - `GET /api/v1/courses/:slug/session` mutates state by creating enrollments and sessions on an HTTP GET request (RFC 7231 violation).
- **Target Stack Gap Analysis:**
  - Relational course hierarchy is 100% sound and ports directly to Neon PostgreSQL.
  - GET endpoint must be refactored to read-only; explicit `POST /enroll` required.
- **Audit Status:** `VERIFIED COMPLETE` (Curriculum & Gates) / `PARTIALLY IMPLEMENTED` (HTTP GET safety).

### Layer 3: AI Socratic Tutor & Evaluation Engine
- **Current State in Repository:**
  - `src/modules/ai/ai.provider.ts`: Abstracted `AIProvider` class with `streamTutorReply`, `evaluateRubricCriteria`, and `evaluateVivaTurn`.
  - `src/modules/sessions/sessions.controller.ts`: SSE token streaming via `streamMessage`.
- **Defects Identified:**
  - **Mocked/Simulated Execution:** Zero real HTTP/SDK calls exist in `ai.provider.ts`. The methods return local deterministic strings and keyword counters even when API keys are configured.
  - **Production Fallback Risk:** Default configuration in `.env.example` sets `ALLOW_DEV_AI_FALLBACK="true"`, allowing simulated responses to run undetected in production.
- **Target Stack Gap Analysis:**
  - Replace simulation with native Workers `fetch` calls to Anthropic Claude 3.5 Sonnet and OpenAI GPT-4o.
  - Enforce fail-closed assertion when API keys are missing in production.
- **Audit Status:** `MOCKED/HARDCODED` (Simulation requires real provider integration).

### Layer 4: Mathematical Mastery (BKT) Engine
- **Current State in Repository:**
  - `src/modules/mastery/bkt.ts`: Implements classical BKT equations with parameters $P(L_0)=0.15, P(T)=0.20, P(G)=0.10, P(S)=0.05$.
  - Unit tests verify convergence on demonstration (+0.23) and slip (-0.08).
- **Defects Identified:**
  - `src/modules/assessment/assessment.controller.ts:643`: Artificial double-update hack:
    ```typescript
    if (updatedP < 0.75) {
      updatedP = BayesianKnowledgeTracer.update(updatedP, true);
    }
    ```
    Fabricates a second positive observation out of thin air on a single remediation check.
- **Target Stack Gap Analysis:**
  - Remove double update; enforce strict single-observation transitions.
- **Audit Status:** `PARTIALLY IMPLEMENTED` (Base equation sound; remediation controller corrupted).

### Layer 5: Practical Code Execution Sandbox
- **Current State in Repository:**
  - `src/modules/sandbox/sandbox.service.ts`: Spawns local `python3 -I -B` subprocesses; uses regex blacklist (`FORBIDDEN_PATTERNS`); injects POSIX `rlimit`; 2.5s watchdog timer.
- **Critical Security Defect:**
  - **Critical Hostile Bypass:** Regex blacklist is trivially bypassed via standard Python introspection (`pathlib`, `importlib`, `getattr(__builtins__)`, MRO subclass navigation).
  - **Platform Failure:** `resource.setrlimit` fails silently on Windows (`try ... except: pass`).
  - **RCE Exposure:** `POST /api/v1/execute` allows arbitrary Python execution without assignment binding.
- **Target Stack Gap Analysis:**
  - Must not run code on the application host or inside Workers isolates.
  - Integrate Cloudflare Sandboxes / isolated container workers with `--network=none` and hard resource limits.
- **Audit Status:** `PARTIALLY IMPLEMENTED (Insecure)` (Must be quarantined and containerized).

### Layer 6: Certification, Asymmetric Cryptography & Public Registry
- **Current State in Repository:**
  - `src/modules/certificates/certificates.controller.ts`: Aggregates persisted database attempts (`CHAPTER`, `PRACTICAL`, `VIVA`); enforces 4 evidence completeness gates.
  - `src/modules/certificates/crypto.service.ts`: Signs canonical JSON payloads using Ed25519.
- **Defects Identified:**
  - **Interaction Depth Gaming:** `0.55 + demonstratedEvidenceCount * 0.03 + userMessageCount * 0.03`. Spamming 15 empty messages maxes out interaction depth, adding +4.2% to the final certificate score.
  - **Volatile Key Risk:** Generates ephemeral in-memory Ed25519 keys if `ED25519_PRIVATE_KEY_PEM` is unset, invalidating all historical credentials on server reboot.
  - **PII Exposure:** `GET /verify/:credentialId` returns student full legal names and enrollment UUIDs to unauthenticated scrapers.
  - **Overprivileged Revocation:** Any user with role `INSTRUCTOR` can revoke any certificate across the system without course-level tenancy checks.
- **Target Stack Gap Analysis:**
  - Remove message counts from scoring; enforce retake cooldowns.
  - Store persistent Ed25519 private keys in Cloudflare Worker secrets; attach Key ID (`kid`).
  - Blind recipient PII on public verification endpoint.
- **Audit Status:** `PARTIALLY IMPLEMENTED` (Gating sound; crypto persistence and privacy flawed).

---

## 3. Comprehensive Master Traceability & Status Matrix

| Subsystem | Component / Symbol | Legacy Baseline | Argon State | Target Locked Stack | Authoritative Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `User`, `Session`, `Account` | Custom JWT / Bcrypt | Custom JWT + IDOR check | Better Auth (Prisma Adapter) | `PARTIALLY IMPLEMENTED` |
| **Auth** | Email Verification / Reset | Missing | Missing | Resend Transactional Email | `BLOCKED (Target Stack)` |
| **Courses** | Syllabus & Catalog | Static query | Relational hierarchy | Relational hierarchy in Neon | `VERIFIED COMPLETE` |
| **Courses** | `POST /enroll` | Missing (GET mutation) | Missing (GET mutation) | Explicit POST endpoint | `BLOCKED (Implementation)` |
| **Sessions** | Socratic Dialogue | Direct BKT mutation | Decoupled (Principle B) | SSE stream via Workers Fetch | `VERIFIED COMPLETE` |
| **Sessions** | Chapter Progression | Open | Gated ($P \ge 0.70$) | Gated ($P \ge 0.70$) | `VERIFIED COMPLETE` |
| **AI** | Tutor & Evaluator LLM | Mock keywords | Simulated mock strings | Real Anthropic & OpenAI SDK | `MOCKED/HARDCODED` |
| **AI** | Anti-Gaming Filter | None | Regex ratio checks | Regex ratio + Semantic check | `VERIFIED COMPLETE` |
| **Assessment** | Baseline Diagnostic | Missing | Honest Skip ($0.15/0.40$) | Honest Skip in Neon | `VERIFIED COMPLETE` |
| **Assessment** | Chapter Grading | Nested-loop bug | 1-to-1 concept map | 1-to-1 concept map | `VERIFIED COMPLETE` |
| **Assessment** | Remediation Check | Missing | Double BKT update hack | Single-observation BKT | `PARTIALLY IMPLEMENTED` |
| **Assessment** | Practical Runner | Missing | Insecure subprocess | Cloudflare Sandbox Container | `PARTIALLY IMPLEMENTED (Insecure)` |
| **Assessment** | 3-Turn Viva Defense | 1-turn stub | Persisted 3-turn state | Persisted 3-turn state | `VERIFIED COMPLETE` |
| **Mastery** | BKT Calculus | 8 unit tests | 8 unit tests | Single observation math | `VERIFIED COMPLETE` |
| **Certificates** | Score Aggregation | Hardcoded constants | Persisted DB queries | Persisted DB queries | `VERIFIED COMPLETE` |
| **Certificates** | Interaction Depth | Hardcoded `0.82` | Gamed via message count| Evaluated rubric evidence | `PARTIALLY IMPLEMENTED` |
| **Certificates** | Digital Signing | Broken HMAC-SHA256 | Ed25519 (Ephemeral risk)| Ed25519 Web Crypto + `kid` | `PARTIALLY IMPLEMENTED` |
| **Certificates** | Public Verification | Unverified HMAC | Verified Ed25519 (PII risk)| Blinded Zero-PII verify | `PARTIALLY IMPLEMENTED` |
| **Certificates** | Revocation | Open | Global Instructor RBAC | Course-scoped Instructor RBAC| `PARTIALLY IMPLEMENTED` |
| **Storage** | Artifacts & Receipts | None (DB text) | None (DB text) | Cloudflare R2 Private Bucket | `BLOCKED (Target Stack)` |
| **Database** | Migrations & Pooler | SQLite prototype | SQLite prototype | Neon PostgreSQL + Pooler | `BLOCKED (Target Stack)` |
| **Infra** | Hosting & Runtime | Local Node.js host | Local Node.js host | Cloudflare Pages + Workers | `BLOCKED (Target Stack)` |

---

## 4. Immediate Architectural Remediation Order

To bridge the platform to full production readiness, engineering must execute tasks in this exact sequence:

1. **Quarantine & Secure Practical Code Execution:** Disable public `POST /execute`; build isolated Cloudflare Sandbox container client (`TASK-006`).
2. **Correct BKT Mathematical Logic:** Remove double-update line in `assessment.controller.ts:643` (`TASK-008`).
3. **Database Migration to Neon PostgreSQL:** Update `schema.prisma` to PostgreSQL; generate versioned migrations; seed `Python Fundamentals` (`TASK-002`).
4. **Deploy Better Auth & Resend:** Replace custom JWT with Better Auth Prisma adapter; configure transactional verification emails via Resend (`TASK-003`, `TASK-004`).
5. **Real AI Provider Integration:** Replace simulated LLM responses with real Anthropic and OpenAI Workers fetch streaming (`TASK-007`).
6. **Ed25519 Persistence & Zero-PII Privacy:** Bind persistent private key to Worker secrets; blind student legal names on public `/verify` (`TASK-010`).
7. **Anti-Gaming Scoring & Retake Cooldowns:** Remove message counts from `interactionDepth`; implement retake limits (`TASK-009`).
8. **Cloudflare R2 Bucket Integration:** Upload immutable SVG certificate artifacts to R2 (`TASK-005`).
9. **Cloudflare Pages Frontend Deployment:** Re-wire `api.ts` to Better Auth and Worker endpoints; deploy to Pages (`TASK-014`).
