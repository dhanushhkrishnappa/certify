# STITCH SCREEN MAPPING (`STITCH_SCREEN_MAPPING.md`)

> **Comprehensive Screen-to-Component & API Integration Architecture**  
> *Mapping Approved Google Stitch Screens to React Routes, Modular Components, and Express Endpoints*

---

## 1. Master Screen-to-Route Mapping Table

The table below maps all approved screens authored in Stitch Project `5466241804294606748` directly to React application routes and component files:

| # | Approved Stitch Screen | Stitch ID | React Route / State | Target Component | Status & Changes Required | API / Data Dependencies |
|:---|:---|:---|:---|:---|:---|:---|
| **1** | `Certify Dashboard` | `7ae2a4db6ccf45d3839ec93b2bcb37ae` | `currentView === 'dashboard'` | `src/components/DashboardView.tsx` | Update tokens: `#F8F7F4` canvas, `#FFFFFF` cards, `#0F1117` ink, radial mastery dial | `api.getMe()`, `api.listCourses()`, `api.getSessionContext(slug)` |
| **2** | `Certify - Explore Courses Catalog` | `c9ffd6bb1b2a4dc9804789aa36f5fa37` | `currentView === 'catalog'` | `src/components/CatalogView.tsx` | Update tokens: white track cards, `#5B4DF0` buttons, lavender tier pills | `api.listCourses()` |
| **3** | `Certify Course Catalog` (Alternate) | `29bc8fb45c2b45299954f13a0b29b655` | `currentView === 'catalog'` | `src/components/CatalogView.tsx` | Variant visual reference for category filters & syllabus drawer | `api.listCourses()` |
| **4** | `Python Fundamentals - Course Overview` | `d94fe7900abc419aabdb50e359eeb3d7` | `currentView === 'course-detail'` | `src/components/CourseDetailView.tsx` | Update tokens: editorial serif title, module accordions, `#5B4DF0` enroll CTA | `api.getCourseBySlug(slug)`, `api.enrollCourse(slug)` |
| **5** | `Python Fundamentals - Course Overview` (Alt) | `aee2466c379d49a2bbd12631088ea0b9` | `currentView === 'course-detail'` | `src/components/CourseDetailView.tsx` | Visual reference for tier breakdown and prerequisite trees | `api.getCourseBySlug(slug)` |
| **6** | `Certify - My Learning Dashboard` | `86de1ece75644915ad1b92acf8dd65ad` | `currentView === 'mylearning'` | `src/components/MyLearningView.tsx` | Update tokens: active course card, segmented progress bar, concept meters | `api.getSessionContext(slug)` |
| **7** | `Python Fundamentals - AI Learning Studio` | `aca1fa697b5f42e1a90c2fec774bdd92` | `currentView === 'studio'` | `src/components/LearningStudio.tsx` | Update tokens: warm ivory 3-column studio, Socratic inquiry cards, code playground | `api.getSessionContext(slug)`, `api.streamMessage()`, `api.advanceChapter()` |
| **8** | `Certify Learning Studio` (Flagship) | `909e5489e8ae4823a72c28ec5cf301ae` | `currentView === 'studio'` | `src/components/LearningStudio.tsx` | Canonical visual reference for AI presence node and dialogue typography | `api.getSessionContext(slug)`, `api.streamMessage()` |
| **9** | `Certify - Final Assessment` | `82985d06b70744d39ca302a7926b3235` | `showAssessment === true` (or route `assessment`) | `src/components/assessment/FinalAssessmentView.tsx` | **Create dedicated view**: 5-card meta strip, integrated Python 3 IDE, test cases table, right HUD | `api.getChapterQuestions()`, `api.submitChapterAssessment()` |
| **10**| `Certify Chapter Assessment & Demo Mode` | `8275d10851394ea98387d9afcbd173db` | `showAssessmentModal === true` | `src/components/ChapterAssessmentModal.tsx` | Update tokens: rubric drawer, criteria statements, and demonstration test runner | `api.getChapterQuestions()`, `api.submitChapterAssessment()` |
| **11**| `Certify Diagnostic Pre-Assessment` | `fbd5e10d00714d43aee75b1bad177a2a` | `showDiagnostic === true` | `src/components/assessment/DiagnosticModal.tsx` | **Create component**: baseline knowledge probe to calibrate initial $P(L_0)$ | `api.getChapterQuestions()` |
| **12**| `Certify Remediation Deep-Dive Studio` | `9dbe6f95f15d4a1192cf830875be665a` | `currentView === 'remediation'` | `src/components/studio/RemediationStudio.tsx` | **Create component**: concept pivot mental models with instant practice sandbox | `api.getSessionContext(slug)` |
| **13**| `Certify Oral Viva Defense Chamber` | `c12056519a5e4613a992dd80f8b66e6d` | `showViva === true` | `src/components/VivaDefenseModal.tsx` | Update tokens: deep plum canvas, turn-taking dialogue rail, defended thesis ledger | `api.conductVivaTurn()`, `api.issueCertificate()` |
| **14**| `Certify - Certification Result` | `121bec711af441399ab1b5907bcbc70d` | `currentView === 'result'` | `src/components/CertificationResultView.tsx` | Update tokens: 87% circular radial meter, 5-stage evaluation pipeline, percentile chart | `api.issueCertificate()`, `api.verifyPublicCredential(id)` |
| **15**| `Certify - My Credentials` | `1ade17caf8164787a2e252d180f0438c` | `currentView === 'credentials'` | `src/components/MyCredentialsView.tsx` | Update tokens: credential cards, gold medal badges, 5-point evidence itemization | `api.getMe()`, list issued credentials |
| **16**| `Certify - Credential Details` | `a88dca1b7b8947cbb357a946d8e12d0a` | `currentView === 'credential-detail'` | `src/components/CredentialDetailModal.tsx` | **Create component**: double gold filigree frame, navy ribbon hanging seal, cursive recipient name | `api.verifyPublicCredential(id)` |
| **17**| `Certify Public Verification & Ledger` | `be1355baff4f478ba5951c01450cfd97` | `currentView === 'verify'` | `src/components/PublicVerifyView.tsx` | Update tokens: institutional trust seal, academic recipient name, evidence matrix | `api.verifyPublicCredential(id)` |
| **18**| `Certify Login / Signup Portal` | `cc50adadf7104d9cb7598cfb11090077` | `showAuthModal === true` | `src/components/auth/AuthModal.tsx` | **Create component**: restrained academic login with domain email verification | `api.login()`, `api.register()` |
| **19**| `Certify Editorial Landing Page` | `a75d49fa985e47d993059ca51a0384a3` | `currentView === 'landing'` | `src/components/LandingView.tsx` | Optional root marketing overview with live evidence calculator & verification snippet | `api.listCourses()` |

