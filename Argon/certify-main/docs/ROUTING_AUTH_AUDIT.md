# CERTIFY — ROUTING & AUTHENTICATION AUDIT
**Execution Date**: September 25, 2026  
**Auditor**: Antigravity Quality Assurance & System Architecture  
**Source of Truth**: `.stitch/DESIGN.md` & Google Stitch Canonical Reference Screens  
**Scope**: 20 System Screens across Full Learner Lifecycle

---

## 1. Executive Summary & Auth Architecture

The Certify platform enforces a strict client-side authentication barrier in `App.tsx` coupled with backend JWT / Session token verification against SQLite (`dev.db`).

### Entry Point & Protection Rules
- **Rule 11 Enforced**: Root URL (`/`) for an unauthenticated visitor strictly opens `AuthView` (Login / Sign Up). Direct visits to `/dashboard` or any protected path without a valid `certify_token` are intercepted and redirected to `/auth`.
- **Rule 12 Enforced**: The Dashboard (`/dashboard`) is the authenticated learner home screen and cannot be accessed publicly.
- **Public Routes Allowlist**: `["auth", "landing", "verify"]`.
- **Protected Routes**: All 17 other views require an active session. Unauthenticated attempts immediately render `AuthView`.
- **Session Termination (Logout)**: Purges `certify_token` and `certify_user` from `localStorage`, resets React state `currentUser` to `null`, and navigates directly to `AuthView`. No cached learner evidence or protected UI states remain visible.

---

## 2. Comprehensive 20-Screen Routing & State Matrix

| # | Screen / View Name | Route Path / State Key | Public / Protected | Auth Requirement | Canonical Entry Point | Previous Screen | Next Screen(s) | Navigation Mechanism | Reachability Status |
|---|---|---|---|---|---|---|---|---|---|
| **01** | **Authentication** | `/auth` (`auth`) | **Public** | None (Unauthenticated) | Root URL `/` on cold start; `/auth`; Logout | Landing, Logout | Dashboard (post-auth), Diagnostic (new registration) | Phone/Email input + OTP verification (`auth.login`) | **REACHABLE & VERIFIED** |
| **02** | **Landing Page** | `/landing` (`landing`) | **Public** | None | Direct URL `/landing`; Top nav "Home" | Direct visit | Login (`/auth`), Catalog (`/catalog` via Auth) | CTA buttons ("Start Learning", "Sign In") | **REACHABLE & VERIFIED** |
| **03** | **Learner Dashboard** | `/` or `/dashboard` (`dashboard`) | **Protected** | Valid JWT Session | Post-login redirect; Sidebar "Dashboard" | Auth, Any protected view | Catalog, My Learning, Studio, Course Details | Sidebar navigation, "Continue Learning" cards | **REACHABLE & VERIFIED** |
| **04** | **Course Catalog** | `/catalog` (`catalog`) | **Protected** | Valid JWT Session | Sidebar "Explore Courses"; Header Search | Dashboard | Course Details (`/course-details`) | "View Details", "Enroll" course card actions | **REACHABLE & VERIFIED** |
| **05** | **Course Details** | `/course-details` (`course-details`) | **Protected** | Valid JWT Session | Course Card click; Catalog click | Catalog, Dashboard | Diagnostic (`/diagnostic`), Studio (`/studio`) | "Take Diagnostic Pre-Assessment", "Begin Curriculum" | **REACHABLE & VERIFIED** |
| **06** | **My Learning** | `/mylearning` (`mylearning`) | **Protected** | Valid JWT Session | Sidebar "My Learning"; Top Nav tab | Dashboard | Learning Studio (`/studio`), Course Details | "Resume Chapter", "Review Syllabus" | **REACHABLE & VERIFIED** |
| **07** | **Diagnostic Assessment** | `/diagnostic` (`diagnostic`) | **Protected** | Valid JWT Session | Course Details "Take Diagnostic" CTA | Course Details | Learning Studio (`/studio`), Course Details (Cancel) | 4-Probe sequential radio selection + Submit action | **REACHABLE & VERIFIED** |
| **08** | **AI Learning Studio** | `/studio` (`studio`) | **Protected** | Valid JWT Session | "Continue" on Dashboard; Diagnostic complete | Diagnostic, My Learning | Chapter Assessment (`/chapter-assessment`), Code Playground | Dynamic Socratic chat input, Chapter selector tabs | **REACHABLE & VERIFIED** |
| **09** | **Chapter Assessment** | `/chapter-assessment` (`chapter-assessment`) | **Protected** | Valid JWT Session | Studio "Verify Mastery" button | Learning Studio | Remediation (`/remediation`), Studio (`/studio`) | Invariant code check + radio options + submit | **REACHABLE & VERIFIED** |
| **10** | **Remediation Studio** | `/remediation` (`remediation`) | **Protected** | Valid JWT Session | Chapter Assessment failure (<80%) | Chapter Assessment | Learning Studio (`/studio`), Chapter Retry | 3-step misconception walk + interactive probe check | **REACHABLE & VERIFIED** |
| **11** | **Final Assessment** | `/final-assessment` (`final-assessment`) | **Protected** | Valid JWT Session | Sidebar "Assessments"; Course syllabus completion | Learning Studio | Practical Sandbox (`/practical`), Dashboard | 4-question navigator + answer persistence + submit | **REACHABLE & VERIFIED** |
| **12** | **Practical Assessment** | `/practical` (`practical`) | **Protected** | Valid JWT Session | Final Assessment submission | Final Assessment | Oral Viva Chamber (`/viva`), Remediation | Sandbox code verification + test suite runner | **REACHABLE & VERIFIED** |
| **13** | **Oral Viva Chamber** | `/viva` (`viva`) | **Protected** | Valid JWT Session | Practical milestone completion | Practical Assessment | Certification Result (`/result`), Dashboard | Multi-turn Socratic defense audio/text exchange | **REACHABLE & VERIFIED** |
| **14** | **Certification Result** | `/result` (`result`) | **Protected** | Valid JWT Session | Successful Viva defense completion | Oral Viva Chamber | Credential Details (`/credential-details`), Dashboard | "View Official Credential", "Return to Dashboard" | **REACHABLE & VERIFIED** |
| **15** | **Credentials Registry** | `/credentials` (`credentials`) | **Protected** | Valid JWT Session | Sidebar "Credentials"; Result page | Dashboard, Result | Credential Details (`/credential-details`), Public Verify | "View Certificate", "Verify On-Chain/Database" | **REACHABLE & VERIFIED** |
| **16** | **Credential Details** | `/credential-details` (`credential-details`) | **Protected** | Valid JWT Session | Credential card click from `/credentials` | Credentials Registry | Public Verification (`/verify`), Credentials | "Public Verification Ledger", "Back to Credentials" | **REACHABLE & VERIFIED** |
| **17** | **Public Verification** | `/verify` (`verify`) | **Public** | None (Public Ledger) | Public link `/verify?id=...`; Credential details | Any view / External | Credentials (if logged in) | Search input + SHA-256 Ledger query | **REACHABLE & VERIFIED** |
| **18** | **Progress Tracing** | `/progress` (`progress`) | **Protected** | Valid JWT Session | Sidebar "Progress" | Dashboard | Learning Studio (`/studio`) | BKT Mastery charts, Concept radar, "Resume" CTA | **REACHABLE & VERIFIED** |
| **19** | **Learner Profile** | `/profile` (`profile`) | **Protected** | Valid JWT Session | AppHeader avatar click; Sidebar "Profile" | Dashboard | Credentials (`/credentials`), Catalog (`/catalog`) | "View Credentials", "Enroll More", Edit Form | **REACHABLE & VERIFIED** |
| **20** | **Settings & Preferences**| `/settings` (`settings`) | **Protected** | Valid JWT Session | Sidebar "Settings" | Dashboard | Dashboard | Notification toggles, Socratic AI Mentor cadence | **REACHABLE & VERIFIED** |

