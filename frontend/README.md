# CERTIFY — Frontend Web Application

The interactive client interface for the **CERTIFY** engineering qualification and credentialing platform. Built with **React 19**, **TypeScript**, **Vite**, and hardware-accelerated **WebGL/OGL** shaders.

---

## 🎨 Architectural & Design Highlights

1. **State-of-the-Art Visual Aesthetics**:
   - **Custom WebGL Silk Shader**: Dynamic GPU-accelerated background rendering via [OGL](https://github.com/oframe/ogl) (`src/components/landing/Silk.tsx`).
   - **Reactive Dither Canvas**: Real-time particle dithering backdrop on authentication and gateway modals (`src/components/landing/ReactiveDitherCanvas.tsx`).
   - **Lenis Smooth Inertia Scrolling**: 60fps editorial scrolling transitions (`src/motion/useLenis.ts`).
   - **Tactile Micro-Interactions**: Spring physics and page transitions powered by [Motion (Framer Motion)](https://motion.dev/).

2. **Editorial Typographic System**:
   - **Newsreader / Merriweather**: Editorial display serif for page headers, academic titles, and certificate embellishments.
   - **Plus Jakarta Sans / Inter**: Clean grotesque sans for interactive elements and body prose.
   - **JetBrains Mono**: Monospace font for code execution environments, verification hashes, and telemetry data.

3. **Complete View Stack & Routing**:
   - **Editorial Landing** (`LandingPageView.tsx`): Hero, manifesto, curriculum carousel, interactive showcases, testimonials, and FAQ.
   - **Authentication Portal** (`AuthView.tsx`): Glassmorphic login/signup card with live dithering animation.
   - **Learner Dashboard** (`DashboardView.tsx`): Active course progression, BKT mastery metrics, and quick actions.
   - **Course Catalog & Details** (`CatalogView.tsx`, `CourseDetailsView.tsx`): Syllabus inspection, module objectives, and track enrollments.
   - **My Learning Hub** (`MyLearningView.tsx`): Multi-course progress tracker and chapter jump points.
   - **AI Learning Studio** (`LearningStudio.tsx`): Flagship dual-pane workspace with Socratic AI mentor chat and in-browser code editor.
   - **Diagnostic Pre-Assessment** (`DiagnosticView.tsx`): Adaptive baseline knowledge calibrator.
   - **Chapter Assessment & Remediation** (`ChapterAssessmentView.tsx`, `RemediationStudioView.tsx`): Multi-format evaluations and concept repair studios.
   - **Oral Viva Defense Chamber** (`VivaChamberView.tsx`): Conversational examination defending architectural decisions.
   - **Certification Results & Credentials** (`CertificationResultView.tsx`, `CredentialsListView.tsx`, `CredentialDetailsView.tsx`): Gold filigree verifiable certificates with SHA-256 validation proof.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Installation & Development

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite local development server
npm run dev
```

The application will be accessible at: **`http://localhost:5173`**

---

## 📜 Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Starts Vite HMR dev server at `http://localhost:5173` |
| **Production Build** | `npm run build` | Compiles TypeScript and builds optimized production assets to `dist/` |
| **Linting** | `npm run lint` | Runs ultra-fast [Oxlint](https://oxc.rs/) static analysis |
| **Preview** | `npm run preview` | Previews the production bundle locally |
| **Visual QA Suite** | `node qa-all-screens.mjs` | Automated Puppeteer headless visual QA across all view states |
| **Capture Screenshots** | `node capture-all-screens.mjs` | Captures high-res screenshots of every application screen |
| **Interaction QA** | `node qa-interactions.mjs` | Tests user clicks, navigation, modals, and input states |

---

## 📁 Source Directory Structure

```
frontend/
├── public/                 # Static assets, branding logo, favicons
├── src/
│   ├── assets/             # Brand logos and iconography
│   ├── components/         # Core UI view components
│   │   ├── ai/             # Socratic chat mentor components
│   │   ├── credentials/    # Certificate renderer, badges, and seals
│   │   ├── landing/        # Editorial landing sections, shaders & carousel
│   │   ├── mastery/        # Bayesian Knowledge Tracing telemetry cards
│   │   ├── motion/         # Motion container wrappers
│   │   └── ...             # Standalone page views (Dashboard, Studio, Viva)
│   ├── motion/             # Lenis scroll controller and motion hooks
│   ├── services/           # Type-safe REST client for backend API
│   ├── types/              # Domain TypeScript interfaces (Courses, Sessions, Users)
│   ├── App.tsx             # Root application controller & navigation shell
│   ├── index.css           # Canonical design system tokens & typography rules
│   └── main.tsx            # React application entry point
├── package.json
└── vite.config.ts
```
