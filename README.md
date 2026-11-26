# CERTIFY — AI-First Interactive Engineering Qualification & Credentialing Platform

> **Credentials earned through demonstrated, defensible understanding — never passive video completion.**

CERTIFY is a full-stack AI engineering qualification and verifiable credentialing platform. Instead of awarding completion certificates for watching passive video playlists, CERTIFY guides learners through first-principles Socratic AI dialogue, deterministic Bayesian Knowledge Tracing (BKT), in-flow chapter checkpoints, automated Python code execution sandboxes, and oral Viva defense evaluations before issuing RFC 8032 Ed25519 cryptographically signed credentials.

---

## Repository Structure

```text
certify/
├── backend/                  # Hono + TypeScript + Prisma Edge API (Cloudflare Workers & Node.js)
│   ├── prisma/               # 37-table PostgreSQL + pgvector schema, seed, and DDL migrations
│   ├── scripts/              # Curriculum enrichment, 169-chunk RAG ingestion, and user management
│   └── src/                  # Domain-isolated modules (ai, analytics, assessment, auth, certificates, courses, email, mastery, progression, sandbox, sessions, storage)
├── courses/                  # Versioned curriculum corpus
│   └── python-fundamentals/  # Flagship 10-module, 29-chapter, 66-criterion Python track
├── docs/                     # Complete Business Proposal, System Design & Engineering Documentation Suite
│   ├── README.md             # Master Documentation Index
│   ├── 01_BUSINESS_PROPOSAL_AND_PITCH.md
│   ├── 02_SYSTEM_ARCHITECTURE_AND_DESIGN.md
│   ├── 03_TECH_STACK_AND_INFRASTRUCTURE.md
│   ├── 04_DATABASE_ARCHITECTURE_AND_SCHEMA.md
│   ├── 05_AI_PEDAGOGY_RAG_AND_BKT_ENGINE.md
│   ├── 06_API_AND_SECURITY_SPECIFICATION.md
│   └── 07_PROJECT_STATUS_AND_ROADMAP.md
├── frontend/                 # React 19 + TypeScript + Vite + WebGL/GSAP/Lenis SPA
│   ├── public/               # Optimized WebP/PNG visual assets, course covers, and hero videos
│   └── src/                  # 14 application views, Socratic Learning Studio, and API client
└── package.json              # Root workspace scripts
```

---

## Documentation Suite (`docs/`)

All business pitch materials, architectural blueprints, database specifications, mathematical engines, and roadmaps are organized inside [`docs/`](./docs/README.md):

| Document | Purpose & Target Audience |
| :--- | :--- |
| **[`docs/README.md`](./docs/README.md)** | Master index and executive navigation guide for investors, enterprise buyers, and technical reviewers. |
| **[`docs/01_BUSINESS_PROPOSAL_AND_PITCH.md`](./docs/01_BUSINESS_PROPOSAL_AND_PITCH.md)** | Executive pitch deck narrative, problem/solution gap, market positioning, B2B/B2C/University use cases, and monetization model. |
| **[`docs/02_SYSTEM_ARCHITECTURE_AND_DESIGN.md`](./docs/02_SYSTEM_ARCHITECTURE_AND_DESIGN.md)** | End-to-end system design, Control Plane vs. Data Plane separation, 4-level progression state machine, and SSE streaming flow. |
| **[`docs/03_TECH_STACK_AND_INFRASTRUCTURE.md`](./docs/03_TECH_STACK_AND_INFRASTRUCTURE.md)** | Complete inventory and architectural rationale for every frontend, backend, database, AI, storage, and security technology. |
| **[`docs/04_DATABASE_ARCHITECTURE_AND_SCHEMA.md`](./docs/04_DATABASE_ARCHITECTURE_AND_SCHEMA.md)** | Full 37-table Neon PostgreSQL + `pgvector` data dictionary across 10 domains, ER relationships, and indexing strategy. |
| **[`docs/05_AI_PEDAGOGY_RAG_AND_BKT_ENGINE.md`](./docs/05_AI_PEDAGOGY_RAG_AND_BKT_ENGINE.md)** | Stateful Socratic Pedagogical Director, 169-chunk 4-tier section-fenced Hybrid RAG, hybrid rubric evaluator, and BKT math. |
| **[`docs/06_API_AND_SECURITY_SPECIFICATION.md`](./docs/06_API_AND_SECURITY_SPECIFICATION.md)** | Complete REST + SSE endpoint reference, Better Auth 6-digit OTP flow, Durable Object rate limiting, and Ed25519 verification. |
| **[`docs/07_PROJECT_STATUS_AND_ROADMAP.md`](./docs/07_PROJECT_STATUS_AND_ROADMAP.md)** | Comprehensive audit of what is 100% built and tested today (v3.0.0) vs. what is planned next across Phases 1–4. |

---

## Quick Start

### 1. Prerequisites
- **Node.js** 20+ and **npm** 9+
- **PostgreSQL 16+** with `pgvector` (or a [Neon Serverless PostgreSQL](https://neon.tech/) connection string)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL, BETTER_AUTH_SECRET, GEMINI_API_KEY, GROQ_API_KEY, and ED25519 keys in .env

# Push schema and seed curriculum + progression state machine
npm run db:push
npm run db:generate
npm run db:seed

# Ingest 169 curriculum chunks into pgvector + tsvector
npm run rag:ingest

# Run backend verification suite (17 test suites, 71 tests)
npm test

# Start development server (http://localhost:5000)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start Vite development server (http://localhost:5173)
npm run dev
```
