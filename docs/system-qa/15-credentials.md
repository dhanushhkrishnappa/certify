# SCREEN QA REPORT: 15 — CREDENTIALS REGISTRY (MY CREDENTIALS)
**Screen Key**: `credentials`  
**Route**: `/credentials`  
**Screenshot**: `docs/screenshots/15_credentials.png`  
**Auditor**: Antigravity Quality Assurance & System Architecture  

---

### VISUAL
- **Typography**:
  - Page Title: Unified H1 in `AppHeader` ("My Credentials").
  - Certificate Titles & Learner Name: Editorial serif `Newsreader` (`font-serif`).
  - UI Labels & Status Chips: `Plus Jakarta Sans`.
  - Credential Hash & Serial Numbers: `JetBrains Mono` (`font-mono`).
- **Headings**: Removed duplicate local H1 header in DEF-P2-01. Single clear page hierarchy.
- **Alignment**: 2-column or list grid with aligned gold-accented credential cards (`border-[#C59B27]/30`).
- **Spacing**: 24px grid gaps, 24px card internal padding, 16px row spacing.
- **Colors**: Canvas `#F8F7F4`, Card `#FFFFFF`, Gold Accent `#C59B27`, Border `#EBE8E1`, Brand `#5B4DF0`.
- **Geometry**: Certificate preview cards `rounded-2xl`, action buttons `rounded-xl`.

---

### FUNCTIONAL
- **Buttons**:
  - "View Certificate": Opens `/credential-details` with corresponding `credentialId`.
  - "Verify On-Chain / Database": Opens `/verify` with active credential ID prefilled.
  - "Download PDF": Generates printable credential certificate.
  - "Add to LinkedIn": Generates standard LinkedIn certification share link.
- **Forms**: Filter credentials by course or certification year.
- **Tabs**: Status tabs ("Active Credentials", "In Progress", "Expired").
- **Navigation**: Sidebar item "Credentials" remains active and highlighted.
- **Checkboxes**: Status filter toggles.
- **Inputs**: Search field for filtering credential certificates by name or ID.
- **State Changes**: Selecting a credential card highlights it and updates context for detail actions.

---

### DATA
- **Backend Data**: Live candidate certifications from `/api/v1/credentials`.
- **Derived Data**: Total verified credentials count (2), latest issue date, expiry status.
- **Fixture Data**: None; DB-backed credential records.

---

### AUTH
- **Status**: **Protected**.
- **Enforcement**: Access requires active authenticated session.
- **Redirect**: Logging out redirects to `/auth`.

---

### STATUS: PASS
*Verified by automated interaction test suite and screenshot inspection.*
