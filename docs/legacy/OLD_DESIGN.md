# Certify Design System & Visual Specification (`DESIGN.md`)

> **Authoritative Design Contract for the Certify Platform**  
> *Version 1.0 — Architecture & Visual Source of Truth*

---

## 1. Design Philosophy & Aesthetic Identity

Certify is an **AI-first interactive learning and certification platform** where credentials represent demonstrated, defensible understanding rather than passive video completion. The visual identity reflects this pedagogical gravity:

* **Intellectual Rigor over SaaS Convenience**: Clean editorial rhythm, elevated typography, and distraction-free spatial composition.
* **Calm Concentration over Gamification**: Muted, high-contrast dark surfaces that prevent fatigue during intensive multi-hour learning sessions.
* **Subtle Futuristic Restraint**: Elegant luminescence, tactile glass surfaces, and purposeful micro-interactions in place of loud, colorful tech clichés.
* **Cryptographic Trust**: Verifiable, architectural credential layouts conveying the prestige of a recognized academic qualification.

### The Anti-Generic Mandate: What Certify Strictly Avoids
| Generic Anti-Pattern | Why It Fails | Certify Mandated Alternative |
| :--- | :--- | :--- |
| **Generic SaaS Blue** (`#2563EB`, `#3B82F6`) | Evokes transactional B2B tools, marketing landing pages, and generic dashboards. | **Near-Black Charcoal & Warm Ivory** foundation accented with deliberate semantic colors. |
| **Purple/Cyan Neon Gradient Soup** | Looks like a novelty Web3 or hackathon AI wrapper. | **Subtle directional luminescence** (max 12% opacity) on deep plum and charcoal canvases. |
| **Cookie-Cutter Rounded Card Grids** | Flattened visual hierarchy where every widget carries identical visual weight. | **Typographic hierarchy, 1px structural hairline rules, and asymmetric spatial zoning**. |
| **ChatGPT Chat Clones** | Passive chat bubbles that feel like generic customer service bots. | **Structured Socratic Mentor UI** with contextual inquiry states, rubrics, and dynamic focus indicators. |
| **Stock Clipart & Flat Illustrations** | Cheapens academic credibility. | **Geometric node graphs, architectural diagrammatic vectors, and typographical proof stamps**. |
| **Raw Math Dumps (BKT Equations)** | Confuses learners with statistical notation. | **Intuitive Concept Mastery Meters, orbital state rings, and actionable remediation prompts**. |

---

## 2. Color System & Semantic Roles

Colors in Certify have **strict semantic duties**. They are never used as arbitrary decoration.

```
+----------------------------------------------------------------------------------------------------+
|                                      SEMANTIC COLOR MATRIX                                         |
+----------------------------------------------------------------------------------------------------+
|  [ SOFT VIOLET ]  -->  AI Intelligence, Socratic Inquiries, Thoughtful Inferences                  |
|  [ ACID LIME ]    -->  Mastery Demonstrated, Positive Progress Delta, Unlocked Milestones          |
|  [ MUTED CORAL ]  -->  Diagnosed Misconceptions, Remediation Triggers, Attention Areas             |
|  [ WARM IVORY ]   -->  Core Learning Content, Prose Readability, Primary Typography                |
|  [ CHARCOAL/PLUM] -->  Deep Focus Canvas, Assessment Modals, High-Concentration Viva Chambers       |
+----------------------------------------------------------------------------------------------------+
```

### A. Primitive Tokens
```css
:root {
  /* Canvas & Neutral Primitives */
  --primitive-charcoal-950: #0C0D11;
  --primitive-charcoal-900: #13151A;
  --primitive-charcoal-850: #171922;
  --primitive-charcoal-800: #1E222D;
  --primitive-charcoal-700: #2B2E3A;
  --primitive-charcoal-600: #424656;
  
  --primitive-slate-400:    #8E93A6;
  --primitive-slate-300:    #B5B8C5;
  --primitive-slate-200:    #D8DAE2;
  
  --primitive-ivory-50:     #FBF9F5;
  --primitive-ivory-100:    #F5F3EF;
  --primitive-ivory-200:    #EDE8DF;
  --primitive-ivory-300:    #DDD9D0;
  
  /* Plum & Deep Accent Primitives */
  --primitive-plum-950:     #120D1A;
  --primitive-plum-900:     #1A1325;
  --primitive-plum-800:     #261A35;
  --primitive-plum-700:     #38264D;

  /* Semantic Accents */
  --primitive-violet-400:   #B399FF;
  --primitive-violet-500:   #9D7BFF;
  --primitive-violet-600:   #7C5CE0;
  --primitive-violet-900:   #231B38;

  --primitive-lime-300:     #E2FA7D;
  --primitive-lime-400:     #D4F65B;
  --primitive-lime-500:     #B8E332;
  --primitive-lime-900:     #1E2806;

  --primitive-coral-300:    #F28B7D;
  --primitive-coral-400:    #E06A55;
  --primitive-coral-500:    #C8503C;
  --primitive-coral-900:    #331510;
}
```

