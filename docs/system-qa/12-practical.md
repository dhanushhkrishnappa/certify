# SCREEN QA REPORT: 12 — PRACTICAL CAPSTONE ASSESSMENT
**Screen Key**: `practical`  
**Route**: `/practical`  
**Screenshot**: `docs/screenshots/12_practical.png`  
**Auditor**: Antigravity Quality Assurance & System Architecture  

---

### VISUAL
- **Typography**:
  - Capstone Scenario Heading: Editorial serif `Newsreader` (`font-serif`) 26px.
  - Test Specifications & Architecture Notes: `Plus Jakarta Sans`.
  - Code Sandbox, Invariant Assertions & CLI Output: `JetBrains Mono` (`font-mono`).
- **Headings**: Unified single H1: "Practical Capstone: Quorum Invariants & In-Memory State".
- **Alignment**: 2-column sandbox environment (Left: Architecture specifications and invariants; Right: Interactive code editor and unit test runner).
- **Spacing**: 24px column gap, 16px padding within code block containers.
- **Colors**: Canvas `#F8F7F4`, Sandbox Dark Mode `#0F1117`, Pass State `#10B981`, Border `#EBE8E1`.
- **Geometry**: Editor container `rounded-2xl`, test runner execution pill `rounded-xl`.

---

### FUNCTIONAL
- **Buttons**:
  - "Run Test Suite": Executes code against backend test suite or sandbox runner.
  - "Submit Implementation": Validates passing criteria and advances candidate to `/viva`.
  - "Reset to Baseline Code": Resets implementation to initial template.
- **Forms**: Code editor textarea supporting keyboard indentation and typing.
- **Tabs**: Sandbox tabs ("implementation.py", "test_invariants.py", "terminal_output").
- **Navigation**: Exit button returns safely to `/dashboard`.
- **Checkboxes**: Test assertion pass/fail checklist items.
- **Inputs**: Multi-line code input area.
- **State Changes**: Running tests triggers console output stream and updates test pass counters in real time.

---

### DATA
- **Backend Data**: Capstone test suite definitions and evaluation scripts.
- **Derived Data**: Tests passed (5/5), execution latency (42ms), memory consumption (18MB).
- **Fixture Data**: Baseline starter code.

---

### AUTH
- **Status**: **Protected**.
- **Enforcement**: Access requires active authenticated session.
- **Redirect**: Logging out redirects to `/auth`.

---

### STATUS: PASS
*Verified by automated interaction test suite and screenshot inspection.*
