# CERTIFY Design System & Canonical Visual Specification (`DESIGN.md`)

> **Authoritative Visual Source of Truth for CERTIFY**  
> *Consolidated from Approved Platform Screens: Dashboard, Explore Courses, Course Details, My Learning, Learning Studio / AI Tutor, Assessments, Certification Result, Credentials, and Credential Details.*

---

## 1. Executive Product Philosophy & Aesthetic Foundation

**Certify** is an AI-first interactive engineering qualification protocol where credentials represent demonstrated, defensible understanding rather than passive video completion.

### The Canonical Product Model
The interface directly mirrors the pedagogical progression:
$$\text{Curated Track} \longrightarrow \text{Baseline Diagnostic} \longrightarrow \text{AI Learning Studio} \longrightarrow \text{Practice} \longrightarrow \text{Chapter Assessment} \longrightarrow \text{Remediation} \longrightarrow \text{Final Assessment} \longrightarrow \text{Practical Sandbox} \longrightarrow \text{AI Viva / Defense} \longrightarrow \text{Deterministic Result} \longrightarrow \text{Verifiable Credential}$$

### Core Aesthetic Principles
1. **Calm Warm Editorial Tone**: Clean, warm ivory canvas (`#F8F7F4` / `#FBF9F5`) balanced against high-contrast charcoal ink (`#0F1117`) and crisp white elevated containers (`#FFFFFF`).
2. **Elevated Academic Typographic Authority**: Editorial Serif headings (`Newsreader` / `Merriweather` / `Playfair Display`) paired with clean, modern grotesque interface sans (`Plus Jakarta Sans` / `Inter`) and precise monospace (`JetBrains Mono` / `SF Mono`) for code, telemetry, and verification identifiers.
3. **Restrained Color Weight**: Royal Purple (`#5B4DF0` / `#4F46E5`) is the primary active brand and interactive CTA accent; Emerald / Forest Mint (`#10B981` / `#059669`) strictly represents validated mastery and pass states; Warm Amber (`#F59E0B` / `#D97706`) denotes review and focus; Coral / Crimson (`#EF4444`) denotes diagnosed misconceptions; Lavender tint (`#EEF0FF` / `#F3F0FF`) hosts skill chips.
4. **Anti-Gamification Mandate**: No flashy badges, spinning slot-machine wheels, or dominating leaderboards. The UI emphasizes intellectual rigor, focused Socratic partnership, and deterministic backend verification.

---

## 2. Global Tokens & Foundations

### A. Color Tokens (CSS Variables)

```css
:root {
  /* Surface & Background Tokens */
  --certify-bg-canvas: #F8F7F4;              /* Global warm ivory page backdrop */
  --certify-bg-surface: #FFFFFF;             /* Elevated white cards and primary surfaces */
  --certify-bg-surface-subtle: #F3F1EC;      /* Secondary pill backgrounds, table headers, inset wells */
  --certify-bg-surface-muted: #EBE8E1;       /* Inactive tabs, subtle hover fills */
  --certify-bg-sidebar: #F8F7F4;             /* Sidebar backdrop */
  --certify-bg-code-ide: #13151A;            /* Dark code editor window canvas */
  --certify-bg-code-header: #1B1E26;         /* IDE window title bar */

  /* Text & Ink Tokens */
  --certify-text-primary: #0F1117;           /* Headings, primary titles, critical labels */
  --certify-text-secondary: #525866;         /* Descriptive body prose, explanations, subheads */
  --certify-text-muted: #8A909E;             /* Meta-timestamps, placeholders, breadcrumb chevrons */
  --certify-text-disabled: #B4B8C4;          /* Inactive actions */
  --certify-text-on-dark: #FFFFFF;           /* Text on primary purple or dark IDE canvas */

  /* Primary Brand & Interactive Tokens */
  --certify-brand-purple: #5B4DF0;          /* Primary interactive buttons, active rings, brand links */
  --certify-brand-purple-hover: #4C3DE0;    /* Darkened hover state */
  --certify-brand-purple-active: #4032C9;   /* Tactile press state */
  --certify-brand-purple-light: #EEF0FF;    /* Selected nav items, active question borders, pill tints */
  --certify-brand-purple-border: #D6D2FA;   /* Ring borders and highlighted cards */

  /* Semantic Mastery & Status Tokens */
  --certify-status-success: #10B981;        /* 100% Passed, Verified, Correct answers */
  --certify-status-success-bg: #ECFDF5;     /* Green pill backdrop */
  --certify-status-success-border: #A7F3D0; /* Green hairline border */

  --certify-status-warning: #F59E0B;        /* Marked for Review, Pending Diagnostic */
  --certify-status-warning-bg: #FFFBEB;     /* Amber pill backdrop */
  --certify-status-warning-border: #FDE68A; /* Amber hairline border */

  --certify-status-danger: #EF4444;         /* Misconception diagnosed, Test error */
  --certify-status-danger-bg: #FEF2F2;      /* Coral pill backdrop */
  --certify-status-danger-border: #FECACA;  /* Coral hairline border */

  --certify-status-info: #3B82F6;           /* Collapsible assessment instructions, notice */
  --certify-status-info-bg: #EFF6FF;        /* Soft blue note backdrop */
  --certify-status-info-border: #BFDBFE;    /* Soft blue border */

  /* Hairlines, Rules & Outlines */
  --certify-border-subtle: #E8E5DF;         /* 1px Card separation & standard dividers */
  --certify-border-medium: #D5D1C8;         /* Outlined buttons, inputs, focus borders */
  --certify-border-focus: #5B4DF0;          /* Keyboard focus visible outline */

  /* Gold & Certificate Embellishments */
  --certify-gold-primary: #C59B27;          /* Certificate filigree border, seal accents */
  --certify-gold-secondary: #E3B341;        /* Embossed gold medallion highlight */
  --certify-gold-bg: #FDF9EC;               /* Certificate parchment warm tone */
}
```

