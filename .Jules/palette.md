## 2026-04-04 - [Accessibility & Semantic Markup]
**Learning:** In a project using extensive Framer Motion animations, interactive `motion.div` elements should be converted to `motion.button` to ensure they are naturally keyboard-accessible and recognized as interactive elements by screen readers. For all icon-only buttons, descriptive `aria-label` attributes are mandatory to provide context to assistive technologies.
**Action:** Always prefer `<button>` or `<motion.button>` with `type="button"` for clickable elements, and audit icon-only buttons for missing ARIA labels during any UI work.

## 2026-04-19 - [Keyboard Accessibility for Hover Menus]
**Learning:** Hover-triggered menus should implement  and  on their parent containers to ensure they are accessible to keyboard users. Additionally, converting custom interactive components from `div` to semantic `button` (or `motion.button`) is critical for screen reader recognition and native focusability.
**Action:** Always audit hover-based navigation for keyboard accessibility and prefer semantic `<button>` for all clickable elements.

## 2026-04-19 - [Keyboard Accessibility for Hover Menus]
**Learning:** Hover-triggered menus should implement `onFocusCapture` and `onBlurCapture` on their parent containers to ensure they are accessible to keyboard users. Additionally, converting custom interactive components from `div` to semantic `button` (or `motion.button`) is critical for screen reader recognition and native focusability.
**Action:** Always audit hover-based navigation for keyboard accessibility and prefer semantic `<button>` for all clickable elements.
