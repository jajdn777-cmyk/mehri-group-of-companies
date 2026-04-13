## 2026-04-04 - [Accessibility & Semantic Markup]
**Learning:** In a project using extensive Framer Motion animations, interactive `motion.div` elements should be converted to `motion.button` to ensure they are naturally keyboard-accessible and recognized as interactive elements by screen readers. For all icon-only buttons, descriptive `aria-label` attributes are mandatory to provide context to assistive technologies.
**Action:** Always prefer `<button>` or `<motion.button>` with `type="button"` for clickable elements, and audit icon-only buttons for missing ARIA labels during any UI work.

## 2026-04-13 - [Accessible Dropdowns & Visual Feedback]
**Learning:** Standard interactive patterns like dropdown triggers should always use semantic `<button>` elements with `aria-haspopup` and `aria-expanded` to ensure they are discoverable and their state is clear to assistive technologies. Adding smooth transitions to chevron icons (e.g., `rotate-180`) provides critical visual feedback that complements ARIA states.
**Action:** Implement `aria-haspopup` and `aria-expanded` on all custom dropdown triggers and pair them with visual indicators (like rotating icons) using Tailwind's transition classes.
