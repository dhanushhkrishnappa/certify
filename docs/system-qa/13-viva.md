# SCREEN QA REPORT: 13 — ORAL VIVA DEFENSE CHAMBER
**Screen Key**: `viva`  
**Route**: `/viva`  
**Screenshot**: `docs/screenshots/13_viva.png`  
**Auditor**: Antigravity Quality Assurance & System Architecture  

---

### VISUAL
- **Typography**:
  - Viva Chamber Title & Defense Prompt: Editorial serif `Newsreader` (`font-serif`) 26px.
  - Defense Transcript & Examiner Dialogue: `Plus Jakarta Sans`.
  - Telemetry, Turn Counters & Audio Waveforms: `JetBrains Mono` (`font-mono`).
- **Headings**: Unified single H1: "Oral Viva Defense Chamber: Architectural Defense".
- **Alignment**: Centered chamber layout (`max-w-4xl mx-auto`), aligned conversation bubbles, aligned bottom audio/text input dock.
- **Spacing**: 20px bubble gaps, 24px container padding, 16px dock margin.
- **Colors**: Canvas `#F8F7F4`, Examiner Card `#FFFFFF`, Candidate Response `#5B4DF0`, Audio Visualizer `#10B981`.
- **Geometry**: Defense cards `rounded-2xl`, input dock `rounded-2xl`, action buttons `rounded-xl`.

---

### FUNCTIONAL
- **Buttons**:
  - "Submit Defense Argument": Evaluates argument against defense criteria, steps the turn counter, and triggers AI examiner inquiry.
  - "Conclude Defense": Appears after 4 turns and advances candidate to `/result`.
  - Audio/Text Toggle: Allows switching between spoken audio defense and typed technical defense.
  - "Exit Chamber": Confirmation prompt before aborting defense.
- **Forms**: Argument text entry dock with real-time word counter.
- **Tabs**: Defense mode toggle ("Audio Defense", "Written Argument").
- **Navigation**: Exit button returns to `/dashboard`.
- **Checkboxes**: Defense rubric criteria checklist.
- **Inputs**: Textarea for typed defense rationale.
- **State Changes**: Submitting response renders candidate message, increments turn counter (e.g. Turn 2 of 4), and renders streaming AI examiner follow-up.

---

### DATA
- **Backend Data**: Live viva dialogue session managed via `/api/v1/viva/session`.
- **Derived Data**: Turn counter (Turn 2/4), coherence score (0.92), response latency.
- **Fixture Data**: None; dynamic examiner inquiries.

---

### AUTH
- **Status**: **Protected**.
- **Enforcement**: Access requires active authenticated session.
- **Redirect**: Logging out redirects to `/auth`.

---

### STATUS: PASS
*Verified by automated interaction test suite and screenshot inspection.*
