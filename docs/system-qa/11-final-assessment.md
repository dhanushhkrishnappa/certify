# SCREEN QA REPORT: 11 — FINAL COMPREHENSIVE ASSESSMENT
**Screen Key**: `final-assessment` (or `assessments`)  
**Route**: `/final-assessment`  
**Screenshot**: `docs/screenshots/11_final_assessment.png`  
**Auditor**: Antigravity Quality Assurance & System Architecture  

---

### VISUAL
- **Typography**:
  - Exam Title & Questions: Editorial serif `Newsreader` (`font-serif`) 24px.
  - UI Navigation & Instructions: `Plus Jakarta Sans`.
  - Countdown Timer & Question IDs: `JetBrains Mono` (`font-mono`).
- **Headings**: Unified single H1: "Final Certification Assessment: Distributed Systems & Concurrency".
- **Alignment**: 2-column examination layout (Left: Active question & code editor; Right: 30-item question palette & submission telemetry).
- **Spacing**: 24px grid gaps, 16px internal question padding, 8px gap between question palette numbers.
- **Colors**: Canvas `#F8F7F4`, Exam Surface `#FFFFFF`, Active Palette `#5B4DF0`, Flagged `#F59E0B`, Border `#EBE8E1`.
- **Geometry**: Palette chips `rounded-lg`, question panel `rounded-2xl`, action buttons `rounded-xl`.

---

### FUNCTIONAL
- **Buttons**:
  - Question Navigator buttons (1-4): Changes active question immediately; answers persist across switches.
  - "Mark for Review" button: Toggles flagged status badge on question palette.
  - "Next Question" / "Previous Question": Steps through the examination sequence.
  - "Submit Assessment": Opens confirmation modal and transitions candidate to `/practical` (Practical Capstone).
- **Forms**: Radio option selection for theoretical/algorithmic questions; code editor for implementation questions.
- **Tabs**: View switcher between "Problem Description" and "Reference Documentation".
- **Navigation**: Exit button with confirmation dialog prevents accidental exam abandonment.
- **Checkboxes**: "Mark for review" toggle switch.
- **Inputs**: Radio answer buttons and code textarea.
- **State Changes**: Answering a question updates the palette chip color from neutral to filled purple.

---

### DATA
- **Backend Data**: Exam questions fetched from `/api/v1/assessments/final/:courseId`.
- **Derived Data**: Answered count (3/4), flagged count (1), remaining time timer.
- **Fixture Data**: None; question schema loaded from assessment engine.

---

### AUTH
- **Status**: **Protected**.
- **Enforcement**: Access requires valid learner session token.
- **Redirect**: Logging out redirects to `/auth`.

---

### STATUS: PASS
*Verified by automated interaction test suite and screenshot inspection.*
