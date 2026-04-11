## 2026-04-04 - [Accessibility & Semantic Markup]
**Learning:** In a project using extensive Framer Motion animations, interactive `motion.div` elements should be converted to `motion.button` to ensure they are naturally keyboard-accessible and recognized as interactive elements by screen readers. For all icon-only buttons, descriptive `aria-label` attributes are mandatory to provide context to assistive technologies.
**Action:** Always prefer `<button>` or `<motion.button>` with `type="button"` for clickable elements, and audit icon-only buttons for missing ARIA labels during any UI work.

## 2026-05-15 - [Keyboard Accessible Hover Menus]
**Learning:** Hover-triggered menus are inaccessible to keyboard users. Using `onFocusCapture` and `onBlurCapture` on a shared parent container allows toggling menu visibility for both mouse and keyboard users without complex state management.
**Action:** Implement `onFocusCapture` and `onBlurCapture` on parent containers of hover-menus to ensure they expand when children receive focus.
