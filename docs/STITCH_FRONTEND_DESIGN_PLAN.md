# Stitch Frontend Design Plan (`STITCH_FRONTEND_DESIGN_PLAN.md`)

> **Comprehensive Visual Architecture, Screen Inventory, and Implementation Roadmap**  
> *Role Separation: Google Stitch (Visual Design Authority) & Antigravity (Architecture & Engineering)*

---

## 1. Executive Summary & Design Governance

This document establishes the binding implementation plan for transitioning Certify’s frontend from the interim prototype into a bespoke, production-grade interface designed by **Google Stitch** and engineered by **Antigravity**.

### The Division of Responsibilities
```
+----------------------------------------------------------------------------------------------------+
|                                    ROLE SEPARATION PROTOCOL                                        |
+----------------------------------------------------------------------------------------------------+
|  GOOGLE STITCH (Visual Designer & Art Director):                                                   |
|  - Explores visual identities, typography rhythm, and spatial composition.                         |
|  - Generates multi-screen design variants and handles design loops.                                |
|  - Authors the visual specification in DESIGN.md.                                                  |
|  - Acts as the primary aesthetic authority.                                                        |
+----------------------------------------------------------------------------------------------------+
|  ANTIGRAVITY (Implementation & Full-Stack Architect):                                              |
|  - Ingests and interprets Stitch screens and design systems.                                       |
|  - Implements modular React 19 + TypeScript components adhering strictly to Stitch tokens.         |
|  - Integrates Express + Prisma SQLite/PostgreSQL APIs and manages client state.                    |
|  - Solves responsive breakpoint layouts, keyboard navigation, and WCAG AA accessibility.          |
|  - Executes automated visual QA and browser regression testing.                                   |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Stitch Project Specification

* **Project Title**: `CERTIFY — AI LEARNING & CERTIFICATION PLATFORM`
* **Target Device Formats**: Desktop (`1440x900`), Tablet (`1024x768`), Mobile (`390x844`)
* **Primary Design System Source**: [`/DESIGN.md`](../DESIGN.md) & [`/docs/CERTIFY_VISUAL_LANGUAGE.md`](CERTIFY_VISUAL_LANGUAGE.md)
* **Underlying Palette**: Obsidian Charcoal (`#0C0D11`), Warm Ivory (`#FBF9F5`), Deep Plum (`#1A1325`), Soft Violet (`#9D7BFF`), Acid Lime (`#D4F65B`), Muted Coral (`#E06A55`).

---

## 3. Four Distinct Art Direction Explorations

To ensure Certify does not fall into the trap of generic AI SaaS or standard LMS templates, Stitch explores **four substantially distinct art directions**:

```
+----------------------------------------------------------------------------------------------------+
| DIRECTION A: EDITORIAL INTELLIGENCE (RECOMMENDED CORE)                                             |
+----------------------------------------------------------------------------------------------------+
| - Philosophy: Elite research journal meets contemporary typography-forward web design.             |
| - Layout: Asymmetric 3-column studio with wide reading gutters (68ch line length).                 |
| - Visual Accents: Warm ivory prose typography, subtle 1px hairline obsidian borders, restrained    |
|   monochrome code blocks with lime proof highlights.                                               |
| - Mood: Calm, scholarly, highly focused, zero visual clutter.                                      |
+----------------------------------------------------------------------------------------------------+
| DIRECTION B: NEO-ACADEMIC MONASTERY                                                                |
+----------------------------------------------------------------------------------------------------+
| - Philosophy: Traditional academic gravitas translated into a digital medium.                      |
| - Layout: Architectural grids with authoritative header blocks and formal evidence stamps.         |
| - Visual Accents: Serif display accents (Newsreader/Fraunces) for course titles and milestones;    |
|   subtle guilloche-inspired watermarks on credentials; deep plum canvas for assessments.           |
| - Mood: Rigorous, institutional, permanent, prestigious.                                           |
+----------------------------------------------------------------------------------------------------+
| DIRECTION C: IMMERSIVE LEARNING STUDIO                                                             |
+----------------------------------------------------------------------------------------------------+
| - Philosophy: The digital cockpit of an expert pair-programming apprentice.                        |
| - Layout: High-density 3-pane layout with collapsable curriculum rail and live BKT mastery ledger. |
| - Visual Accents: Dynamic orbital AI presence node, responsive code-execution pane, interactive   |
|   Socratic diagnostic cards with immediate visual feedback deltas.                                |
| - Mood: Active, tactile, responsive, intellectually stimulating.                                   |
+----------------------------------------------------------------------------------------------------+
| DIRECTION D: EXPERIMENTAL KNOWLEDGE INTERFACE                                                      |
+----------------------------------------------------------------------------------------------------+
| - Philosophy: Concept dependency graph as the primary spatial navigation metaphor.                |
| - Layout: Interactive radial graph connecting atomic concepts; clicking a node zooms into its      |
|   Socratic dialogue session.                                                                       |
| - Visual Accents: Luminescent concept nodes (Hollow $\to$ Violet $\to$ Lime $\to$ Coral), graph    |
|   topology overlays, animated knowledge-propagation pulses.                                       |
| - Mood: Futuristic, exploratory, cutting-edge AI.                                                  |
+----------------------------------------------------------------------------------------------------+
```

