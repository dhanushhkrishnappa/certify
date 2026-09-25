# Certify Visual Language & UX Design System

> **Companion Specification to `/DESIGN.md`**  
> *Authoritative Guide to Interface Ergonomics, Aesthetic Direction, and Interaction Models*

---

## 1. Executive Summary & Design Vision

Online education interfaces are overwhelmingly plagued by two flawed paradigms:
1. **The Passive Streaming Portal**: Dark, video-centric dashboards designed to maximize watch time, punctuated by trivial multiple-choice quizzes.
2. **The Generic SaaS Productivity App**: Bright blue cards, generic charts, and chat interfaces that resemble generic customer support bots.

**Certify breaks radically from both.**

Certify's visual language is engineered around the concept of a **High-Stakes Academic Sanctuary**:
* It evokes the focus of an elite university research library at night.
* It communicates the technological sophistication of modern AI systems without devolving into hackathon neon clichés.
* It presents credentials not as decorative PDF certificates, but as **verifiable architectural blueprints of demonstrated competency**.

---

## 2. Palette Architecture & Semantic Discipline

To cultivate an atmosphere of deep concentration and academic authority, Certify operates on a curated, high-contrast dark spectrum:

```
[ Canvas: #0C0D11 ] ─── [ Layer 1: #13151A ] ─── [ Layer 2: #171922 ] ─── [ Layer 3: #1E222D ]
        │                       │                        │                       │
   Deep Obsidian         Structural Columns       Interactive Surfaces     Dropdowns / Badges
```

### The Five Semantic Color Roles

```
               [ SOFT VIOLET ] ─── AI Intelligence & Inquiry
                     │
 [ MUTED CORAL ] ────┼──── [ ACID LIME ]
Attention / Remediation  │   Mastery / Progress
                     │
               [ WARM IVORY ] ─── Core Learning Prose
```

1. **Warm Ivory (`#FBF9F5` / `#EDE8DF`) — The Surface of Thought**:
   * *Role*: Used for primary reading prose, conceptual explanations, headline typography, and Socratic dialogues.
   * *Psychological Effect*: Warm ivory provides superior legibility against charcoal without the aggressive glare and eye-fatigue of pure `#FFFFFF`.
2. **Soft Violet (`#9D7BFF` / `#7C5CE0`) — The Socratic Presence**:
   * *Role*: Reserved exclusively for the AI tutor: thinking states, Socratic inquiry questions, and cognitive beacons.
   * *Psychological Effect*: Signifies high intelligence, curiosity, and guidance without the clinical coldness of enterprise blue.
3. **Acid Lime (`#D4F65B` / `#B8E332`) — Proven Competency**:
   * *Role*: Unlocked chapters, verified rubric criteria, mastered concept pills, and cryptographic verification seals.
   * *Psychological Effect*: Delivers an unmistakable, high-energy positive reinforcement signal when mastery is earned.
4. **Muted Coral (`#E06A55` / `#F28B7D`) — Constructive Attention**:
   * *Role*: Diagnosed misconceptions, concept remediation notices, and low-confidence warnings.
   * *Psychological Effect*: Coral communicates urgency and guidance without the panic-inducing, punitive feeling of harsh crimson red (`#EF4444`).
5. **Obsidian Charcoal & Deep Plum (`#0C0D11` / `#1A1325`) — The Focus Matrix**:
   * *Role*: Base background canvas and examination/viva chambers.
   * *Psychological Effect*: Absorbs visual noise and directs 100% of cognitive bandwidth toward the learning material.

---

## 3. Product Visual Modes & Screen States

Certify guides the learner through distinct psychological phases. The interface shifts its visual weight to support each mode:

### 1. Marketing Mode (The Academic Proof Screen)
* **Goal**: Establish immediate trust, prestige, and differentiate from video-based certification mills.
* **Hero Treatment**: Asymmetric layout featuring bold editorial typography in warm ivory, backed by a subtle, ambient violet aura (`radial-gradient(circle at 75% 20%, rgba(157, 123, 255, 0.08), transparent 50%)`).
* **Visual Anchors**: Interactive "Evidence Calculator" widget demonstrating how a Certify credential verifies 14 atomic concepts across diagnostic, code execution, and oral defense.

