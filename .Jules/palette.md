## 2026-04-04 - [Accessibility & Semantic Markup]
**Learning:** In a project using extensive Framer Motion animations, interactive `motion.div` elements should be converted to `motion.button` to ensure they are naturally keyboard-accessible and recognized as interactive elements by screen readers. For all icon-only buttons, descriptive `aria-label` attributes are mandatory to provide context to assistive technologies.
**Action:** Always prefer `<button>` or `<motion.button>` with `type="button"` for clickable elements, and audit icon-only buttons for missing ARIA labels during any UI work.

## 2026-04-10 - [Keyboard-Accessible Hover Menus]
**Learning:** For navigation menus that rely on hover states, simply adding `focus-visible` styles to the trigger button is insufficient for keyboard users. To make sub-menus accessible, `onFocusCapture` and `onBlurCapture` must be implemented on the parent container to programmatically toggle visibility based on focus. Additionally, when rebranding core features under strict constraints, prioritize user-facing labels over internal prop names to maintain component compatibility.
**Action:** Use `onFocusCapture` / `onBlurCapture` patterns for hover-triggered menus to ensure full Tab key accessibility.
