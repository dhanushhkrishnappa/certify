# 03 — Technology Stack & Infrastructure

**Document Scope:** Complete Technology Inventory, Architectural Justification, Runtime Environments, and Deployment Topology  
**Platform Version:** CERTIFY v3.0.0

---

## 1. Executive Stack Overview

CERTIFY is engineered for **edge-native performance, zero cold-start latency, strict type safety, and mathematical determinism**. Both the frontend and backend are written in **100% TypeScript** and deployed across globally distributed edge infrastructure.

| Layer | Core Technologies | Deployment Target |
| :--- | :--- | :--- |
| **Frontend Application** | React 19.2, TypeScript 6.0, Vite 8.3, Tailwind CSS, Motion 14, GSAP 3.15, Lenis 1.3, Three.js / OGL WebGL | Cloudflare Pages / Vercel Edge CDN (`certify.studio`) |
| **Backend API & Control Plane** | Hono 4.13, TypeScript 5.6, Zod 3.23, Node.js & Cloudflare Workers Runtime | Cloudflare Workers (`api.certify.studio`) & Node.js 20+ |
| **Database & Vector Engine** | Neon Serverless PostgreSQL 16, Prisma ORM 5.22 (`@prisma/adapter-neon`), `pgvector` (1536-dim HNSW), `tsvector` (GIN FTS) | Neon Serverless Postgres (WebSocket/HTTP Pooler) |
| **Authentication & Identity** | Better Auth 1.7 (`better-auth/adapters/prisma`), Bearer Token + Cookie Sessions, CSPRNG 6-Digit OTP, Google OAuth 2.0 | Integrated within Hono Edge API |
| **AI & RAG Pipeline** | Google Gemini (`gemini-2.5-flash`, `gemini-embedding-001` 1536-dim), Groq (`llama-3.3-70b-versatile`), Anthropic Claude (`claude-sonnet-4-6`), OpenAI (`gpt-4o`) | Multi-Provider Failover Gateway |
| **Cryptography & Trust Ledger** | Node/WebCrypto **RFC 8032 Ed25519** Digital Signatures, SHA-256 Canonical Payload Hashing | `CredentialCryptoService` + `SigningKeyRegistry` |
| **Object Storage & Rate Limiting** | Cloudflare R2 Private Bucket (`CERTIFY_STORAGE`), Cloudflare Durable Objects (`RateLimiterDO`) + In-Memory Sliding Window | Cloudflare Edge Bindings |
| **Transactional Email Engine** | Raw Cloudflare TCP/TLS Socket SMTP (`cloudflare:sockets`), Nodemailer 10.5, Resend HTTP API 6.34 | Triple-Fallback Transport (`support@certify.studio`) |
| **Testing & Quality Assurance** | Vitest 2.1 (17 test suites, 71 tests), Oxlint 1.81, TypeScript Strict Compiler (`tsc`) | CI/CD & Local Pre-Build Verification |

---

## 2. Frontend Technology Stack (`frontend/`)

### 2.1 Core Framework & Build Tooling
- **React 19.2 (`react`, `react-dom`):** Concurrent rendering, strict state isolation per authenticated user, and custom View Transition API integration (`document.startViewTransition`) in `App.tsx`.
- **TypeScript 6.0 (`~6.0.2`):** Strict type checking across all 14 application views, SSE stream callbacks, BKT mastery payloads, and progression tree structures (`src/types/index.ts`).
- **Vite 8.3 (`vite`, `@vitejs/plugin-react`):** Sub-second HMR during development and optimized production ES module bundling.
- **Oxlint 1.81 (`oxlint`):** Rust-powered static analysis and linting via `.oxlintrc.json`.

### 2.2 Visual Engineering, Shaders & Editorial Motion
- **WebGL / Three.js / OGL (`three`, `@react-three/fiber`, `ogl`):** Powers the hardware-accelerated full-viewport Silk shader (`src/components/landing/Silk.tsx`) and 3D interactive Bulge cards (`src/components/landing/webgl/BulgeCard.tsx`).
- **GSAP 3.15 (`gsap`, `gsap/ScrollTrigger`, `gsap/SplitText`):** Drives the unified motion vocabulary (`src/motion/motionVocabulary.ts`), scroll-pinned manifesto typography, and horizontal accordion galleries.
- **Lenis 1.3 (`lenis`):** 60fps smooth inertia scrolling synchronized with `gsap.ticker` (`src/motion/useLenis.ts`), automatically disabled when `prefers-reduced-motion: reduce` is active.
- **Motion 14 (`motion/react`):** Tactile spring physics (`stiffness: 380, damping: 30`) for navigation docks, modal transitions, and OTP input slots.
- **Iconography (`lucide-react`, `@hugeicons/react`, `@hugeicons/core-free-icons`):** Sharp, high-contrast vector icons across the Learning Studio, Sandbox IDE, and verification badges.

---

## 3. Backend Technology Stack (`backend/`)

### 3.1 Edge-First Web Framework
- **Hono 4.13 (`hono`, `@hono/node-server`):** Ultra-fast, Web-Standards-native router (`Request` / `Response` / `ReadableStream`). Allows the exact same `src/app.ts` codebase to run on **Cloudflare Workers** (`src/worker.ts`) in production and on **Node.js** (`src/server.ts`) for local development and Vitest integration testing.
- **Native SSE Streaming (`hono/streaming`):** Zero-buffering Server-Sent Events streaming via `streamSSE`, multiplexing live tutor tokens (`event: token`), rubric verdicts (`event: rubric_update`), BKT posterior updates (`event: state_update`), and progression unlocks (`event: section_status`).
- **Zod 3.23 (`zod`):** Runtime schema validation for structured LLM rubric evaluation outputs (`RubricEvaluationOutputSchema`) and API payloads.

