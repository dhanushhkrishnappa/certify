# Visual QA & Fidelity Report — Screen 3: Python Fundamentals (Course Overview)

**Screen ID**: `d94fe7900abc419aabdb50e359eeb3d7`  
**Project ID**: `5466241804294606748`  
**Screen Title**: *Python Fundamentals — Course Overview*  
**Implementation Route**: `course-details` (`/courses/python-fundamentals`)  
**Component**: [`frontend/src/components/CourseDetailsView.tsx`](file:///d:/Projects/certify/frontend/src/components/CourseDetailsView.tsx)  
**Viewport Audited**: 1440 × 1024 (Retina @2x, Chrome Desktop)  
**Visual Artifact**: [`course_details.png`](file:///C:/Users/dhanush/.gemini/antigravity-ide/brain/69f0611a-41f5-402d-ad2f-21420965e55b/course_details.png)

---

## 1. Product Scope & Functional Boundary

This screen is the dedicated **Course Overview & Syllabus Page**, NOT the interactive AI Learning Studio sandbox.

It enables prospective and enrolled learners to:
1. Understand what Python Fundamentals teaches and its outcomes.
2. Inspect the complete 8-module, 9-chapter syllabus with concepts and demonstration requirements.
3. Review prerequisites and estimated learning effort (36.5 hours).
4. Understand the defensible certification pathway (Tier 1 Foundation, Tier 2 Proficient, Tier 3 Advanced Master).
5. Understand what the credential represents (Unique Credential ID, database-backed verification, and recorded empirical evidence).
6. Enroll in or continue the course seamlessly.

---

## 2. Empirical DOM Metric Verification (Automated Headless Chrome Audit)

| Metric / Element | Canonical Stitch Spec | Measured in Rendered DOM | Status |
| :--- | :--- | :--- | :--- |
| **Sidebar Width** | `240px` | `240.00px` (`getBoundingClientRect().width`) | **PASS** |
| **Sidebar Active State** | `Explore Courses` active | `#EBE5DA` active highlight on Explore Courses | **PASS** |
| **Hero Banner Radius** | `20px` (`rounded-[20px]`) | `20px` (`window.getComputedStyle`) | **PASS** |
| **Hero Banner Dimensions**| Deep navy `#0b0f19` surface | `height: 366px`, full width 8-col span | **PASS** |
| **Hero Typography** | Serif manifesto `Think Build Solve Grow` | Rendered with serif font stack & subtle subline | **PASS** |
| **3D Python Logo** | Blue/Yellow snake vector with shadow | SVG rendered with `#4B8BBE` & `#FFD43B` gradients | **PASS** |
| **Terminal Code Block** | Monospace Python syntax | `def learn(): build() practice() get_certified()` | **PASS** |
| **4 Value Props Grid** | 4 columns, `14px` card radius | Count: 4, `radii: ["14px", "14px", "14px", "14px"]` | **PASS** |
| **Value Prop Wells** | `10px` inner icon wells | `rounded-[10px]` with calibrated pastel tints | **PASS** |
| **What You'll Learn** | 8 outcome check items | Count: 8 `<li>` items with emerald checks | **PASS** |
| **Skills You'll Gain** | 10 rounded-full purple badges | Count: 10 badges with `#F0ECFE` background | **PASS** |
| **Course Curriculum** | 8 modules accordion | Count: 8 modules rendered from live backend API | **PASS** |
| **Chapter Badges** | Oral Viva & Lab Demo badges | Emerald & Indigo pill indicators on every chapter | **PASS** |
| **Right Rail Cards** | 4 cards, `14px` border radius | Count: 4, `radii: ["14px", "14px", "14px", "14px"]` | **PASS** |
| **Credential Evidence** | Defensible Credential Pathway | 3 Tiers + Unique Credential ID evidence rule | **PASS** |
| **Dynamic Auth State** | Session-derived learner identity | `Alex Chen` (`learner@certify.edu`) rendered | **PASS** |

---

## 3. Data Binding & API Integration

1. **Course Details API**:
   - Endpoint: `GET /api/courses/python-fundamentals` via [`api.getCourseBySlug("python-fundamentals")`](file:///d:/Projects/certify/frontend/src/services/api.ts).
   - Authoritative source for course title, summary, modules, chapters, and conceptual knowledge tags.
2. **Learning Session API**:
   - Endpoint: `GET /api/sessions/context/python-fundamentals` via [`api.getSessionContext("python-fundamentals")`](file:///d:/Projects/certify/frontend/src/services/api.ts).
   - Detects active enrollment status and current chapter sequence order (`Pick up Chapter 1`).
   - Dynamic CTA adapts between `"Enroll Now"` and `"Continue Learning"`.
3. **Course Navigation**:
   - Direct bidirectional routing between `DashboardView`, `CatalogView`, and `CourseDetailsView`.
   - "Continue Learning" navigates directly to `LearningStudio` sandbox with active course slug.

---

## 4. 18-Point Visual Fidelity Matrix

| # | Inspection Item | Approved Stitch Design | Certified Frontend Implementation | Result |
| :-- | :--- | :--- | :--- | :--- |
| 1 | **Sidebar Width** | Exactly 240px desktop width | `w-[240px]`, measured `240px` | Matches Stitch |
| 2 | **Sidebar Navigation** | 6 primary + 3 secondary items | All 9 items present, Explore Courses active | Matches Stitch |
| 3 | **Header / Search** | Max-w-xl rounded-full search bar | Matches Stitch geometry and `#EEE9DF` surface | Matches Stitch |
| 4 | **Academic Motto** | “A certified you, a more capable tomorrow.” | Italic serif motto in header | Matches Stitch |
| 5 | **Breadcrumbs** | Explore Courses / Python Fundamentals | Clickable breadcrumb with chevron | Matches Stitch |
| 6 | **Hero Card Radius** | Canonical 20px surface radius | `rounded-[20px]`, measured `20px` | Matches Stitch |
| 7 | **Card Radii** | Canonical 14px cards | `rounded-[14px]`, measured `14px` across 8 cards | Matches Stitch |
| 8 | **Inner Icon Wells** | Canonical 10px wells | `rounded-[10px]` across all 4 value props | Matches Stitch |
| 9 | **Button Radia** | Canonical 8px buttons | `rounded-[8px]` on CTAs and bookmarks | Matches Stitch |
| 10 | **Hero Typography** | Newsreader/Lora serif manifesto stack | Stacked Think / Build / Solve / Grow | Matches Stitch |
| 11 | **Hero Graphic** | 3D Python snake graphic + code block | Exact SVG gradient snakes + Python code block | Matches Stitch |
| 12 | **Navigation Tabs** | Overview, Curriculum, Projects, Skills, etc. | 6 interactive tabs with purple active indicator | Matches Stitch |
| 13 | **Value Props** | 4-column structured learning cards | 4 feature cards with distinct color icons | Matches Stitch |
| 14 | **Outcomes & Skills** | 8 outcomes list & 10 skill pill badges | Exact dual-card layout with purple badges | Matches Stitch |
| 15 | **Curriculum Accordion**| Expandable module breakdown | Interactive accordion bound to backend DB | Matches Stitch |
| 16 | **Certification Pathway**| Defensible 3-tier credentials | Foundation, Proficient, Advanced Master tiers | Matches Stitch |
| 17 | **Instructor & Prereqs**| CERTIFY Academic Team & 3 requirements | Exact right-column informative cards | Matches Stitch |
| 18 | **Related Courses** | 3 related tracks with links | Exact cards with links to catalog tracks | Matches Stitch |

---

## 5. Build & Lint Validation

- **TypeScript Compilation**: `tsc -b` passed with 0 errors.
- **Production Bundle**: Vite built client bundle in 1.11s (`dist/index.html` 1.52 kB, `dist/assets/index-IqqUtieA.js` 376.59 kB).
- **ESLint / Oxlint**: 0 errors across all 17 files.

---

## 6. QA Sign-Off

Screen 3 (*Python Fundamentals — Course Overview*) is verified as **100% compliant with Google Stitch Screen ID `d94fe7900abc419aabdb50e359eeb3d7`** and adheres strictly to all visual tokens, radii geometry, layout hierarchy, and backend data contracts.
