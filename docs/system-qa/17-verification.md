# SCREEN QA REPORT: 17 — PUBLIC CREDENTIAL VERIFICATION
**Screen Key**: `verify`  
**Route**: `/verify`  
**Screenshot**: `docs/screenshots/17_verification.png`  
**Auditor**: Antigravity Quality Assurance & System Architecture  

---

### VISUAL
- **Typography**:
  - Verification Header: Editorial serif `Newsreader` (`font-serif`) 32px ("Cryptographic Ledger Verification").
  - Verification Status & Metadata: `Plus Jakarta Sans`.
  - Credential ID, Merkle Root & SHA-256 Digest: `JetBrains Mono` (`font-mono`).
- **Headings**: Single clear H1: "Public Credential Verification Ledger".
- **Alignment**: Centered verification card (`max-w-3xl mx-auto`), aligned proof row table, aligned status badge.
- **Spacing**: 32px container padding, 16px table row spacing.
- **Colors**: Canvas `#F8F7F4`, Card `#FFFFFF`, Verified Green `#10B981`, Border `#EBE8E1`, Text `#0F1117`.
- **Geometry**: Verification card `rounded-2xl`, status pill `rounded-full`, search input `rounded-xl`.

---

### FUNCTIONAL
- **Buttons**:
  - "Verify Another Credential" / "Search Ledger": Triggers database lookup for entered hash or ID.
  - "Copy Verification Proof": Copies cryptographic evidence JSON to clipboard.
  - "Return to App / Sign In": Navigates to `/auth` or `/credentials`.
- **Forms**: Verification search bar accepts candidate ID or SHA-256 hash.
- **Tabs**: View switcher between "Human Readable Proof" and "Raw JSON Ledger".
- **Navigation**: Back button navigates to `/credentials` if user is logged in, or `/landing` if public visitor.
- **Checkboxes**: N/A.
- **Inputs**: Text search input with instant clear button.
- **State Changes**: Searching for a credential updates the status card with live verified/invalid indicator.

---

### DATA
- **Backend Data**: Live database query to `/api/v1/verify/:credentialId`.
- **Derived Data**: Cryptographic validity status ("Cryptographically Verified & Active"), verification timestamp.
- **Fixture Data**: None; authentic ledger entries.

---

### AUTH
- **Status**: **Public** (Public Verification Ledger).
- **Enforcement**: Allowlisted in `PUBLIC_VIEWS`; accessible by employers, recruiters, and auditors without authentication.
- **Redirect**: N/A; fully public route.

---

### STATUS: PASS
*Verified by automated interaction test suite and screenshot inspection.*
