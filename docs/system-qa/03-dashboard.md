# SCREEN QA REPORT: 03 — LEARNER DASHBOARD
**Screen Key**: `dashboard`  
**Route**: `/dashboard` (or `/` when authenticated)  
**Screenshot**: `docs/screenshots/03_dashboard.png`  
**Auditor**: Antigravity Quality Assurance & System Architecture  

---

### VISUAL
- **Typography**:
  - Salutation Heading: Editorial serif `Newsreader` ("Good morning, Dhanush").
  - UI Controls & Navigation: `Plus Jakarta Sans`.
  - Metric Telemetry: `JetBrains Mono` for mastery percentages, streak days, and telemetry badges.
- **Headings**: Single primary greeting H1 in `AppHeader`. Zero duplicate page headers or stacked titles.
- **Alignment**: Cohesive alignment grid; sidebar pinned at left edge (240px expanded / 68px collapsed), main content padded 32px (`p-8`), cards aligned in 12-column grid.
- **Spacing**: 24px grid gap between metric cards; 32px between dashboard sections.
- **Colors**: Canvas `#F8F7F4`, Card `#FFFFFF`, Active State `#5B4DF0`, Border `#EBE8E1`.
- **Geometry**: Cards `rounded-2xl`, action buttons `rounded-xl`.

---

### FUNCTIONAL
- **Buttons**:
  - "Continue Learning": Launches active course directly in `/studio`.
  - "View Syllabus": Navigates to `/course-details`.
  - "Explore More Courses": Navigates to `/catalog`.
  - Sidebar Nav items (Dashboard, Courses, My Learning, Credentials, Progress, Profile, Settings): All active and functional.
- **Forms**: Global search input in `AppHeader` responds to keystrokes and filters courses.
- **Tabs**: Recent activity filter tabs (All, Chapters, Assessments, Viva).
- **Navigation**: Sidebar collapse/expand toggle works smoothly with transition; routes update URL history cleanly.
- **Checkboxes**: Daily milestone check items toggle visual completion.
- **Inputs**: Global search with clear action and keyboard shortcut (`Cmd/Ctrl + K`).
- **State Changes**: Resuming a course updates active course context and transitions views without full page reload.

---

### DATA
- **Backend Data**: Live learner data fetched via `api.auth.me()`, active enrollments from SQLite database.
- **Derived Data**: BKT Mastery score calculation (78%), current streak calculation (14 days), syllabus completion progress bar.
- **Fixture Data**: None; live learner record initialized from database.

---

### AUTH
- **Status**: **Protected** (Learner Home Screen).
- **Enforcement**: Direct unauthenticated access strictly redirected to `/auth` (RULE 11 & RULE 12).
- **Redirect**: Logging out clears session and redirects to `/auth`.

---

### STATUS: PASS
*Verified by automated interaction test suite and screenshot inspection.*