### Synthesis Recommendation
We recommend adopting **Direction A (Editorial Intelligence)** as the primary baseline for the Reading & Learning Studio, enhanced with **Direction B's Neo-Academic prestige** for the Credentials & Public Verification pages, and **Direction C's tactile density** for the Chapter Assessment and Viva Defense chambers.

---

## 4. Comprehensive Screen Inventory & Grouping

A total of 23 screens across 6 functional groups are cataloged:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ GROUP 1: PUBLIC & DISCOVERY                                                                      │
│ 1. Landing (Hero narrative, evidence calculator, live verification preview)                      │
│ 2. Course Catalog (Curated engineering tracks, concept density badges, prerequisite trees)       │
│ 3. Course Details (Syllabus deep-dive, tier breakdown, evaluation rubrics, sample viva probes)   │
│ 4. How It Works (Visual explanation of the BKT engine, oral defense, and credential trust)       │
│ 5. Login / Authenticate (Restrained, secure modal with academic/work email verification)          │
│ 6. Register / Onboard (Domain background assessment, track goal selection)                       │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ GROUP 2: LEARNER WORKSPACE                                                                       │
│ 7. Learner Dashboard (Active courses, longitudinal mastery overview, pending chapter checks)     │
│ 8. Diagnostic Pre-Assessment ("Let's see where you're starting" — non-punitive baseline probe)   │
│ 9. Learning Studio (Flagship 3-column asymmetric layout: Curriculum ↔ Dialogue ↔ Mastery)       │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ GROUP 3: ASSESSMENT & DEMONSTRATION                                                              │
│ 10. Chapter Assessment (In-flow transition from learning to demonstration mode)                  │
│ 11. Remediation Studio ("Let's approach this differently" — non-punitive concept pivot)          │
│ 12. Practical Assessment (Sandbox work environment with test runner and rubric drawer)           │
│ 13. AI Viva Defense Chamber ("DEFEND YOUR WORK" — high-concentration oral thesis defense)        │
│ 14. Certification Result (Comprehensive multi-signal evaluation report & tier celebration)       │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ GROUP 4: CREDENTIAL & VERIFICATION                                                               │
│ 15. Certificate View (Architectural credential document with cryptographic watermark)             │
│ 16. Public Verification Ledger (External trust portal displaying verified criteria & audit hash)  │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ GROUP 5: LEARNER ACCOUNT & PORTFOLIO                                                             │
│ 17. Credentials Portfolio (Issued credentials, badge gallery, shareable links)                  │
│ 18. Learner Profile (Mastery history, verified competencies, hours in deep learning)             │
│ 19. Account Settings (Notification cadence, theme preferences, cryptographic key management)     │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ GROUP 6: ADMINISTRATION & PEDAGOGY                                                               │
│ 20. Admin Dashboard (Cohort evidence density, completion with integrity metrics)                │
│ 21. Course Management (Curriculum version control, prerequisite validation)                      │
│ 22. Course Builder (Authoring modules, chapters, atomic concepts, and evaluation rubrics)        │
│ 23. Cohort Analytics (Diagnostic vs final score distributions, remediation efficacy rates)       │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Generated Stitch Screen Assets & Live Registry

All screens below have been authored in Stitch Project `5466241804294606748` under the authoritative Design System asset `assets/950aab624634401a919b3fbad2480538`:

