# SCREEN QA REPORT: 20 — ACCOUNT & MENTOR SETTINGS
**Screen Key**: `settings`  
**Route**: `/settings`  
**Screenshot**: `docs/screenshots/20_settings.png`  
**Auditor**: Antigravity Quality Assurance & System Architecture  

---

### VISUAL
- **Typography**:
  - Page Title: Unified H1 in `AppHeader` ("Account & AI Mentor Settings").
  - Section Headings: Medium `Plus Jakarta Sans` 18px.
  - Setting Labels & Descriptions: `Plus Jakarta Sans`.
  - API Keys & Telemetry Identifiers: `JetBrains Mono` (`font-mono`).
- **Headings**: Removed duplicate local H1 header in DEF-P2-01. Single clear page hierarchy.
- **Alignment**: Single column structured settings form (`max-w-3xl mx-auto`), aligned switch controls, aligned form action buttons.
- **Spacing**: 24px section spacing, 16px row spacing within cards.
- **Colors**: Canvas `#F8F7F4`, Card `#FFFFFF`, Toggle Active `#5B4DF0`, Border `#EBE8E1`.
- **Geometry**: Cards `rounded-2xl`, inputs and buttons `rounded-xl`.

---

### FUNCTIONAL
- **Buttons**:
  - "Save Preferences": Persists preferences via `/api/v1/users/preferences`.
  - "Regenerate API Key": Generates new access token with confirmation dialog.
  - "Log Out of All Devices": Invalidates active tokens and routes to `/auth`.
- **Forms**: Mentor strictness level selector, Socratic probing depth slider.
- **Tabs**: Settings tabs ("AI Mentor Behavior", "Notifications", "Security & Sessions").
- **Navigation**: Sidebar item "Settings" remains active and highlighted.
- **Checkboxes & Toggles**:
  - Socratic Mentor Mode toggle: Switches between "Strict First-Principles Probing" and "Guided Assistance".
  - Email notification toggle: Persists state.
  - Diagnostic re-assessment cadence: Dropdown updates selection.
- **Inputs**: Form selects and text fields.
- **State Changes**: Toggling settings switches updates knurling animation and displays "Settings saved" indicator.

---

### DATA
- **Backend Data**: Live learner preferences from `/api/v1/users/preferences`.
- **Derived Data**: Active session count, security audit timestamp.
- **Fixture Data**: None; DB-backed preferences.

---

### AUTH
- **Status**: **Protected**.
- **Enforcement**: Access requires valid session token.
- **Redirect**: Logging out redirects to `/auth`.

---

### STATUS: PASS
*Verified by automated interaction test suite and screenshot inspection.*
