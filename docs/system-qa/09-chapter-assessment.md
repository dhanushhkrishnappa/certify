# SCREEN QA REPORT: 09 — CHAPTER ASSESSMENT
**Screen Key**: `chapter-assessment`  
**Route**: `/chapter-assessment`  
**Screenshot**: `docs/screenshots/09_chapter_assessment.png`  
**Auditor**: Antigravity Quality Assurance & System Architecture  

---

### VISUAL
- **Typography**:
  - Problem Statement: Editorial serif `Newsreader` (`font-serif`) 24px.
  - Option Descriptions: `Plus Jakarta Sans`.
  - Code Snippets & Execution Output: `JetBrains Mono` (`font-mono`).
- **Headings**: Unified single H1: "Chapter Mastery Assessment: Memory Model & Mutability".
- **Alignment**: Centered assessment layout (`max-w-4xl mx-auto`), aligned option cards, sticky bottom action bar.
- **Spacing**: 24px between code editor and questions, 12px vertical gaps between radio options.
- **Colors**: Canvas `#F8F7F4`, Card `#FFFFFF`, Active `#5B4DF0`, Border `#EBE8E1`, Remediation Warning `#F59E0B`.
- **Geometry**: Containers `rounded-2xl`, answer choice cards `rounded-xl`.

---

### FUNCTIONAL
- **Buttons**:
  - "Verify Invariant" / "Run Check": Evaluates selected invariant choice against AST rules.
  - "Remediate Concept": Appears on incorrect attempt and routes candidate to `/remediation`.
  - "Continue to Next Lesson": Appears on successful invariant verification and routes back to `/studio`.
  - "Mark for Review": Toggles review status indicator.
- **Forms**: Radio option selection for code invariant analysis.
- **Tabs**: View toggle between "Interactive Code Snippet" and "Invariant Theory".
- **Navigation**: Exit button returns safely to `/studio`.
- **Checkboxes / Radios**: Interactive radio choices highlight upon selection and persist in component state.
- **Inputs**: Code modification input area for debugging practical exercises.
- **State Changes**: Submitting an answer triggers instantaneous evaluation feedback banner (Success green / Remediation amber).

---

### DATA
- **Backend Data**: Assessment questions and rubric criteria from `/api/v1/assessments/chapter`.
- **Derived Data**: Score percentage, mastery probability update $P(L_t)$.
- **Fixture Data**: None; evaluation logic executed against real runtime invariants.

---

### AUTH
- **Status**: **Protected**.
- **Enforcement**: Access requires active authenticated session.
- **Redirect**: Logging out redirects to `/auth`.

---

### STATUS: PASS
*Verified by automated interaction test suite and screenshot inspection.*