---

## 3. End-to-End Workflow Verification Proof

All 15 canonical transition pathways were verified via automated browser testing (`frontend/qa-interactions.mjs`) in headless Chrome:

1. **Landing → Login**:  
   Clicking "Sign In" on `/landing` routes to `/auth`.
2. **Login → Dashboard**:  
   Submitting OTP `123456` authenticates learner and transitions to `/dashboard`.
3. **Dashboard → Courses / My Learning / Studio**:  
   Sidebar and action cards successfully route to each destination.
4. **Catalog → Course Details**:  
   Clicking "View Details" on the Python card transitions to `/course-details`.
5. **Course Details → Diagnostic**:  
   Clicking "Take Diagnostic Pre-Assessment" transitions to `/diagnostic`.
6. **Diagnostic → Learning Studio**:  
   Answering all 4 diagnostic probes and clicking "Complete Diagnostic" opens `/studio`.
7. **Learning Studio → Chapter Assessment**:  
   Clicking "Assess Mastery" in the Studio opens `/chapter-assessment`.
8. **Chapter Assessment → Remediation**:  
   Selecting an incorrect invariant triggers the Socratic clarifier and routes to `/remediation`.
9. **Remediation → Learning Studio**:  
   Completing the 3 remediation steps and clicking "Return to Studio" routes to `/studio`.
10. **Final Assessment → Practical**:  
    Submitting the 4-question assessment transitions to `/practical`.
11. **Practical → Viva**:  
    Validating the practical capstone code transitions directly into `/viva`.
12. **Viva → Certification Result**:  
    Completing the oral defense turns routes to `/result`.
13. **Result → Credentials**:  
    Clicking "View Official Credential" routes to `/credential-details`.
14. **Credential → Verification**:  
    Clicking "Public Verification Ledger" transitions to `/verify`.
15. **Logout → Login**:  
    Clicking the sidebar logout button clears all session storage and redirects to `/auth`.