### 3.2 Database & Vector Search Architecture
- **Neon Serverless PostgreSQL (`@neondatabase/serverless`):** Serverless Postgres with scale-to-zero branching and WebSocket connection pooling (`ws`) capable of running inside Cloudflare Workers where raw TCP sockets are restricted.
- **Prisma ORM 5.22 (`@prisma/client`, `@prisma/adapter-neon`):** Configured with `previewFeatures = ["driverAdapters"]` and custom resilient DNS resolution (`1.1.1.1` / `8.8.8.8` fallback in `src/shared/prisma.ts`) to prevent local ISP DNS dropoffs when connecting to Neon endpoints.
- **`pgvector` + PostgreSQL Full-Text Search (`tsvector`):**
  - **Dense Vector Index:** 1536-dimensional embeddings (`vector(1536)`) indexed with an **HNSW** (`vector_cosine_ops`) index for sub-10ms approximate nearest-neighbor semantic search.
  - **Lexical FTS Index:** Generated `tsvector` column (`GENERATED ALWAYS AS (to_tsvector('english', content)) STORED`) indexed with a **GIN** index for exact Python identifier and keyword matching.

### 3.3 Authentication & Rate Limiting
- **Better Auth 1.7 (`better-auth`):** Unified session management supporting both `Authorization: Bearer <token>` headers and HTTP-only signed cookies (`cookiePrefix: "certify"`), with 7-day rolling session expiration and 5-minute cookie cache.
- **Pre-Verification OTP Gate (`src/modules/auth/auth.hono.ts`):** Uses Node `crypto.randomInt(100000, 1000000)` CSPRNG to generate 6-digit verification codes and `better-auth/crypto` (`hashPassword`, `verifyPassword`) so unverified accounts never pollute the `users` table until OTP confirmation.
- **Distributed Rate Limiting (`src/shared/middleware/honoRateLimit.ts`):** Uses Cloudflare Durable Objects (`RateLimiterDO`) at the edge with an automatic in-memory sliding-window fallback for local/Node execution.

### 3.4 Multi-Provider AI Gateway (`src/modules/ai/`)
- **Primary & Failover LLM Routing (`ai.provider.ts`):**
  - Supports **Google Gemini** (`gemini-2.5-flash`), **Groq** (`llama-3.3-70b-versatile` via ultra-low-latency LPU inference), **Anthropic Claude** (`claude-sonnet-4-6` / `claude-haiku-4-5-20251001`), and **OpenAI** (`gpt-4o` / `gpt-4o-mini`).
  - Automatic cross-provider failover: If the primary provider encounters a 429 rate limit or 5xx outage, `AIProvider` transparently fails over to configured secondary providers, and in development/test environments falls back to a curriculum-parsed deterministic Socratic generator (`generateIntelligentSocraticFallback`).
- **Retired Model Guardrail:** Automatically blocks deprecated models (`claude-3-5-sonnet-*`, `claude-2.*`) and normalizes invalid Gemini model strings via `normalizeGeminiModel()`.
- **Dense Embeddings (`embedding.service.ts`):** Calls Google's `gemini-embedding-001` endpoint with `outputDimensionality: 1536`. Blocks synthetic vectors in live runtime queries while providing a deterministic SHA-256 vector mode strictly for offline unit tests.

### 3.5 Transactional Email Architecture (`src/modules/email/`)
- **1st Priority — Cloudflare Worker Raw TLS Socket SMTP (`cloudflareSmtp.ts`):** Connects directly to `smtp.gmail.com:465` using `cloudflare:sockets` (`connect(..., { secureTransport: "on" })`), implementing the full SMTP state machine (`EHLO` → `AUTH LOGIN` → `MAIL FROM` → `RCPT TO` → `DATA` with multipart HTML) directly inside a Cloudflare Worker without external dependencies.
- **2nd Priority — Nodemailer SMTP (`nodemailer`):** Standard TLS SMTP pool for Node.js runtime environments.
- **3rd Priority — Resend HTTP API (`resend`):** Automatic REST API failover if SMTP credentials are not configured.
- **Idempotency & Audit Trail:** Every email dispatch is recorded in the `email_logs` table with a unique `idempotencyKey` to prevent duplicate OTP or certificate emails.

---

## 4. Infrastructure & Environment Configuration (`backend/wrangler.toml`)

```toml
name = "certify-backend"
main = "src/worker.ts"
compatibility_date = "2024-11-01"
compatibility_flags = ["nodejs_compat"]

[vars]
NODE_ENV = "production"
CORS_ORIGIN = "https://certify.pages.dev,https://certify.studio,https://www.certify.studio"
AI_PROVIDER = "groq"
GROQ_TUTOR_MODEL = "llama-3.3-70b-versatile"
GROQ_EVALUATOR_MODEL = "llama-3.3-70b-versatile"
GEMINI_TUTOR_MODEL = "gemini-2.5-flash"
GEMINI_EVALUATOR_MODEL = "gemini-2.5-flash"
GEMINI_AUTO_FALLBACK = "true"
ALLOW_DEV_AI_FALLBACK = "false"
ED25519_KEY_ID = "certify-2026-key-1"

[[r2_buckets]]
binding = "CERTIFY_STORAGE"
bucket_name = "certify-artifacts"

[[durable_objects.bindings]]
name = "RATE_LIMITER"
class_name = "RateLimiterDO"
```
