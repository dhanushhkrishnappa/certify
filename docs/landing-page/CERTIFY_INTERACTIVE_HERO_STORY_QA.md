# CERTIFY — Framer-Style Interactive Hero Story Gallery QA Report

## Executive Summary
This document verifies the complete replacement of the former static hero card on the Certify landing page with a 6-stage interactive editorial story gallery inspired by the reference architecture at [https://early-help-353129.framer.app/](https://early-help-353129.framer.app/).

The storytelling experience guides the visitor through the transformation from passive lesson consumption to verifiable mastery, reinforcing the core Certify promise: **LEARN → DEMONSTRATE → EARN**.

---

## 1. Reference Behavior Observed & Recreated

From inspecting and recording the live Framer reference (`https://early-help-353129.framer.app/`), the following key behaviors and characteristics were mapped and faithfully reproduced:

| Characteristic | Reference Behavior | Implemented Certify Implementation |
| :--- | :--- | :--- |
| **Stage Composition** | 3D perspective card deck with horizontal offset and depth scaling | 3D transform (`perspective: 1200px`, `rotateY`, `scale`, and horizontal peeking offsets) |
| **Card Count** | Sequence labeled `01` through `06` | Exactly 6 story stages (`01 — 06`) |
| **Active / Inactive Treatment** | Active slide in full contrast; adjacent cards scaled down, blurred, and peeking | Active slide with high-contrast border and deep drop-shadow (`shadow-[0_28px_80px...]`); adjacent slides with subtle blur (`2.8px–6px`) and `scale(0.88)` |
| **Scroll Interaction** | Pinned section where wheel/trackpad scrub drives horizontal card deck progression | GSAP ScrollTrigger pinning (`pin: true`, scrub: `0.5`) synchronized with Lenis smooth scroll |
| **Drag Interaction** | Pointer drag on gallery cards with momentum threshold snapping | Native pointer events (`onPointerDown`, `onPointerMove`, `onPointerUp`) with pointer capture and drag-delta threshold snapping |
| **Keyboard Interaction** | Left / Right arrow navigation | `ArrowLeft` / `ArrowRight` window key listeners bound to `goToSlide` |
| **Direct Navigation** | Bottom sequence counter and interactive dot pagination | Animated sequence indicator (`THE PROBLEM 01 — 06`, etc.) and jump pills for instant access |
| **Interaction Cue** | Top-right uppercase indicator with pulsing dot | "● SCROLL / DRAG" indicator with pulsating champagne badge |
| **Natural Release** | Hero section holds on slide 06, then unpins into normal page scroll | Anticipate-pin hold up to 88% scroll progress, releasing smoothly into `ManifestoSection` |

---

## 2. Component Structure & Architecture

```
frontend/
├── public/
│   └── videos/
│       ├── certify-passive-learning.mp4     # Video 1: Passive lesson watching (Slide 01)
│       └── certify-practical-learning.mp4    # Video 2: Hands-on code problem solving (Slide 03)
└── src/
    └── components/
        └── landing/
            ├── LandingPageView.tsx           # Page coordinator (Lenis, Silk Canvas, Navbar, Hero)
            ├── LandingNavbar.tsx             # Transparent header, white burger button, Sign In / Register
            ├── HeroSection.tsx               # Master 3D perspective deck & GSAP pinning controller
            └── story/
                ├── StorySlideGap.tsx             # Slide 02: Kinetic learning path (WATCH -> ADAPT)
                ├── StorySlideSocraticMethod.tsx  # Slide 04: Animated 3-step Socratic dialogue chamber
                ├── StorySlideEvidence.tsx        # Slide 05: 4-stage verification ledger & proof chain
                └── StorySlideOutcome.tsx         # Slide 06: Prestige credential with functional CTAs
```

---

## 3. The Six-Stage Narrative Flow

| Slide | Stage | Media Type | Eyebrow & Headline | Narrative Description |
| :--- | :--- | :--- | :--- | :--- |
| **01** | **THE PROBLEM** | **Video 1** (`certify-passive-learning.mp4`) | `THE PROBLEM · 01`<br>**"You watched the lesson. Can you use it?"** | Depicts a learner watching an online video lesson on a laptop. Communicates that watching feels like progress, but true understanding requires application. Badge: `WATCHING IS ONLY THE START`. |
| **02** | **THE GAP** | **Custom Kinetic Graphic** | `THE GAP · 02`<br>**"Completion isn't the same as understanding."** | Refined kinetic 4-checkpoint learning path: `WATCH` (completed) → `EXPLAIN` (critical gap) → `APPLY` (untested) → `ADAPT` (adaptive). Illustrates the divergence between passive ingestion and conceptual judgment. |
| **03** | **THE SHIFT** | **Video 2** (`certify-practical-learning.mp4`) | `THE SHIFT · 03`<br>**"Understanding begins *when you try*."** | Depicts hands-on coding and keyboard trial. Shows the visual turning point where passive listening shifts into active construction. Badge: `FROM WATCHING TO DOING`. |
| **04** | **THE SOLUTION** | **Custom UI Graphic** | `THE CERTIFY METHOD · 04`<br>**"Learning should respond to you."** | 3-step Socratic dialogue chamber: AI tutor boundary check (`items = []`), learner reasoning response, and AI follow-up probe (`def summarize(items=None):`). Demonstrates interactive question-led guidance. |
| **05** | **THE EVIDENCE** | **Custom Proof Graphic** | `THE EVIDENCE · 05`<br>**"Show what you can do."** | Dynamic 4-stage assessment progression: `LEARN` → `PRACTICE` → `CHAPTER CHECK` → `DEMONSTRATE`. Node illumination, connecting beam, and proof ledger badge highlight cumulative demonstration. |
| **06** | **THE OUTCOME** | **Prestige Credential Graphic + Dual CTAs** | `THE OUTCOME · 06`<br>**"Learn. Demonstrate. Earn."** | Architectural qualification certificate emerging from dark espresso environment, featuring champagne seal, rubric verification chips, and two functional CTAs: `Begin Diagnostic →` and `Explore Courses →`. |

---

## 4. Video Implementation & Playback Lifecycle

### Storage Locations
- Slide 01: `/videos/certify-passive-learning.mp4` (`frontend/public/videos/certify-passive-learning.mp4`)
- Slide 03: `/videos/certify-practical-learning.mp4` (`frontend/public/videos/certify-practical-learning.mp4`)

### Strict Constraints Enforced
1. **Exactly TWO Video Slides:** Videos are used exclusively in slides 01 and 03. Slides 02, 04, 05, and 06 use custom SVG/CSS/Motion visual graphics.
2. **Synchronized Playback Policy:**
   - When `activeSlide === 0`, `video1Ref` plays; `video2Ref` is paused.
   - When `activeSlide === 2`, `video2Ref` plays; `video1Ref` is paused.
   - For all other slides (`1, 3, 4, 5`), both videos are paused.
3. **Muted Autoplay Compliance:** Both videos specify `muted playsInline loop preload="metadata"`. They play seamlessly across all modern browsers without requiring user gestures.
4. **No Rerender Flickering:** Playback is triggered strictly via an `activeSlide` state dependency hook rather than re-mounting DOM elements.
5. **No Event Blocking:** Pointer capture explicitly excludes interactive `<button>` elements, ensuring dragging, dots, and CTAs never block video playback or navigation.

---

## 5. Animation, Drag, and Scroll Integration

### GSAP ScrollTrigger & Lenis Pinning
The master section uses GSAP ScrollTrigger with `pin: true`:
```ts
const st = ScrollTrigger.create({
  trigger: sectionRef.current,
  pin: true,
  start: "top top",
  end: "+=2800",
  scrub: isReduced ? false : 0.5,
  anticipatePin: 1,
  onUpdate: (self) => {
    if (isDraggingRef.current) return;
    const raw = self.progress;
    const holdEnd = 0.88;
    const floatIndex = raw <= holdEnd ? (raw / holdEnd) * (SLIDES.length - 1) : SLIDES.length - 1;
    setSlideProgress(floatIndex);
    setActiveSlide(Math.round(floatIndex));
  },
});
```

### Drag & Pointer Gestures
Pointer down captures the pointer (`setPointerCapture`) and tracks `deltaX`. Releasing the pointer checks a `45px` threshold:
- Dragging left beyond `-45px` advances to the next slide.
- Dragging right beyond `+45px` retreats to the previous slide.
- Clicking any inactive card directly navigates to that card.

### Keyboard Accessibility
Global `keydown` listeners handle `ArrowRight` and `ArrowLeft` keys smoothly, synchronizing both the slide state and global page scroll via `__lenis.scrollTo()`.

---

## 6. Visual Verification & Screenshot Audit

Screenshots were captured programmatically using Puppeteer at full desktop (`1440x900`, 2x retina) and mobile (`390x844`, 2x retina) viewports.

### Desktop Verification Matrix (1440 x 900)
| Stage | Image File | Video Playback Audit | Status |
| :--- | :--- | :--- | :--- |
| **01 THE PROBLEM** | `stage_01_problem_desktop.png` | Video 1: **Playing** (currentTime: 4.67s), Video 2: **Paused** | ✅ PASS |
| **02 THE GAP** | `stage_02_gap_desktop.png` | Video 1: **Paused**, Video 2: **Paused** | ✅ PASS |
| **03 THE SHIFT** | `stage_03_shift_desktop.png` | Video 1: **Paused**, Video 2: **Playing** (currentTime: 1.00s) | ✅ PASS |
| **04 THE SOLUTION** | `stage_04_solution_desktop.png` | Video 1: **Paused**, Video 2: **Paused** | ✅ PASS |
| **05 THE EVIDENCE** | `stage_05_evidence_desktop.png` | Video 1: **Paused**, Video 2: **Paused** | ✅ PASS |
| **06 THE OUTCOME** | `stage_06_outcome_desktop.png` | Video 1: **Paused**, Video 2: **Paused** (Dual CTAs active) | ✅ PASS |

### Mobile Verification Matrix (390 x 844)
| Stage | Image File | Layout Audit | Status |
| :--- | :--- | :--- | :--- |
| **01 THE PROBLEM** | `stage_01_problem_mobile.png` | Video 1 inline, cinematic dark crop, readable typography | ✅ PASS |
| **02 THE GAP** | `stage_02_gap_mobile.png` | 4 checkpoints scale cleanly into touch container | ✅ PASS |
| **03 THE SHIFT** | `stage_03_shift_mobile.png` | Video 2 inline, headline emphasis visible | ✅ PASS |
| **04 THE SOLUTION** | `stage_04_solution_mobile.png` | Socratic dialogue cards stacked comfortably | ✅ PASS |
| **05 THE EVIDENCE** | `stage_05_evidence_mobile.png` | Linear progress chain with proof markers | ✅ PASS |
| **06 THE OUTCOME** | `stage_06_outcome_mobile.png` | Credential card + both CTAs (`Explore Courses`, `Begin Diagnostic`) fully visible | ✅ PASS |

All screenshot assets are archived in `docs/landing-page/screenshots/hero_gallery/`.

---

## 7. Routing & Call-to-Action Validation

On Slide 06 (**THE OUTCOME**):
- **`Begin Diagnostic →`**: Connected to `onBeginDiagnostic`, activating the adaptive diagnostic assessment workflow.
- **`Explore Courses →`**: Connected to `onExploreCourses`, opening the interactive course catalog.
- Both buttons feature hover micro-interactions, active depression feedback (`active:scale-95`), and keyboard focus rings.
- In the transparent header, the extreme-left burger menu button opens the radial navigation sheet, and the `Sign In` / `Register` buttons route to the authentication modals.

---

## 8. Build Results & Console Audit

- **TypeScript Compilation:** `npx tsc --noEmit` runs with **0 errors**.
- **Vite Development Server:** Active with zero HMR degradation.
- **Console Errors:** No JavaScript errors or unhandled exceptions in the hero component.

---

## 9. Conclusion
The Framer-style interactive storytelling hero has been successfully implemented, tested across desktop and mobile, and integrated into the Certify landing page. It faithfully reproduces the 3D perspective deck and scroll/drag interaction of `https://early-help-353129.framer.app/` while maintaining the Certify brand identity, Dither background, and narrative clarity.
