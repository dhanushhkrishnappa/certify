# CERTIFY — Production Implementation Blueprint

**Document Version:** `2026.11-LOCKED-TARGET`  
**Status:** `LOCKED PRODUCTION ARCHITECTURAL TARGET`  
**Target Environment:** Cloudflare Edge Ecosystem + Neon PostgreSQL + Better Auth + Resend  
**Date:** October 22, 2026  

---

## 1. Executive Summary & Locked Target Stack

CERTIFY is an authoritative, course-first AI learning and certification platform engineered around the core progression **LEARN → DEMONSTRATE → EARN**. 

This document defines the production architecture, domain boundaries, data models, migration workflows, security threat models, and operational runbooks for the locked target stack:

| Architectural Tier | Approved Target Technology | Implementation & Integration Specification |
| :--- | :--- | :--- |
| **Frontend Hosting** | **Cloudflare Pages** | Static SPA deployment (`React 19` + `Vite 8` + `TypeScript 5.6`), instant edge cache, custom domain, zero cold start. |
| **Backend & Routing** | **Cloudflare Workers** | Edge compute runtime (`workerd`), V8 isolate security, Web Standards (`fetch`, `Request`, `Response`, `ReadableStream`, `crypto.subtle`). |
| **Relational Database** | **Neon PostgreSQL** | Serverless PostgreSQL 16 with pooling (`pgbouncer`), branching for CI/CD staging, and point-in-time recovery. |
| **ORM & Data Access** | **Prisma 5.20+ via `@prisma/adapter-neon`** | Prisma Client with driver adapter running on `@neondatabase/serverless`. Migrations executed via Node.js CI runner (`prisma migrate deploy`). |
| **Authentication & Sessions** | **Better Auth** | Single authentication authority utilizing `@better-auth/prisma-adapter`. HttpOnly session cookies, CSRF, password hashing, and user migration. |
| **Transactional Email** | **Resend** | Transactional delivery for email verification, password resets, and certificate notifications via Resend Workers SDK / REST API. |
| **Object / File Storage** | **Cloudflare R2** | Private object storage via Worker R2 bucket bindings (`env.CERTIFY_R2_BUCKET`) for credentials, audit logs, and learner uploads. |
| **Practical Code Execution** | **Cloudflare Sandboxes / Containers** | Isolated ephemeral execution boundary: zero-egress network, 128MB RAM, 0.5 vCPU, 2.5s timeout, AST security filter, and unit test harness. |
| **AI LLM Orchestration** | **Anthropic Claude 3.5 Sonnet / OpenAI GPT-4o** | Vendor-neutral `AIProvider` using native Workers `fetch` + `AbortController` streaming. Fails closed (`503`) in production. |
| **Credential Cryptography** | **RFC 8032 Ed25519 via Web Crypto** | Asymmetric Ed25519 signing (`crypto.subtle`), persistent Key IDs (`kid`), canonical JSON payloads, and zero-PII public verification. |

```
+---------------------------------------------------------------------------------------------------------------+
|                                            CLOUDFLARE PAGES (SPA)                                             |
|                                       React 19 + Vite + TypeScript                                            |
+---------------------------------------------------------------------------------------------------------------+
                                                       │
                                        HTTPS / API    │ (Session Cookie / Bearer)
                                                       ▼
+---------------------------------------------------------------------------------------------------------------+
|                                          CLOUDFLARE WORKERS (API)                                             |
|  - Edge Routing & Middleware (Hono / Web Standards)                                                          |
|  - Better Auth Single Authority (Prisma Adapter)                                                              |
|  - Rate Limiting & Concurrency / Idempotency Control                                                         |
|  - Socratic AI Tutor SSE Streaming (Native Fetch + AbortController)                                          |
|  - BKT Probabilistic Mastery Engine (Single Observation Updates)                                              |
|  - Deterministic Certification Evaluator & Ed25519 Asymmetric Signer                                          |
+---------------------------------------------------------------------------------------------------------------+
       │                                │                                │                              │
       │ Direct Binding                 │ SQL over WebSockets            │ REST API                     │ Worker RPC / Tunnel
       ▼                                ▼                                ▼                              ▼
+-----------------------+   +-----------------------+   +-----------------------+   +-----------------------+
|     Cloudflare R2     |   |    Neon PostgreSQL    |   |     Resend Email      |   |  Cloudflare Sandbox   |
|   Private Artifacts   |   |   Serverless Pooler   |   |   Auth Verification   |   |  Isolated Containers  |
|  - Credential SVGs    |   |   - Better Auth Tables|   |   - Account Verify    |   |  - Zero Network       |
|  - Evidence Bundles   |   |   - Course Hierarchy  |   |   - Password Reset    |   |  - 128MB / 2.5s Limit |
|  - Verification Proofs|   |   - BKT Mastery Rows  |   |   - Credential Notice |   |  - Python 3 Harness   |
+-----------------------+   +-----------------------+   +-----------------------+   +-----------------------+
```