| # | Screen Title | Screen ID | Dimensions | Preview / Artifact |
|---|---|---|---|---|
| **0** | `DESIGN.md` (Anchor Specification) | `17870777997034004061` | `780 x 1768` | [Design Spec](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBKNARIhYXBwX2NvbXBhbmlvbl91c2VyX3VwbG9hZGVkX2ZpbGVzGmgKM3VzZXJfdXBsb2FkZWRfaHRtbF8wMDA2NWMxNjc4YTNjZGNhMDUzYjcyZWExNjAwMTQ5ORILEgcQ-9PIx9sCGAGSASMKCnByb2plY3RfaWQSFUITNTQ2NjI0MTgwNDI5NDYwNjc0OA&filename=&opi=96797242) |
| **1** | `Certify Editorial Landing Page` | `a75d49fa985e47d993059ca51a0384a3` | `2560 x 8224` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1UvGq-P3XliDveMBIpdChUIysXnAyoO37C2GqsY_5NwDsQKHHVKuLAv4KerIGX6GyHrchADNZ1TPu6Daf8_cTRyCZsq3lfg1wUvw78U6zsYj7pMBFw5gvLo2QT-s8OvZTG3TyPmxANK47vK_cigusSDli4LeYkhnJivNRykKbisVmXxv7K7EDBol0_2nPYAlTiR3BtbIu_FetgzoDWthb100udbMDguBKjSmdmqS3zdCM1uik91QbDcPuU) • [HTML](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2FiNTM2NTA2Y2FmNzRiOGM5N2ZkNDQ1NjE1ZTBkMzRhEgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=96797242) |
| **2** | `Certify Course Catalog` | `29bc8fb45c2b45299954f13a0b29b655` | `2560 x 3292` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1UKVVhUQivvzk0ZXGFqNfqZ0BALSYTEFLCC-ldgtz_DgoxPbMZkY8PfcG2x-Oe77EYjeCotPan7EWY25LrZ_rkw0seYzvXJe5FpSl_lRjxZAlIp3aCzL03BeLNG_PFgQ35XPr2OY1Q05SxM7SjOIhNpN6WPK9eR9VtrJ8PzVZVa3lDB9s3CRXDGeTi6ZFjmlYq1IQnbMXQ69LRI_a9KeDRCLmsKRjdtFaTGYkqric0w6y5G1pYNup5xgw) • [HTML](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzA5YjJiNmQ0NzFhYjRiMDVhMjM2YWZkNjk3YjI3NmQ0EgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=96797242) |
| **8** | `Certify Diagnostic Pre-Assessment` | `fbd5e10d00714d43aee75b1bad177a2a` | `2560 x 2932` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1Uv5EFEqMepXOaNCa2sscn0tMnHJ7q_NlGpMMYvPSOmmx4FEnWDdlaV-yY_Kdd5N0wezB6aS2cy_U4jD1Df0fITvJ2bj7DI_VXs-Dn8MwM1oZG-w42g44Mfq0fsLqYcsp8AIdhNO5UNM6JFWawJajFhYJ8te7CzwNsmJokirFDKiTgTMFKh8rDAYLmPTdpoAx6bdEsmMemcF5zpZhNFCOlqLVP_If-xQoQOU0lSM0zJ_3_wH3dx2kBAPx0) • [HTML](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzk0ODdiNDAzYzQzMjRkMjZiMTc5ZTQwZDQ4MmMxOWNiEgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=96797242) |
| **9** | `Certify Learning Studio` (Flagship) | `909e5489e8ae4823a72c28ec5cf301ae` | `2560 x 2048` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1VOSlDsp87SxD2jxIb7vi2XY8__A_zrixff4-FBg26hogHcnf_k4fvfSP2rtzGkF9txI24pE8p8yj16fGzox2opQWIIk9lDKpHIDrdQ9zjvn6AquPzjXn5bS6LAR4oc7QAM66IrgFeRc5MEc9pHASvtl-u-JNQr2xSRO9MnOTS93OxN6mdhnGBRb3hGb1J-01LT46x_niIPzEQxuhBU06loFWcUmrsL1NuDogd2wO6-Pa-zGDcjcTmGOA) • [HTML](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzY1Y2VkNzY1NGVlODQzYmViM2IzNTY5NDkyMTIzZjVlEgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=96797242) |
| **10** | `Certify Chapter Assessment` | `8275d10851394ea98387d9afcbd173db` | `2560 x 3662` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1Vx0iXwbMQqP7eR5jLNCKXNzbP75pHMPepsHemOgaonUJDkyqkIJX2bd9reCgEYSiM3zgKC-XW24ZhhI5kDBvdytzdEroHscqylbTtxavAHIhsO74k2POMl04fH-cfxfDW2WaZgoVTAl2q0zPfEz1MM0UJBorR1zae6JL9HTywm5YKtsuhjswZgQS90ChLL-R9jiG8HBNrCOouEPlOwu-vaHf1NaNA7WAJbmhpZN3KcYSlh-KaloiFZ5t8) • [HTML](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2ZjYzA2ZWNkMmRiZDQ1NDk5ZGE4Mjc0MzNmYjQ3YTE4EgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=96797242) |
| **11** | `Certify Remediation Studio` | `9dbe6f95f15d4a1192cf830875be665a` | `2560 x 3616` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1XeCHJjaE43Cf4CsF7hWI07V_TYlUzohVfnVix7ELf8jXxZ1AdI8fS_05KsSK9ZtJ4G5j0xrOYTZLMC0ZbXsi9rVlVkaMkBi81J4k5ncG3vvfq8GYp3C5le8qDk7sbfW1sH34cwPU17UEO6wwioLN82PTNW8IXVDUH-wX70WjPb4buJ3zTZK6NNNlEOM-jn8jMHSc0tlqfiEZ7HJK9TJzzL7w0rziPTBwKqfuf0FLvC4uGXm8tJIlRyBw) • [HTML](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2UyNmUwNTc4ODA4OTRlNGQ4ZjU2MmEwMWM5MzkwOGEyEgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=96797242) |
| **13** | `Certify Oral Viva Defense Chamber` | `c12056519a5e4613a992dd80f8b66e6d` | `2560 x 3054` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1WiIfYXwKsklwL7lcmcevEdwPX6Zkbh0oOvlsb_M9hMSohx3xfWdFH6G-Mrq8ncGjp07mmKHkoh3tEZXiQ3L9z65Lx1n9CO5tS1QNazl7gv6jGTdx4FDN5gUvF1XbeFTyxUb2Zh6SaWTffBKqK2H1kqugbpkp0bKGjCdc-DinyQ3uhGHQsaz6yNHtjdnIl0cJjKWxqtQAMMPiqaNbqglP5SqCUyGDtRrXbStMFteeJehX5VZP7bm6VaDMA) • [HTML](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzU1YTY2YmRiOWYwZTQxYmM5MmIwNDMzYWY0NWM0Zjg1EgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=96797242) |
| **16** | `Certify Public Credential Ledger` | `be1355baff4f478ba5951c01450cfd97` | `2560 x 4226` | [Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1WeC7LOyliJjSUV1_JPqLcLSuejh9y-nlo3tz2yKDj_g3jbZ7jff12FtpCiNz4l9TmBDLN41O-PmIQ8A6WtHJfWGkfsdcos5hEOtGWDk-KSvPYvA7l5B9OJSFaGNeqhDdeR2dDJ6nJVehfgx_t9Y8a1BXl4JSrWHPHDI8F-dI7vrKUXmGWiT3xTBUfpXHoGXc2vZwzd7wi6PlFrFhPHRDLWzMMyV4C0dxyGM-i5V_0WsIhMGeJ5Il4lHoI) • [HTML](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2YzYjQ1NWRkYzAyNzQ1MGFiNWI5ZWI1Zjk2NGY0YzgxEgsSBxD708jH2wIYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDY2MjQxODA0Mjk0NjA2NzQ4&filename=&opi=96797242) |

