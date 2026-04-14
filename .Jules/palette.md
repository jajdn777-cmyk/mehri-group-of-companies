## 2026-04-04 - [Accessibility & Semantic Markup]
**Learning:** In a project using extensive Framer Motion animations, interactive `motion.div` elements should be converted to `motion.button` to ensure they are naturally keyboard-accessible and recognized as interactive elements by screen readers. For all icon-only buttons, descriptive `aria-label` attributes are mandatory to provide context to assistive technologies.
**Action:** Always prefer `<button>` or `<motion.button>` with `type="button"` for clickable elements, and audit icon-only buttons for missing ARIA labels during any UI work.

## 2026-04-14 - [Semantic Dropdown Triggers]
**Learning:** Using `div` elements for dropdown triggers breaks keyboard navigation as they aren't focusable. Converting these to semantic `<button type="button">` with `aria-haspopup="listbox"` and `aria-expanded` attributes ensures accessibility. Adding `transition-transform` to indicator icons (like chevrons) provides essential visual feedback for state changes.
**Action:** Ensure all custom dropdown triggers are semantic buttons with appropriate ARIA states and visual transitions.
