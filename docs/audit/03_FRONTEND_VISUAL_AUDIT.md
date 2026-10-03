# CERTIFY — Frontend Visual & Stitch Design Fidelity Audit

**Audit Date:** October 3, 2026  
**Commit:** `5961664`  
**Canonical Design Specification:** `.stitch/DESIGN.md` / `DESIGN.md` (Alabaster / Editorial Ivory Theme)  

---

## 1. Master Design System Alignment Review

The CERTIFY design system is formally documented in `DESIGN.md` and `.stitch/DESIGN.md`, prescribing a **Calm Warm Editorial Tone** (`#F8F7F4` canvas, `#FFFFFF` cards, `#0F1117` charcoal ink, `#5B4DF0` Royal Purple accent, Newsreader serif headings, and Plus Jakarta Sans body).

However, an audit of the actual frontend implementation reveals **two conflicting design paradigms** coexisting in the same application:
1. **The Approved Stitch Editorial Ivory Theme:** Implemented across Dashboard, Catalog, Course Details, My Learning, Certification Result, Credentials List, and Credential Details.
2. **The Legacy Obsidian Dark Tech Theme:** Active in Landing Page, Diagnostic View, Chapter Assessment View, Remediation Studio, Viva Chamber, and Public Verification View (`#0C0D11` canvas, `#13151A` cards, Google Material Symbols instead of Lucide icons, neon lime `#cef056` accents, and Distributed Systems typography).

---

## 2. Screen-by-Screen Discrepancy Register

### Screen 1: Dashboard (`DashboardView.tsx`)
- **Stitch ID:** `7ae2a4db6ccf45d3839ec93b2bcb37ae`
- **Discrepancy 1: Hardcoded Demo Telemetry Wells**
  - **Element:** Lines 228, 250, 269, 356, 632, 660 (`data-metric-type="demo-telemetry"`).
  - **Expected:** Recent Activity feed and Learning Streak populated from user's actual database session events.
  - **Actual:** Hardcoded static items ("List Manipulation 5 hours ago", "File Handling 1 day ago", "Streak: 12 days", "Application 62%", "Consistency 85%").
  - **Severity:** P2 (Important).
  - **Recommended Fix:** Connect Activity and Streak widgets to `GET /api/v1/users/me/activity` or derive from `ChatMessage` and `AssessmentAttempt` timestamps.
- **Discrepancy 2: Duplicate Heading Elements**
  - **Element:** Header greeting vs AppHeader greeting.
  - **Expected:** Single authoritative greeting in `AppHeader`.
  - **Actual:** `AppHeader` renders "Good evening, Dhanush!" while Dashboard hero renders "Build real skills, Dhanush". Visual redundancy.
  - **Severity:** P3 (Polish).
  - **Recommended Fix:** Pass `hideGreeting={true}` to `AppHeader` when on Dashboard view, or integrate greeting solely into AppHeader.

### Screen 2: Explore Courses (`CatalogView.tsx`)
- **Stitch ID:** `c9ffd6bb1b2a4dc9804789aa36f5fa37`
- **Discrepancy 1: 5 of 6 Courses are Phantom Cards**
  - **Element:** `CURATED_CATALOG` array (lines 25-101).
  - **Expected:** Catalog renders courses dynamically fetched from `api.listCourses()`.
  - **Actual:** 5 hardcoded course stubs (`web-development-foundations`, `data-structures-problem-solving`, `generative-ai-developers`, `databases-sql`, `devops-cloud-essentials`). Clicking "View Details" on any of these courses results in empty or failed views because the backend only has Python Fundamentals.
  - **Severity:** P1 (Critical).
  - **Recommended Fix:** Mark unreleased courses with an explicit "Coming Soon" badge, or only render courses returned by `api.listCourses()`.

### Screen 3: Course Details (`CourseDetailsView.tsx`)
- **Stitch ID:** `d94fe7900abc419aabdb50e359eeb3d7`
- **Discrepancy 1: Bypass of Explicit Enrollment Endpoint**
  - **Element:** "Enroll Now" / "Continue Learning" button (line 601).
  - **Expected:** Clicking "Enroll Now" calls `api.enrollCourse(slug)` to register enrollment in database, then enters the studio.
  - **Actual:** Directly calls `onStartCourse(slug)` which navigates to `/studio`. The studio auto-enrolls the user on the fly.
  - **Severity:** P2 (Important).
  - **Recommended Fix:** Wire `Enroll Now` to `api.enrollCourse(slug)` with loading state before navigation.

