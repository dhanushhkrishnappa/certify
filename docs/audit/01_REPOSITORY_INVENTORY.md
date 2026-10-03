# CERTIFY — Complete Repository Inventory & Architectural Analysis

**Audit Date:** October 3, 2026  
**Commit:** `5961664` (*feat(frontend): refine views, audit routing integrity, and add visual QA suites*)  
**Repository Root:** `d:\Projects\certify`  
**Primary Architect / Auditor:** Antigravity AI Pair Programmer  

---

## 1. Directory Tree & Module Map

```
d:\Projects\certify\
├── .agents/                                # Agent custom skills & rules
│   └── skills/                             # 13 specialized engineering skills
├── .stitch/                                # Canonical Stitch design system specifications
│   ├── DESIGN.md                           # Master Stitch design tokens (Alabaster/Ivory theme)
│   └── screens/                            # Approved UI screen exports
├── backend/                                # Modular Monolith Express/TypeScript Backend
│   ├── prisma/
│   │   ├── schema.prisma                   # SQLite schema (16 models)
│   │   └── seed.ts                         # Flagship "Python Fundamentals" curriculum seed
│   ├── src/
│   │   ├── config/index.ts                 # Environment & secret configuration
│   │   ├── shared/
│   │   │   ├── prisma.ts                   # Singleton PrismaClient instance
│   │   │   └── middleware/auth.ts          # JWT authentication middleware
│   │   ├── modules/
│   │   │   ├── auth/                       # Auth controller & routes (register, login, me)
│   │   │   ├── courses/                    # Course catalog, detail, and enroll
│   │   │   ├── sessions/                   # AI Tutor chat, SSE streaming, advance
│   │   │   ├── assessment/                 # Chapter assessment submission & viva turn
│   │   │   ├── mastery/                    # BKT mathematical update & CertificationEvaluator
│   │   │   └── certificates/               # Issue certificate & public verification
│   │   ├── app.ts                          # Express application setup & route mounting
│   │   ├── server.ts                       # HTTP server entry point (port 5000)
│   │   └── app.test.ts                     # Placeholder unit test
│   ├── test-client.ts                      # Synthetic API integration test script
│   ├── package.json                        # Backend dependencies & scripts
│   └── tsconfig.json                       # Backend TypeScript configuration
├── frontend/                               # Single Page Application (React 19 + Vite 8)
│   ├── public/                             # Favicon and static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                     # AppSidebar, AppHeader
│   │   │   ├── AuthView.tsx                # Login / Registration modal & phone demo
│   │   │   ├── CatalogView.tsx             # Course exploration catalog
│   │   │   ├── CourseDetailsView.tsx       # Course syllabus & overview
│   │   │   ├── DashboardView.tsx           # Student home dashboard
│   │   │   ├── MyLearningView.tsx          # Track progress & course cards
│   │   │   ├── LearningStudio.tsx          # Socratic AI Tutor & code playground
│   │   │   ├── DiagnosticView.tsx          # Pre-assessment knowledge calibration
│   │   │   ├── ChapterAssessmentView.tsx   # Chapter assessment (contains distributed code mismatch)
│   │   │   ├── ChapterAssessmentModal.tsx  # Modal alternative for chapter evaluation
│   │   │   ├── RemediationStudioView.tsx   # Misconception deep-dive studio
│   │   │   ├── FinalAssessmentView.tsx     # Comprehensive final exam (12 questions)
│   │   │   ├── VivaChamberView.tsx         # Oral viva defense chamber (5 turns)
│   │   │   ├── VivaDefenseModal.tsx        # Modal alternative for viva defense
│   │   │   ├── CertificationResultView.tsx # Composite score and tier notification
│   │   │   ├── CredentialsListView.tsx     # List of learner's earned credentials
│   │   │   ├── CredentialDetailsView.tsx   # Formal certificate presentation canvas
│   │   │   ├── PublicVerifyView.tsx        # Public ledger verification registry
│   │   │   ├── ProgressView.tsx            # BKT probability telemetry dashboard
│   │   │   ├── ProfileView.tsx             # Learner user profile
│   │   │   ├── SettingsView.tsx            # Socratic mentor tuning preferences
│   │   │   └── LandingPageView.tsx         # Marketing & trust ledger landing page
│   │   ├── services/
│   │   │   └── api.ts                      # Fetch wrapper for all backend endpoints
│   │   ├── types/
│   │   │   └── index.ts                    # TypeScript data models and DTO interfaces
│   │   ├── App.tsx                         # Client-side router, view switcher, session guard
│   │   ├── main.tsx                        # React DOM root entry point
│   │   └── index.css                       # Global styles & Tailwind utilities
│   ├── qa-interactions.mjs                 # Headless Puppeteer interaction QA suite
│   ├── capture-all-screens.mjs             # Screen capture automation script
│   ├── package.json                        # Frontend dependencies & scripts
│   ├── index.html                          # HTML shell (loads Tailwind via CDN)
│   └── vite.config.ts                      # Vite configuration
├── docs/                                   # Architectural, QA, and audit specifications (37 files)
│   └── audit/                              # Comprehensive E2E Product Audit (created herein)
└── DESIGN.md                               # Root visual design system specification
```