### B. Semantic Mapping Tokens
```css
:root {
  /* Surfaces & Backgrounds */
  --bg-canvas:              var(--primitive-charcoal-950); /* Global Page Backdrop */
  --bg-surface-l1:          var(--primitive-charcoal-900); /* Raised Cards & Columns */
  --bg-surface-l2:          var(--primitive-charcoal-850); /* Nested Panels & Headers */
  --bg-surface-l3:          var(--primitive-charcoal-800); /* Floating Toolbars & Dropdowns */
  --bg-surface-modal:       var(--primitive-plum-900);     /* High-Stakes Assessment & Viva Modals */
  --bg-surface-ivory:       var(--primitive-ivory-100);    /* Editorial Reading Pane (Optional Light Mode) */

  /* Text & Content */
  --text-primary:           var(--primitive-ivory-50);     /* Titles, Headlines, Critical Copy */
  --text-prose:             var(--primitive-ivory-200);    /* Socratic Explanations, Articles, Learning Content */
  --text-secondary:         var(--primitive-slate-400);    /* Subtitles, Metadata, Chapter Labels */
  --text-tertiary:          var(--primitive-charcoal-600); /* Inactive Icons, Micro-timestamps */
  --text-inverse:           var(--primitive-charcoal-950); /* Buttons & Badges with Solid Accents */

  /* Borders & Rules */
  --border-subtle:          rgba(255, 255, 255, 0.06);     /* Default Content Separation */
  --border-medium:          rgba(255, 255, 255, 0.12);     /* Hover State Container Borders */
  --border-focus:           var(--primitive-violet-500);   /* Focus & Active Outlines */

  /* Semantic Action & State Roles */
  --ai-base:                var(--primitive-violet-500);
  --ai-glow:                rgba(157, 123, 255, 0.16);
  --ai-subtle:              var(--primitive-violet-900);

  --mastery-base:           var(--primitive-lime-400);
  --mastery-glow:           rgba(212, 246, 91, 0.18);
  --mastery-subtle:         var(--primitive-lime-900);

  --remediation-base:       var(--primitive-coral-400);
  --remediation-glow:       rgba(224, 106, 85, 0.16);
  --remediation-subtle:     var(--primitive-coral-900);

  --assessment-accent:      var(--primitive-plum-700);
}
```

---

## 3. Typography System & Hierarchy

Certify pairs a modern, ultra-legible geometric grotesque for navigation and interfaces with a refined monospace for technical evidence and code, plus an editorial serif accent for certification authority and course headlines.

### Font Families
* **Primary Sans (Interface & Socratic Dialogue)**: `Plus Jakarta Sans`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
* **Technical Monospace (Evidence, Hashes, Code, BKT States)**: `JetBrains Mono`, `Consolas`, `monospace`
* **Editorial Display Accent (Credentials, Certificates, Module Titles)**: `Newsreader`, `Fraunces`, `Georgia`, `serif`

### Typographic Scale
| Level | Font Family | Size (Desktop) | Size (Mobile) | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Title** | Editorial Serif | `48px (3.0rem)` | `36px (2.25rem)` | 600 SemiBold | 1.15 | `-0.025em` |
| **Page Heading (H1)**| Primary Sans | `36px (2.25rem)`| `28px (1.75rem)` | 700 Bold | 1.20 | `-0.020em` |
| **Section Heading (H2)**| Primary Sans| `26px (1.625rem)`| `22px (1.375rem)`| 600 SemiBold | 1.25 | `-0.015em` |
| **Subheading (H3)** | Primary Sans | `20px (1.25rem)` | `18px (1.125rem)`| 600 SemiBold | 1.30 | `-0.010em` |
| **Card Heading (H4)**| Primary Sans| `16px (1.0rem)`  | `15px (0.938rem)`| 600 SemiBold | 1.35 | `0.000em` |
| **Prose Large** | Primary Sans | `17px (1.063rem)`| `16px (1.0rem)`  | 400 Regular | 1.65 | `+0.005em` |
| **Prose Base** | Primary Sans | `15px (0.938rem)`| `14px (0.875rem)`| 400 Regular | 1.60 | `0.000em` |
| **Caption / Label** | Primary Sans | `13px (0.813rem)`| `12px (0.75rem)` | 500 Medium | 1.40 | `+0.015em` |
| **Micro / Metadata**| Monospace | `11px (0.688rem)`| `10px (0.625rem)`| 500 Medium | 1.30 | `+0.040em` |
| **Code Block** | Monospace | `13.5px (0.84rem)`| `12.5px (0.78rem)`| 400 Regular | 1.55 | `0.000em` |