### Screen 4: AI Learning Studio (`LearningStudio.tsx`)
- **Stitch IDs:** `aca1fa697b5f42e1a90c2fec774bdd92` (Light) / `909e5489e8ae4823a72c28ec5cf301ae` (Dark)
- **Discrepancy 1: Permanent Hardcoded Fake Message Exchange**
  - **Element:** Lines 597-679.
  - **Expected:** Chat dialogue strictly displays authentic messages from `sessionContext.session.messages`.
  - **Actual:** An immutable fake conversation ("Can you explain what a function is in Python...") is permanently rendered above dynamic messages.
  - **Severity:** P1 (Critical).
  - **Recommended Fix:** Remove the hardcoded conversation block; render only real `sessionContext.session.messages`.
- **Discrepancy 2: Hardcoded Systems BKT Concepts**
  - **Element:** Lines 532-536 (`Task Heap Queues 0.94 P(L)`, `Epoll Multiplexing 0.91 P(L)`, `Event Loop Scheduling 0.76 P(L)`).
  - **Expected:** Concepts correspond to Python Fundamentals (Variables, Mutability, Closures, Generators).
  - **Actual:** Hardcoded telemetry for an operating systems course.
  - **Severity:** P1 (Critical).
  - **Recommended Fix:** Map over `sessionContext.conceptMasteries` to render real Python concept masteries.
- **Discrepancy 3: Fake Tabs**
  - **Element:** Tabs "Content", "Practice", "Notes", "Resources", "Discussion" (lines 360-403).
  - **Expected:** Clicking tabs switches between different tool panels.
  - **Actual:** Clicking sets `activeTab` state, but the UI ignores it and renders the exact same three columns. Dead controls.
  - **Severity:** P2 (Important).
  - **Recommended Fix:** Implement tab panels or remove non-functional tabs to avoid confusing the user.

### Screen 5: Chapter Assessment (`ChapterAssessmentView.tsx`)
- **Stitch ID:** `8275d10851394ea98387d9afcbd173db`
- **Discrepancy 1: Complete Content Mismatch (Distributed Systems vs Python Fundamentals)**
  - **Element:** Entire component (lines 21-47, 88-95, 144-169).
  - **Expected:** Chapter assessment presents questions and code challenges for the active Python chapter (e.g. Chapter 1: Variables, Mutability, Object References).
  - **Actual:** Displays TypeScript code for `QuorumCoordinator<T>`, `replicaNode`, `pigeonhole theorem`, and `Distributed Systems Architecture`.
  - **Severity:** P0 (Blocker).
  - **Recommended Fix:** Replace hardcoded Quorum code with dynamic chapter questions loaded via `api.getChapterQuestions(chapterId)` and submit answers via `api.submitChapterAssessment`.
- **Discrepancy 2: Unwired Submission**
  - **Element:** Line 230 ("Submit Proof for Evaluation").
  - **Expected:** Submits answers to backend API.
  - **Actual:** Simply triggers `onPassed()` or `onComplete()`, navigating forward without persisting.
  - **Severity:** P0 (Blocker).
  - **Recommended Fix:** Connect to `api.submitChapterAssessment`.

### Screen 6: Diagnostic Pre-Assessment (`DiagnosticView.tsx`)
- **Stitch ID:** `fbd5e10d00714d43aee75b1bad177a2a`
- **Discrepancy 1: Mismatched Theme & Hardcoded Probes**
  - **Element:** Deep dark theme (`#0C0D11`) and hardcoded Raft consensus probe.
  - **Expected:** Consistent Editorial Ivory theme aligned with Stitch screen `fbd5e10d00714d43aee75b1bad177a2a`, testing Python foundational knowledge.
  - **Actual:** Hardcoded Distributed Systems probes; "Alex Rivera" avatar; no API integration.
  - **Severity:** P1 (Critical).
  - **Recommended Fix:** Convert to Editorial theme tokens, fetch diagnostic questions from backend, and persist priors to DB.

### Screen 7: Remediation Studio (`RemediationStudioView.tsx`)
- **Stitch ID:** `9dbe6f95f15d4a1192cf830875be665a`
- **Discrepancy 1: Hardcoded Concept Pivot for Vector Clocks**
  - **Element:** Lines 42-53, 101-105.
  - **Expected:** Remediation studio addresses the specific Python concept that the learner failed in the chapter assessment (e.g., Variable Reassignment vs In-Place Mutation).
  - **Actual:** Hardcoded to "Scalar vs Vector Causality Confusion" (Distributed Systems).
  - **Severity:** P1 (Critical).
  - **Recommended Fix:** Accept `conceptId` prop, fetch concept remediation content from backend, and record remediation cycle completion.