---

## 2. Runtime Technologies & Dependency Analysis

### Backend Application
| Dimension | Intended Specification | Actual Implementation | Audit Finding |
| :--- | :--- | :--- | :--- |
| **Language & Runtime** | Node.js 20+, TypeScript 5.6 | Node.js v24.13.0, TypeScript 5.6.2, tsx 4.19.1 | Matches modern TS runtime |
| **HTTP Framework** | Express 4.21.0 | Express 4.21.0, CORS 2.8.5 | Matches |
| **Database Engine** | PostgreSQL 16+ with `pgvector` | **SQLite 3 (`file:./dev.db`)** | **CRITICAL MISMATCH:** Architecture documents specify PostgreSQL + pgvector; code uses local SQLite. No vector extension exists. |
| **ORM / Data Access** | Prisma Client 5.20.0 | Prisma Client 5.20.0 | Matches |
| **Authentication** | JWT (RS256 / 15-min) + HttpOnly Cookies | **JWT (HS256 / 7-day) via Bearer Header** | Weak token security; 7-day expiration without revocation; secret fallback key in source code. |
| **Password Hashing** | bcrypt | bcryptjs 2.4.3 (10 salt rounds) | Matches |
| **Validation** | Zod schemas on all endpoints | Partial Zod on Auth; missing on Assessment, Sessions, and Certificates | Input validation gap |
| **AI / LLM Provider** | Anthropic Claude 3.5 Sonnet / OpenAI GPT-4o | **NONE.** No SDK installed (`package.json` contains no `@anthropic-ai/sdk`, `openai`, `@google/genai`). | **CRITICAL GAP:** AI tutor, evaluation, and viva are 100% hardcoded keyword mocks (`sessions.controller.ts:227-308`). |
| **Code Sandbox** | gVisor / Docker containerized runner | **NONE.** No sandbox exists on the backend. `/api/v1/execute` is unrouted. | **CRITICAL GAP:** Frontend fakes code execution. |

### Frontend Application
| Dimension | Intended Specification | Actual Implementation | Audit Finding |
| :--- | :--- | :--- | :--- |
| **UI Library** | React 19.2.8 | React 19.2.8, React-DOM 19.2.8 | Matches |
| **Build Tooling** | Vite 8.3.0 | Vite 8.3.0 | Matches |
| **Styling Framework** | Vanilla CSS / Tailored CSS Variables | **CDN Tailwind (`https://cdn.tailwindcss.com`)** injected in `index.html` + `index.css` | **PRODUCTION BLOCKER:** CDN Tailwind JIT compiler in `index.html` is unsuitable and unsupported for production. |
| **Routing** | Standard URL routing | Custom `window.location.pathname` + `pushState` in `App.tsx` | No React Router / TanStack Router. Direct URL deep linking is brittle and bypasses prerequisite validation. |
| **Icons** | Lucide React (`lucide-react: ^1.47.0`) | Lucide React + Google Material Symbols Outlined | Conflicting icon paradigms across views. |
| **Test Suite** | Vitest / Testing Library / Playwright | **0 unit or component tests.** Only local Puppeteer automation scripts. | No automated test coverage in frontend. |

---

## 3. Subsystem Breakdown & Actual Behavior

### A. Authentication & User Management
- **Routes:** `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`.
- **Reality:** Works for email/password using SQLite and bcrypt. However:
  - Frontend `AuthView.tsx` features a "Mobile Number / OTP" login tab that bypasses real auth and automatically signs in as `learner@certify.edu` with hardcoded password `Password123!`. If backend is down, it generates a fake token (`demo-otp-token-...`).
  - No email verification, password reset, or rate limiting exists.
  - Role check middleware (`requireAdmin`, `requireInstructor`) is completely absent.

### B. Course & Curriculum Subsystem
- **Routes:** `GET /api/v1/courses`, `GET /api/v1/courses/:slug`, `POST /api/v1/courses/:slug/enroll`.
- **Reality:**
  - One real course is seeded in SQLite: `python-fundamentals` (8 modules, 9 chapters, 10 concepts, 19 criteria, 15 questions).
  - The other 5 courses displayed in `CatalogView.tsx` (`web-development-foundations`, `data-structures-problem-solving`, `generative-ai-developers`, `databases-sql`, `devops-cloud-essentials`) are client-side hardcoded objects that fail with 404 if fetched via the backend.
  - Enrollment endpoint creates `Enrollment`, initializes `ConceptMastery` for all concepts at $P(L_0) = 0.15$, and creates an initial `LearningSession`.