---

## 5. Flagship Screen Design Specifications

### A. The Learning Studio (Flagship Screen #9)
* **Psychological Objective**: Make sustained, 2-hour study sessions effortless, distraction-free, and engaging.
* **Layout Geometry**:
  * **Left Column (300px — Curriculum Drawer)**: Displays chapter hierarchy, concept checklist with stateful mastery icons (Unencountered, In Dialogue, Remediation, Mastered).
  * **Center Column (Flex 1, Max 780px — Socratic Dialogue Pane)**: The core conversation surface. Clean editorial line-height (`1.65`), warm ivory prose on charcoal canvas. Displays the AI Presence Node at top.
  * **Right Column (340px — Mastery Ledger)**: Displays real-time understanding metrics for the current chapter: concept breakdown, evidence items verified, and a persistent "Take Chapter Assessment" action trigger.
* **AI Visual States Handled**: Thinking (orbital rotation), Streaming (opacity reveal), Socratic Probe (violet highlight bar), Remediation Trigger (calm coral banner).

### B. Diagnostic Pre-Assessment (Screen #8)
* **Tone**: Welcoming and calibrating.
* **Header Statement**: *"Let's map your existing knowledge foundation to tailor your learning curve."*
* **Design Pattern**: 3–5 progressive conceptual probes (Easy $\to$ Medium $\to$ Hard) to calibrate prior mastery $P(L_0)$ and recommend an initial tier.

