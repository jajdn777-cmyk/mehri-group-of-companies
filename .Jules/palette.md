## 2026-04-04 - [Accessibility & Semantic Markup]
**Learning:** In a project using extensive Framer Motion animations, interactive `motion.div` elements should be converted to `motion.button` to ensure they are naturally keyboard-accessible and recognized as interactive elements by screen readers. For all icon-only buttons, descriptive `aria-label` attributes are mandatory to provide context to assistive technologies.
**Action:** Always prefer `<button>` or `<motion.button>` with `type="button"` for clickable elements, and audit icon-only buttons for missing ARIA labels during any UI work.

## 2026-04-21 - [Keyboard Accessible Dropdowns]
**Learning:** For hover-triggered navigation menus, implementing `onFocusCapture` and `onBlurCapture` on the parent container allows sub-menus to remain visible when keyboard users Tab into them. This bridges the gap between hover-only interactions and full keyboard accessibility.
**Action:** Apply `onFocusCapture` and `onBlurCapture` to parent containers of hover menus to toggle visibility for keyboard users.
