# SCREEN QA REPORT: 01 — AUTHENTICATION (LOGIN / SIGNUP)
**Screen Key**: `auth`  
**Route**: `/auth`  
**Screenshot**: `docs/screenshots/01_auth.png`  
**Auditor**: Antigravity Quality Assurance & System Architecture  

---

### VISUAL
- **Typography**:
  - Primary UI Font: `Plus Jakarta Sans` (`font-sans`).
  - Brand Heading: Editorial serif `Newsreader` (`font-serif`) for "Enter the certification standard."
  - Monospace Elements: `JetBrains Mono` (`font-mono`) on OTP inputs.
  - Zero rogue fonts (`Inter`, `Arial`, `Roboto` eradicated).
- **Headings**: Single clear H1: "Log in or sign up to Certify". No duplicate headers or subheadings.
- **Alignment**: Centered auth card modal (`max-w-md mx-auto`) with 24px vertical padding and aligned input columns.
- **Spacing**: Canonical 4px scale (`p-8`, `space-y-6`, `gap-3`).
- **Colors**: Canvas `#F8F7F4`, Card `#FFFFFF`, Borders `#EBE8E1`, Brand CTA `#5B4DF0`, Text `#0F1117`, Muted `#8A909E`.
- **Geometry**: Card radius `rounded-2xl` (`16px`), inputs and buttons `rounded-xl` (`12px`).

---

### FUNCTIONAL
- **Buttons**:
  - "Continue with OTP" / "Verify & Enter": Active, clickable, loading spinner during network request, disabled when input is invalid.
  - Method Toggle ("Continue with Email" / "Continue with Phone"): State transitions cleanly between inputs.
- **Forms**:
  - Mobile Phone input: Correct mask, updates state on change, handles enter key.
  - OTP Inputs: 6 discrete inputs with auto-focus advance, backspace regression, and paste handling.
- **Tabs**: Smooth tab switching between phone and email authentication methods.
- **Navigation**: Successful OTP verification redirects to `/dashboard` for existing learners or `/diagnostic` for new enrollments.
- **Checkboxes**: "Remember this device for 30 days" toggles state and persists session.
- **Inputs**: Real-time validation with visible error messages on invalid input.
- **State Changes**: Advances from Phone/Email view to OTP verification step dynamically.

---

### DATA
- **Backend Data**: Live integration with SQLite backend endpoint `/api/v1/auth/login` and `/api/v1/auth/verify-otp`.
- **Derived Data**: Country dial code prefix (`+91`), masked contact display in OTP screen.
- **Fixture Data**: None in production flow; fallback sandbox test bypass allows OTP `123456` for deterministic testing.

---

### AUTH
- **Status**: **Public** (Unauthenticated entry point).
- **Enforcement**: Root URL `/` strictly routes unauthenticated visitors here (RULE 11).
- **Redirect**: Authenticated users visiting `/auth` are automatically bounced to `/dashboard`.

---

### STATUS: PASS
*Verified by automated interaction test suite and screenshot inspection.*
