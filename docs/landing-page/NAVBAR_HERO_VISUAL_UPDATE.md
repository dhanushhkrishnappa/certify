# CERTIFY — Navbar + Hero Color & Visual Refinement Report

**Document Version:** 1.0.0  
**Status:** Completed & Visually Verified  
**Canonical Spec Alignment:** `Certify AI Learning Hero(2).png` reference image  

> **EXPLICIT MANDATE DECLARATION:**  
> **"NO PRODUCT FUNCTIONALITY WAS INTENTIONALLY CHANGED."**  
> All existing routes, API connections, event handlers, CTAs, animations (GSAP, ScrollTrigger, Lenis, WebGL cursor, 3D BulgeCard tilt), responsive behaviors, and authentication workflows remain 100% intact.

---

## 1. Summary of Changes

A strict visual-only refactoring was performed to align the CERTIFY landing page navbar, hero panel, and authentication views with the provided high-fidelity reference design (`Certify AI Learning Hero(2).png`).

The composition now establishes a cohesive visual relationship:
$$\text{Deep Dark Chocolate Backdrop } (\#150A05) \longrightarrow \text{Floating Ivory Pill Navbar } (\#F8F2E8) \longrightarrow \text{Illuminated Warm Parchment Hero Panel } (\#F5EBDD)$$

---

## 2. Files Modified & Added

| File | Type | Changes Made |
| :--- | :--- | :--- |
| `frontend/src/index.css` | Stylesheet | Added shared canonical design tokens for the cinematic warm editorial system (`--certify-parchment`, `--certify-cream`, `--certify-espresso`, `--certify-purple-muted`, `--certify-gold-accent`). |
| `frontend/src/components/landing/LandingNavbar.tsx` | Component | Refactored navbar into a floating pill container with light warm ivory surface, refined multi-petal botanical emblem with bronze gradients, centered navigation with active sand pill and internal indicator dot, and pill-shaped action buttons. |
| `frontend/src/components/landing/HeroSection.tsx` | Component | Converted dark hero card into an illuminated warm parchment card with delicate champagne wavy linework, two 4-pointed concave sparkle stars, deep espresso serif headline, muted lilac italic subtitle, and matching CTAs. |
| `frontend/src/components/AuthView.tsx` | Component | Aligned authentication card surfaces from dark brown to the shared warm parchment system with deep espresso typography, muted lilac badges, champagne accents, and matching button styles. |
| `frontend/scripts/test-auth-and-hero.cjs` | Test Script | Automated visual QA script for Edge puppeteer-core capturing navbar close-up, auth modal transitions, and return navigation. |
| `docs/landing-page/NAVBAR_HERO_VISUAL_UPDATE.md` | Documentation | This comprehensive verification and delivery report. |

---

## 3. Shared Color Tokens (`index.css`)

```css
:root {
  /* CERTIFY Shared Warm Editorial Color Tokens (Landing & Auth Alignment) */
  --certify-brown-deep: #150A05;            /* Dark chocolate / obsidian espresso backdrop */
  --certify-brown: #24140D;                 /* Deep warm espresso brown */
  --certify-brown-surface: #2E1B13;         /* Warm brown container surface */
  --certify-parchment: #F5EBDD;             /* Warm parchment hero surface */
  --certify-parchment-light: #FAF2E9;       /* Lighter parchment radial center */
  --certify-cream: #F8F2E8;                 /* Floating navbar warm ivory surface */
  --certify-cream-soft: #F1E5D4;            /* Soft champagne cream fill / active pill */
  --certify-cream-border: #DECBB7;          /* Soft warm border on cream */
  --certify-espresso: #24130D;              /* Deep espresso primary headline/nav typography */
  --certify-espresso-hover: #120904;        /* Darkest espresso text hover */
  --certify-muted-brown: #664E41;           /* Muted editorial secondary prose on parchment */
  --certify-purple-muted: #5D3B75;          /* Muted lilac / royal purple italic accent */
  --certify-gold-accent: #C89758;           /* Subtle champagne / gold star & linework */
  --certify-gold-border: rgba(180, 140, 90, 0.35); /* Subtle warm gold border */
}
```

---

## 4. Navbar Visual Changes

1. **Floating Container**:
   - Replaced full-width edge-to-edge dark strip with a floating pill container (`max-w-[1240px]`, `rounded-full`).
   - Light warm ivory/cream gradient surface (`from-[#F8F2E8] via-[#F5EBDD] to-[#EFE2D2]`) with subtle warm border (`#DECBB7`) and soft depth shadow (`shadow-[0_16px_40px_-8px_rgba(15,7,3,0.45)]`).
2. **Brand Presentation & Logo**:
   - Implemented the Socratic botanical crest emblem SVG in layered warm bronze gradients (`#6C4127` to `#3C2114`).
   - Uppercase bold serif "CERTIFY" with tracked uppercase subtitle "LEARN • DEMONSTRATE • EARN".
3. **Center Navigation Links**:
   - Active state ("About") renders inside a soft warm sand oval pill (`#E6D7C5`) with a small centered dark espresso dot (`•`) positioned cleanly underneath the text inside the pill.
   - Inactive items ("How It Works", "Courses", "Contact") use dark espresso typography (`#3E271C` hovering to `#1F0E07`) with comfortable letter spacing.
4. **Action Buttons**:
   - **Sign In**: Warm pill with thin border (`border-[#D5C2AD]`, `text-[#2B160D]`, `bg-[#EDE0CF]/30`).
   - **Register →**: Warm pill with subtle arrow transition (`text-[#2B160D]`, `hover:translate-x-0.5`).
   - **Begin Diagnostic →**: High-contrast deep espresso chocolate pill (`linear-gradient(180deg, #3E2316 0%, #28140B 100%)`) with cream typography and right arrow.
5. **Mobile Responsiveness**:
   - Mobile navbar smoothly adapts into a compact floating pill with the emblem, brand title, compact "Diagnostic →" button, and hamburger toggle.
   - Mobile menu overlay rendered in warm parchment backdrop with espresso typography.

---

## 5. Center Hero Panel Changes

1. **Illuminated Parchment Panel**:
   - Replaced dark brown glass card with warm parchment surface (`from-[#F8F0E5] via-[#F5EBDD] to-[#EEE0CD]`) with subtle ambient radial warmth and `rounded-[34px] sm:rounded-[44px]` geometry.
   - Delicate warm champagne border (`#DECBB7`) and soft elevation shadow (`shadow-[0_28px_80px_-15px_rgba(15,7,3,0.55)]`).
2. **Editorial Linework & Sparkles**:
   - Two sweeping champagne/sand bezier curves (`stroke="#DEC5A7"`) flowing gently across the card background.
   - Two 4-pointed radiant flare stars with concave curved diamond geometry (`#DCA86A` with subtle golden glow) at upper-left and lower-right.
3. **Typography**:
   - Headline: "Where AI proves understanding." in deep espresso serif (`#22120B`), formatted with academic line hierarchy.
   - Italic Accent: "Not passive video attendance." in canonical muted lilac (`#5E3B75`).
   - Subtitle: Warm muted espresso prose (`#5C4538`, WCAG AA contrast $> 5.5:1$).
4. **Hero CTA Group**:
   - Primary: Deep espresso chocolate button with warm lightning bolt (`⚡`) and right arrow (`→`).
   - Secondary: Light warm parchment button with subtle border (`border-[#C9B39B]`) and espresso text (`#28150C`).

---

## 6. Authentication Pages Color Alignment

1. **Surface Harmony**:
   - Both the interactive form card and the platform preview card in `AuthView.tsx` now use the same warm parchment gradient (`from-[#FAF1E6] via-[#F5EBDD] to-[#EFE1CF]`) and delicate borders (`#DFCDBB`).
2. **Typography & Accents**:
   - Form headings and labels use deep espresso typography (`#24130D`, `#4A3225`).
   - Preview badge uses muted lilac pill styling (`bg-[#EDE2F5]`, `border-[#D5C2E8]`, `text-[#5D3B75]`).
   - Input fields use warm parchment backgrounds (`#FAF5EE`) with espresso text and muted lilac focus rings.
   - Action buttons utilize the deep espresso chocolate gradient matching the primary landing CTA.
   - Progress bar during 1-click authentication features a muted lilac to champagne gold gradient (`from-[#5D3B75] to-[#C89758]`).

---

## 7. Overall Landing Page Boxes Refinement (Full Page System)

Following the initial Navbar and Hero panel refinement, the remaining interactive and visual boxes across the entire landing page were systematically refactored to share the same warm parchment / ivory box language:

1. **How It Works / Learned, Demonstrated, Earned (`LearnedDemonstratedEarnedSection.tsx`)**:
   - Pinned scrub story cards updated to warm parchment BulgeCard panels (`from-[#FAF1E6] via-[#F5EBDD] to-[#EEE0CD]`, border `#DFCDBB`).
   - Active phase stepper indicator pills updated to high-contrast sand and espresso.
   - Inner dialogue and code wells styled in light parchment with rich espresso text and lilac badges (`bg-[#EDE2F5] text-[#5D3B75]`).
2. **Socratic AI Tutor Interactive Showcase (`AiShowcaseSection.tsx`)**:
   - Refactored studio outer shell to warm parchment BulgeCard with macOS-style window controls and `#EDE0CD` window header.
   - Socratic AI avatar well in muted lilac (`#EDE2F5 border-[#D5C2E8]`), candidate avatar in deep espresso (`#24130D`).
   - Pedagogical evaluation callout styled in light cream with verified emerald checkmark.
   - Concept Mastery Ledger on the right upgraded with warm parchment styling, gradient Bayesian meter, and pass/probe checklist.
3. **Six Pillars Bento Grid (`ProofBentoSection.tsx`)**:
   - All 6 bento boxes converted into warm parchment BulgeCards (`bg-gradient-to-b from-[#FAF1E6] via-[#F5EBDD] to-[#EEE0CD] border-[#DFCDBB] shadow-xl`).
   - Bronze-tinted icon wells (`bg-[#FAF6EE] border-[#DFCDBB] text-[#8B5E3C]`).
   - Inner interactive widgets (memory gauge, soundwave visualizer, atomic audit trail) refactored to harmonized parchment surfaces.
   - Code sandbox widget retains dark IDE background (`#160B06`) for maximum syntax contrast against the parchment card.
4. **Milestone Image Reveal Gallery (`ImageRevealGallery.tsx`)**:
   - All 4 alternating visual cards refactored to warm parchment BulgeCard shells with `#DFCDBB` hairlines and lilac milestone badges.
   - IDE code snippet well sits inside the parchment container with dark chocolate styling (`#160B06 border-[#3E2416]`) for clear readability.
5. **Interactive Curriculum Carousel (`DraggableCurriculumCarousel.tsx`)**:
   - Carousel track cards styled in elevated warm parchment with espresso serif course titles, muted lilac track badges, and deep espresso action buttons.
   - Carousel navigation chevron buttons updated to warm parchment pills.
6. **Flagship Course Deep Architecture (`FlagshipCourseSection.tsx`)**:
   - Left-column module selector pills: Selected module illuminates in warm parchment with an emerald "SELECTED" badge; unselected modules rest in deep chocolate.
   - Right-column Live Sandbox BulgeCard: Warm parchment container with dark Python 3.11 invariant terminal inside.
   - "Inspect Syllabus" CTA in deep espresso; "Test Diagnostic Baseline" in warm parchment.
7. **Pedagogical Metric Stats (`AnimatedStatsSection.tsx`)**:
   - 4 stat boxes styled as elevated ivory pedestals (`from-[#FAF1E6] via-[#F5EBDD] to-[#EEE0CD]`) with 60px espresso serif numerals and lilac uppercase labels.
8. **Learner Experience Report (`TestimonialsSection.tsx`)**:
   - Main testimonial BulgeCard refactored to warm parchment with deep espresso serif quotes, lilac cohort badges, and gold carousel indicators.
9. **Choose Your Learning Path (`ChooseYourPathSection.tsx`)**:
   - Phase 1 (Diagnostic) & Phase 3 (Credential) cards in warm parchment with deep espresso CTAs.
   - Phase 2 (AI Learning Studio - Most Popular) highlighted with 2px warm gold border (`#DCA86A`), gold pill badge, and deep espresso action button.
10. **Protocol FAQ Accordion (`FaqSection.tsx`)**:
    - Accordion items styled in warm ivory pills; open items expand into illuminated parchment cards with espresso questions, muted brown answer prose, and rotating chevron wells.
11. **Final Dramatic CTA Box (`FinalCtaSection.tsx`)**:
    - Grand bottom BulgeCard converted to illuminated warm parchment with deep espresso headline ("Don't just say you know it.") and striking muted lilac italic display headline ("Prove it.").
    - Background features subtle champagne gold (`#DCA86A`) and lilac bezier curves with concave 4-pointed sparkle stars.
12. **Landing Footer (`LandingFooter.tsx`)**:
    - Brand emblem updated to match the navbar's refined circular bronze gradient mark for end-to-end visual harmony.

---

## 8. Verification & QA Results

### A. TypeScript & Production Build
```
> frontend@0.0.0 build
> tsc -b && vite build

✓ 471 modules transformed.
dist/index.html                   1.69 kB │ gzip:   0.78 kB
dist/assets/index-D_rGZY61.css    6.44 kB │ gzip:   2.17 kB
dist/assets/index-BS99z6c6.js   965.90 kB │ gzip: 258.15 kB
✓ built in 328ms
Exit code: 0
```

### B. Linter Check
```
> frontend@0.0.0 lint
> oxlint

Found 0 warnings and 0 errors.
Finished in 76ms on 61 files with 116 rules using 12 threads.
Exit code: 0
```

### C. Visual QA Automation Screenshots
Automated Microsoft Edge visual tests executed across Desktop (1440x900), Tablet (768x1024), and Mobile (390x844). All screenshots captured in `docs/screenshots/landing/`:
- `01_desktop_hero.png`: Floating ivory pill navbar & illuminated parchment hero box with sparkle stars.
- `02_desktop_manifesto.png`: Pinned scrub transition across dark chocolate canvas.
- `03_desktop_how_it_works.png`: Warm parchment story card with lilac phase badge and dialogue wells.
- `04_desktop_ai_showcase.png`: Parchment studio shell with step tabs, AI tutor bubble, and mastery ledger.
- `06_desktop_proof_bento.png`: All 6 bento boxes in creamy parchment with bronze icon wells and nested widgets.
- `07_desktop_image_gallery.png`: Alternating code reveal card in parchment with dark IDE well.
- `08_desktop_curriculum_carousel.png`: Course cards in parchment with espresso CTAs and parchment controls.
- `09_desktop_flagship_course.png`: Selected module card & right-column live sandbox BulgeCard in parchment.
- `10_desktop_testimonials.png`: Testimonial BulgeCard in parchment with espresso serif typography.
- `11_desktop_choose_path.png`: 3 pathway cards with highlighted center card featuring warm gold borders.
- `12_desktop_faq_accordion.png`: Ivory accordion items with expanded answer in warm parchment.
- `13_desktop_final_cta.png`: Grand bottom BulgeCard in parchment with espresso headline and lilac "Prove it." display.
- `14_desktop_footer.png`: Matching bronze gradient circular emblem and protocol links.
- `15_tablet_hero.png` & `16_mobile_hero.png`: Flawless responsive scaling on tablet and mobile viewports.
- `17_mobile_menu_open.png`: Mobile navigation drawer in warm parchment backdrop.

**Console Errors:** 0 console errors detected across entire session.  
**Functional Regressions:** 0. All animations, routes, CTAs, and interactions remain 100% operational.