### C. AI Viva Defense Chamber (Screen #13)
* **Atmosphere**: Deep Plum (`#120D1A`), high concentration, serious yet supportive.
* **Hero Title**: **"DEFEND YOUR WORK"**
* **Components**:
  1. **Dynamic Audio Waveform**: Pulsing violet organic aura responding to audio synthesis/speech turns.
  2. **Defended Thesis Ledger**: Left sidebar pinning the student's submitted code and architectural assertions.
  3. **Live Counter-Inquiry Stream**: Center dialogue showing the AI examiner probing trade-offs (e.g. *"What happens if node 2 fails during phase 1 of your Paxos implementation?"*).
  4. **Conceptual Rigor Meter**: Top status bar tracking defense depth and clarity.

### D. Public Verification Ledger (Screen #16)
* **Goal**: Immediate, incontrovertible credibility for faculty and hiring managers.
* **Visual Elements**:
  * Prominent **VERIFIED BY CERTIFY PROTOCOL** seal in Acid Lime.
  * Recipient Name in prestigious editorial serif (`Newsreader`).
  * Cryptographic Signature Block (Ed25519 hash + public key fingerprint).
  * 4-Part Evidence Decomposition (Chapter Mastery, Practical Sandbox Tests, Viva Rigor, Consistency Index).

---

## 6. Shared Atomic Component Library

To prevent code duplication and ensure strict token compliance across all 23 screens, Antigravity will build and maintain these core reusable components:

| Component Name | File Target | Responsibilities & Variants |
| :--- | :--- | :--- |
| `AIPresenceGlyph` | `components/ai/AIPresenceGlyph.tsx` | Orbital rotating rings; states: Idle, Thinking, Probing, Remediating. |
| `SocraticMessage` | `components/ai/SocraticMessage.tsx` | Formatted dialogue bubble with prose styling, code syntax, and Socratic highlight bars. |
| `MasteryDial` | `components/mastery/MasteryDial.tsx` | 24px SVG circular meter rendering $P(L)$ probability and state icons. |
| `MasteryLedger` | `components/mastery/MasteryLedger.tsx` | Chapter concept list showing verification status and active focal concept. |
| `RemediationCard` | `components/learning/RemediationCard.tsx` | Coral-tinted guided pivot card explaining alternative conceptual mental models. |
| `EvidenceGrid` | `components/credentials/EvidenceGrid.tsx` | 4-column metric card breakdown used in both certificate and public verification views. |
| `CryptoStamp` | `components/credentials/CryptoStamp.tsx` | Ed25519 signature badge with one-click hash copy and public ledger link. |
| `AudioVisualizer` | `components/viva/AudioVisualizer.tsx` | Concentric audio waveform visualizer for oral defense voice/audio interactions. |
| `RubricDrawer` | `components/assessment/RubricDrawer.tsx` | Slide-over inspector displaying evaluation criteria, weights, and score deltas. |

---

## 7. Design Token Synchronization Strategy

All visual attributes authored in Stitch designs will map 1:1 to CSS Custom Properties in [`frontend/src/index.css`](../frontend/src/index.css):

```css
/* Stitch -> Certify Token Bindings */
--bg-canvas:              #0C0D11;
--bg-surface-l1:          #13151A;
--bg-surface-l2:          #171922;
--bg-surface-modal:       #1A1325;

--text-primary:           #FBF9F5;
--text-prose:             #EDE8DF;
--text-secondary:         #8E93A6;

--ai-base:                #9D7BFF;
--mastery-base:           #D4F65B;
--remediation-base:       #E06A55;

--font-sans:              'Plus Jakarta Sans', sans-serif;
--font-mono:              'JetBrains Mono', monospace;
--font-serif:             'Newsreader', serif;
```

---

## 8. Implementation Order & Staging

Once the Stitch designs are generated and reviewed:

1. **Sprint 1: Design Tokens & Layout Skeleton**
   - Bind CSS tokens in `index.css`.
   - Implement the responsive 3-column Studio grid shell and navigation bar.
2. **Sprint 2: Flagship Learning Studio & Socratic AI States**
   - Implement `AIPresenceGlyph`, `SocraticMessage`, and the 7 AI dialogue states.
   - Connect the curriculum drawer and mastery ledger to existing Express API endpoints.
3. **Sprint 3: Assessment & Remediation Workflows**
   - Build `ChapterAssessmentModal` and `RemediationCard`.
   - Implement the non-punitive diagnostic flow.
4. **Sprint 4: Viva Defense Chamber & Public Verification Ledger**
   - Build `VivaDefenseModal` with the audio presence visualizer.
   - Build `PublicVerifyView` with the architectural certificate and evidence grid.
5. **Sprint 5: Discovery & Catalog Refinement**
   - Refactor `CatalogView` with concept density badges and track prerequisite trees.
