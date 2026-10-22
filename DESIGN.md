# CERTIFY Canonical Design System (`DESIGN.md`)

> **Authoritative Visual Source of Truth for CERTIFY**  
> *Consolidated design specifications across all screens: Dashboard, Explore Courses, Course Details, My Learning, Learning Studio / AI Tutor, Assessments, Certification Result, Credentials, and Credential Details.*

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
Fixed `240px` width on desktop (`border-r border-[#E8E5DF] bg-[#F8F7F4]`).
1. **Brand**: Isometric black cube SVG logo mark (`w-8 h-8`), "CERTIFY", "LEARN • DEMONSTRATE • EARN".
2. **Main Navigation**: Dashboard, Explore Courses, My Learning, Assessments, Credentials, Progress.
3. **Secondary Actions**: AI Tutor / Ask Certify, Profile, Settings.
4. **Bottom Tile**: Circular avatar badge, candidate name/email, sign-out icon.
5. **Collapsed State**: Collapses into a 68px icon rail or off-canvas drawer during deep-focus coding and viva sessions.

### B. Top Header & Utility Bar
* **Breadcrumbs**: Chevron trail in `text-sm text-[#8A909E]`.
* **Universal Search Bar**: Centered rounded pill (`bg-white border border-[#E8E5DF] h-10 px-4 w-96 text-sm`).
* **Academic Quote**: Italicized quote: *“A certified you, a more capable tomorrow.”*
* **Notifications**: Bell icon with unread bubble.
