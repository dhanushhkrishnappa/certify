# SCREEN QA REPORT: 05 — COURSE DETAILS & SYLLABUS
**Screen Key**: `course-details`  
**Route**: `/course-details`  
**Screenshot**: `docs/screenshots/05_course_details.png`  
**Auditor**: Antigravity Quality Assurance & System Architecture  

---

### VISUAL
- **Typography**:
  - Course Hero Title: Editorial serif `Newsreader` (`font-serif`) 36px.
  - UI & Syllabus Descriptions: `Plus Jakarta Sans` (`font-sans`).
  - Learning Objectives & Module Code: `JetBrains Mono` (`font-mono`).
- **Headings**: Breadcrumb navigation (`Courses > Python Backend Engineering`) leads into a single hero H1. Zero duplicate title text.
- **Alignment**: 2-column layout (70% syllabus narrative, 30% sticky enrollment right rail) aligned on shared top baseline.
- **Spacing**: 32px column gap, 16px accordion row gaps, 24px rail card padding.
- **Colors**: Canvas `#F8F7F4`, Rails `#FFFFFF`, Brand `#5B4DF0`, Border `#EBE8E1`, Mastery Accent `#10B981`.
- **Geometry**: Rail card `rounded-2xl`, syllabus module accordions `rounded-xl`.

---

### FUNCTIONAL
- **Buttons**:
  - "Take Diagnostic Pre-Assessment": Navigates to `/diagnostic`.
  - "Begin Curriculum" / "Resume Chapter": Navigates to `/studio`.
  - Module Accordion Toggles: Expands and collapses individual chapter lesson trees.
  - Prerequisite and related course links: Updates `selectedCourseSlug` and reloads syllabus.
- **Forms**: N/A.
- **Tabs**: Syllabus view toggle ("Overview", "Detailed Syllabus", "Prerequisites", "Instructors").
- **Navigation**: Back to Catalog link returns to `/catalog`. Breadcrumb items are clickable.
- **Checkboxes**: Completed module indicators reflect learner progress state.
- **Inputs**: None on this view.
- **State Changes**: Expanding an accordion smoothly toggles visibility of nested topics and estimated completion times.

---

### DATA
- **Backend Data**: Course syllabus and chapter tree fetched from `/api/v1/courses/:slug`.
- **Derived Data**: Estimated time to complete (24 hrs), total chapters (8), completion percentage.
- **Fixture Data**: None; active syllabus models loaded from DB.

---

### AUTH
- **Status**: **Protected** (where enrollment and personal progress are involved).
- **Enforcement**: Session required; unauthenticated visits route to `/auth`.
- **Redirect**: Logging out redirects to `/auth`.

---

### STATUS: PASS
*Verified by automated interaction test suite and screenshot inspection.*