### B. Typography Hierarchy

| Role | Font Family | Size (px / rem) | Weight | Line Height | Tracking | Visual Target |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Serif Display (Hero/Cert)** | Newsreader / Merriweather | `38px (2.375rem)` | 700 Bold | 1.15 | `-0.025em` | Page H1s ("Python Fundamentals", "Credential Details") |
| **Serif Section (H2)** | Newsreader / Merriweather | `28px (1.750rem)` | 700 Bold | 1.25 | `-0.020em` | "Final Assessment", "Congratulations, Learner!" |
| **Card Heading (H3)** | Plus Jakarta Sans | `18px (1.125rem)` | 700 Bold | 1.30 | `-0.010em` | Card titles ("Question 4 of 12", "Course Instructor") |
| **Subheading (H4)** | Plus Jakarta Sans | `15px (0.938rem)` | 600 SemiBold | 1.40 | `0.000em` | Module titles, panel section headers |
| **Prose / Body Regular** | Plus Jakarta Sans | `14px (0.875rem)` | 400 Regular | 1.60 | `+0.005em` | Explanations, assessment prompts, syllabus copy |
| **Body Small / Meta** | Plus Jakarta Sans | `13px (0.813rem)` | 500 Medium | 1.45 | `+0.010em` | Subtitles, helper hints, right-rail metadata |
| **Tag & Micro Label** | Plus Jakarta Sans | `11px (0.688rem)` | 600 SemiBold | 1.30 | `+0.025em` | Status badges, category pills, table headers |
| **Code & Invariants** | JetBrains Mono | `13px (0.813rem)` | 400 Regular | 1.55 | `0.000em` | Python code blocks, IDs, test cases |

### C. Spacing Scale (4px Baseline)
* `--space-1`: `4px`
* `--space-2`: `8px`
* `--space-3`: `12px`
* `--space-4`: `16px`
* `--space-5`: `20px`
* `--space-6`: `24px`
* `--space-8`: `32px`
* `--space-10`: `40px`
* `--space-12`: `48px`
* `--space-16`: `64px`

### D. Geometry, Borders & Corner Radii
* **Pill / Badge Radius**: `9999px` (Status badges, tags, skill pills, category chips).
* **Inner Component Radius**: `8px` (`rounded-lg` for form inputs, code window buttons, table cells).
* **Card & Module Radius**: `12px` or `14px` (`rounded-xl` for standard content cards, preview containers, test suites).
* **Hero & Modal Radius**: `20px` (`rounded-2xl` for large banners, certificate canvas frame, login dialog).
* **Border Treatment**: Clean 1px hairlines (`border border-[#E8E5DF]`). No heavy 2px borders except for active/focus states.
* **Shadow System**:
  * `--shadow-sm`: `0 1px 2px rgba(15, 17, 23, 0.04)` (Cards, input fields).
  * `--shadow-md`: `0 4px 12px rgba(15, 17, 23, 0.06)` (Dropdowns, floating HUDs).
  * `--shadow-lg`: `0 12px 32px rgba(15, 17, 23, 0.08)` (Certificate canvas, modals).

