# 06 — API Contract & Security Specification

**Document Scope:** Complete REST & Server-Sent Events (SSE) API Reference, Authentication & OTP Security, Rate Limiting, Sandbox Isolation, and Ed25519 Verification Ledger  
**Base URL:** `/api/v1` (Production: `https://api.certify.studio/api/v1`)

---

## 1. API Endpoint Reference

### 1.1 Health & Public Brand Assets
| Method | Path | Auth | Description |
| :---: | :--- | :---: | :--- |
| `GET` | `/health` | Public | Liveness probe returning service status, version, and timestamp. |
| `GET` | `/api/v1/assets/certify-logo-email.png` | Public | Serves the official Certify logo PNG with 7-day immutable cache headers for transactional email clients. |

### 1.2 Authentication & Learner Activity (`/api/v1/auth` & `/api/auth/*`)
| Method | Path | Auth | Rate Limit | Description |
| :---: | :--- | :---: | :---: | :--- |
| `POST` | `/api/v1/auth/register` | Public | 5 / 60s | Validates registration fields, hashes password via `better-auth/crypto`, stores pre-user record in `verifications`, and dispatches 6-digit CSPRNG OTP email. |
| `POST` | `/api/v1/auth/verify-otp` | Public | 8 / 60s | Verifies 6-digit registration OTP (5-attempt lockout) and atomically creates `User`, `Account`, and `Session` in PostgreSQL. |
| `POST` | `/api/v1/auth/resend-otp` | Public | 5 / 60s | Invalidates previous OTP and dispatches a fresh 6-digit verification code. |
| `POST` | `/api/v1/auth/login` | Public | 8 / 60s | Authenticates email/password against Better Auth credential store and returns `{ user, token }`. |
| `POST` | `/api/v1/auth/logout` | Bearer/Cookie | Standard | Revokes active session token in Better Auth. |
| `GET` | `/api/v1/auth/me` | Bearer/Cookie | Standard | Returns authenticated learner profile and active enrollments. |
| `PUT` | `/api/v1/auth/profile` | Bearer/Cookie | Standard | Updates learner profile (`fullName`, `dob`, `persona`, `primaryGoal`, `image`, `bio`, `onboardingCompleted`). |
| `GET` | `/api/v1/auth/activity` | Bearer/Cookie | Standard | Aggregates 16-week (112-day) activity heatmap matrix, current streak, longest streak, and total contributions from real database events. |
| `POST` | `/api/v1/auth/forgot-password` | Public | 5 / 60s | Generates and emails a 6-digit password reset OTP (`reset:<email>`). |
| `POST` | `/api/v1/auth/verify-reset-otp` | Public | 8 / 60s | Validates a 6-digit password reset OTP prior to password update. |
| `POST` | `/api/v1/auth/reset-password` | Public | 8 / 60s | Consumes reset OTP, updates credential password hash, and invalidates old sessions. |
| `ALL` | `/api/auth/*` | Public/Session | Standard | Native Better Auth handler for OAuth callbacks (Google OAuth 2.0) and session management. |