### C. Learning Studio & AI Tutor Subsystem
- **Routes:** `GET /api/v1/courses/:slug/session`, `POST /api/v1/sessions/:sessionId/messages` (SSE), `POST /api/v1/sessions/:sessionId/advance`.
- **Reality:**
  - `streamMessage` emits Server-Sent Events (`event: token`, `event: state_update`, `event: done`).
  - **Zero LLM Integration:** The tutor scans the student message for 11 hardcoded lowercase keywords (`pointer`, `reference`, `lazy`, `closure`, etc.). If found, it updates BKT, creates a `MasteryEvidence` record, and streams pre-written text chunks (`sessions.controller.ts:285-308`).
  - The metadata field writes `model: "claude-3-5-sonnet-pedagogical-v1"` despite Claude never being called.
  - Frontend `LearningStudio.tsx` renders a permanent, hardcoded fake chat message about functions (`greet("Dhanush")`) at the top of the chat area regardless of session history.

### D. Assessment Subsystem
- **Routes:** `GET /api/v1/assessments/chapters/:chapterId`, `POST /api/v1/assessments/chapters/:chapterId/submit`, `POST /api/v1/assessments/final/viva`.
- **Reality:**
  - `submitChapterAssessment` does not evaluate answers semantically or per-question. It loops through all criteria of all concepts in the chapter and checks if `studentAnswer.length > 20 && hasKeyword`.
  - `conductVivaTurn` does not persist anything to the database. It inspects `studentAnswer` for keywords (`trade-off`, `lock`, etc.), checks `turnNumber`, and returns a canned probe question.
  - In `ChapterAssessmentView.tsx`, the UI is completely hardcoded with TypeScript code for a Distributed Systems "QuorumCoordinator" rather than Python Fundamentals. It never calls the chapter assessment submit endpoint.
  - In `FinalAssessmentView.tsx`, 12 questions are hardcoded in the `.tsx` file. Clicking "Submit" does not hit the backend API at all.

### E. Mastery & Bayesian Knowledge Tracing (BKT) Engine
- **Module:** `backend/src/modules/mastery/bkt.ts`.
- **Reality:**
  - Standard BKT formulation is implemented mathematically:
    $$P(L | \text{Obs}=1) = \frac{P(L) \cdot (1 - pS)}{P(L) \cdot (1 - pS) + (1 - P(L)) \cdot pG}$$
    $$P(L_{t+1}) = P(L | \text{Obs}) + (1 - P(L | \text{Obs})) \cdot pT$$
  - Unit tests in `bkt.test.ts` pass (8 tests).
  - Gaps: Fixed parameters for all concepts ($pT=0.20, pG=0.10, pS=0.05$). No concept difficulty differentiation.
  - Vulnerability: Endpoints that trigger BKT updates (`/submit`, `/messages`) do not verify that the calling user owns the enrollment.

### F. Certification & Evidence System
- **Routes:** `POST /api/v1/certificates/issue`, `GET /api/v1/certificates/:credentialId/verify`.
- **Reality:**
  - `issueCertificate` computes mean chapter mastery from stored `ConceptMastery`.
  - **Fake Scores:** In `certificates.controller.ts:51-56`, practical score (0.92), viva score (0.88), consistency (0.86), and interaction depth (0.82) are **hardcoded numbers**. None are calculated from actual student work.
  - Cryptographic Signing: Uses symmetric HMAC-SHA256 with `config.jwtSecret`. Documentation claiming Ed25519 asymmetric signatures is untrue.
  - Verification: `verifyPublicCredential` does not verify the signature hash; it only checks if the database status is `VALID`.
  - Frontend Fallback: If `PublicVerifyView.tsx` receives a 404 for an invalid credential, it silently catches the error and displays a fake verified credential for "Sophia Chen" in "Distributed Systems".

---

## 4. Known Architectural Inconsistencies

1. **Database Mismatch:** `docs/DATABASE_DESIGN.md` mandates PostgreSQL 16+ and `pgvector`. Actual database is local SQLite `file:./dev.db`.
2. **AI Provider Missing:** `docs/AI_ARCHITECTURE.md` describes a 5-agent multi-role LLM routing pipeline. Actual code contains zero LLM API calls.
3. **Course Content Divergence:** The flagship course is Python Fundamentals. However, `DiagnosticView.tsx`, `ChapterAssessmentView.tsx`, `RemediationStudioView.tsx`, and `PublicVerifyView.tsx` contain hardcoded content for "Distributed Systems & Quorum Replication".
4. **Missing Sandbox:** Documentation specifies an isolated Docker code execution environment. In reality, no backend execution service exists.
5. **Admin Module Absence:** Roles include `ADMIN` and `INSTRUCTOR`, but zero admin routes, admin controllers, course management endpoints, or admin UI screens exist.
6. **Tailwind Loading:** Modern Vite builds require PostCSS/Tailwind build plugins. The app currently loads Tailwind via a CDN script in `index.html`.