---

## 2. Domain Boundaries & Modular Architecture

The platform preserves its 8 core modular domain boundaries while refactoring transport and storage adapters for edge compatibility:

```
src/
├── config/                  # Worker environment secrets & runtime bindings
├── shared/
│   ├── db.ts                # PrismaClient singleton with Neon driver adapter
│   ├── auth.ts              # Better Auth client & session/role middleware
│   ├── r2.ts                # Cloudflare R2 bucket storage helper & pre-signing
│   ├── email.ts             # Resend client wrapper for transactional templates
│   ├── logger.ts            # Structured JSON logger with secret redaction
│   └── errors.ts            # Domain error types & standard HTTP responses
└── modules/
    ├── auth/                # Better Auth routes, profile handler, credential migration
    ├── courses/             # Catalog, versioning, curriculum traversal, enrollment
    ├── sessions/            # Socratic studio context, SSE streaming dialogue, chapter gates
    ├── ai/                  # Real Anthropic & OpenAI adapters, anti-gaming checks, Zod parsing
    ├── assessment/          # Baseline diagnostic, chapter rubric grading, remediation, 3-turn viva
    ├── mastery/             # BKT mathematical state engine, CertificationEvaluator
    ├── sandbox/             # Cloudflare Sandbox container client & test harness parser
    └── certificates/        # Persisted evidence aggregator, Ed25519 signer, public verifier
```

---

## 3. Database Architecture & Neon PostgreSQL Migration Plan

### 3.1 Datasource Configuration
The database layer is standardized on PostgreSQL 16. Local and test SQLite parity is deprecated in favor of **Neon Serverless PostgreSQL Branching**, ensuring 100% schema and dialect identity across local development, CI test pipelines, staging, and production.

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}
```

- `DATABASE_URL`: Neon pooled connection string (with `pgbouncer=true`) for application runtime queries.
- `DIRECT_URL`: Neon direct connection string (unpooled port 5432) for running migrations and DDL operations.

### 3.2 Prisma Client Edge Instantiation
Inside Cloudflare Workers, the Prisma Client is instantiated using `@prisma/adapter-neon` and `@neondatabase/serverless`:

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

export function createPrismaClient(databaseUrl: string): PrismaClient {
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}
```

### 3.3 Strict Migration Protocol
1. **Local Development:** Run `npx prisma migrate dev --name <migration_name>` against a local PostgreSQL container or a designated Neon development branch.
2. **Review & Version Control:** Inspect the generated SQL migration files in `prisma/migrations/*` before committing to Git.
3. **Staging / Production Deployment:** Execute migrations exclusively via CI/CD runners using:
   ```bash
   npx prisma migrate deploy
   ```
   **Rule:** `prisma db push` is strictly forbidden in CI/CD, staging, and production environments.

---

## 4. Authentication Authority: Better Auth Integration

Better Auth replaces the custom JWT implementation, serving as the sole identity, session, and role authority.

### 4.1 Required Database Schema (Better Auth Tables)
The following tables are added to `prisma/schema.prisma` to support Better Auth with the Prisma adapter:

```prisma
model User {
  id            String       @id @default(uuid())
  name          String
  email         String       @unique
  emailVerified Boolean      @default(false)
  image         String?
  role          String       @default("STUDENT") // STUDENT, INSTRUCTOR, ADMIN
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  sessions      Session[]
  accounts      Account[]
  enrollments   Enrollment[]
}

model Session {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  id                    String    @id @default(uuid())
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?   // Salted password hash
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

model Verification {
  id         String   @id @default(uuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

### 4.2 Better Auth Configuration (`src/shared/auth.ts`)
```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";

export function initBetterAuth(prisma: any, env: any) {
  const resend = new Resend(env.RESEND_API_KEY);

  return betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      async sendVerificationEmail({ user, url }) {
        await resend.emails.send({
          from: env.EMAIL_FROM || "security@certify.edu",
          to: user.email,
          subject: "Verify your CERTIFY account",
          html: `<p>Click here to verify: <a href="${url}">${url}</a></p>`,
        });
      },
      async sendResetPassword({ user, url }) {
        await resend.emails.send({
          from: env.EMAIL_FROM || "security@certify.edu",
          to: user.email,
          subject: "Reset your CERTIFY password",
          html: `<p>Click here to reset your password: <a href="${url}">${url}</a></p>`,
        });
      },
    },
    session: {
      cookieCache: { enabled: true, maxAge: 5 * 60 },
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24,      // 1 day
    },
  });
}
```

### 4.3 Data-Preserving Legacy Migration Plan
Existing users with legacy password hashes in `User.passwordHash` are migrated to Better Auth via a database migration script:
1. Copy legacy `User.fullName` to `User.name`.
2. For each legacy user, create a corresponding `Account` row with `providerId: "credential"`, `accountId: user.email`, and `password: user.passwordHash`.
3. Drop legacy column `User.passwordHash` after verification.

---

## 5. Object Storage: Cloudflare R2 Integration

Cloudflare R2 provides zero-egress fee object storage for static credential assets, verification receipts, and student artifact backups.

### 5.1 Storage Layout
```
certify-r2-bucket/
├── credentials/
│   ├── {credentialId}/
│   │   ├── certificate.svg       # Signed visual SVG artifact
│   │   ├── canonical-payload.json # Canonical signed payload
│   │   └── verification.pdf      # Optional printable PDF
├── evidence/
│   └── {enrollmentId}/
│       └── final-defense-transcript.json
└── public/
    └── branding/
```

### 5.2 Access Control & Worker Binding
R2 buckets are private by default. Access is managed directly inside Cloudflare Workers via binding:

```typescript
// wrangler.toml
// [[r2_buckets]]
// binding = "CERTIFY_R2_BUCKET"
// bucket_name = "certify-production-artifacts"

