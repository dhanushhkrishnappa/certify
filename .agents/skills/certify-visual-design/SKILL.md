---
name: certify-visual-design
description: Authoritative frontend design system and visual implementation skill for the Certify platform. Use when designing, creating, refactoring, or reviewing any UI component, page layout, modal, typography, color palette, or interactive state across Certify to ensure anti-generic, high-trust, editorial, and mathematically grounded design execution.
---

# Certify Visual Design Skill

This skill enforces the visual identity, design tokens, and user experience principles defined in [`/DESIGN.md`](../../DESIGN.md) and [`/docs/CERTIFY_VISUAL_LANGUAGE.md`](../../docs/CERTIFY_VISUAL_LANGUAGE.md).

Every agent working on Certify frontend tasks **MUST** adhere to this skill.

---

## 1. The 12 Mandatory Execution Directives

Whenever performing any frontend task on Certify:

1. **Read `/DESIGN.md` First**: Before modifying any JSX, TSX, or CSS, read `/DESIGN.md` and `/docs/CERTIFY_VISUAL_LANGUAGE.md` to extract the relevant token variables and component patterns.
2. **Preserve Certify's Visual Identity**: Keep the aesthetic focused, editorial, academic, and subtly futuristic. Reject decorative clipart, loud 2021 neon glows, and novelty gradients.
3. **Avoid Generic SaaS Aesthetics**: Never introduce default SaaS blue (`#2563eb`), copy-paste rounded card grids, or generic Bootstrap-like styling.
4. **Preserve Semantic Color Roles**: 
   - **Soft Violet** is exclusively for AI intelligence and Socratic inquiry.
   - **Acid Lime** is exclusively for validated mastery and positive progress deltas.
   - **Muted Coral** is exclusively for attention, diagnosed misconceptions, and remediation triggers.
   - **Warm Ivory** is exclusively for core learning prose and titles.
   - **Obsidian Charcoal & Deep Plum** are exclusively for high-focus surfaces, assessment modals, and the Viva chamber.
5. **Maintain Typography Hierarchy**: Use `Plus Jakarta Sans` for UI/dialogue, `JetBrains Mono` for code/evidence/hashes, and editorial serif accents for credentials/certificates. Establish clear visual contrast with font scale and letter spacing before adding boxes or borders.
6. **Reuse Established Components**: Extend existing atomic components (dialogue pane, curriculum drawer, mastery dial, credential ledger) rather than reinventing ad-hoc layout wrappers.
7. **Use Motion Deliberately**: All transitions must be 150ms–250ms with `cubic-bezier(0.16, 1, 0.3, 1)`. Motion must signify an informative state change, never idle decoration.
8. **Design All States**: Every component must explicitly handle **Empty**, **Loading (Skeleton)**, **Error / Remediation**, and **Active** states.
9. **Think Responsively**: The 3-column studio must collapse gracefully to drawer-based or tabbed navigation on tablet ($< 1024px$) and mobile ($< 768px$) without breaking conversational continuity.
10. **Check Accessibility**: Ensure minimum WCAG AA contrast ($> 4.5:1$ for body text, $> 3:1$ for UI controls), visible keyboard focus rings (`outline: 2px solid var(--primitive-violet-500)`), and respect `prefers-reduced-motion`.
11. **Inspect Actual Browser Output**: Verify actual rendered appearance in the live browser (via `http://localhost:5173` or visual tools) rather than assuming JSX looks correct.
12. **Avoid Introducing Future-Scope Product Features**: Respect the product boundaries in `/docs/PRODUCT_SCOPE.md`. Strictly do NOT implement or mock deferred features (e.g., real-time voice synthesis, webcam/biometric proctoring, blockchain gas ledgers, recruitment marketplaces, or external video ingestion).
