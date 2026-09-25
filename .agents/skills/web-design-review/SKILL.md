---
name: web-design-review
description: Comprehensive visual QA, layout review, and UX critique skill for web applications. Use to inspect frontend pages, review design hierarchy, detect generic template anti-patterns, audit accessibility/contrast, and verify responsive behaviors before shipping code.
---

# Web Design Review & Visual QA Skill

This skill guides the inspection and verification of web interfaces to ensure they meet modern, premium, and human-centric design standards.

---

## 1. Visual Review Dimensions

When evaluating a web page, review these 6 dimensions:

### 1. Visual Hierarchy & Focal Point
- Does every viewport have one clear, dominant visual focal point?
- Can a user understand the purpose of the screen within 3 seconds?
- Are titles, subtitles, and interactive buttons grouped with clear proximity?

### 2. Typographic Polish
- Is there a deliberate typographic hierarchy (Display $\to$ H1 $\to$ H2 $\to$ Body $\to$ Caption)?
- Are font sizes, weights, line heights, and letter-spacings tailored? (e.g., negative letter spacing on large display headings `-0.02em`, positive on small caps `+0.05em`).
- Are line lengths constrained for optimal readability (60–75 characters per line for body copy)?

### 3. Surface & Elevation Integrity
- Are backgrounds layered thoughtfully (Canvas $\to$ Card Surface $\to$ Floating Panel $\to$ Modal)?
- Are borders subtle (1px solid with 6–10% opacity) rather than heavy black/gray lines?
- Are shadows soft, diffused, and slightly tinted by the background hue?

### 4. Anti-Generic Aesthetics
- Does the interface look distinct and custom-crafted for the domain, or does it look like a generic Bootstrap/Tailwind template?
- Has generic blue/purple gradient overload been avoided?
- Are interactive hover states subtle and tactile rather than abrupt?

### 5. Semantic Color Usage
- Is color used to convey meaning (status, mode, action) rather than arbitrary decoration?
- Is there sufficient contrast between text and background surfaces (WCAG AA compliant)?

### 6. Responsive & Empty States
- How does the layout adapt from desktop (1440px) to tablet (768px) and mobile (375px)?
- Are empty states, loading skeletons, and error states thoughtfully designed rather than blank screens or raw error messages?
