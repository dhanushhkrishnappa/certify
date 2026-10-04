# CERTIFY Landing Page — Implementation Specification

## 1. Executive Summary

The public landing page for CERTIFY has been completely rebuilt as an editorial, highly animated AI marketing experience that communicates the core promise: **LEARN → DEMONSTRATE → EARN**. 

The design combines high-stakes academic authority with creative-development interaction standards inspired by React Bits, while strictly retaining CERTIFY's warm dark-brown canvas, editorial serif typography (`Newsreader`), Plus Jakarta Sans interface sans, and JetBrains Mono code invariants.

---

## 2. Section Architecture & Narrative Flow

```
[00. NAVBAR] ──────── Fixed, glassmorphic espresso on scroll, traveling indicator, magnetic CTAs
      │
[01. HERO] ────────── Editorial serif display, parallax classroom depth, BulgeCard container
      │
[02. MANIFESTO] ───── Pinned scroll choreography: "Watching lectures is not proof. Understanding is."
      │
[03. CORE STORY] ──── Pinned 3-phase journey: LEARN (01) ➔ DEMONSTRATE (02) ➔ EARN (03)
      │
[04. AI SHOWCASE] ─── Interactive Socratic tutor simulator with typing animation & concept ledger
      │
[05. PROOF BENTO] ─── 6 interactive pillars with sandbox re-runner, viva equalizer, & Ed25519 seal
      │
[06. GALLERY] ─────── Masked clip-path scroll reveals with live code invariant snippets
      │
[07. CAROUSEL] ────── Draggable, momentum-snapping curriculum tracks with keyboard navigation
      │
[08. FLAGSHIP] ────── Python Fundamentals deep architecture with interactive module switcher
      │
[09. STATISTICS] ──── ScrollTrigger animated count-up metrics for real product dimensions
      │
[10. EXPERIENCE] ──── Verified cohort experience reports with carousel pagination
      │
[11. PATHWAYS] ────── Transparent model (Diagnostic ➔ Studio ➔ Qualification) with real CTAs
      │
[12. FAQ] ─────────── Accessible animated accordion answering 8 core architectural questions
      │
[13. FINAL CTA] ───── Grand statement: "Don't just say you know it. Prove it."
      │
[14. FOOTER] ──────── Editorial footer with structured links, protocol status, and legal marks
```

---

## 3. Component Inventory

| Component File | Location | Description |
| :--- | :--- | :--- |
| `LandingPageView.tsx` | `components/` | Main page coordinator; hosts Lenis initialization & section assembly |
| `LandingNavbar.tsx` | `components/landing/` | Sticky nav with traveling indicator, mobile overlay, and magnetic buttons |
| `WebGLCursor.tsx` | `components/landing/webgl/` | Hardware-accelerated fluid particle cursor in CERTIFY palette |
| `BulgeCard.tsx` | `components/landing/webgl/` | 3D perspective card with dynamic radial light flare |
| `HeroSection.tsx` | `components/landing/` | Cinematic introduction with parallax student background & CTAs |
| `ManifestoSection.tsx` | `components/landing/` | Pinned value proposition scroll narrative |
| `LearnedDemonstratedEarnedSection.tsx` | `components/landing/` | Emotional center: pinned 3-stage progression |
| `AiShowcaseSection.tsx` | `components/landing/` | Interactive Socratic studio with live typing & Bayesian ledger |
| `ProofBentoSection.tsx` | `components/landing/` | 6 interactive cards representing defensible qualification |
| `ImageRevealGallery.tsx` | `components/landing/` | Masked clip-path gallery with code invariant assertions |
| `DraggableCurriculumCarousel.tsx` | `components/landing/` | Mouse/touch draggable carousel of engineering tracks |
| `FlagshipCourseSection.tsx` | `components/landing/` | Deep dive into Python Fundamentals with live code preview |
| `AnimatedStatsSection.tsx` | `components/landing/` | ScrollTrigger count-up metrics for authentic product dimensions |
| `TestimonialsSection.tsx` | `components/landing/` | Candidate experience reports from verified engineering cohorts |
| `ChooseYourPathSection.tsx` | `components/landing/` | Transparent pathways (Diagnostic, Studio, Certification) |
| `FaqSection.tsx` | `components/landing/` | Accessible accordion with animated height transitions |
| `FinalCtaSection.tsx` | `components/landing/` | High-impact bottom CTA with ambient glow and magnetic buttons |
| `LandingFooter.tsx` | `components/landing/` | Multi-column protocol footer with real route navigation |

---

## 4. Route Mappings & CTA Functionality

Every button and link on the landing page connects to authentic application actions without dead clicks or dummy handlers:

| CTA / Link | Target Action | Behavior |
| :--- | :--- | :--- |
| **Begin 7-Min Diagnostic** | `onBeginDiagnostic` | Unauthenticated: routes to Auth gateway; Authenticated: routes to `/diagnostic` |
| **Explore Curriculum** | `onExploreCourses` | Unauthenticated: routes to Auth gateway; Authenticated: routes to `/catalog` |
| **Inspect Syllabus & Rubrics** | `onSelectCourse(slug)` | Sets active course slug and opens `/course-details` |
| **Sign In** | `onSignIn` | Opens `/auth` in login mode |
| **Register** | `onRegister` | Opens `/auth` in signup mode |
| **About Anchor** | `#manifesto` | Smooth Lenis scroll to Manifesto section |
| **How It Works Anchor** | `#how-it-works` | Smooth Lenis scroll to Pinned Story section |
| **Courses Anchor** | `#courses` | Smooth Lenis scroll to Draggable Curriculum Carousel |
| **Proof Architecture Anchor** | `#pedagogy` | Smooth Lenis scroll to Bento Grid |
| **FAQ Anchor** | `#faq` | Smooth Lenis scroll to FAQ Accordion |

---

## 5. Dependencies Added

- `three`: `^0.183.1` — Three.js foundational 3D graphics support
- `@types/three`: `^0.183.1` — Full TypeScript typings for Three.js
- Existing motion libraries utilized: `gsap`, `lenis`, `motion`, `lucide-react`.

---

## 6. Known Limitations & Deliberate Boundary Decisions

1. **Non-Simulated Real-World Claims**: In strict accordance with the product integrity directive, all statistics communicate genuine platform dimensions (6 evidence signals, 1 continuous journey, 14 unit invariants, 100% defensibility) rather than fake learner counts or placement percentages.
2. **Product Demonstration Labeling**: The interactive Socratic AI tutor showcase is explicitly labeled as an "INTERACTIVE PRODUCT DEMONSTRATION" with deterministic simulated dialogue turns reflecting actual backend prompt behaviors.
3. **Touch Device Optimizations**: The WebGL fluid cursor and 3D card bulge tilt are automatically disabled on touch devices and narrow viewports ($< 768px$) to maintain 60–120 FPS performance on mobile devices.