export async function storeCredentialArtifact(
  env: Env,
  credentialId: string,
  svgData: string,
  canonicalPayload: object
): Promise<void> {
  await env.CERTIFY_R2_BUCKET.put(
    `credentials/${credentialId}/certificate.svg`,
    svgData,
    {
      httpMetadata: { contentType: "image/svg+xml" },
      customMetadata: { credentialId, generatedAt: new Date().toISOString() },
    }
  );

  await env.CERTIFY_R2_BUCKET.put(
    `credentials/${credentialId}/canonical-payload.json`,
    JSON.stringify(canonicalPayload),
    {
      httpMetadata: { contentType: "application/json" },
      customMetadata: { credentialId },
    }
  );
}
```

---

## 6. Practical Code Execution: Cloudflare Sandboxes / Containers Evaluation

### 6.1 Architectural Constraint
Untrusted learner Python code must **never** execute inside the Cloudflare Worker isolate or on the primary application host. 

### 6.2 Cloudflare Sandboxes / Containers Evaluation Matrix

| Evaluation Dimension | Cloudflare Sandboxes / Containers Target | Status / Assessment |
| :--- | :--- | :--- |
| **Execution Boundary** | Ephemeral, isolated container or microVM per code execution attempt. | **REQUIRED**: Isolates OS kernel and filesystem from application server. |
| **Network Egress Control** | Zero network egress (`--network=none`). | **MANDATORY**: Blocks outbound sockets, telemetry, and internal LAN probing. |
| **Resource Constraints** | Hard limits: `CPU = 0.5 vCPU`, `Memory = 128 MB`, `Wall-clock = 2.5s`, `Output = 16 KB`. | **MANDATORY**: Prevents fork bombs, infinite loops, and memory exhaustion attacks. |
| **Filesystem Isolation** | Ephemeral scratch directory, read-only root, non-root user (`uid=1000`). | **MANDATORY**: Destroys all state immediately upon completion; prevents cross-run leaks. |
| **Adversarial Resilience** | Immune to Python AST/import bypasses (`pathlib`, `importlib`, `getattr`, MRO traversal). | **VERIFIED**: Container kernel boundary stops escape even if Python bytecode runs arbitrary OS calls. |
| **Operational Cost & Plans**| Requires Cloudflare Workers Paid / Dedicated compute integration or container add-on. | **FEASIBLE**: Pay-per-execution model aligns with assessment volume. |
| **Fallback Architecture**   | Dedicated isolated runner cluster (e.g., Judge0 or microVMs) behind Cloudflare Tunnel. | **CONTINGENCY**: Fully supported if Cloudflare native container slots face quota limits. |

### 6.3 Secure Worker-to-Sandbox Execution Protocol
1. Learner submits code to `POST /api/v1/assessments/practical/submit`.
2. Worker validates ownership and checks that the learner has an active enrollment.
3. Worker dispatches the submission and unit test harness to the isolated Sandbox service over an internal authenticated RPC / mutual TLS connection.
4. Sandbox executes the code inside a non-networked container, captures stdout markers (`__CERTIFY_RESULTS__:`), enforces the 2.5s timeout, and returns parsed JSON results.
5. Worker records the `AssessmentAttempt` (type: `PRACTICAL`) with the attributable score.

---

## 7. Real AI Provider Integration & Pedagogical Integrity

### 7.1 Vendor-Neutral Architecture
The backend integrates real Anthropic and OpenAI APIs using native `fetch` over HTTP:

```typescript
export class AIProvider {
  public static async streamTutorReply(params: TutorContext, onChunk: (t: string) => void): Promise<string> {
    if (!env.ANTHROPIC_API_KEY && !env.OPENAI_API_KEY) {
      throw new AIProviderError("AI Provider not configured", 503);
    }
    // Real Anthropic Streaming implementation via fetch("https://api.anthropic.com/v1/messages")
    // ...
  }

