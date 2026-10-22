# CERTIFY — Production Readiness Checklist & Deployment Gates

**Document Version:** `2.0-LOCKED-TARGET`  
**Status:** `PRE-DEPLOYMENT VERIFICATION GATES`  
**Target Environment:** Cloudflare Pages + Cloudflare Workers + Neon PostgreSQL + Better Auth + Resend + Cloudflare R2 + Cloudflare Sandboxes  
**Date:** October 22, 2026  

---

## 1. Executive Deployment Governance

Before CERTIFY can be deployed to production, every requirement below must be verified. No feature or endpoint may be released with simulated fallbacks, volatile in-memory signing keys, or unisolated code execution.

```
+---------------------------------------------------------------------------------------------------+
|                                  PRODUCTION READINESS GATES                                       |
+---------------------------------------------------------------------------------------------------+
|  [GATE 1: Security & Sandboxing]      Container microVM isolation, zero-egress, no regex relying |
|  [GATE 2: Database & Migrations]       Neon PostgreSQL 16, Prisma Neon adapter, versioned SQL     |
|  [GATE 3: Identity & Authentication]   Better Auth single authority, Resend transactional emails  |
|  [GATE 4: Mastery & Pedagogy]          BKT single observation, chat decoupled, anti-gaming scoring |
|  [GATE 5: Cryptography & Privacy]      Ed25519 Web Crypto, Key IDs, persistent PEM, zero-PII     |
|  [GATE 6: Edge Storage & Performance]  Cloudflare R2 private bucket, Cloudflare Pages caching     |
|  [GATE 7: CI/CD & Secret Management]   Staging/Prod separation, Wrangler secrets, zero client leak |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Comprehensive Verification Gates

### Gate 1: Security & Hostile-Code Sandbox Isolation

| # | Check / Requirement | Verification Method / Evidence | Status | Blocker / Remediation |
| :--- | :--- | :--- | :--- | :--- |
| **1.1** | Practical code runs in isolated container/microVM. | Container runtime inspection; `docker inspect` or Cloudflare Sandbox API. | `BLOCKED` | Local subprocess currently used; must deploy Cloudflare Sandbox container. |
| **1.2** | Zero network egress from code execution boundary. | Socket connection test (`import socket; socket.connect(('1.1.1.1', 80))`) throws unreachable. | `BLOCKED` | Must configure container with `--network=none`. |
| **1.3** | Hard resource quotas enforced (128MB RAM, 2.5s CPU). | Memory bomb (`'A' * 10**9`) and infinite loop tests terminate within 2.5s. | `BLOCKED` | Dependent on container runtime integration. |
| **1.4** | Ephemeral scratch filesystem destroyed immediately. | File write (`open('test.txt', 'w')`) does not persist into subsequent run. | `BLOCKED` | Dependent on container runtime integration. |
| **1.5** | Public arbitrary code execution (`POST /execute`) removed. | `POST /api/v1/execute` returns 404/403 for non-admin students. | `BLOCKED` | Route must be deprecated or restricted. |

---

### Gate 2: Database Architecture & Neon PostgreSQL Migrations

| # | Check / Requirement | Verification Method / Evidence | Status | Blocker / Remediation |
| :--- | :--- | :--- | :--- | :--- |
| **2.1** | Schema uses PostgreSQL provider (`provider = "postgresql"`).| Inspect `prisma/schema.prisma`. | `BLOCKED` | Schema currently specifies `provider = "sqlite"`. |
| **2.2** | Versioned PostgreSQL SQL migrations created and reviewed. | Inspect `prisma/migrations/*` for valid PostgreSQL DDL. | `BLOCKED` | Zero PostgreSQL migrations exist in repository. |
| **2.3** | Production deployment uses `prisma migrate deploy`. | CI/CD script verification; `prisma db push` prohibited. | `BLOCKED` | Must configure GitHub Actions deployment runner. |
| **2.4** | Connection pooling configured via Neon pgbouncer. | Verify `DATABASE_URL` uses pooled Neon connection string. | `BLOCKED` | Requires Neon project provisioning. |
| **2.5** | Separate direct connection string for migrations. | Verify `DIRECT_URL` uses direct unpooled port 5432. | `BLOCKED` | Requires Neon project provisioning. |
| **2.6** | Point-in-time recovery (PITR) & branching enabled. | Neon project settings review. | `BLOCKED` | Requires Neon dashboard configuration. |

---

### Gate 3: Identity, Authentication & Better Auth

| # | Check / Requirement | Verification Method / Evidence | Status | Blocker / Remediation |
| :--- | :--- | :--- | :--- | :--- |
| **3.1** | Better Auth is the single identity and session authority. | Verify `Session` and `Account` tables; verify custom JWT is removed. | `BLOCKED` | Better Auth Prisma adapter integration pending. |
| **3.2** | Transactional email delivery via Resend configured. | Sign-up triggers verification email to test inbox via Resend. | `BLOCKED` | Requires `RESEND_API_KEY` configuration. |
| **3.3** | Password recovery flow verified end-to-end. | Forgot-password request delivers signed 1-hour reset token. | `BLOCKED` | Requires Better Auth email plugin. |
| **3.4** | Existing legacy users migrated without data loss. | Execute `scripts/migrate-legacy-users.ts` on test database. | `BLOCKED` | Script must be created and tested. |
| **3.5** | Secure cookie flags enforced (`HttpOnly`, `SameSite=Lax`, `Secure`).| Inspect `Set-Cookie` header on sign-in response. | `BLOCKED` | Dependent on Better Auth edge configuration. |

---

### Gate 4: Mastery Engine (BKT) & Pedagogical Integrity

| # | Check / Requirement | Verification Method / Evidence | Status | Blocker / Remediation |
| :--- | :--- | :--- | :--- | :--- |
| **4.1** | Socratic tutor chat strictly decoupled from BKT mastery. | Send 10 chat messages; assert `ConceptMastery.pMastery` unchanged. | `PASS` | Verified in Argon `sessions.controller.ts`. |
| **4.2** | Double-update remediation hack removed permanently. | Single remediation check updates BKT exactly once. | `BLOCKED` | Must remove lines 642–644 in `assessment.controller.ts`. |
| **4.3** | Baseline diagnostic supports non-punitive "Honest Skip". | Skip answer sets prior to $0.15$; correct sets to $0.40$. | `PASS` | Verified in Argon `assessment.controller.ts`. |
| **4.4** | Interaction depth immune to raw message flooding. | Spam 20 empty chat messages; assert interaction depth unchanged. | `BLOCKED` | Must remove `userMessageCount * 0.03` formula. |
| **4.5** | Real AI models stream via native Workers `fetch`. | Streaming response emits true tokens from Anthropic/OpenAI. | `BLOCKED` | Real LLM SDK/fetch integration pending. |
| **4.6** | Zero simulated AI responses permitted in production. | Missing API keys in production triggers `503 Service Unavailable`. | `BLOCKED` | Assertion must be hardcoded in `config/index.ts`. |

---

### Gate 5: Asymmetric Cryptography (Ed25519) & Privacy

| # | Check / Requirement | Verification Method / Evidence | Status | Blocker / Remediation |
| :--- | :--- | :--- | :--- | :--- |
| **5.1** | Ed25519 keypair persistent across worker reboots. | Private key stored in Worker secrets; public key verifies across restarts. | `BLOCKED` | In-memory ephemeral fallback must be disabled. |
| **5.2** | Canonical JSON payload strictly sorted and deterministic. | Canonical serializer test validates key ordering and byte identity. | `PASS` | Verified in `crypto.service.ts`. |
| **5.3** | Key ID (`kid`) attached to certificate metadata. | Verify `kid` field in signed certificate payload. | `BLOCKED` | Must add `keyId` column and metadata field. |
| **5.4** | Public `/verify` endpoint blinds student legal names. | Unauthenticated request returns `A***e L.`; full name requires token. | `BLOCKED` | Must implement identity blinding on verify route. |
| **5.5** | Scoped revocation (instructors cannot revoke other courses).| Instructor A receives 403 when revoking Certificate for Course B. | `BLOCKED` | Must implement course-level tenant checks. |

---

### Gate 6: Storage, Edge Routing & HTTP Compliance

| # | Check / Requirement | Verification Method / Evidence | Status | Blocker / Remediation |
| :--- | :--- | :--- | :--- | :--- |
| **6.1** | HTTP `GET` endpoints are strictly read-only and safe. | `GET /courses/:slug/session` creates zero database rows. | `BLOCKED` | Must refactor state creation into explicit POST routes. |
| **6.2** | Cloudflare R2 bucket configured with private access. | R2 bucket binding verified; visual SVG certificate stored upon issue. | `BLOCKED` | R2 binding and storage helper pending. |
| **6.3** | Idempotency keys enforced on assessment submissions. | Concurrent identical submissions return cached result with no duplicate attempts. | `BLOCKED` | Idempotency middleware pending. |
| **6.4** | Frontend deployed to Cloudflare Pages with clean routing. | `npm run build && npx wrangler pages deploy dist` succeeds. | `BLOCKED` | Requires Pages project linking. |

---

### Gate 7: CI/CD, Secrets & Operational Runbooks

| # | Check / Requirement | Verification Method / Evidence | Status | Blocker / Remediation |
| :--- | :--- | :--- | :--- | :--- |
| **7.1** | Staging and Production environments strictly separated. | Separate Neon branches, separate Worker routes, separate R2 buckets. | `BLOCKED` | Requires environment setup. |
| **7.2** | Zero client-side leakage of server API keys or secrets. | Inspect client bundle (`dist/assets/*.js`) for forbidden secret patterns. | `PASS` | Client only references `VITE_` variables. |
| **7.3** | Rollback runbook tested and documented. | Automated rollback of Worker and database migration verified in staging. | `BLOCKED` | Runbook must be verified. |
| **7.4** | Structured JSON logging with automated secret redaction. | Inspect worker logs; assert passwords and API keys are masked. | `PASS` | Redaction verified in `logger.ts`. |

---

## 3. Production Deployment Sign-Off Procedure

A release to production requires unanimous sign-off across all 7 gates:

1. **Security Engineering Sign-Off:** Gates 1, 5 verified. (Hostile code sandbox isolated; Ed25519 keys secured).
2. **Database Engineering Sign-Off:** Gate 2 verified. (Neon migrations applied via `migrate deploy`; pooler verified).
3. **Identity & Auth Sign-Off:** Gate 3 verified. (Better Auth session tokens and Resend email delivery verified).
4. **Pedagogical Integrity Sign-Off:** Gate 4 verified. (BKT math single-observation; zero simulated AI in production).
5. **Platform & DevOps Sign-Off:** Gates 6, 7 verified. (Cloudflare Workers, R2, Pages, and CI/CD automation verified).
