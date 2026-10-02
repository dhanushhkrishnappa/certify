# SCREEN QA REPORT: 04 — COURSE CATALOG (EXPLORE COURSES)
**Screen Key**: `catalog`  
**Route**: `/catalog`  
**Screenshot**: `docs/screenshots/04_catalog.png`  
**Auditor**: Antigravity Quality Assurance & System Architecture  

---

### VISUAL
- **Typography**:
  - Filter Bar & UI Controls: `Plus Jakarta Sans` (`font-sans`).
  - Course Titles: Medium `Plus Jakarta Sans` 18px.
  - Telemetry Chips: `JetBrains Mono` for course duration, candidate count, and prerequisite codes.
- **Headings**: Unified single H1 in `AppHeader`: "Explore Courses". Filter toolbar sits directly beneath without redundant title text.
- **Alignment**: 3-column responsive card grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) with aligned card heights and button baselines.
- **Spacing**: 24px grid gap (`gap-6`), 24px card internal padding (`p-6`).
- **Colors**: Canvas `#F8F7F4`, Card `#FFFFFF`, Active Filter `#5B4DF0`, Border `#EBE8E1`.
- **Geometry**: Cards `rounded-2xl`, filter chips `rounded-full`, CTA buttons `rounded-xl`.

---

### FUNCTIONAL
- **Buttons**:
  - "View Details" on each card: Navigates to `/course-details` with corresponding slug set in state.
  - "Enroll Now": Performs enrollment API call and routes to `/diagnostic` or `/studio`.
  - Filter pills ("All Tracks", "Systems", "AI & ML", "Distributed Systems"): Filters grid immediately in DOM.
  - Level filter dropdown: Filters by Beginner, Intermediate, Advanced.
- **Forms**: Search input filters course list by title, tags, or description in real time.
- **Tabs**: Category filter pills function as interactive tabs.
- **Navigation**: Sidebar remains synced on "Explore Courses" active item.
- **Checkboxes**: Filter facets (Prerequisites Met, In-Progress) toggle correctly.
- **Inputs**: Filter search input with instant debounced response.
- **State Changes**: Selecting a filter updates visible card count and empty-state messaging if no courses match.

---

### DATA
- **Backend Data**: Live courses loaded from `/api/v1/courses` database table.
- **Derived Data**: Active candidate enrollment count per course, candidate reviews aggregate.
- **Fixture Data**: None; course curriculum entries populated from SQLite seed data.

---

### AUTH
- **Status**: **Protected**.
- **Enforcement**: Access requires valid session token. Unauthenticated access redirects to `/auth`.
- **Redirect**: Logging out redirects to `/auth`.

---

### STATUS: PASS
*Verified by automated interaction test suite and screenshot inspection.*
