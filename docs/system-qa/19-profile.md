# SCREEN QA REPORT: 19 — LEARNER PROFILE
**Screen Key**: `profile`  
**Route**: `/profile`  
**Screenshot**: `docs/screenshots/19_profile.png`  
**Auditor**: Antigravity Quality Assurance & System Architecture  

---

### VISUAL
- **Typography**:
  - Page Title: Unified H1 in `AppHeader` ("Learner Profile").
  - Candidate Name: Editorial serif `Newsreader` (`font-serif`) 28px.
  - UI Labels & Form Descriptions: `Plus Jakarta Sans`.
  - Candidate ID & Public Key: `JetBrains Mono` (`font-mono`).
- **Headings**: Removed duplicate local H1 header in DEF-P2-01. Single clear page hierarchy.
- **Alignment**: 2-column profile layout (Left: Identity card with avatar, candidate ID, and verified status; Right: Detailed profile settings and verified credentials list).
- **Spacing**: 24px grid gap, 24px internal card padding, 16px form field spacing.
- **Colors**: Canvas `#F8F7F4`, Card `#FFFFFF`, Verified Badge `#10B981`, Brand `#5B4DF0`, Border `#EBE8E1`.
- **Geometry**: Identity card and panels `rounded-2xl`, form inputs and action buttons `rounded-xl`.

---

### FUNCTIONAL
- **Buttons**:
  - "Save Changes": Submits profile updates via `/api/v1/users/profile`.
  - "View All Credentials": Navigates to `/credentials`.
  - "Browse Course Catalog": Navigates to `/catalog`.
  - "Change Avatar": Uploads or selects learner avatar.
- **Forms**:
  - Full Name input: Updates state on edit.
  - Professional Title / Headline input: Updates state on edit.
  - Bio / Experience textarea: Updates state on edit.
- **Tabs**: Profile sections ("Personal Details", "Certifications", "Public Profile").
- **Navigation**: Sidebar item "Profile" and top-bar avatar menu link both route here.
- **Checkboxes**: "Make profile publicly visible for employer verification" toggle works and persists.
- **Inputs**: Form inputs with validation and character counters.
- **State Changes**: Submitting profile form displays "Profile updated successfully" toast message.

---

### DATA
- **Backend Data**: Live user profile loaded from `/api/v1/auth/me`.
- **Derived Data**: Joined date, total certified hours, candidate completion rate.
- **Fixture Data**: None; DB-backed user profile.

---

### AUTH
- **Status**: **Protected**.
- **Enforcement**: Access requires active authenticated session.
- **Redirect**: Logging out redirects to `/auth`.

---

### STATUS: PASS
*Verified by automated interaction test suite and screenshot inspection.*