---

## 3. Persistent Layout & Shell Architecture

### A. Left Navigation Sidebar

```
+-------------------------------------------------------------+
| [CUBE LOGO]  CERTIFY                                        |
|              LEARN • DEMONSTRATE • EARN                     |
|                                                             |
|  [icon]  Dashboard                                          |
|  [icon]  Explore Courses                                    |
|  [icon]  My Learning                                        |
|  [icon]  Assessments                               (ACTIVE) |
|  [icon]  Credentials                                        |
|  [icon]  Progress                                           |
|                                                             |
|  ---------------------------------------------------------  |
|  [star]  AI Tutor / Ask Certify                             |
|  [user]  Profile                                            |
|  [gear]  Settings                                           |
|                                                             |
|  ---------------------------------------------------------  |
|  (DK) Learner Profile                         [logout icon] |
|       learner@certify.edu                                   |
+-------------------------------------------------------------+
```

1. **Width & Inset**: Fixed `240px` width on desktop (`border-r border-[#E8E5DF] bg-[#F8F7F4]`).
2. **Brand Block**:
   - Isometric black cube SVG logo mark (`w-8 h-8`).
   - Wordmark: *"CERTIFY"* (bold uppercase grotesque, `letter-spacing: 0.05em`).
   - Subhead: *"LEARN • DEMONSTRATE • EARN"* (`text-[9px] text-[#8A909E] font-semibold tracking-wider`).
3. **Active Nav Tab State**:
   - Rounded container (`bg-[#EDE9E1]` or `bg-[#E5E0D5]`) with dark text (`text-[#0F1117] font-semibold`).
   - Icon highlighted; active indicator is the full soft-tint pill enclosing icon and label.
4. **Inactive Nav Tab State**:
   - Transparent background, `text-[#525866]`, subtle hover fill (`hover:bg-[#EFECE5] text-[#0F1117]`).
5. **Collapsed Behavior (Focus & Studio Views)**:
   - Sidebar collapses into an icon-only rail (`68px` width) or docks off-canvas with a floating expand trigger (`[>]` / `[<]` button) to maximize focus during coding assessments and Socratic deep dives.
6. **Bottom User Profile Tile**:
   - Circular avatar badge on black `#0F1117` with white text.
   - Candidate Name + Email truncate.
   - External sign-out icon trigger (`w-4 h-4 text-[#8A909E] hover:text-[#0F1117]`).

### B. Top Header & Utility Bar
* **Breadcrumbs**: Explicit chevron trail (`Explore Courses > Python Fundamentals > Result`) in `text-sm text-[#8A909E]` with final segment in `text-[#0F1117] font-semibold`.
* **Universal Search Bar**: Centered rounded pill (`bg-white border border-[#E8E5DF] h-10 px-4 w-96 text-sm`) with magnifying glass icon and placeholder *"Search courses, concepts or ask anything..."*.
* **Top Right Motto**: Italicized serif academic quote: *“A certified you, a more capable tomorrow.”* or *“Discipline today, opportunities tomorrow.”* (`text-xs italic text-[#525866]`).
* **Notification Pill**: Bell icon with unread count bubble (`bg-[#EF4444] text-white text-[10px] w-4 h-4 rounded-full`).

---

## 4. Component Library & Canonical Specifications

### A. Button Variants

1. **Primary Action Button (`.btn-primary`)**:
   - `bg-[#5B4DF0] text-white hover:bg-[#4C3DE0] active:scale-[0.98] transition-all duration-150 font-semibold px-5 py-2.5 rounded-lg text-sm shadow-sm flex items-center gap-2`.
   - Used for: *"Enroll Now →"*, *"Submit Assessment"*, *"View Certificate →"*, *"Run Code"*.
2. **Secondary Outline Button (`.btn-secondary`)**:
   - `bg-white border border-[#D5D1C8] text-[#0F1117] hover:bg-[#F3F1EC] active:scale-[0.98] transition-all font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2`.
   - Used for: *"Download PDF"*, *"Share Result"*, *"Pause"*, *"Reset"*.
3. **Ghost / Action Trigger (`.btn-ghost`)**:
   - `text-[#525866] hover:text-[#0F1117] hover:bg-[#EBE8E1] px-3 py-1.5 rounded-md text-xs font-medium transition-colors`.
4. **Hero Light Pill (`.btn-hero-light`)**:
   - `bg-white text-[#0F1117] hover:bg-neutral-100 font-semibold px-4 py-2 rounded-full text-xs shadow flex items-center gap-1.5`. (e.g. *"Watch Preview 2 min"* inside dark hero banner).

