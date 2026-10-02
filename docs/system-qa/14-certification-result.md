# SCREEN QA REPORT: 14 — CERTIFICATION RESULT
**Screen Key**: `result`  
**Route**: `/result`  
**Screenshot**: `docs/screenshots/14_certification_result.png`  
**Auditor**: Antigravity Quality Assurance & System Architecture  

---

### VISUAL
- **Typography**:
  - Certification Verdict: Editorial serif `Newsreader` (`font-serif`) 36px ("Candidate Certified: Distinction").
  - Assessment Breakdown & Explanations: `Plus Jakarta Sans`. Fixed rogue `font-['Inter']` in DEF-P2-02.
  - Credential ID, Verification Hash & Cryptographic Signature: `JetBrains Mono` (`font-mono`).
- **Headings**: Unified single H1: "Official Certification Decision".
- **Alignment**: Centered certificate decision hero (`max-w-3xl mx-auto`), aligned 4-stage competency grid (Diagnostic, Knowledge, Practical, Viva).
- **Spacing**: 32px vertical rhythm, 24px internal card padding, 16px metric row spacing.
- **Colors**: Canvas `#F8F7F4`, Result Card `#FFFFFF`, Distinction Gold `#C59B27`, Success Green `#10B981`, Border `#EBE8E1`.
- **Geometry**: Result card `rounded-2xl`, score pills `rounded-full`, CTA buttons `rounded-xl`.

---

### FUNCTIONAL
- **Buttons**:
  - "View Official Credential": Transitions candidate directly to `/credential-details`.
  - "Return to Dashboard": Navigates back to `/dashboard`.
  - "Download Cryptographic Transcript": Initiates JSON/PDF export download.
  - "Share Credential": Copies verified link to clipboard with confirmation toast.
- **Forms**: N/A.
- **Tabs**: View switcher between "Executive Summary" and "Cryptographic Evidence Ledger".
- **Navigation**: Top and bottom action links all resolve cleanly.
- **Checkboxes**: N/A.
- **Inputs**: Shareable URL copy field with click-to-copy button.
- **State Changes**: Clicking copy triggers "Copied to clipboard!" transient indicator.

---

### DATA
- **Backend Data**: Deterministic evaluation result fetched from `/api/v1/certifications/result/:id`.
- **Derived Data**: Weighted final grade (94.2%), Distinction tier classification, issue timestamp.
- **Fixture Data**: None; computed deterministically from candidate assessment evidence.

---

### AUTH
- **Status**: **Protected**.
- **Enforcement**: Access requires valid learner session token.
- **Redirect**: Logging out redirects to `/auth`.

---

### STATUS: PASS
*Verified by automated interaction test suite and screenshot inspection.*
