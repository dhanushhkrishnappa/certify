# SCREEN QA REPORT: 16 — CREDENTIAL DETAILS & CERTIFICATE
**Screen Key**: `credential-details`  
**Route**: `/credential-details`  
**Screenshot**: `docs/screenshots/16_credential_details.png`  
**Auditor**: Antigravity Quality Assurance & System Architecture  

---

### VISUAL
- **Typography**:
  - Certificate Institution & Title: Editorial serif `Newsreader` (`font-serif`) 32px.
  - Candidate Name: Formal serif `Newsreader` 28px italic.
  - UI Controls & Metadata: `Plus Jakarta Sans`.
  - Serial Key & Cryptographic Digest: `JetBrains Mono` (`font-mono`).
- **Headings**: Unified single H1: "Official Verified Certificate: Distributed Systems Architecture".
- **Alignment**: Centered formal certificate parchment frame (`max-w-4xl mx-auto`), aligned double borders with corner ornaments.
- **Spacing**: 40px internal parchment padding, 24px between signature and validation QR code.
- **Colors**: Canvas `#F8F7F4`, Parchment `#FFFFFF`, Seal & Border `#C59B27`, Text `#0F1117`, Border `#EBE8E1`.
- **Geometry**: Certificate card `rounded-2xl` with 2px gold border inset; action buttons `rounded-xl`.

---

### FUNCTIONAL
- **Buttons**:
  - "Public Verification Ledger": Directs user or auditor to `/verify` with active hash.
  - "Download PDF Certificate": Exports high-resolution PDF document.
  - "Copy Credential Link": Copies verified URL to clipboard.
  - "Back to Credentials": Navigates back to `/credentials`.
- **Forms**: N/A.
- **Tabs**: N/A.
- **Navigation**: Back button and breadcrumb return to `/credentials`.
- **Checkboxes**: N/A.
- **Inputs**: Read-only hash string field with one-click copy button.
- **State Changes**: Copying hash displays inline checkmark confirmation.

---

### DATA
- **Backend Data**: Complete cryptographic evidence chain fetched from `/api/v1/credentials/:id`.
- **Derived Data**: QR code matrix, SHA-256 integrity hash (`9f83a...`), issue timestamp.
- **Fixture Data**: None; authentic database record.

---

### AUTH
- **Status**: **Protected** (for learner dashboard actions; public preview via verification view).
- **Enforcement**: Access requires valid session token.
- **Redirect**: Logging out redirects to `/auth`.

---

### STATUS: PASS
*Verified by automated interaction test suite and screenshot inspection.*
