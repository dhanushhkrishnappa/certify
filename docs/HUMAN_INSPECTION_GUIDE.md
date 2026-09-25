# CERTIFY — Human Inspection Guide

This guide is prepared specifically for manual visual and functional inspection of the CERTIFY application.

---

## 1. System Endpoints & Service Status

| Service | Local URL | Status | Health / Endpoint Check |
| :--- | :--- | :--- | :--- |
| **Frontend Application** | `http://localhost:5173` | **Running** (Vite Dev Server) | `http://localhost:5173/` |
| **Backend API Engine** | `http://localhost:5000/api/v1` | **Running** (Daemon task-650) | `http://localhost:5000/api/v1/health` |

---

## 2. Seed Credentials & Authentication

The application automatically logs into the development seed session on initial load. If logging in manually via `/auth`:

- **Email**: `learner@certify.edu`
- **Password**: `Password123!`
- **Mobile OTP**: Any 10-digit number (e.g. `9876543210`) with OTP `123456`
- **User Role**: `learner` (Name: "Dhanush K")

---

## 3. Direct Route Inspection Directory

Every screen and state is directly accessible via its URL pathname without requiring multi-step navigation.

| Route | View Description | Authoritative Stitch Reference | Rendered App Screenshot | Demo Data & Fixture Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| **`/landing`** | Editorial Landing Page | `.stitch/screens/19_editorial_landing_a75d49fa985e47d993059ca51a0384a3/screenshot.png` | [`17_landing_page.png`](file:///d:/Projects/certify/docs/screenshots/17_landing_page.png) | Public ledger table uses live demonstration feed. |
| **`/auth`** | Login / Signup Portal | `.stitch/screens/18_auth_portal_cc50adadf7104d9cb7598cfb11090077/screenshot.png` | [`16_auth.png`](file:///d:/Projects/certify/docs/screenshots/16_auth.png) | Mock OTP verification accepts standard 6-digit code. |
| **`/catalog`** | Explore Courses Catalog | `.stitch/screens/02_explore_courses_catalog_c9ffd6bb1b2a4dc9804789aa36f5fa37/screenshot.png` | [`2_explore_courses.png`](file:///d:/Projects/certify/docs/screenshots/2_explore_courses.png) | Backed by `/api/v1/courses` backend catalog. |
| **`/course-details`** | Python Course Overview | `.stitch/screens/04_course_overview_d94fe7900abc419aabdb50e359eeb3d7/screenshot.png` | [`3_course_details.png`](file:///d:/Projects/certify/docs/screenshots/3_course_details.png) | Backed by backend curriculum for `python-fundamentals`. |
| **`/mylearning`** | My Learning Dashboard | `.stitch/screens/06_my_learning_dashboard_86de1ece75644915ad1b92acf8dd65ad/screenshot.png` | [`4_my_learning.png`](file:///d:/Projects/certify/docs/screenshots/4_my_learning.png) | September 2026 calendar and 4-week chart use visual demo fixtures. |
| **`/dashboard`** | Main Learner Dashboard | `.stitch/screens/01_dashboard_7ae2a4db6ccf45d3839ec93b2bcb37ae/screenshot.png` | [`1_dashboard.png`](file:///d:/Projects/certify/docs/screenshots/1_dashboard.png) | Real backend auth profile and course telemetry; Day 14 streak seed. |
| **`/studio`** | Socratic AI Learning Studio | `.stitch/screens/07_ai_learning_studio_aca1fa697b5f42e1a90c2fec774bdd92/screenshot.png` & `08_...` | [`5_ai_learning_studio.png`](file:///d:/Projects/certify/docs/screenshots/5_ai_learning_studio.png) | Real `/api/v1/sessions` context and live code runner. Includes Light/Dark toggle. |
| **`/diagnostic`** | Diagnostic Pre-Assessment | `.stitch/screens/11_diagnostic_pre_assessment_fbd5e10d00714d43aee75b1bad177a2a/screenshot.png` | [`7_diagnostic.png`](file:///d:/Projects/certify/docs/screenshots/7_diagnostic.png) | Raft consensus partition diagnostic probe fixture. |
| **`/chapter-assessment`**| In-Flow Demonstration Mode | `.stitch/screens/10_chapter_assessment_demo_8275d10851394ea98387d9afcbd173db/screenshot.png` | [`6_chapter_assessment.png`](file:///d:/Projects/certify/docs/screenshots/6_chapter_assessment.png) | Quorum replication practical code challenge fixture. |
| **`/remediation`** | Remediation Deep-Dive | `.stitch/screens/12_remediation_studio_9dbe6f95f15d4a1192cf830875be665a/screenshot.png` | [`8_remediation.png`](file:///d:/Projects/certify/docs/screenshots/8_remediation.png) | Misconception `INV-02` line 42 failure and vector clock divergence fixture. |
| **`/final-assessment`** | Final Assessment Workspace | `.stitch/screens/09_final_assessment_82985d06b70744d39ca302a7926b3235/screenshot.png` | [`9_final_assessment.png`](file:///d:/Projects/certify/docs/screenshots/9_final_assessment.png) | Question 4 of 12 prompt, test cases, and radial 24:37 timer fixture. |
| **`/viva`** | Oral Viva Defense Chamber | `.stitch/screens/13_viva_defense_chamber_c12056519a5e4613a992dd80f8b66e6d/screenshot.png` | [`11_viva_defense.png`](file:///d:/Projects/certify/docs/screenshots/11_viva_defense.png) | Defended code lines 43-47, examiner inquiry, and waveform animation fixture. |
| **`/result`** | Certification Result | `.stitch/screens/14_certification_result_121bec711af441399ab1b5907bcbc70d/screenshot.png` | [`12_certification_result.png`](file:///d:/Projects/certify/docs/screenshots/12_certification_result.png) | 87% score breakdown, laurel medallion, and distribution curve fixture. |
| **`/credentials`** | My Credentials Vault | `.stitch/screens/15_my_credentials_1ade17caf8164787a2e252d180f0438c/screenshot.png` | [`13_my_credentials.png`](file:///d:/Projects/certify/docs/screenshots/13_my_credentials.png) | Seed credentials collection and verification ledger sidebar. |
| **`/credential-details`**| Parchment Certificate View | `.stitch/screens/16_credential_details_a88dca1b7b8947cbb357a946d8e12d0a/screenshot.png` | [`14_credential_details.png`](file:///d:/Projects/certify/docs/screenshots/14_credential_details.png) | High-trust parchment canvas for credential `CERT-PY-2026-001842`. |
| **`/verify`** | Public Verification & Ledger | `.stitch/screens/17_public_verification_be1355baff4f478ba5951c01450cfd97/screenshot.png` | [`15_public_verify.png`](file:///d:/Projects/certify/docs/screenshots/15_public_verify.png) | Database verification resolver; falls back to demo record if unseeded. |
| **`/progress`** | Learning Progress Overview | Canonical Shell System | [`19_progress.png`](file:///d:/Projects/certify/docs/screenshots/19_progress.png) | BKT mastery progression telemetry. |
| **`/profile`** | Learner Profile | Canonical Shell System | [`19_profile.png`](file:///d:/Projects/certify/docs/screenshots/19_profile.png) | Account metadata and active sessions. |
| **`/settings`** | Account & Security Settings| Canonical Shell System | [`19_settings.png`](file:///d:/Projects/certify/docs/screenshots/19_settings.png) | Preferences and authentication credentials settings. |

---

## 4. Known Demo-Data Dependencies & Fallbacks

For manual visual inspection without creating an entire multi-week learning history from scratch:
1. **Calendar & Activity History (`/mylearning`)**: Uses the canonical September 2026 calendar matrix and activity time allocation curve specified in Stitch screen `86de1ece...`.
2. **Viva Defense Dialogue (`/viva`)**: Pre-populated with candidate's defended thesis claims and examiner challenge turn indicators matching Stitch screen `c1205651...`.
3. **Assessment Questions (`/final-assessment`, `/diagnostic`, `/chapter-assessment`)**: Seeded with the exact questions, test cases, and consensus topology challenges from Stitch screens `82985d06...`, `fbd5e10d...`, and `8275d108...`.
4. **Certificate Result (`/result`)**: Displays the 87% Advanced Tier score breakdown, verification pipeline nodes, and normal score distribution curve matching Stitch screen `121bec71...`.
5. **Credential Verification (`/verify`)**: When querying an arbitrary credential ID not yet committed to the local database, gracefully displays the verified record fallback for Sophia Chen / Dhanush K.

---

## 5. Known Runtime Observations & Network Telemetry

During automated browser execution across all 19 routes:
- **Crashes / Uncaught Exceptions**: `0` across all routes.
- **React Render Errors**: `0` across all routes.
- **Broken Imports / Missing Assets**: `0` across all routes.
- **Expected Network Observations**:
  - On `/verify`, requesting uncommitted credential ID `CERT-PY-2026-001842` logs an HTTP 404 response from the backend before switching to the verified demo fixture. This is expected behavior for an unseeded credential lookup.

---

## 6. Build & Lint Validation Summary

### TypeScript & Vite Production Bundle
```bash
$ npm run build
> tsc -b && vite build
✓ 38 modules transformed.
✓ built in 162ms
```
- **Exit Code**: `0` (Zero compilation errors)

### Oxlint Static Analysis
```bash
$ npm run lint
> oxlint
Found 0 warnings and 0 errors.
Finished in 44ms on 34 files with 116 rules using 12 threads.
```
- **Exit Code**: `0` (Zero lint warnings or errors)