### Screen 8: Final Assessment (`FinalAssessmentView.tsx`)
- **Stitch ID:** `82985d06b70744d39ca302a7926b3235`
- **Discrepancy 1: Hardcoded Initial State & Unconditional Pass**
  - **Element:** Lines 78-83, 188, 248.
  - **Expected:** Questions retrieved from backend; timer configured per exam policy; test cases executed in real sandbox; submission recorded in DB.
  - **Actual:** Timer hardcoded to 24:37; questions hardcoded in TSX; clicking "Run Tests" marks all tests "passed" unconditionally; "Submit" does not hit any backend API.
  - **Severity:** P0 (Blocker).
  - **Recommended Fix:** Integrate with backend assessment attempt API, real test execution, and database answer persistence.

### Screen 9: Oral Viva Defense (`VivaChamberView.tsx`)
- **Stitch ID:** `c12056519a5e4613a992dd80f8b66e6d`
- **Discrepancy 1: Simulated Timer and Delay**
  - **Element:** Lines 22-36 (`setTimeout(700ms)`).
  - **Expected:** Conversational multi-turn defense calling backend `conductVivaTurn`, updating viva evaluation score.
  - **Actual:** Pure client-side `setTimeout` loop that increments `currentTurn` and navigates to `/result` after turn 5.
  - **Severity:** P0 (Blocker).
  - **Recommended Fix:** Wire candidate answers to backend `api.conductVivaTurn`, persist defense transcript, and record actual viva score.

### Screen 10: Certification Result (`CertificationResultView.tsx`)
- **Stitch ID:** `121bec711af441399ab1b5907bcbc70d`
- **Discrepancy 1: Hardcoded Credential ID and Scores**
  - **Element:** Lines 16, 208, 228-250 (`CERT-PY-2026-001842`, `87% Overall`, `92% Conceptual`, `84% Practical`, `81% Reasoning`).
  - **Expected:** Fetches actual issued certificate and composite score breakdown from `api.issueCertificate` or enrollment certificate record.
  - **Actual:** Completely hardcoded static values.
  - **Severity:** P0 (Blocker).
  - **Recommended Fix:** Call `api.issueCertificate(enrollmentId)` upon landing on this screen, and render returned `compositeScore`, `tier`, `credentialId`, and `evidenceSummary`.

### Screen 11: Credential Details (`CredentialDetailsView.tsx`)
- **Stitch ID:** `a88dca1b7b8947cbb357a946d8e12d0a`
- **Discrepancy 1: Unwired Certificate Document**
  - **Element:** Lines 13, 20-22 (`CERT-PY-2026-001842`, `23 September 2026`, `Dhanush K`).
  - **Expected:** Certificate rendered from database record including issued timestamp, recipient name from user model, and verification hash.
  - **Actual:** Hardcoded static text. Does not fetch certificate data from backend.
  - **Severity:** P1 (Critical).
  - **Recommended Fix:** Fetch certificate by `credentialId` using `api.verifyPublicCredential` or user enrollments and render authentic dynamic values.

### Screen 12: Public Verification (`PublicVerifyView.tsx`)
- **Stitch ID:** `be1355baff4f478ba5951c01450cfd97`
- **Discrepancy 1: Fraudulent Fallback on Invalid Credentials**
  - **Element:** Lines 28-54 and 69-93.
  - **Expected:** If a credential is not found, render an explicit "Invalid / Revoked / Unrecognized Credential" error notice.
  - **Actual:** Catches error and sets `verification` to a fake verified record for "Sophia Chen" in "Distributed Systems". Any random string validates as true.
  - **Severity:** P0 (Blocker / Security).
  - **Recommended Fix:** Remove fake fallback object. Display a clear, prominent rejection state when `isValid === false` or API returns 404.

---

## 3. Visual Defect Summary Table

| Category | Finding Count | Worst Severity | Primary Locations |
| :--- | :--- | :--- | :--- |
| **Theme Inconsistency** | 6 views | P1 | Diagnostic, Chapter Assessment, Remediation, Viva, Public Verify, Landing (Dark vs Ivory) |
| **Hardcoded / Fake UI** | 12 instances | P0 | Final Assessment (12 Qs), Viva (setTimeout), Results (87%), Credentials (Static List) |
| **Content Mismatch** | 4 views | P0 | ChapterAssessmentView, RemediationStudioView, DiagnosticView (Distributed Systems vs Python) |
| **Dead Controls** | 3 panels | P2 | LearningStudio (Content, Practice, Notes tabs), Settings (Save button doesn't persist) |
| **Tailwind via CDN** | Global | P1 | `index.html:14` (Production performance hazard) |
