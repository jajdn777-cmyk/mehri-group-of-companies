## 2026-04-04 - [Accessibility & Semantic Markup]
**Learning:** In a project using extensive Framer Motion animations, interactive `motion.div` elements should be converted to `motion.button` to ensure they are naturally keyboard-accessible and recognized as interactive elements by screen readers. For all icon-only buttons, descriptive `aria-label` attributes are mandatory to provide context to assistive technologies.
**Action:** Always prefer `<button>` or `<motion.button>` with `type="button"` for clickable elements, and audit icon-only buttons for missing ARIA labels during any UI work.

## 2026-04-20 - [Keyboard-Accessible Hover Menus]
**Learning:** Dropdown menus triggered by hover (`onMouseEnter`/`onMouseLeave`) are inaccessible to keyboard users. Implementing `onFocusCapture` and `onBlurCapture` on the parent container, combined with `focus-visible` styles on the trigger button, allows keyboard users to reveal and navigate these menus seamlessly.
**Action:** Always implement companion focus event handlers for any hover-based interactive menus to ensure full WCAG compliance.
