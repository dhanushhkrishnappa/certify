# CERTIFY — Strict Framer Gallery Visual Fidelity QA Report

## Overview
This QA report documents the strict rebuilding of the CERTIFY landing-page hero storytelling gallery to match the observable geometry, 3D perspective transforms, card proportions, and caption layout of the live Framer reference:
**Reference:** [https://early-help-353129.framer.app/](https://early-help-353129.framer.app/)

---

## 1. Inspection of the Live Reference & Measured Attributes

We inspected the live DOM, computed matrix transforms, perspective parameters, and layout metrics of `https://early-help-353129.framer.app/` using headless browser inspection.

### Key Architectural Findings
1. **Perspective Container:**
   - `perspective: 1300px`
   - `perspective-origin: 50% 50%`
   - `transform-style: preserve-3d`
2. **Card Dimensions & Proportions:**
   - Active Center Card: Width ~520–540px, Height ~340–350px (aspect ratio ~1.53 : 1).
   - Corner Radius: `8px–10px` (`rounded-lg` / `rounded-[10px]`) — NOT oversized 28px/32px containers.
   - Border & Shadow: Crisp white hairline border (`border-white/10` to `border-white/20`) with deep downward shadow (`shadow-[0_24px_60px_-12px_rgba(0,0,0,0.85)]`).
3. **Perspective & Overlap Geometry:**
   - **Active Center (diff = 0):** `translate3d(0, 0, 0) rotateY(0deg) scale(1)`, `blur: 0`, `opacity: 1`, `zIndex: 1000`.
   - **Immediate Right (diff = +1):** Shifted `+245px` X, `-140px` Z, rotated `rotateY(-36deg)`, `scale: 0.88`, `blur: 1.5px`, `opacity: 0.95`, `zIndex: 950`.
     - *Visual Result:* Its left edge sits behind the active card's right edge and appears closer/taller, while its right edge recedes away into the depth.
   - **Immediate Left (diff = -1):** Shifted `-245px` X, `-140px` Z, rotated `rotateY(+36deg)`, `scale: 0.88`, `blur: 1.5px`, `opacity: 0.95`, `zIndex: 950`.
     - *Visual Result:* Its right edge sits behind the active card's left edge and appears closer/taller, while its left edge recedes away into the depth.
   - **Outer Panels (diff = ±2, ±3):** Shifted `±430px`, `±600px`, deeper negative Z-depth (`-280px`, `-420px`), scaled down to `0.78` and `0.67`, progressively blurred (`3.5px` to `7px`), and dimmed.
   - **First / Last Slide Boundaries:** When Slide 01 is active, the left side is completely clean and empty (no duplicate or ghost panels). When Slide 06 is active, the right side is completely clean and empty.
4. **Media Isolation & Caption Separation:**
   - In the reference, the card contains **ONLY** the media (clean image). There is **NO** text overlaid across the media panel.
   - The headline, eyebrow, description, and counter sit in a unified, synchronized caption area **DIRECTLY BENEATH** the active center card.

---

## 2. Implementation Changes & Corrections Made

| Previous Flaw | Root Cause | Rebuilt Implementation |
| :--- | :--- | :--- |
| **Overlaid Text on Cards** | Story copy (eyebrow, large serif headline, paragraph) was rendered inside the card, obscuring the video and graphics. | Removed all text overlays from all 6 media cards. Cards now render pure media. The headline and narrative are moved into the synchronized caption below the deck. |
| **Ghosted Blurred Content** | Inactive cards rendered blurred copies of the active slide's text and background blocks. | Every card renders its own distinct visual media panel. Inactive cards display their own unique graphic or paused video frame. |
| **Incorrect 3D Orientation & Flat Layout** | Side cards lacked proper perspective tilt, Z-depth translation, and overlap. | Replaced transforms with exact matrix-derived calculations (`perspective: 1300px`, `translateZ(-140px * absDiff)`, `rotateY(-sign * 36deg)`, step-wise X translation with overlap). |
| **Oversized Card Container** | Card radius was `28px` with excessive internal padding. | Reduced card corner radius to `rounded-lg sm:rounded-[10px]` with refined `1px` border and deep drop shadow matching the reference. |
| **Caption Position & Stability** | Caption and counter were split above and below the card. | Unified the caption beneath the center card with stable vertical bounds, centered alignment, and synchronized transitions. |

---

## 3. Narrative & Media Matrix

All six story stages now follow the exact editorial copy:

| Slide | Stage | Media Type | Title & Description (Beneath Center Card) |
| :---: | :--- | :--- | :--- |
| **01** | **THE PROBLEM** | **Video 1** (`certify-passive-learning.mp4`) | **Title:** "You watched the lesson. Can you solve it yourself?"<br>**Description:** "A lesson can make a concept feel familiar. Applying it on your own reveals what you truly understand." |
| **02** | **THE GAP** | **Kinetic Graphic** (`StorySlideGap.tsx`) | **Title:** "Completion isn't the same as understanding."<br>**Description:** "Watching introduces an idea. Practice reveals whether you can use it." |
| **03** | **THE SHIFT** | **Video 2** (`certify-practical-learning.mp4`) | **Title:** "Understanding begins *when you try*."<br>**Description:** "Move from watching to working through an idea yourself." |
| **04** | **THE SOLUTION** | **Socratic UI** (`StorySlideSocraticMethod.tsx`) | **Title:** "Learning should respond to you."<br>**Description:** "An AI tutor asks questions, explores your reasoning, and helps you work through what you don't yet understand." |
| **05** | **THE PROOF** | **Proof Progression** (`StorySlideEvidence.tsx`) | **Title:** "Show what you can do."<br>**Description:** "Practice and assessments help turn learning into evidence of what you understand." |
| **06** | **THE OUTCOME** | **Prestige Credential** (`StorySlideOutcome.tsx`) | **Title:** "Learn. Demonstrate. Earn."<br>**Description:** "Your learning and assessment evidence comes together in a credential you can verify."<br>*Actions:* `Explore Courses →` and `Begin Diagnostic →` |

---

## 4. Video Playback Lifecycle Verification

- **Video 1 (`certify-passive-learning.mp4`):**
  - Plays inline, muted, with `object-cover` strictly when `activeSlide === 0`.
  - Paused immediately when user scrolls or drags to any other slide.
- **Video 2 (`certify-practical-learning.mp4`):**
  - Plays inline, muted, with `object-cover` strictly when `activeSlide === 2`.
  - Paused immediately when user moves to any other slide.
- **No Secondary Video Instances:** Both videos exist once in the DOM, maintaining playback state without recreation.

---

## 5. Visual QA & Screenshot Matrix

Screenshots were captured programmatically via Puppeteer at desktop (`1440x900`) and mobile (`390x844`):

### Desktop Inspection (1440 x 900)
- **Stage 01:** [`stage_01_problem_desktop.png`](file:///d:/Projects/certify/docs/landing-page/screenshots/hero_gallery/stage_01_problem_desktop.png) — Center card displays passive learning video; left is clean; right cards tilt outward in 3D perspective; caption underneath reads "You watched the lesson. Can you solve it yourself?".
- **Stage 02:** [`stage_02_gap_desktop.png`](file:///d:/Projects/certify/docs/landing-page/screenshots/hero_gallery/stage_02_gap_desktop.png) — Center card displays 4-checkpoint learning path; Slide 01 tilts on the left; Slide 03 tilts on the right.
- **Stage 03:** [`stage_03_shift_desktop.png`](file:///d:/Projects/certify/docs/landing-page/screenshots/hero_gallery/stage_03_shift_desktop.png) — Center card displays hands-on coding video; Slide 02 and Slide 04 layer behind it with perspective tilt.
- **Stage 04:** [`stage_04_solution_desktop.png`](file:///d:/Projects/certify/docs/landing-page/screenshots/hero_gallery/stage_04_solution_desktop.png) — Center card displays Socratic inquiry dialogue chamber.
- **Stage 05:** [`stage_05_evidence_desktop.png`](file:///d:/Projects/certify/docs/landing-page/screenshots/hero_gallery/stage_05_evidence_desktop.png) — Center card displays continuous verification stack graphic.
- **Stage 06:** [`stage_06_outcome_desktop.png`](file:///d:/Projects/certify/docs/landing-page/screenshots/hero_gallery/stage_06_outcome_desktop.png) — Center card displays prestige credential illustration; caption contains `Explore Courses →` and `Begin Diagnostic →`.

### Mobile Inspection (390 x 844)
- **Stage 01 Mobile:** [`stage_01_problem_mobile.png`](file:///d:/Projects/certify/docs/landing-page/screenshots/hero_gallery/stage_01_problem_mobile.png) — Clean media card with inline video, touch-friendly peeking cards, and compact caption.
- **Stage 06 Mobile:** [`stage_06_outcome_mobile.png`](file:///d:/Projects/certify/docs/landing-page/screenshots/hero_gallery/stage_06_outcome_mobile.png) — Credential preview and dual action buttons fully visible within the mobile viewport without overflow.

---

## 6. Interaction & Motion QA

- **Scroll Scrubbing:** Section pins for 2800px using GSAP ScrollTrigger coordinated with Lenis smooth scroll. Scrolling through the section smoothly scrubs cards through the 3D deck and holds on slide 06 before releasing.
- **Drag & Swipe:** Mouse dragging and mobile touch swiping track pointer delta in real time with continuous transform updates and threshold snapping at `45px`.
- **Keyboard Navigation:** `ArrowLeft` and `ArrowRight` advance and retreat slides reliably.
- **Click to Navigate:** Clicking any visible inactive side card jumps directly to that card.
- **Brand Consistency:** Fixed React Bits Silk/Dither shader (`#514369`), transparent navbar with extreme-left pure white burger button and Certify logo, and downstream sections (`ManifestoSection`, `Six Pillars`, `ScrollStack`, footer) remain fully intact and operational.

---

## 7. Build Results
- **TypeScript:** `npx tsc --noEmit` runs with **0 errors**.
- **Console Errors:** No JavaScript runtime exceptions or unhandled promise rejections.
