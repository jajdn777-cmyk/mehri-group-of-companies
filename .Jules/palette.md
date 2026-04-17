## 2026-04-04 - [Accessibility & Semantic Markup]
**Learning:** In a project using extensive Framer Motion animations, interactive `motion.div` elements should be converted to `motion.button` to ensure they are naturally keyboard-accessible and recognized as interactive elements by screen readers. For all icon-only buttons, descriptive `aria-label` attributes are mandatory to provide context to assistive technologies.
**Action:** Always prefer `<button>` or `<motion.button>` with `type="button"` for clickable elements, and audit icon-only buttons for missing ARIA labels during any UI work.

## 2026-04-17 - [Accessible Dropdown Triggers]
**Learning:** When implementing custom dropdown triggers, using a semantic `<button type="button">` with `aria-haspopup="listbox"` and `aria-expanded` is essential for both keyboard accessibility and screen reader support. It ensures the element is in the tab order and correctly announces its state.
**Action:** Convert `div`-based triggers to `<button>` with appropriate ARIA attributes to maintain a high accessibility standard.