---

## 4. Spacing Scale, Layout Grid & Elevations

### Spacing Scale (4px Baseline)
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
* `--space-20`: `80px`
* `--space-24`: `96px`

### Layout Grids
* **Global Max-Width**: `1440px` (centered with `padding: 0 32px`)
* **Editorial Max-Width (Course Reader)**: `760px` (optimized for 65–75 characters per line)
* **Learning Studio 3-Column Asymmetric Grid**:
  * **Col 1 (Curriculum Drawer)**: `300px` fixed width (collapsible on tablet)
  * **Col 2 (Socratic Dialogue Pane)**: `flex: 1` (`min-width: 520px`)
  * **Col 3 (Mastery & Evidence Ledger)**: `340px` fixed width (collapsible to right panel)

### Border Radius
* `radius-xs`: `4px` (micro tags, code tags)
* `radius-sm`: `8px` (buttons, input fields)
* `radius-md`: `12px` (inner cards, alert callouts)
* `radius-lg`: `16px` (main containers, modal windows)
* `radius-xl`: `24px` (hero banners, certificate cards)
* `radius-full`: `9999px` (pills, badges, avatars)

### Elevation & Layering
| Level | Token | Surface Color | Border | Shadow | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **L0** | `--elev-l0` | `--bg-canvas` (`#0C0D11`) | None | None | Base page body |
| **L1** | `--elev-l1` | `--bg-surface-l1` (`#13151A`) | `1px solid var(--border-subtle)` | None | Main layout columns, sidebars |
| **L2** | `--elev-l2` | `--bg-surface-l2` (`#171922`) | `1px solid var(--border-subtle)` | `0 4px 20px rgba(0,0,0,0.25)` | Interactive cards, message blocks |
| **L3** | `--elev-l3` | `--bg-surface-l3` (`#1E222D`) | `1px solid var(--border-medium)` | `0 8px 32px rgba(0,0,0,0.35)` | Dropdowns, popovers, drawers |
| **L4** | `--elev-modal` | `--bg-surface-modal` (`#1A1325`) | `1px solid rgba(157,123,255,0.2)` | `0 24px 64px rgba(0,0,0,0.65)` | Assessment and Viva modals |

---

## 5. Animation, Motion & Transitions

Certify uses **purposeful, physical, non-bouncy motion** to communicate state changes:

* **Instantaneous Feedback**: `100ms ease-out` (button press, checkbox toggle)
* **Standard Transition**: `200ms cubic-bezier(0.16, 1, 0.3, 1)` (hover state, menu disclosure)
* **Expressive State Change**: `350ms cubic-bezier(0.16, 1, 0.3, 1)` (modal entrance, tab transition)
* **AI Cognitive Cadence**: `800ms ease-in-out infinite alternate` (subtle aura breathing during tutor inference)

```css
:root {
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-smooth: cubic-bezier(0.4, 0.0, 0.2, 1);
  --transition-fast: 150ms var(--ease-spring);
  --transition-base: 250ms var(--ease-spring);
  --transition-modal: 350ms var(--ease-spring);
}
```

---

## 6. Product-Specific Visual Modes

The Certify application transitions across **six distinct operational modes**. While sharing core tokens, each mode emphasizes distinct ergonomic and psychological goals:

```
[ MARKETING ]      --> Expressive / Editorial / Academic Proof
       ↓
[ DISCOVERY ]      --> Curated Catalog / Structural Overview
       ↓
[ LEARNING ]       --> Calm / Deep Reading / Socratic Partnership
       ↓
[ ASSESSMENT ]     --> Serious / Distraction-Free / Rubric-Driven
       ↓
[ VIVA DEFENSE ]   --> Immersive / High-Stakes / Audio-Visual Presence
       ↓
[ CERTIFICATION ]  --> Cryptographic Authority / Verified Evidence Ledger
```