### B. Card Variants

1. **Standard Elevated Content Card**:
   - `bg-white border border-[#E8E5DF] rounded-xl p-6 shadow-sm`.
2. **Value Pillar Card (4-Deck Row)**:
   - `bg-white border border-[#E8E5DF] rounded-xl p-5 flex flex-col items-start gap-3`.
   - Contains a soft tinted icon container (`w-9 h-9 rounded-lg flex items-center justify-center` in lavender, mint, warm peach, or gold).
3. **Hero Preview Banner (Obsidian)**:
   - `bg-[#0C0E14] text-white rounded-2xl p-8 relative overflow-hidden flex justify-between items-center`.
   - Left side: Editorial serif headline (*"Think Build Solve Grow"*), preview pill button.
   - Right side: Python dual-snake graphic or interactive code snippet card (`bg-[#161922] border border-[#262A36] rounded-xl p-4 font-mono text-xs`).

### C. Progress & Meter Components

1. **Circular Radial Meter (87% Overall Result)**:
   - SVG dual-circle track: Light gray background ring (`#E5E7EB`), animated stroke in `#10B981` (stroke-width 8px).
   - Centered numerical label (`text-3xl font-bold text-[#0F1117]`) paired with small subhead *"Overall Score"*.
2. **Horizontal Segmented Progress Bar**:
   - Track: `h-2 w-full bg-[#E5E7EB] rounded-full overflow-hidden`.
   - Fill: `h-full bg-[#5B4DF0] rounded-full` (or `#10B981` when completed).
3. **Connected Evaluation Pipeline**:
   - Horizontal sequence of 5 connected checkpoint cards (*Learning Progress, Chapter Assessments, Practical Project, Final Assessment, AI Viva / Defense*).
   - Connected via hairline arrows (`→`); each card features a small checkmark icon (`w-4 h-4 text-[#10B981]`), bold percentage, and question ratio.
4. **Percentile Distribution Chart**:
   - Bar chart with 7 vertical rounded columns (`bg-[#E5E7EB]`), with candidate's column highlighted in `#5B4DF0` above the label *"YOU"*.

### D. Assessment & Interactive Workspace Components

1. **5-Card Assessment Meta Strip**:
   - 5 equal columns: *12 Questions*, *30 Minutes*, *Mixed Difficulty*, *Credential Integrity* (replaces "Proctored"), and *Passing Criteria (70%+)*.
   - Soft icon background, high-contrast label, and secondary format description.
2. **Coding Question Workspace**:
   - Question title with difficulty pill (`Coding Question` in lavender).
   - Formatted challenge instructions with example box (`bg-[#F9F8F6] border border-[#E8E5DF] p-3 rounded-lg font-mono text-xs`).
   - Integrated IDE Window:
      - Header: `Your Code (Python 3)` with Light/Dark toggle.
      - Dark canvas (`#13151A`), line numbers in `#4B5563`, syntax highlighting.
      - Actions: `▶ Run Code` (purple), `> Run Tests` (outline purple), `↺ Reset` (outline gray).
3. **Interactive Test Case Table**:
   - Tabs: `Test Cases` (active, purple border-b) and `Custom Input`.
   - Table columns: `#`, `Input`, `Expected Output`, `Status`.
   - Status indicators: Gray dot (`Not run`), Green dot (`Passed`), Coral dot (`Failed`).
4. **Assessment Control HUD (Right Rail)**:
   - **Radial Time Remaining Dial**: `24:37` with `⏸ Pause` button.
   - **Progress Counter**: `Question 4 of 12 (35%)`.
   - **Question Number Matrix (12 Tiles)**:
      - Green tile: Answered (`bg-[#10B981] text-white`).
      - White tile with Purple Ring: Current question (`border-2 border-[#5B4DF0] text-[#5B4DF0] font-bold`).
      - Light gray tile: Unanswered (`bg-[#F3F1EC] text-[#525866]`).
      - Yellow dot: Marked for review.
   - **Question Utility Deck**: *Mark for Review*, *Clear Answer*, *Report an Issue*.
   - **Collapsible Instruction Accordion**: Soft blue alert box detailing honor code and passing criteria.

### E. AI Tutor / Learning Studio Components

1. **Socratic Dialogue Pane**:
   - Distinct from generic chatbots: structured inquiry cards instead of casual bubbles.
   - Socratic Mentor badge (`✦ AI Tutor for Python Fundamentals`).
   - Contextual code breakdown cards with copy triggers.
   - Recommended probe pills: *"Explain with a diagram"*, *"Give a practice question"*, *"Show a real-world example"*.