  public static async evaluateRubricCriteria(params: RubricParams): Promise<RubricEvaluationOutput> {
    // Real LLM call requesting JSON schema response
    // Schema enforced via Zod (RubricEvaluationOutputSchema)
    // ...
  }
}
```

### 7.2 Production Failsafe Rules
1. **No Simulated Fallbacks in Production:** If API keys are missing or invalid in production, endpoints immediately return `503 Service Unavailable`.
2. **Pedagogical Boundary (Principle B):** Socratic tutor dialogue **never** awards or mutates BKT mastery. Only structured assessment submissions trigger BKT state transitions.
3. **Anti-Gaming Protections:** Evaluator checks include lexical diversity validation (flagging keyword stuffing with unique ratio $< 0.42$) and semantic contradiction detection.

---

## 8. Mathematical Mastery (BKT) & Certification Gating

### 8.1 Single-Observation Bayesian Knowledge Tracing
The student model adheres strictly to classical BKT calculus with verified parameters:
- Prior Probability: $P(L_0) = 0.15$
- Transition Rate: $P(T) = 0.20$
- Guess Rate: $P(G) = 0.10$
- Slip Rate: $P(S) = 0.05$

$$\text{Posterior: } P(L_t | \text{Obs}) = \begin{cases} \frac{P(L_{t-1}) \cdot (1 - P(S))}{P(L_{t-1}) \cdot (1 - P(S)) + (1 - P(L_{t-1})) \cdot P(G)} & \text{if Demonstrated} \\ \frac{P(L_{t-1}) \cdot P(S)}{P(L_{t-1}) \cdot P(S) + (1 - P(L_{t-1})) \cdot (1 - P(G))} & \text{if Missed} \end{cases}$$

$$\text{Updated Mastery: } P(L_t) = P(L_t | \text{Obs}) + (1 - P(L_t | \text{Obs})) \cdot P(T)$$

**Mathematical Integrity Rule:** The double-update remediation hack is permanently removed. One student answer corresponds to **exactly one** Bayesian update.

### 8.2 Attributable Certification Gating & Scoring
A certificate is issued **only** when all deterministic gates are satisfied from persisted database records:
1. **Chapter Mastery Gate:** All course concepts have $P(L) \ge 0.70$ with zero pending remediations.
2. **Formal Assessment Gate:** All chapter assessments completed and evaluated.
3. **Practical Code Gate:** Evaluated sandbox attempt with score $\ge 0.70$.
4. **Viva Defense Gate:** Completed 3-turn AI oral defense with mean score $\ge 0.70$.

**Score Composition (Anti-Gaming Refactored):**
$$\text{Composite Score} = 0.35 \cdot (\text{Mean Mastery}) + 0.25 \cdot (\text{Practical}) + 0.20 \cdot (\text{Viva}) + 0.10 \cdot (\text{Consistency}) + 0.10 \cdot (\text{Interaction Depth})$$
- `Interaction Depth` is calculated strictly from validated dialogue rubric criteria demonstrations, **completely eliminating raw user message counts**.
- Retakes adhere to a 12-hour cooldown period, and chapter consistency uses the learner's most recent valid attempt per chapter.

---

## 9. Asymmetric Cryptography (Ed25519) & Zero-PII Verification

### 9.1 Key Management & Fail-Fast Boot Guard
- Production private signing keys (`ED25519_PRIVATE_KEY_PEM`) are stored as encrypted Cloudflare Worker secrets.
- In-memory key generation in production is strictly prohibited. If keys are missing, the Worker refuses to boot.
- All credentials include a Key ID (`kid`) identifying the public key version used for signing:
  ```json
  {
    "kid": "certify-2026-key-1",
    "algorithm": "Ed25519",
    "signature": "..."
  }
  ```

### 9.2 Zero-PII Public Verification Contract
The public endpoint `GET /api/v1/certificates/:credentialId/verify` returns zero unauthenticated personal identifying information:
- Recipient identity is presented as an anonymized public handle or cryptographically blinded identifier (e.g., `A***e L.`).
- Full learner legal names are revealed **only** when the request includes a recipient-granted verification token (`?token=...`).

---

## 10. Operational Environments & Secrets Configuration

| Environment Variable / Secret | Target / Scope | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | Worker Secret | Neon pooled connection string |
| `DIRECT_URL` | CI/CD Secret | Neon direct connection string (migrations) |
| `BETTER_AUTH_SECRET` | Worker Secret | 32-byte cryptographic session secret |
| `BETTER_AUTH_URL` | Worker Plaintext | Base URL for auth callbacks |
| `RESEND_API_KEY` | Worker Secret | Transactional email delivery key |
| `EMAIL_FROM` | Worker Plaintext | Verified sender address (`noreply@certify.edu`) |
| `ED25519_PRIVATE_KEY_PEM` | Worker Secret | PKCS#8 Ed25519 private key for signing |
| `ED25519_PUBLIC_KEY_PEM` | Worker Plaintext | SPKI Ed25519 public key for verification |
| `ANTHROPIC_API_KEY` | Worker Secret | Real Anthropic Claude API key |
| `OPENAI_API_KEY` | Worker Secret | Real OpenAI API key |
| `CERTIFY_R2_BUCKET` | Worker Binding | R2 bucket binding for artifact storage |
| `VITE_API_URL` | Pages Environment | Public API endpoint for frontend client |