### 2. Discovery Mode (Curated Track Catalog)
* **Goal**: Enable learners to select an engineering specialization based on syllabus rigor and prerequisite depth.
* **Layout**: Multi-column catalog with structured track cards. Each card highlights:
  * Course Track Title & Architectural Scope.
  * Concept Density Meter (e.g., `24 Atomic Concepts`, `3 Verification Tiers`).
  * Explicit Prerequisites (e.g., `Requires Distributed Systems Fundamentals`).
  * Tier Offerings (Foundation, Proficient, Advanced).

### 3. Learning Mode (The 3-Column Studio)
* **Goal**: Facilitate sustained, immersive Socratic dialogues with minimal distraction.
* **Spatial Layout**:
  ```
  +----------------------------------------------------------------------------------------------------+
  | [NAVBAR] Course Title | Module 2: Consensus | Current Concept: Paxos Quorum | Tier: Advanced     |
  +----------------------------------------------------------------------------------------------------+
  | COLUMN 1: CURRICULUM DRAWER  | COLUMN 2: SOCRATIC DIALOGUE PANE     | COLUMN 3: MASTERY LEDGER     |
  | (Width: 300px)               | (Flex: 1, Max-Width: 780px)          | (Width: 340px)               |
  |                              |                                      |                              |
  | • Chapter 1: Introduction    | [AI TUTOR]                           | • Leader Election: 92% [✓]   |
  |   - Concept 1.1 [✓ Mastered] | "In Paxos, how does a proposer know  | • Quorum Formation: 45% [ ]  |
  |   - Concept 1.2 [✓ Mastered] | a majority has promised not to       | • Split-Brain Defense: [ ! ] |
  | • Chapter 2: Quorums [ACTIVE]| accept older proposals?"             |   (Remediation In Progress)  |
  |   - Concept 2.1 [!] Needs Att|                                      |                              |
  |   - Concept 2.2 [ ] In Prog  | [STUDENT INPUT PANE]                 | [CHAPTER CHECK TRIGGER]      |
  |                              | [ Type your architectural rationale] | "Take Chapter Assessment"    |
  +----------------------------------------------------------------------------------------------------+
  ```

### 4. Assessment Mode (Focused Examination)
* **Goal**: Eliminate peripheral distractions to enable rigorous demonstration of understanding.
* **Interface Behavior**:
  * Sidebars smoothly collapse into compact icon rails.
  * Background shifts to deep obsidian (`#0A0B0E`).
  * Question prompt presented in clean editorial typography with explicit rubric criteria shown in a right-hand inspection drawer.
  * Multi-part answer area supporting markdown prose, code editors, or architectural diagram prompts.

### 5. Viva Defense Mode (Oral Capstone Chamber)
* **Goal**: Simulate an authentic oral defense before an expert AI examiner probing architectural trade-offs.
* **Atmosphere**: Deep plum backdrop (`#120D1A`), high contrast, elevated focus.
* **Visual Components**:
  * **AI Presence Waveform**: A dynamic, organic audio waveform pulsating in soft violet during examiner prompts.
  * **Thesis Defense Timeline**: Structured log displaying each defended thesis statement, the AI challenge probe, and the learner's counter-defense.
  * **Conceptual Rigor Meter**: Dynamic real-time meter indicating defense depth, trade-off clarity, and evasion penalties.

### 6. Certification & Public Verification Mode
* **Goal**: Provide an unassailable, high-prestige credential suitable for inclusion on resumes, LinkedIn, and university verification portals.
* **Visual Architecture**:
  * Clean architectural layout featuring guilloche-inspired geometric borders.
  * High-visibility verification status seal in acid lime: **CRYPTOGRAPHICALLY VERIFIED BY CERTIFY PROTOCOL**.
  * Multi-dimensional evidence ledger: Displays breakdown of Chapter Mastery (BKT), Sandbox Execution Tests, Oral Viva Score, and Consistency Index.
  * Public key signature fingerprint and one-click copyable verification URL.