### 1.3 Courses, Progression Tree & Skills Report (`/api/v1/courses`)
| Method | Path | Auth | Description |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/courses` | Public | Lists published qualification tracks with module counts and metadata. |
| `GET` | `/api/v1/courses/:slug` | Public | Returns full versioned curriculum hierarchy (10 modules, 29 chapters, concepts, rubrics). |
| `POST` | `/api/v1/courses/:slug/enroll` | Bearer/Cookie | Idempotently enrolls learner in active `CourseVersion` and initializes all `ModuleProgress`, `ChapterProgress`, `SectionProgress`, `RubricCriterionMastery`, and `LearnerSkillProfile` rows. |
| `GET` | `/api/v1/courses/:slug/progression` | Bearer/Cookie | Returns the complete 4-level `ProgressionTree` (`modules` → `chapters` → `sections` → `rubricCriteria`) with live lock statuses and scores. |
| `GET` | `/api/v1/courses/:slug/skills-report` | Bearer/Cookie | Recomputes and returns the learner's 8-dimension `SkillsReport` (`strengths`, `developing`, `weakpoints`, `recommendedFocus`). |
| `GET` | `/api/v1/courses/:slug/session` | Bearer/Cookie | **Read-only** session context fetch returning current chapter, messages, BKT masteries, and progression snapshot without mutating state. |
| `POST` | `/api/v1/courses/:slug/sessions` | Bearer/Cookie | Starts or resumes an active `LearningSession` for an unlocked chapter (enforces `403 PROGRESSION_LOCKED` if chapter is locked). |
| `POST` | `/api/v1/courses/:slug/chat` | Public | Guest Socratic preview SSE stream for unauthenticated course exploration. |

### 1.4 Socratic Learning Studio Sessions (`/api/v1/sessions`)
| Method | Path | Auth | Rate Limit | Description |
| :---: | :--- | :---: | :---: | :--- |
| `POST` | `/api/v1/sessions/:sessionId/messages` | Bearer/Cookie | 20 / 60s | Primary Socratic turn endpoint. Runs drift firewall, pre-reply rubric/BKT evaluation, section transition check, 4-tier scoped RAG, and streams multi-event SSE (`token`, `rubric_update`, `state_update`, `section_status`, `drift_redirect`, `done`). |
| `POST` | `/api/v1/sessions/:sessionId/sections/advance` | Bearer/Cookie | Standard | Advances active `LessonSection` (`S1`→`S2`→`S3`→`S4`) when `turnsCompleted >= minTurns` and rubric threshold is met (`403 SECTION_INCOMPLETE` otherwise). |
| `POST` | `/api/v1/sessions/:sessionId/advance` | Bearer/Cookie | Standard | Advances enrollment to the next sequential chapter once `S1`–`S3` are completed and `S4 CHAPTER_CHECKPOINT` is passed (`403 CHECKPOINT_REQUIRED` / `PRACTICAL_REQUIRED` otherwise). |

### 1.5 Assessments, Practicals & Oral Viva (`/api/v1/assessments`)
| Method | Path | Auth | Rate Limit | Description |
| :---: | :--- | :---: | :---: | :--- |
| `GET` | `/api/v1/assessments/chapters/:chapterId` | Bearer/Cookie | Standard | Fetches checkpoint questions and rubric criteria for `S4 CHAPTER_CHECKPOINT`. |
| `POST` | `/api/v1/assessments/chapters/:chapterId/submit` | Bearer/Cookie | 15 / 60s | Grades chapter checkpoint answers via `RubricEvaluatorService`, updates BKT $P(L_t)$, unlocks next chapter (or `S5 MODULE_PRACTICAL`) if score $\ge 0.70$, or triggers remediation. |
| `POST` | `/api/v1/assessments/practical/submit` | Bearer/Cookie | 15 / 60s | Executes learner Python code against the module's deterministic multi-case test harness (`SandboxService.evaluatePractical`), updates `ModuleProgress.practicalPassed`, and unlocks the next module. |
| `POST` | `/api/v1/assessments/final/viva` | Bearer/Cookie | 15 / 60s | Conducts a 3-turn interactive Viva Voce oral defense (`VivaDefenseTurn` 1..3), grading each turn and returning follow-up architectural probes. |

### 1.6 Code Execution Sandbox, R2 Vault & Verifiable Certificates
| Method | Path | Auth | Rate Limit | Description |
| :---: | :--- | :---: | :---: | :--- |
| `POST` | `/api/v1/execute` | Bearer/Cookie | Standard | Executes ad-hoc Python snippets from the Learning Studio IDE drawer inside the security-filtered sandbox (`SandboxService.executePython`). |
| `POST` | `/api/v1/certificates/issue` | Bearer/Cookie | 10 / 60s | Verifies 5-component `CertificationEvaluator` gates, signs canonical evidence JSON with **Ed25519**, persists `Certificate`, and emails notice. |
| `GET` | `/api/v1/certificates/mine` | Bearer/Cookie | Standard | Lists all verifiable credentials earned by the authenticated learner. |
| `GET` | `/api/v1/certificates/:credentialId/verify` | Public | Standard | Public cryptographic verification endpoint. Re-verifies the Ed25519 signature against `SigningKeyRegistry` and returns full evidence breakdown. |
| `POST` | `/api/v1/certificates/:credentialId/revoke` | Admin Only | Standard | Revokes a compromised or invalidated credential (`status = REVOKED`) with an auditable `revocationReason`. |
| `POST` | `/api/v1/storage/upload` | Bearer/Cookie | 10 / 60s | Uploads a MIME-validated ($\le 2	ext{ MB}$) evidence artifact to private Cloudflare R2 storage. |
| `GET` | `/api/v1/storage/:artifactId` | Bearer/Cookie | Standard | Streams a private R2 artifact after verifying enrollment ownership or `ADMIN` role. |

---

## 2. Defense-in-Depth Security Architecture

1. **Ownership & Role Authorization (`honoAuth.ts`):**
   - `honoAuthMiddleware` validates Bearer tokens and Better Auth session cookies on every protected route.
   - `verifyEnrollmentOwnership(enrollmentId, userId)` ensures learners can never read or mutate another learner's sessions, assessments, or R2 artifacts (`403 Forbidden`).
   - `honoRequireRole("ADMIN")` restricts administrative endpoints such as credential revocation.
2. **Pre-Verification Account Isolation & CSPRNG OTP Lockout (`auth.hono.ts`):**
   - Registration requests do not insert unverified rows into `users`. Instead, the hashed password and 6-digit CSPRNG OTP (`crypto.randomInt(100000, 1000000)`) are held in `verifications` with a 10-minute TTL and a hard **5-attempt brute-force lockout** (`429 Too Many Requests`).
3. **Edge Durable Object Rate Limiting (`honoRateLimit.ts`):**
   - Protects authentication (`5–8 req/min`), AI tutor streaming (`20 req/min`), assessment grading (`15 req/min`), and certificate issuance (`10 req/min`) using Cloudflare Durable Objects (`RateLimiterDO`) with sliding-window counters and standard `Retry-After` headers.
4. **Python Sandbox Security Blacklist (`sandbox.service.ts`):**
   - Rejects dangerous system/network imports and builtins (`subprocess`, `socket`, `shutil`, `ctypes`, `multiprocessing`, `urllib`, `requests`, `http`, `eval(`, `exec(`, `__import__(`, `open('/etc/...')`) before execution and enforces a strict 3000ms process timeout and 64 KB output cap.
5. **PII-Redacted Structured Logging (`logger.ts`):**
   - Automatically scrubs sensitive keys (`password`, `passwordHash`, `token`, `secret`, `authorization`, `apiKey`, `privateKey`) before writing structured JSON logs.
