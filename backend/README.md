# CERTIFY — Backend Service

The core application service and domain engine for the **CERTIFY** engineering qualification and credentialing platform. Built as a modular monolith in **Node.js**, **Express**, **TypeScript**, and **Prisma ORM**.

---

## 🏛️ Domain Architecture & Modules

The backend isolates core domains into dedicated modules under `src/modules/`:

- **`auth/`**: User registration, login, JWT issuance, and bcrypt password hashing.
- **`courses/`**: Course catalog, versioning, syllabus hierarchy (modules, chapters, concepts).
- **`sessions/`**: Real-time conversational AI session orchestrator and Socratic prompt pipelines.
- **`mastery/`**: Bayesian Knowledge Tracing (BKT) engine and multi-signal competency aggregator.
- **`assessment/`**: Diagnostic pre-assessments, chapter evaluations, practical sandboxes, and oral Viva defense scoring.
- **`certificates/`**: Cryptographic credential generation, SHA-256 certificate hashing, and public verification ledger.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Installation & Database Initialization

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Push Prisma schema to the database (SQLite dev database by default)
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed the database with the flagship Python Fundamentals course and accounts
npm run db:seed
```

### Running the Server

```bash
# Start in development mode with hot-reloading (tsx watch)
npm run dev

# Or build and run production bundle
npm run build
npm start
```

The backend server listens on port **`5000`** by default (`http://localhost:5000`).

---

## 🔑 Default Accounts (Database Seed)

| Email | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `learner@certify.edu` | `Password123!` | `STUDENT` | Pre-enrolled learner with active BKT mastery data |
| `instructor@certify.edu` | `Password123!` | `INSTRUCTOR` | Course author & evaluation inspector |

---

## 📡 Core API Endpoints

- **Health Check**: `GET /api/v1/health`
- **Authentication**:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/register`
- **Courses**:
  - `GET /api/v1/courses`
  - `GET /api/v1/courses/:slug`
- **Sessions & AI**:
  - `POST /api/v1/sessions/start`
  - `POST /api/v1/sessions/:id/message`
- **Assessments & Viva**:
  - `GET /api/v1/assessment/:chapterId`
  - `POST /api/v1/assessment/submit`
  - `POST /api/v1/assessment/viva/respond`
- **Certificates & Verification**:
  - `GET /api/v1/certificates/user/:userId`
  - `GET /api/v1/certificates/verify/:hash`

---

## 🧪 Testing

Run the automated test suite with Vitest:

```bash
npm run test
```
