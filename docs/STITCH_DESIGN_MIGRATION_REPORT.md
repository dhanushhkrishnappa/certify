# STITCH DESIGN MIGRATION REPORT (`STITCH_DESIGN_MIGRATION_REPORT.md`)

> **Comprehensive Visual Delta & Specification Migration Analysis**  
> *Migration from Legacy Dark Obsidian Design to Canonical Google Stitch Editorial Design System*

---

## 1. Executive Summary

This report establishes the exhaustive differential between the **Legacy CERTIFY Design System** (archived at [`/docs/legacy/OLD_DESIGN.md`](legacy/OLD_DESIGN.md)) and the canonical **Google Stitch Design System** (active at [`/.stitch/DESIGN.md`](../.stitch/DESIGN.md) and mirrored at [`/DESIGN.md`](../DESIGN.md)).

The core transformation replaces the dense dark-mode canvas with a **prestigious warm ivory editorial reading environment** (`#F8F7F4` canvas, `#FFFFFF` elevated cards, `#0F1117` primary ink, `#5B4DF0` royal purple interactive brand, `#10B981` verified mastery, and `#C59B27` academic certificate gold).

---

## 2. Token-by-Token Migration Matrix

### A. Colors & Surfaces

| Design Element | Legacy Design (`OLD_DESIGN.md`) | Canonical Stitch Design (`.stitch/DESIGN.md`) | Rationale & Guidance |
| :--- | :--- | :--- | :--- |
| **Global Canvas** | `#0C0D11` (Obsidian Charcoal 950) | `#F8F7F4` (Warm Ivory Canvas) | Shifts platform from dark gaming/hacker mood to calm, academic editorial authority. |
| **Primary Surfaces** | `#13151A` (Charcoal 900) | `#FFFFFF` (Elevated Pure White) | Crisp contrast against warm ivory canvas; clear container elevation. |
| **Secondary Fills** | `#171922` / `#1E222D` (Charcoal 850/800) | `#F3F1EC` (Soft Ivory Well) | Used for inset wells, secondary pills, table headers. |
| **Inactive / Hover** | `rgba(255, 255, 255, 0.04)` | `#EBE8E1` / `#EFECE5` | Subtle tactile fill for inactive tabs and button hover states. |
| **Sidebar Surface** | `#13151A` | `#F8F7F4` (Matches Canvas) | Seamless left navigation rail divided by 1px hairline border. |
| **Primary Ink (Text)**| `#FBF9F5` (Warm Ivory Text) | `#0F1117` (Deep Obsidian Ink) | Maximum typographic legibility and contrast against white surfaces. |
| **Secondary Text** | `#8E93A6` (Slate 400) | `#525866` (Neutral Slate Body) | High-comfort line reading for body prose and syllabus descriptions. |
| **Muted Metadata** | `#424656` (Charcoal 600) | `#8A909E` (Muted Slate) | Micro-timestamps, inactive chevrons, placeholders. |
| **Brand Primary** | `#9D7BFF` (Soft Violet 500) | `#5B4DF0` (Royal Purple Brand) | Authoritative interactive primary for CTAs, active indicators, and focus rings. |
| **Mastery / Success** | `#D4F65B` (Acid Lime 400) | `#10B981` (Emerald / Forest Mint) | Academic validation color for 100% passed checks, correct answers, and mastery dials. |
| **Warning / Review** | `#E2FA7D` (Lime 300) | `#F59E0B` (Warm Amber) | Marked for review, diagnostic in progress. |
| **Misconception / Error**| `#E06A55` (Muted Coral 400) | `#EF4444` (Crisp Coral / Crimson) | Diagnosed conceptual gaps and test errors requiring remediation. |
| **Code IDE Canvas** | Integrated dark background | `#13151A` (Dark Code Window) | Code editor retains high-contrast dark IDE canvas with `#1B1E26` header bar. |
| **Certificate Gold** | Not defined | `#C59B27` (Filigree Gold) & `#FDF9EC` | Dual gold filigree borders, metallic medallion, and parchment certificate tone. |

---

### B. Typography & Font Families

