# SCREEN QA REPORT: 07 — DIAGNOSTIC PRE-ASSESSMENT
**Screen Key**: `diagnostic`  
**Route**: `/diagnostic`  
**Screenshot**: `docs/screenshots/07_diagnostic.png`  
**Auditor**: Antigravity Quality Assurance & System Architecture  

---

### VISUAL
- **Typography**:
  - Probe Question Title: Editorial serif `Newsreader` (`font-serif`) 24px.
  - Option Labels & Explanations: `Plus Jakarta Sans`.
  - Code Snippets & Invariant Identifiers: `JetBrains Mono` (`font-mono`) with syntax-highlighted dark container `#0F1117`.
- **Headings**: Single clear H1: "Diagnostic Pre-Assessment: Python Backend Invariants".
- **Alignment**: Centered assessment layout (`max-w-3xl mx-auto`), aligned radio rows, aligned bottom navigation bar.
- **Spacing**: 24px between code block and question options; 12px gap between selectable answer cards.
- **Colors**: Canvas `#F8F7F4`, Card `#FFFFFF`, Selected Radio Border `#5B4DF0`, Border `#EBE8E1`.
- **Geometry**: Question container `rounded-2xl`, answer choice cards `rounded-xl`.

---

### FUNCTIONAL
- **Buttons**:
  - "Next Probe" / "Previous Probe": Cycles through probes 1 through 4 sequentially.
  - "Complete Diagnostic": Evaluates diagnostic score and transitions to `/studio`.
  - "Cancel & Return": Navigates back to `/course-details`.
- **Forms**: Radio choice selection for invariant verification.
- **Tabs**: N/A.
- **Navigation**: Probe progress indicator steps (1 of 4, 2 of 4, etc.) are interactive.
- **Checkboxes / Radios**: Radio buttons genuinely toggle and persist state across probe navigation.
- **Inputs**: Radio input elements with keyboard arrow navigation support.
- **State Changes**: Selecting an option highlights card border (`border-[#5B4DF0]`) and enables the Next/Complete button.

---

### DATA
- **Backend Data**: Dynamic 4-probe evaluation suite (CPython Invariants, Raft Consensus, Asyncio Coroutine Atomicity, Quorum Overlap).
- **Derived Data**: Live progress bar calculation (`(currentProbe / totalProbes) * 100`).
- **Fixture Data**: None; probes loaded dynamically.

---

### AUTH
- **Status**: **Protected**.
- **Enforcement**: Direct unauthenticated access strictly blocked and redirected to `/auth`.
- **Redirect**: Logging out redirects to `/auth`.

---

### STATUS: PASS
*Verified by automated interaction test suite and screenshot inspection.*