---

## 2. Component Inventory: Existing vs New/Updated

### A. Reusable Components to Update
1. **`src/components/common/AppSidebar.tsx`**:
   - Change width to `240px`.
   - Update background to `#F8F7F4` and border to `#E8E5DF`.
   - Replace glowing purple award with the isometric black cube SVG logo mark.
   - Update active pill background to `#EDE9E1` and text to `#0F1117 font-semibold`.
   - Add collapsed 68px mode support.
2. **`src/components/common/AppHeader.tsx`**:
   - Add centered Universal Search pill (`bg-white border border-[#E8E5DF] h-10 px-4 w-96 text-sm`).
   - Add academic motto (*“A certified you, a more capable tomorrow.”*).
   - Update breadcrumb styling to `text-sm text-[#8A909E]`.
3. **`src/components/mastery/MasteryDial.tsx`**:
   - Update progress stroke color to `#10B981` (Mastery) and `#5B4DF0` (In Progress) with light gray `#E5E7EB` track.
4. **`src/components/credentials/EvidenceGrid.tsx`**:
   - Style cards with `#FFFFFF` background, `#E8E5DF` hairline borders, and soft icon wells.
5. **`src/components/credentials/CryptoStamp.tsx`**:
   - Realign copy to truthful verification protocol: Unique Credential ID, database-backed credential verification, and recorded certification evidence (future cryptographic signing may be added separately).

### B. Specialized Components to Create
1. **`src/components/assessment/FinalAssessmentView.tsx`**:
   - 5-Card Assessment Meta Strip (*12 Questions*, *30 Minutes*, *Mixed Difficulty*, *Credential Integrity*, *Passing Criteria (authoritative threshold from certification engine)*).
   - Integrated Python 3 IDE Window with dark canvas (`#13151A`), line numbers, Run Code / Run Tests actions.
   - Interactive Test Cases table (Tabs: Test Cases, Custom Input).
   - Right Control HUD: Radial time remaining dial, 12-question interactive grid, question utility deck.
2. **`src/components/assessment/EvaluationPipeline.tsx`**:
   - 5-stage horizontal sequence (*Learning Progress → Chapter Assessments → Practical Project → Final Assessment → AI Viva / Defense*).
3. **`src/components/credentials/CertificateDocument.tsx`**:
   - Warm parchment backdrop (`#FDF9EC`).
   - Intricate double gold filigree frame (`#b89758`).
   - Hanging navy ribbon seal with gold brand insignia.
   - Script recipient typography, embossed metallic medallion, and official signature block.

---

## 3. Product Constraints & Anti-Pattern Compliance

Every screen and component in this mapping strictly satisfies CERTIFY's non-negotiable principles:

- **No Generic LMS Features**: No recruiter marketplaces, no candidate leaderboards, no gamified badges.
- **Pedagogical Progression**: Curated Track $\to$ Baseline Diagnostic $\to$ AI Learning Studio $\to$ Practice $\to$ Chapter Assessment $\to$ Remediation $\to$ Final Assessment $\to$ Practical Demo $\to$ AI Viva $\to$ Deterministic Result $\to$ Verifiable Credential.
- **Truthful Implementations**:
  - Removed "Proctored" $\to$ Replaced with **"Credential Integrity"** and **"Passing Criteria"** (with thresholds determined authoritatively by the backend deterministic certification engine rather than hardcoded product rules).
  - Credential Integrity: Formatted strictly as **Unique Credential ID**, **database-backed credential verification**, and **recorded certification evidence** (no unbacked claims of Ed25519 or cryptographic hash signing; future cryptographic signing may be added separately).