| Role | Legacy Design | Canonical Stitch Design | Implementation Details |
| :--- | :--- | :--- | :--- |
| **Serif Display (H1)** | `Newsreader` 48px | `Newsreader` / `Merriweather` 38px (2.375rem) | 700 Bold, tracking `-0.025em`, line-height 1.15. Used for course titles, certificate name. |
| **Serif Section (H2)** | `Plus Jakarta Sans` 26px | `Newsreader` / `Merriweather` 28px (1.750rem) | 700 Bold, tracking `-0.020em`, line-height 1.25. Used for "Final Assessment", result titles. |
| **Card Heading (H3)** | `Plus Jakarta Sans` 20px | `Plus Jakarta Sans` 18px (1.125rem) | 700 Bold, tracking `-0.010em`. Used for "Question 4 of 12", track card titles. |
| **Subheading (H4)** | `Plus Jakarta Sans` 16px | `Plus Jakarta Sans` 15px (0.938rem) | 600 SemiBold, tracking `0.000em`. Module headers, section dividers. |
| **Body Prose** | `Plus Jakarta Sans` 17px / line 1.65 | `Plus Jakarta Sans` 14px (0.875rem) / line 1.60 | 400 Regular, `#525866` color, generous line-height for dense conceptual reading. |
| **Meta / Small** | `Plus Jakarta Sans` 13px | `Plus Jakarta Sans` 13px (0.813rem) / line 1.45 | 500 Medium, `#8A909E` color. |
| **Micro Labels & Tags**| `Monospace` 11px | `Plus Jakarta Sans` 11px (0.688rem) / line 1.30 | 600 SemiBold, uppercase, letter-spacing `+0.025em`. Status pills and table headers. |
| **Code & Invariants** | `JetBrains Mono` 13.5px | `JetBrains Mono` 13px (0.813rem) / line 1.55 | 400 Regular. Python code blocks, hashes, test cases. |

---

### C. Spacing Scale

* 4px baseline maintained across both specifications:
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

---

### D. Geometry, Radii, Borders & Shadows

| Attribute | Legacy Design | Canonical Stitch Design | Implementation Notes |
| :--- | :--- | :--- | :--- |
| **Pill Radius** | `radius-full` (`9999px`) | `9999px` | Badges, tags, skill pills, category chips. |
| **Inner Radius** | `radius-sm` (`8px`) | `8px` (`rounded-lg`) | Inputs, code buttons, table cells. |
| **Card Radius** | `radius-lg` (`16px`) | `12px` or `14px` (`rounded-xl`) | Standard content cards, preview containers, test suites. |
| **Hero / Modal Radius**| `radius-xl` (`24px`) | `20px` (`rounded-2xl`) | Large hero banners, certificate canvas frame, login dialog. |
| **Hairline Borders** | `rgba(255, 255, 255, 0.07)` | `1px solid #E8E5DF` | Card dividers, section separation. Clean, light hairlines replace dark alpha borders. |
| **Outlined Inputs** | `rgba(255, 255, 255, 0.14)` | `1px solid #D5D1C8` | Form controls, secondary buttons, question option borders. |
| **Focus Outlines** | `var(--primitive-violet-500)` | `outline-2 outline-[#5B4DF0]` | High-visibility focus ring with 2px offset for keyboard navigation. |
| **Shadows (Small)** | `0 4px 20px rgba(0,0,0,0.25)` | `0 1px 2px rgba(15, 17, 23, 0.04)` | Subtle tactile elevation for white cards. |
| **Shadows (Medium)**| `0 8px 32px rgba(0,0,0,0.35)` | `0 4px 12px rgba(15, 17, 23, 0.06)` | Dropdowns, popovers, floating test dials. |
| **Shadows (Large)** | `0 24px 64px rgba(0,0,0,0.65)` | `0 12px 32px rgba(15, 17, 23, 0.08)`| Certificate canvas, modals. |

---

### E. Navigation & Global Layout

| Component | Legacy Design | Canonical Stitch Design | Details |
| :--- | :--- | :--- | :--- |
| **Sidebar Width** | `260px` | `240px` | Desktop fixed sidebar (`bg-[#F8F7F4] border-r border-[#E8E5DF]`). |
| **Brand Logo** | Glowing purple award icon | Isometric black cube SVG mark | Geometric black cube mark with wordmark "CERTIFY" and subhead "LEARN • DEMONSTRATE • EARN". |
| **Active Nav Indicator** | `bg-surface-l3` (dark gray pill) | `bg-[#EDE9E1]` (soft warm tint) | Full soft-tint pill enclosing icon and label in `#0F1117` font-semibold. |
| **Collapsed Sidebar**| Not fully specified | `68px` icon rail or off-canvas | Collapsible for deep-focus coding and oral viva defense sessions. |
| **Header Layout** | Status pills on right, breadcrumb left | Universal Search Pill + Academic Motto | Centered search bar (`w-96 rounded-full`), breadcrumb trail, and italicized academic motto. |
| **User Profile Tile**| Inset dark card | Pinned bottom tile | Circular avatar (`DK` on black), name, email, and clean sign-out icon trigger. |

---

### F. Button Variants

* **Primary Action (`.btn-primary`)**:
  - Legacy: `#FBF9F5` white-ivory background with black text.
  - Stitch: **`bg-[#5B4DF0]`** royal purple with white text, `hover:bg-[#4C3DE0]`, `active:scale-[0.98]`, `px-5 py-2.5 rounded-lg text-sm shadow-sm`.
