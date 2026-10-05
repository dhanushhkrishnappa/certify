# CERTIFY — Six Pillars Accordion Gallery Implementation & QA Report

**Final Status: PASS**  
**Date:** 2026-10-05  
**Component:** `AccordionGallery` (React Bits Architecture for Certify)  
**Location:** Section `#pedagogy` on the Landing Page  

---

## 1. Executive Summary

The previous 3 × 2 bento grid on the CERTIFY landing page has been replaced by a high-fidelity **Accordion Gallery** based directly on the [React Bits AccordionGallery](https://reactbits.dev/components/accordion-gallery) component. 

The implementation features 6 cinematic image-backed panels representing the six pillars of Certify's pedagogical model. Inactive panels remain narrow, tilted in 3D space, desaturated (grayscale), and dimmed, while the active panel smoothly expands via GSAP flex-grow reallocation, restores natural color, flattens to 0° rotation, and reveals a champagne gold accent bar and typography.

---

## 2. Implementation Files

| File | Purpose |
|------|---------|
| [`AccordionGallery.tsx`](file:///d:/Projects/certify/frontend/src/components/landing/AccordionGallery.tsx) | Port of the React Bits component to TypeScript, implementing flex-grow GSAP timelines, parallax image drift, 3D tilt, and keyboard/touch navigation. |
| [`AccordionGallery.css`](file:///d:/Projects/certify/frontend/src/components/landing/AccordionGallery.css) | Core 3D perspective layout, grayscale/dimming CSS variables, bottom readability gradient overlays, and mobile breakpoints. |
| [`ProofBentoSection.tsx`](file:///d:/Projects/certify/frontend/src/components/landing/ProofBentoSection.tsx) | Parent container hosting the gallery with GSAP scroll-triggered entrance and updated section header. |
| `frontend/public/pillars/*.jpg` | Six dedicated high-resolution 3:4 cinematic assets generated specifically for CERTIFY's six pillars. |

---

## 3. Dependency Changes

- **No new external libraries installed.**
- Utilized the pre-existing GSAP 3.15.0 dependency (`import { gsap } from "gsap"`).
- Zero third-party bloat or external image dependencies.

---

## 4. Exact Animation & Layout Parameters

| Parameter | Value | Rationale / Behavior |
|-----------|-------|----------------------|
| `duration` | `0.6s` | React Bits standard transition duration for physical smoothness. |
| `ease` | `"power3.out"` | Deceleration curve ensuring natural momentum on expansion. |
| `expandRatio` | `0.52` | Expanded panel occupies ~52% of the row width, leaving ~48% shared by 5 collapsed panels. |
| `parallax` | `0.5` | Subtle horizontal/vertical image drift inside the expanding/collapsing container. |
| `tilt` | `8°` | Panels to the left of the active panel tilt +8° on `rotateY`; panels to the right tilt -8°. |
| `stagger` | `0.06s` | Staggered reveal between the champagne accent bar and the caption text. |
| `gap` | `10px` | Tight, cohesive gap preserving the feeling of one unified physical installation. |
| `radius` | `16px` | Smooth rounded panel corners. |
| `perspective` | `1400px` | 3D depth field applied to the `.accordion-gallery` root container. |
| `grayscale` | `true` | Collapsed panels set `--ag-gray: 1` (`filter: grayscale(1)`), expanded sets `--ag-gray: 0`. |
| `dimming` | `0.38` | Inactive panels dim to 38% opacity over a dark espresso overlay. |

---

## 5. Panel Content & Asset Mapping

| # | Pillar Title | Sublabel / Supporting Copy | Local Asset Path |
|---|--------------|---------------------------|-------------------|
| **01** | **AI-Guided Learning** | *"Learn through an AI tutor that adapts to you."* | `/pillars/pillar-01-ai-guided.jpg` |
| **02** | **Adaptive Progress** | *"Your learning path evolves with your understanding."* | `/pillars/pillar-02-adaptive.jpg` |
| **03** | **Chapter Assessment** | *"Check understanding before moving forward."* | `/pillars/pillar-03-chapter-assessment.jpg` |
| **04** | **Practical Demonstration** | *"Apply what you've learned in practice."* | `/pillars/pillar-04-practical-demo.jpg` |
| **05** | **Evidence Trail** | *"Learning and assessment build evidence over time."* | `/pillars/pillar-05-evidence-trail.jpg` |
| **06** | **Verified Credential** | *"Earn a credential backed by your learning evidence."* | `/pillars/pillar-06-verified-credential.jpg` |

---

## 6. Comprehensive QA Test Results

### A. Desktop QA (1440 × 900)
- **Default Load State**: Panel 01 is expanded by default (`defaultIndex = 0`). Remaining 5 panels are collapsed, dimmed, tilted, and grayscale.
- **Hover Transitions**: Tested rapid pointer movement across panels 01 → 02 → 03 → 04 → 05 → 06 → 01. Transitions executed without flicker, hitching, or layout jumps.
- **GSAP Timelines**: Active timeline is killed before creating the next timeline (`tlRef.current?.kill()`), avoiding animation collisions or memory leaks.
- **Horizontal Overflow**: `document.documentElement.scrollWidth === window.innerWidth` (`hasHorizontalOverflow: false`).

### B. Mobile QA (390 × 844 iPhone Viewport)
- **Responsive Stacking**: Under 768px, `.accordion-gallery` switches to `flex-direction: column`.
- **Collapsed Strip Height**: Collapsed panels collapse to clean horizontal preview strips (96px height).
- **Expanded Panel**: Tapping a panel expands it to 220px height, smoothly restoring color and displaying the title and sublabel.
- **Touch / Tap Interaction**: Immediate response with no double-tap requirement or 300ms mobile delay.

### C. Keyboard & Accessibility QA
- **Tab Focus**: Every panel is keyboard focusable (`tabIndex={0}`, `role="listitem"`).
- **Arrow Keys**:
  - `ArrowRight` / `ArrowDown`: Selects and expands the next panel (wrapping around).
  - `ArrowLeft` / `ArrowUp`: Selects and expands the previous panel (wrapping around).
- **ARIA Attributes**: `aria-current="true"` on the expanded panel, meaningful `aria-label` including number and pillar name.
- **High-Contrast Focus Ring**: Accessible champagne gold focus outline (`0 0 0 2px var(--ag-accent)`).

### D. Reduced-Motion QA
- Supported via `window.matchMedia("(prefers-reduced-motion: reduce)")`.
- When active, duration drops to 0, tilt rotation and stagger are bypassed, ensuring instant, non-disorienting state switches.

### E. Console & Performance QA
- **Console Errors**: **0 errors** recorded during automated headless browser testing.
- **Bundle Build**: `npm run build` completed in **213ms** with zero TypeScript or Vite errors.

---

## 7. Visual Verification Screenshots

Automated browser screenshots captured during live verification:
- `docs/landing-page/screenshots/desktop_default_panel_01.png` (Default state with Panel 01 active)
- `docs/landing-page/screenshots/desktop_panel_03_active.png` (Panel 03 Chapter Assessment active with bilateral 3D tilt)
- `docs/landing-page/screenshots/desktop_panel_06_active.png` (Panel 06 Verified Credential active)
- `docs/landing-page/screenshots/mobile_default.png` (Mobile stacked vertical accordion)
- `docs/landing-page/screenshots/mobile_panel_03_expanded.png` (Mobile tap expansion)

---

## 8. Known Limitations
- The gallery requires JavaScript for the GSAP flex-grow tween. For environments with disabled JavaScript, CSS fallbacks render the panels in a balanced flex layout.
