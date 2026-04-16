## 2026-04-04 - [Accessibility & Semantic Markup]
**Learning:** In a project using extensive Framer Motion animations, interactive `motion.div` elements should be converted to `motion.button` to ensure they are naturally keyboard-accessible and recognized as interactive elements by screen readers. For all icon-only buttons, descriptive `aria-label` attributes are mandatory to provide context to assistive technologies.
**Action:** Always prefer `<button>` or `<motion.button>` with `type="button"` for clickable elements, and audit icon-only buttons for missing ARIA labels during any UI work.

## 2026-04-04 - [Keyboard Navigation for Hover Menus]
**Learning:** For navigation menus that open on hover, implementing `onFocusCapture` and `onBlurCapture` on the parent container is a reliable way to support keyboard users. This ensures the menu stays open when focus enters any child element and closes when focus leaves the entire group.
**Action:** Use focus capture events to toggle state for hover-based UI components to ensure accessibility for keyboard-only users.
