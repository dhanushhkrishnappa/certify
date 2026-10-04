# CERTIFY Landing Page — Motion System Specification

## 1. Executive Motion Architecture

The CERTIFY landing page motion system is engineered as a unified, mathematically grounded creative-development framework inspired by the interaction quality, depth, and storytelling density of top creative AI SaaS experiences, while rigorously enforcing CERTIFY's warm, academic, editorial brand identity.

### Motion Principles
1. **Definite Purpose**: Motion never exists for frivolous decoration. Every reveal, transition, and tilt signifies cognitive progression, proof verification, or tactile physical response.
2. **Harmonious Timing & Physics**: All transitions use coordinated easing curves defined in `motionVocabulary.ts` rather than ad-hoc CSS duration values.
3. **Hardware Acceleration**: Transitions strictly manipulate GPU-composited properties (`transform`, `opacity`, `filter: blur`) with `will-change` hints on critical layers.
4. **Adaptive Degradation**: Respects `prefers-reduced-motion` at the root, instantly disabling smooth scrolling, parallax scrubbing, and particle effects.

---

## 2. Animation Tech Stack

| Technology | Role | Implementation |
| :--- | :--- | :--- |
| **Lenis (`^1.3.26`)** | Inertial Smooth Scrolling | Synchronized with GSAP ticker; bypassed for reduced motion |
| **GSAP (`^3.15.0`)** | Complex Timelines & Pinning | ScrollTrigger choreography, pinned narrative sequence |
| **GSAP ScrollTrigger** | Viewport Scroll Orchestration | Scrubbed pinning, batch reveals, counter triggers |
| **Motion (`^14.0.0`)** | View Transition Animation | Component-level enter/exit state transitions |
| **HTML5 Canvas & WebGL** | Organic Fluid Cursor | Velocity-aware trailing light particles in warm gold & violet |
| **3D Perspective CSS** | Bulge & Perspective Tilt | `BulgeCard` pointer-tracking with dynamic radial flare |

---

## 3. Motion Vocabulary & Central Constants (`motionVocabulary.ts`)

```typescript
export const MOTION_EASING = {
  // Decisive acceleration with smooth natural settling
  expoOut: "power4.out",
  // Narrative scrolls & smooth transitions
  smoothInOut: "power3.inOut",
  // Snappy tactile feedback
  tactileOut: "power2.out",
  // CSS cubic-bezier equivalents
  cssExpoOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  cssSmoothInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
};
```

---

## 4. Reusable Motion Hooks

### `useLenis(enabled)`
Initializes buttery-smooth scrolling with exponential ease-out settling.
- Coordinates ticker updates with GSAP `ScrollTrigger.update()`.
- Captures anchor tag clicks (`#manifesto`, `#how-it-works`, `#courses`, `#faq`) and executes smooth offsets (`offset: -76px`).
- Automatically destroys on component unmount and cleans up global references.

### `useScrollReveal(options)`
Declarative scroll-triggered entrance for cards and sections.
- Configurable `y`, `opacity`, `scale`, `stagger`, and `duration`.
- Scoped inside `gsap.context()` for clean teardown without lingering memory leaks.

### `useTextReveal(options)`
Splits headings or editorial prose into word spans with masked container overflows, providing staggered reveal animations. Supports `"words"`, `"lines"`, `"blurToSharp"`, and `"fadeUp"` modes.

### `useMagnetic(options)`
Calculates cursor distance from button center and pulls the element toward the cursor with spring tension. Releases smoothly with `elastic.out(1, 0.4)` upon mouse leave.

### `useParallax(options)`
Scroll-linked continuous displacement for background imagery and decorative layers.

---

## 5. WebGL / Canvas Fluid Cursor (`WebGLCursor.tsx`)

- **Palette**: Calibrated to CERTIFY tones: Warm Gold (`rgba(230, 202, 164, ...)`), Soft Violet (`rgba(206, 164, 242, ...)`), Parchment Ivory (`rgba(247, 231, 206, ...)`).
- **Physics**: Spawns soft radial alpha particles proportional to cursor velocity ($dx, dy$). Applies velocity decay ($0.94$) and radial expansion before particle death.
- **Performance Safeguard**: Screen-blend canvas. Automatically dormant when pointer stops moving. Completely omitted on mobile devices ($< 768px$ and coarse pointer) and whenever `prefers-reduced-motion` is active.

---

## 6. Interactive Bulge & 3D Tilt Card (`BulgeCard.tsx`)

- Computes normalized pointer offset relative to card center ($[-1, 1]$).
- Applies `perspective(1000px) rotateX(...) rotateY(...) scale3d(1.015, 1.015, 1.015)`.
- Renders an internal dynamic radial gradient flare following cursor coordinates.
- Degrades gracefully to static cards on touch devices and reduced-motion environments.

---

## 7. Reduced-Motion & Accessibility Guarantees

Every animated component queries `prefersReducedMotion()`. When enabled:
1. Lenis smooth scrolling is bypassed; native instant scrolling is used.
2. GSAP tweens instantly set `opacity: 1`, `transform: none`, and `scale: 1`.
3. Pinned sections render static without scroll locks or stuck screens.
4. Canvas fluid cursor is unmounted.
5. All interactive elements remain keyboard accessible with visible outline focus rings (`outline: 2px solid var(--certify-brand-purple)`).
