# CERTIFY — FlexCarousel Integration QA Report

## Overview
This document records the visual, behavioral, and structural quality assurance for integrating the **React Bits FlexCarousel** component into the CERTIFY course showcase.

---

## 1. Component Architecture & Files

| Component / Asset | File Path | Description |
| :--- | :--- | :--- |
| **FlexCarousel Core** | [`frontend/src/components/landing/FlexCarousel.tsx`](file:///d:/Projects/certify/frontend/src/components/landing/FlexCarousel.tsx) | Original React Bits WebGL component powered by OGL. Retains `liquid` preset, `rise` entrance, `squeeze`, pointer dragging, speed deformation, and animated digit reel. Exposes `useImperativeHandle` for programmatic navigation. |
| **FlexCarousel Stylesheet** | [`frontend/src/components/landing/FlexCarousel.css`](file:///d:/Projects/certify/frontend/src/components/landing/FlexCarousel.css) | Custom styled for CERTIFY theme: dark espresso surfaces, Newsreader serif titles, JetBrains Mono counter badge, warm ivory text `#FEF5E5`, champagne focus rings. |
| **Course Showcase Section** | [`frontend/src/components/landing/DraggableCurriculumCarousel.tsx`](file:///d:/Projects/certify/frontend/src/components/landing/DraggableCurriculumCarousel.tsx) | Clean section integrating the unified single-card FlexCarousel, editorial heading, and direct route integration. |
| **Card Generation Script** | [`scripts/generate_cards.cjs`](file:///d:/Projects/certify/scripts/generate_cards.cjs) | High-resolution Chromium-based rendering engine producing unified composite cards matching Coursera/edX reference layout in CERTIFY aesthetic. |

---

## 2. Configuration & Preset Fidelity

FlexCarousel is invoked with the following optimized parameters:
- **`preset="liquid"`**: Retains genuine liquid glass refractions, corner roundness, and edge dispersion.
- **`intro="rise"`**: Original rising card entrance animation.
- **`cardHeight={0.82}`**: Calibrated to sit snugly below the section header without excessive dead space.
- **`gap={36}`**: Generous 36px separation between adjacent cards to eliminate any attached appearance.
- **`squeeze={0.29}`**: Momentum squeeze distortion during horizontal swipes/dragging.
- **`focusOnClick={true}`**: Centers and focuses clicked cards.
- **`captions={false}`**: External caption text and counter removed per design direction (all text integrated within cards).
- **`radius={8}`**: Lens corner radius.
- **`roundness={0.85}`**: Lens roundness.
- **`bend={0}`**: Zero base bend for clean editorial card presentation.
- **`autoplay={true}`**: Fluid auto-rotation.
- **`interval={2}`**: 2-second rotation pacing.

---

## 3. Course Catalog & Unified Card Imagery

Each card is an all-in-one unified card featuring generous 42px internal padding and a prominent 38px Newsreader title:

| # | Course Title | Track Badge | Level | Verified Metadata | Cover Asset |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **01** | **Python Fundamentals** | `FLAGSHIP TRACK` | Beginner → Proficient | 8 Modules • 36.5 hrs • Oral Viva Included | [`/courses/card-python-fundamentals.jpg`](file:///d:/Projects/certify/frontend/public/courses/card-python-fundamentals.jpg) |
| **02** | **Web Development Foundations** | `FOUNDATION TRACK` | Beginner | 12 Modules • 48 hrs • Practical Projects | [`/courses/card-web-development-foundations.jpg`](file:///d:/Projects/certify/frontend/public/courses/card-web-development-foundations.jpg) |
| **03** | **Data Structures & Algorithms** | `CORE CS TRACK` | Intermediate | 14 Modules • 52 hrs • Algorithmic Defense | [`/courses/card-data-structures-problem-solving.jpg`](file:///d:/Projects/certify/frontend/public/courses/card-data-structures-problem-solving.jpg) |
| **04** | **GenAI & LLM Engineering** | `APPLIED AI TRACK` | Advanced | 10 Modules • 40 hrs • Agent Evaluation | [`/courses/card-genai-llm-application-engineering.jpg`](file:///d:/Projects/certify/frontend/public/courses/card-genai-llm-application-engineering.jpg) |
| **05** | **SQL & Relational Databases** | `DATA SYSTEMS TRACK` | Intermediate | 9 Modules • 38 hrs • Schema Verification | [`/courses/card-sql-relational-database-design.jpg`](file:///d:/Projects/certify/frontend/public/courses/card-sql-relational-database-design.jpg) |

---

## 4. CTA Route Mappings

Clicking any card in FlexCarousel activates `onSelect` and dispatches directly to:
- **`onSelectCourse(slug)`**: Sets `selectedCourseSlug` in [`App.tsx`](file:///d:/Projects/certify/frontend/src/App.tsx) and transitions to `course-details` (or `auth` if unauthenticated).
- Each course maps directly to its verified course record.

---

## 5. Build & Lint Validation

- **TypeScript Validation (`tsc --noEmit`)**: Passed with `0 errors`.
- **Linter Validation (`oxlint`)**: Passed with `0 warnings and 0 errors`.
- **Vite Dev Server**: Running cleanly on port `5174`.
