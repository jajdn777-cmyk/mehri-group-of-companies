## 2026-04-04 - [Accessibility & Semantic Markup]
**Learning:** In a project using extensive Framer Motion animations, interactive `motion.div` elements should be converted to `motion.button` to ensure they are naturally keyboard-accessible and recognized as interactive elements by screen readers. For all icon-only buttons, descriptive `aria-label` attributes are mandatory to provide context to assistive technologies.
**Action:** Always prefer `<button>` or `<motion.button>` with `type="button"` for clickable elements, and audit icon-only buttons for missing ARIA labels during any UI work.

## 2026-04-08 - [Keyboard Accessible Dropdowns]
**Learning:** Hover-triggered dropdown menus are inaccessible to keyboard users. Using `onFocusCapture` and `onBlurCapture` on the parent container allows for toggling the visibility state when a user tabs into the menu or its children, making the sub-menu items reachable.
**Action:** Implement focus-based visibility alongside hover states for all complex navigation menus.
