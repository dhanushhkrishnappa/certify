# CERTIFY Landing Page — React Bits Dither Background QA Report

**Date**: 2026-10-05  
**Component**: `CertifyDitherBackground` ([`CertifyDitherBackground.tsx`](file:///d:/Projects/certify/frontend/src/components/landing/CertifyDitherBackground.tsx))  
**Reference**: [React Bits Dither](https://reactbits.dev/c/backgrounds/dither)  
**Status**: Production Ready & Fully Verified

---

## 1. Executive Summary

The landing page background system for CERTIFY was completely transformed from the static `/hero-students.jpg` classroom photo and legacy canvas particle cursor into an ambient, full-page **React Bits Dither** WebGL environment.

The new visual environment provides continuous, subtle, animated warm brown and dark chocolate dithered waves with soft pointer reactivity. The canvas is rendered at `position: fixed` with `pointer-events: none` across the entire landing page, guaranteeing zero interference with UI interactions, while maintaining crisp legibility and aesthetic supremacy for the cream hero panel, typography, and recently deployed Accordion Gallery.

---

## 2. Requirements & Verification Matrix

| Requirement | Status | Evidence |
| :--- | :---: | :--- |
| **Old background removed** | **PASS** | Removed `/hero-students.jpg` and scroll parallax tween from [`HeroSection.tsx`](file:///d:/Projects/certify/frontend/src/components/landing/HeroSection.tsx). |
| **Dither installed** | **PASS** | Implemented [`CertifyDitherBackground.tsx`](file:///d:/Projects/certify/frontend/src/components/landing/CertifyDitherBackground.tsx) with custom Three.js shaders + Bayer 8x8 matrix dithering effect via `@react-three/postprocessing`. |
| **Brown palette applied** | **PASS** | `backgroundColor: [0.045, 0.022, 0.014]` (#0B0604) and `waveColor: [0.22, 0.105, 0.055]` (#381B0E), producing 4 quantized warm chocolate/amber tones without monochrome or neon gaming artifacts. |
| **Mouse interaction works** | **PASS** | Pointer position tracked on `window` and lerped into `mousePos` uniform; subtle wave displacement around cursor with `mouseRadius = 0.32`. |
| **Old cursor removed** | **PASS** | `WebGLCursor` unmounted and removed from [`LandingPageView.tsx`](file:///d:/Projects/certify/frontend/src/components/LandingPageView.tsx). |
| **UI remains clickable** | **PASS** | Canvas container has `pointer-events: none !important;`. Navbar, CTAs, Accordion Gallery, Course Carousel, and FAQ accordion receive 100% of DOM events unblocked. Verified via headless automated click test. |
| **Mobile works** | **PASS** | Tested on 390×844 mobile viewport. Mouse interaction auto-disabled on touch; wave frequency reduced to `2.0` and `pixelSize` scaled to `3` for GPU efficiency. |
| **Reduced motion works** | **PASS** | `prefers-reduced-motion: reduce` halts wave clock time, freezing the background into a static high-aesthetic stipple copperplate texture. |
| **WebGL fallback works** | **PASS** | Built-in `checkWebGLSupport()` and `WebGLErrorBoundary` render a warm radial chocolate CSS vignette fallback if WebGL context is unavailable or fails. |
| **Build passes** | **PASS** | `tsc -b` and `vite build` completed with `0` errors. |
| **Browser QA passes** | **PASS** | Automated browser execution via Microsoft Edge headless runner (`scripts/test-dither-qa.cjs`) completed with `0` console errors and captured high-resolution verification screenshots. |

---

## 3. Files Modified & Added

1. **[`frontend/src/components/landing/CertifyDitherBackground.tsx`](file:///d:/Projects/certify/frontend/src/components/landing/CertifyDitherBackground.tsx)** *(Added)*
   - Full TypeScript port of React Bits Dither with procedural Simplex/FBM wave vertex & fragment shaders.
   - Postprocessing Bayer 8×8 matrix dithering (`RetroEffectImpl extends Effect`).
   - Window-level pointer listener with smooth lerping.
   - Graceful WebGL check and ErrorBoundary fallback.

2. **[`frontend/src/components/LandingPageView.tsx`](file:///d:/Projects/certify/frontend/src/components/LandingPageView.tsx)** *(Modified)*
   - Removed legacy `WebGLCursor` import and render.
   - Added `CertifyDitherBackground` at page root level (`position: fixed; inset: 0; z-index: 0`).
   - Added subtle atmospheric vignette overlay at `z-[1]`.

3. **[`frontend/src/components/landing/HeroSection.tsx`](file:///d:/Projects/certify/frontend/src/components/landing/HeroSection.tsx)** *(Modified)*
   - Removed `bgImageRef` with `/hero-students.jpg` and corresponding GSAP parallax scroll tween.
   - Retained atmospheric espresso and sepia vignette layer, softened to let Dither waves flow through.

4. **Landing Section Backgrounds** *(Modified)*
   - Updated section container backgrounds from solid `bg-[#170C06]` to `bg-[#170C06]/80` (and corresponding values in [`ProofBentoSection.tsx`](file:///d:/Projects/certify/frontend/src/components/landing/ProofBentoSection.tsx), [`AiShowcaseSection.tsx`](file:///d:/Projects/certify/frontend/src/components/landing/AiShowcaseSection.tsx), [`DraggableCurriculumCarousel.tsx`](file:///d:/Projects/certify/frontend/src/components/landing/DraggableCurriculumCarousel.tsx), [`FlagshipCourseSection.tsx`](file:///d:/Projects/certify/frontend/src/components/landing/FlagshipCourseSection.tsx), [`TestimonialsSection.tsx`](file:///d:/Projects/certify/frontend/src/components/landing/TestimonialsSection.tsx), [`ChooseYourPathSection.tsx`](file:///d:/Projects/certify/frontend/src/components/landing/ChooseYourPathSection.tsx), [`FaqSection.tsx`](file:///d:/Projects/certify/frontend/src/components/landing/FaqSection.tsx), [`FinalCtaSection.tsx`](file:///d:/Projects/certify/frontend/src/components/landing/FinalCtaSection.tsx), and [`LandingFooter.tsx`](file:///d:/Projects/certify/frontend/src/components/landing/LandingFooter.tsx)) so the animated dither environment visually connects the entire landing experience.

5. **[`frontend/package.json`](file:///d:/Projects/certify/frontend/package.json)** *(Modified)*
   - Installed `postprocessing`, `@react-three/fiber`, and `@react-three/postprocessing`.

---

## 4. Final Parameter Values & Palette Calibration

```typescript
<CertifyDitherBackground
  waveSpeed={0.032}                 // Restrained, atmospheric wave flow
  waveFrequency={2.8}               // Organic wave density (2.0 on mobile)
  waveAmplitude={0.24}              // Gentle height displacement
  waveColor={[0.22, 0.105, 0.055]}  // Warm roasted chocolate / amber crest
  backgroundColor={[0.045, 0.022, 0.014]} // Deep espresso black base
  colorNum={4}                      // 4-step Bayer quantization
  pixelSize={2}                     // Fine-grain stippling (3 on mobile)
  mouseRadius={0.32}                // Subtle, localized pointer ripple
  enableMouseInteraction={!isMobile} // Disabled on touch devices
  disableAnimation={prefersReducedMotion} // Halts animation when requested
/>
```

---

## 5. Visual QA & Verification Screenshots

Screenshots generated during automated browser verification:
- **Desktop Hero (1440×900)**: `docs/landing-page/screenshots/dither-hero-1440.png`
- **Six Pillars Gallery (1440×900)**: `docs/landing-page/screenshots/dither-pillars-1440.png`
- **Footer & Bottom CTA (1440×900)**: `docs/landing-page/screenshots/dither-footer-1440.png`
- **Mobile Viewport (390×844)**: `docs/landing-page/screenshots/dither-mobile-390.png`

---

## 6. Known Limitations & Performance Observations
- **Single Canvas Instance**: Exactly 1 WebGL canvas runs for the entire page, pinned in place at fixed coordinates, avoiding multi-canvas GPU context switching.
- **Fixed DPR of 1**: Setting `dpr={1}` keeps GPU fragment fill-rate low even on high-density Retina and 4K displays.
- **No Cursor Lockout**: Because pointer tracking runs passively on `window`, users can select text, drag carousels, click navigation links, and interact with the Accordion Gallery without lag.
