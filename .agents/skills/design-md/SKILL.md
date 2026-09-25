---
name: design-md
description: Agent skill for generating, reading, and enforcing DESIGN.md source-of-truth documents. Use whenever creating new UI features, establishing design systems, inspecting design token alignment, or ensuring AI code generation strictly obeys the project's DESIGN.md specifications.
---

# DESIGN.md Agent Skill

This skill governs the structure, maintenance, and consumption of `DESIGN.md` within AI-assisted frontend workflows.

---

## 1. Purpose of DESIGN.md

A `DESIGN.md` file serves as the **contract between design intent and implementation code**. It gives autonomous agents and human developers an unambiguous source of truth for:
- Design tokens (colors, typography, spacing, elevations, motion)
- Component hierarchy and layout rules
- Visual states (empty, loading, active, error, success)
- Anti-patterns to strictly avoid

---

## 2. Standard Workflow When Modifying UI

Whenever building or refactoring frontend components:
1. **Read `/DESIGN.md` First**: Inspect the design tokens, typography rules, and semantic color mappings before writing JSX or CSS.
2. **Never Invent Colors**: Map all UI surfaces, text, borders, and interactive accents to declared CSS custom properties (`var(--token)`).
3. **Verify Contrast Ratios**: Check that text-to-background combinations meet WCAG AA standards (4.5:1 for body, 3:1 for large display/headings).
4. **Update `DESIGN.md` on Expansion**: If a new UI primitive (e.g., audio visualizer, split-pane handle, confidence dial) is introduced, document its tokens and anatomy in `/DESIGN.md`.

---

## 3. Core Token Categories

A compliant `DESIGN.md` must document:
- **Primitives**: Raw palette values (e.g., `--slate-900`, `--violet-500`, `--lime-400`).
- **Semantics**: Contextual aliases (e.g., `--color-ai`, `--color-mastery`, `--color-remediation`, `--color-canvas`).
- **Typography Scale**: Font families, font weights, line-heights, letter-spacing, and responsive font sizes.
- **Spacing & Layout**: 4px or 8px baseline grid, padding scales, layout container widths.
- **Motion & Elevation**: Transition durations, easing curves, border radii, and layered shadow tokens.