### 1. Marketing Mode (Landing & Course Overview)
* **Tone**: Academic prestige meets cutting-edge AI.
* **Palette**: High-contrast ivory typography on obsidian charcoal, with subtle violet focal glows and lime proof highlights.
* **Key Components**: Editorial hero narrative, syllabus preview accordion, interactive evidence demonstration widget, live cryptographic verification preview.

### 2. Discovery Mode (Catalog)
* **Tone**: Curated library of rigorous engineering tracks.
* **Palette**: Charcoal-900 surfaces with clear tier insignia (Foundation / Proficient / Advanced).
* **Key Components**: Track cards with explicit prerequisite trees, estimated hours to mastery, concept density counts, and syllabus breakdowns. No marketing fluff cards.

### 3. Learning Mode (The Learning Studio)
* **Tone**: Quiet library reading room with a master private tutor.
* **Palette**: Very calm charcoal canvas (`#0C0D11`), warm ivory prose (`#F5F3EF`), soft violet tutor accents.
* **Layout**: 3-column asymmetric layout. Center reading column is prioritized with high line-height (`1.65`) and constrained width to maximize retention.

### 4. Assessment Mode (Chapter Checks & Practical Sandbox)
* **Tone**: Strict focus, academic examination hall.
* **Palette**: Deeper charcoal background, peripheral elements dimmed to 40% opacity, crisp white test prompt.
* **Key Components**: Concrete rubric evaluation drawer, criterion breakdown (0–100%), targeted feedback cards indicating precise conceptual gaps.

### 5. Viva Defense Mode (Oral Capstone Defense)
* **Tone**: High-stakes thesis defense before a faculty board.
* **Palette**: Plum-950 background with soft violet audio waveform / orbital presence indicator.
* **Key Components**: Real-time transcript with turn-taking latency indicators, live thesis assertion box, AI counter-inquiry probe banner, countdown clock.

### 6. Certification & Public Verification Mode
* **Tone**: Defensible institutional credential, cryptographic security.
* **Palette**: Warm ivory background or high-prestige obsidian parchment, acid lime verification checkmark, Ed25519 hash stamp.
* **Key Components**: Certificate view, credential ID copy pill (`CRT-2026-XXXXX`), cryptographic signature fingerprint, multi-dimensional evidence ledger (Mastery, Practical, Viva, Consistency).

---

## 7. The Certify AI Tutor Visual Language

The AI tutor in Certify is a **Socratic pedagogical mentor**, not a generic conversational assistant. It never uses generic chat bubbles.

### Visual States of the AI Mentor
```
+----------------------------------------------------------------------------------------------------+
| STATE               | VISUAL INDICATOR                    | COLOR / GLOW    | INTERACTION          |
+----------------------------------------------------------------------------------------------------+
| 1. Thinking         | Pulsing Orbital Node (3 dots orbit) | Soft Violet     | Inactive input       |
| 2. Streaming        | Smooth text reveal + subtle cursor  | Warm Ivory/Violet| Reading mode        |
| 3. Explaining       | Structured card + code/diagram      | Neutral Charcoal| Reference content    |
| 4. Asking (Socratic)| Left border highlight (3px violet)  | Violet + Ivory  | Learner response req |
| 5. Checking Concept | Micro-probe pill with option keys   | Neutral-Slate   | Diagnostic test      |
| 6. Weak Concept     | Ambient coral aura alert            | Muted Coral     | Remediation proposal |
| 7. Remediation Mode | "Concept Deep Dive" banner          | Coral-to-Ivory  | Guided re-teach      |
+----------------------------------------------------------------------------------------------------+
```

### The AI Mentor Presence Node
In place of a robot avatar or ChatGPT icon, the AI presence is represented by a **geometric orbital glyph**:
* Three micro concentric rings with an oscillating core.
* Idle state: Steady 10% opacity violet glow.
* Thinking state: Rhythmic orbital rotation (`duration: 1.2s`).
* Probing state: Emits a brief forward ring pulse toward the learner's response box.

---

## 8. Concept Mastery & Knowledge Tracing Visuals

Certify tracks learner understanding using Bayesian Knowledge Tracing ($P(L)$) across atomic concepts. The interface translates these complex probabilities into intuitive visual patterns without confusing mathematical notation.

