## 2026-04-04 - [Accessibility & Semantic Markup]
**Learning:** In a project using extensive Framer Motion animations, interactive `motion.div` elements should be converted to `motion.button` to ensure they are naturally keyboard-accessible and recognized as interactive elements by screen readers. For all icon-only buttons, descriptive `aria-label` attributes are mandatory to provide context to assistive technologies.
**Action:** Always prefer `<button>` or `<motion.button>` with `type="button"` for clickable elements, and audit icon-only buttons for missing ARIA labels during any UI work.

## 2026-04-05 - [Keyboard Accessible Hover Menus]
**Learning:** For navigation menus that open on hover (using `onMouseEnter`/`onMouseLeave`), implementing `onFocusCapture` and `onBlurCapture` on the parent container ensures that the menus are also accessible to keyboard users navigating via the Tab key.
**Action:** Always implement companion focus event handlers for hover-triggered UI elements to maintain parity between mouse and keyboard experiences.