---

## 4. The Certify AI Tutor Visual States

The AI Tutor is an active, conversational mentor. Its visual state reflects its current pedagogical intent:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 1. THINKING STATE                                                                │
│ [∷] Soft violet orbital glyph rotates slowly (1.2s cadence).                     │
│ Message status label: "Synthesizing pedagogical follow-up..."                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 2. STREAMING EXPLANATION                                                         │
│ Text renders with smooth token opacity fade. Code blocks highlight syntax in     │
│ restrained monochrome with lime/violet token highlights.                         │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 3. SOCRATIC PROBE (Action Required)                                              │
│ Left border illuminates with a 3px solid violet rule. Learner response box       │
│ receives subtle violet halo. Status: "Waiting for your justification..."         │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 4. CONCEPT CHECK (Diagnostic Test)                                               │
│ Renders an inline structured diagnostic card containing prompt and criterion.    │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 5. MISCONCEPTION DETECTED (Remediation)                                          │
│ Card transforms with soft coral accent border. Renders encouraging pivot:        │
│ "Interesting perspective. However, notice what happens when node 3 partitions..."│
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Mastery Representation & Knowledge Tracing

Instead of generic circular percentage loaders or progress bars, Certify renders concept mastery through **stateful knowledge tokens**:

### Concept State Representation
1. **Unencountered**: Hollow slate ring (`--primitive-charcoal-700`). Indicates the learner has not yet arrived at this concept in the curriculum.
2. **In Dialogue**: Radial violet progress arc proportional to $P(L)$. Indicates active Socratic exploration.
3. **Needs Remediation**: Coral beacon with pulsing dot. Indicates a failed diagnostic check; clicking opens the targeted remediation pathway.
4. **Mastered**: Solid acid lime pill with checkmark (`P(L) >= 0.85`). Demonstrated competency across explanation, reasoning, and application probes.
5. **Advanced Tier**: Obsidian pill with iridescent lime border (`P(L) >= 0.95` + validated Viva defense).

---

## 6. Credential & Verification Page Guidelines

1. **No Old-Fashioned Parchment Clichés**: Avoid faux-aged paper backgrounds, ribbon graphics, or fake handwriting fonts.
2. **Architectural Grid & Monospace Precision**: Credentials should look like an authoritative technical specification or securities document:
   * Header with Certify Protocol seal and issuance timestamp.
   * Prominent Recipient Name in editorial serif typography.
   * Verified Tier badge: **FOUNDATION**, **PROFICIENT**, or **ADVANCED**.
   * Verifiable Evidence Decomposition Grid.
   * Ed25519 digital signature block with immutable hash.
3. **Public Verification Trust Banner**: When visited by an external employer or faculty member, the page immediately displays a verified badge, signer identity, and verification timestamp with zero login wall.

---

## 7. Responsive Breakpoint & Spatial Behavior

| Viewport | Width | Layout Transformation |
| :--- | :--- | :--- |
| **Desktop (Large)** | $\ge 1440px$ | 3-column studio fully expanded. Max-width container at 1440px. |
| **Desktop (Standard)**| $1024px - 1439px$ | 3-column studio with collapsible right Mastery Drawer (toggled via header icon). |
| **Tablet** | $768px - 1023px$ | 2-column layout: Center dialogue pane with slide-over drawer for curriculum navigation. |
| **Mobile** | $< 768px$ | 1-column responsive layout: Tab bar switching between "Dialogue", "Curriculum", and "Mastery". |

---

## 8. Accessibility & Contrast Assurance

* **Text Contrast**: All body copy in warm ivory (`#F5F3EF` / `#EDE8DF`) on obsidian (`#0C0D11` / `#13151A`) achieves a contrast ratio $> 14:1$, drastically exceeding WCAG AAA standards ($7:1$).
* **Focus States**: Interactive inputs, buttons, and chapter items must display an unmistakable focus ring:
  ```css
  :focus-visible {
    outline: 2px solid var(--primitive-violet-500);
    outline-offset: 2px;
  }
  ```
* **Reduced Motion Support**: All CSS animations and transitions must respect user system preferences:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