* **Secondary Outline (`.btn-secondary`)**:
  - Legacy: Dark translucent background (`rgba(255, 255, 255, 0.04)`).
  - Stitch: **`bg-white border border-[#D5D1C8] text-[#0F1117]`**, `hover:bg-[#F3F1EC]`, `px-4 py-2 rounded-lg text-sm`.
* **Ghost Action (`.btn-ghost`)**:
  - Stitch: `text-[#525866] hover:text-[#0F1117] hover:bg-[#EBE8E1] px-3 py-1.5 rounded-md text-xs`.
* **Hero Light Pill (`.btn-hero-light`)**:
  - Stitch: `bg-white text-[#0F1117] hover:bg-neutral-100 font-semibold px-4 py-2 rounded-full text-xs shadow`.

---

### G. Cards & Structural Elements

* **Standard Content Card**: `bg-white border border-[#E8E5DF] rounded-xl p-6 shadow-sm`.
* **Value Pillar Card (4-Deck Row)**: `bg-white border border-[#E8E5DF] rounded-xl p-5`, soft-tinted icon containers (lavender, mint, warm peach, gold).
* **Obsidian Hero Banner**: `bg-[#0C0E14] text-white rounded-2xl p-8`, editorial headline on left, dual-snake / interactive code card on right.

---

### H. Progress, Meters & Pipelines

* **Circular Radial Meter**: SVG dual-circle track: light gray `#E5E7EB` ring with animated `#10B981` stroke (stroke-width 8px) and centered score (`text-3xl font-bold text-[#0F1117]`).
* **Horizontal Segmented Progress Bar**: `h-2 bg-[#E5E7EB] rounded-full`, fill in `#5B4DF0` (or `#10B981` upon completion).
* **Connected Evaluation Pipeline**: 5 connected horizontal cards (*Learning Progress → Chapter Assessments → Practical Project → Final Assessment → AI Viva / Defense*) linked with hairline arrows (`→`), green checkmark icons, and scores.
* **Percentile Distribution Chart**: 7 vertical rounded columns (`bg-[#E5E7EB]`), with the candidate's column highlighted in `#5B4DF0` above the label *"YOU"*.

---

### I. Assessment Workspace & Controls

* **5-Card Meta Strip**: Equal-width columns: *12 Questions*, *30 Minutes*, *Mixed Difficulty*, *Credential Integrity* (corrected from "Proctored" to represent database-backed Unique Credential ID verification and recorded evidence without unbacked cryptographic claims), and *Passing Criteria* (authoritative threshold determined by the deterministic certification engine, not hardcoded as a fixed product rule in UI).
* **Coding Question Workspace**: Left instructions panel with example box (`bg-[#F9F8F6] border border-[#E8E5DF]`), right integrated dark IDE window (`#13151A`) with Run Code, Run Tests, and Reset actions.
* **Interactive Test Case Table**: `Test Cases` and `Custom Input` tabs, status dots (Gray: Not run, Green: Passed, Coral: Failed).
* **Right Control HUD**: Radial timer dial (`24:37`), 12-tile question matrix (Green: Answered, White with Purple Ring: Active, Gray: Unanswered, Yellow dot: Review).

---

### J. AI Tutor & Learning Studio

* **Socratic Dialogue Pane**: Structured inquiry cards, Socratic mentor badge (`✦ AI Tutor for Python Fundamentals`), contextual code breakdown cards, and prompt recommendation chips (*"Explain with a diagram"*, *"Give a practice question"*).
* **Mastery Ledger Rail**: Concept checklist with atomic Bayesian Mastery bars (`0.94 P(L) Mastered`).
* **Side-by-side Code Playground**: Collapsible in-line scratchpad to test assumptions before submitting reasoning.

---

### K. Credentials & Verifiable Certificate

* **Credential Model**: Described truthfully as **Unique Credential ID**, **database-backed credential verification**, and **recorded certification evidence**. No false claims of Ed25519 or cryptographic hash signing (future cryptographic signing may be added separately).
* **Certificate Canvas**: Warm parchment backdrop (`#FDF9EC`), double gold filigree frame (`#b89758`), navy ribbon hanging seal, centered cursive candidate name, high-contrast serif course title, embossed metallic gold medallion.
* **Verified Reassurance Card**: Soft green container with shield checkmark confirming official issuance and database-backed verification.
* **Assessment Evidence Checklist**: 5-point itemization covering modules, chapter assessments, hands-on demonstration, final assessment, and oral viva.
* **Skills Demonstrated Badges**: Modular lavender tags (`bg-[#F0EDFF] text-[#5B4DF0] border border-[#E0D8FF]`).