2. **Mastery Ledger Rail**:
   - Concept list with atomic Bayesian Mastery bars (`0.94 P(L) Mastered`).
   - Weak concept alert callout with instant *"Practice Concept"* remediation trigger.
3. **Side-by-side Code Playground**:
   - Collapsible in-line scratchpad allowing candidates to test assumptions before submitting reasoning.

### F. Credential & Verifiable Certificate Components

1. **Certificate Canvas & Border**:
   - Warm parchment backdrop (`#FDF9EC`).
   - Intricate double gold filigree frame with corner ornamental accents.
   - Certify dark navy ribbon hanging seal with gold brand insignia.
   - Centered recipient name in graceful cursive script (**Alex Rivera**).
   - High-contrast serif title (**Python Fundamentals**).
   - Embossed metallic golden medallion with Python logo, stars, and laurel wreath (*"CERTIFY INTERMEDIATE LEVEL"*).
   - Signatures: Academic Director signature stamp with verification ID (`CERT-PY-2026-001842`) and public verification URL.
2. **Verified Credential Reassurance Card**:
   - Soft green container with shield checkmark: *"This credential is officially issued by CERTIFY and can be verified publicly."*
3. **Assessment Evidence Card**:
   - Checkmark itemization verifying all 5 hurdles: *Completed all modules*, *Passed chapter assessments*, *Completed hands-on demonstration*, *Cleared final assessment*, *Defended work in AI viva*.
4. **Skills Demonstrated Badges**:
   - Modular lavender tags (`bg-[#F0EDFF] text-[#5B4DF0] px-3 py-1 rounded-full text-xs font-medium border border-[#E0D8FF]`).

---

## 5. Responsive Behavior & Viewport Breakpoints

| Breakpoint | Target View | Layout Adjustments |
| :--- | :--- | :--- |
| **Desktop Wide (`≥ 1280px`)** | Full 3-Column / Dual Rail | Standard 240px sidebar, expanded center content, 360px right evidence rail. |
| **Desktop / Laptop (`1024px – 1279px`)** | Collapsed HUD | Right assessment / evidence rail collapses below or into drawer; sidebar narrows to 68px icon rail if needed. |
| **Tablet (`768px – 1023px`)** | Stacked Flow | Left sidebar becomes off-canvas drawer accessed via hamburger icon; assessment questions stack above code runner. |
| **Mobile (`< 768px`)** | Single Column Focus | Navigation collapses into bottom/drawer sheet; code editor provides horizontal scrolling; certificate scales with proportional aspect ratio. |

---

## 6. Accessibility & Interaction States

1. **Keyboard Navigation & Focus Visible**:
   - All interactive elements (buttons, inputs, test cases, question tiles) feature a high-contrast focus indicator: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4DF0] focus-visible:ring-offset-2`.
2. **Tactile Micro-Interactions**:
   - Buttons, cards, and number tiles implement an authentic physical press state: `active:scale-[0.98] transition-transform duration-100 ease-out`.
3. **Contrast Compliance**:
   - All text combinations strictly satisfy WCAG AA (minimum 4.5:1 for body copy, 3:1 for large display titles).
4. **Comprehensive Edge States**:
   - **Empty States**: Neutral illustration, instructional title, clear primary CTA.
   - **Loading / Skeleton**: Warm ivory pulsing placeholders (`bg-[#EDE9E1] animate-pulse rounded-lg`).
   - **Diagnostic Error / Remediation**: Non-punitive Socratic explanation with targeted retry triggers.

---

## 7. Canonical Implementation Checklist for Antigravity

- [x] **Color Authenticity**: Use `--certify-bg-canvas` (`#F8F7F4`), `--certify-brand-purple` (`#5B4DF0`), and `--certify-status-success` (`#10B981`).
- [x] **Typographic Pairings**: Editorial serif for page titles, sans-serif for UI labels, monospace for code and IDs.
- [x] **Sidebar Structure**: 240px fixed sidebar with Certify cube logo and user profile at the bottom.
- [x] **Product Progression**: Maintain the 11-step pedagogical path without generic LMS leaderboards or distracting gamification.
- [x] **Assessment HUD**: Circular timer, 12-question interactive grid, and integrated Python 3 code runner.
- [x] **Credential Authority**: Verifiable 5-point evidence checklist and ornamental gold certificate layout with public trust registry verification.