### Mastery Progression Tokens
| State | Probability $P(L)$ | Visual Badge | Color Token | Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **Unencountered** | $0.00$ | Hollow Gray Ring | `--primitive-charcoal-700` | Concept not yet introduced in curriculum. |
| **In Dialogue** | $0.01 - 0.59$ | Violet Arc (Partial) | `--primitive-violet-500` | Currently being explored with the tutor. |
| **Needs Remediation**| Check Failed | Coral Beacon | `--primitive-coral-400` | Misconception identified; targeted exercise active. |
| **Mastered** | $\ge 0.85$ | Solid Lime Pill + Check | `--primitive-lime-400` | Demonstrated across explain, reason & apply probes. |
| **Advanced Tier** | $\ge 0.95$ + Viva | Luminescent Lime Glyph | `--primitive-lime-300` | Deep architectural defense verified. |

### Visual Components for Mastery
1. **Orbital Mastery Dial**: A compact 24px circular SVG meter displayed beside each concept in the curriculum drawer.
2. **Remediation Pivot Card**: When an error occurs, the tutor does not display a red "WRONG" banner. Instead, it renders a calm **Remediation Card**:
   > *"You identified the symptom correctly, but let's look closer at why the connection pool exhausted. Consider how async handlers yield..."*
3. **Mastery Delta Notification**: A subtle floating pill (`+22% Mastery — Connection Pooling`) that animates upward when a rubric check is satisfied.

---

## 9. Credential & Verification Visual Language

Certificates must look **reputable, institutional, and defensible**.

### Visual Structure of the Credential
```
+----------------------------------------------------------------------------------------------------+
|                                    CERTIFY CREDENTIAL ARCHITECTURE                                 |
+----------------------------------------------------------------------------------------------------+
|  [ HEADER ]       Institutional Seal & Certify Protocol Mark                                       |
|  [ METRIC BAR ]   Credential ID: CRT-2026-9812A | Verified Tier: ADVANCED | Issued: Sep 2026        |
|  [ RECIPIENT ]    "Awarded to Alex Rivera for demonstrated mastery of ..."                         |
|  [ EVIDENCE GRID] Four Verifiable Evidence Proof Columns:                                          |
|                   - Concept Mastery: 100% (14/14 Concepts Validated)                               |
|                   - Chapter Assessments: 94.2% Avg Score                                           |
|                   - Practical Defense: Container Execution Verified                                |
|                   - Oral Viva: 91.0% Architectural Rigor                                           |
|  [ CRYPTO FOOTER] Ed25519 Public Key Fingerprint | Immutable Hash | Verification QR Code           |
+----------------------------------------------------------------------------------------------------+
```

---

## 10. The 10 Ironclad Frontend Design Rules

Every engineer and AI agent writing frontend code for Certify must obey these ten rules:

1. **Every Viewport Has One Visual Anchor**: Never present five equal-weight cards. One element (the active dialogue, the exam question, or the credential) must command primary focus.
2. **Zero Hardcoded Colors**: Always use `var(--bg-canvas)`, `var(--text-primary)`, `var(--mastery-base)`, etc. Never write raw hex colors like `#6366f1` or `#10b981` in JSX style attributes.
3. **Typography Drives Layout**: Establish hierarchy through font size, weight, and letter spacing before adding background boxes, borders, or badges.
4. **Reserve Accent Colors for Semantics**: Do not use lime for decorative icons. Lime is exclusively for verified mastery and positive progression. Violet is exclusively for AI intelligence. Coral is exclusively for remediation.
5. **No Clutter Cards**: Avoid nesting boxes within boxes. Use whitespace (`--space-6` to `--space-8`) and subtle hairline rules (`--border-subtle`) to group related information.
6. **Design the Edge States First**: Every component must have explicitly designed **Empty**, **Loading (Skeleton)**, **Error (Remediation)**, and **Active** states.
7. **Restrained Motion**: Keep UI transitions between 150ms and 250ms. Never use bouncing animations or endless pulsing on stationary content.
8. **High Information Density with Generous Breathing Room**: Monospace metadata must be small (`11px`) and precise, while prose copy must have generous line height (`1.65`) for effortless reading.
9. **Full Keyboard Accessibility**: All interactive triggers must have crisp `:focus-visible` styling (`outline: 2px solid var(--primitive-violet-500); outline-offset: 2px;`).
10. **Mobile & Tablet Coherence**: The 3-column studio must collapse intelligently into drawer-based or tabbed views on screens under `1024px` without losing learning state or conversational continuity.
