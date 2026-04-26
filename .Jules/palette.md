## 2026-04-04 - [Accessibility & Semantic Markup]
**Learning:** In a project using extensive Framer Motion animations, interactive `motion.div` elements should be converted to `motion.button` to ensure they are naturally keyboard-accessible and recognized as interactive elements by screen readers. For all icon-only buttons, descriptive `aria-label` attributes are mandatory to provide context to assistive technologies.
**Action:** Always prefer `<button>` or `<motion.button>` with `type="button"` for clickable elements, and audit icon-only buttons for missing ARIA labels during any UI work.

## 2026-04-24 - [Semantic Triggers & Focus States]
**Learning:** Interactive `div` containers used as dropdown triggers should be converted to semantic `<button type="button">` elements. This provides native keyboard support (Enter/Space to activate) and allows for the use of `aria-haspopup="listbox"` and `aria-expanded` to communicate component state to assistive technologies. Additionally, pairing these with `focus-visible:ring-2` ensures a clear visual indicator for keyboard navigation.
**Action:** Identify and convert all "click-divs" to buttons, ensuring proper ARIA attributes are applied to manage state visibility for screen readers.

## 2026-04-26 - [Keyboard Accessible Hover Menus]
**Learning:** Hover-triggered menus (like navigation dropdowns) are often inaccessible to keyboard users. Implementing 'onFocusCapture' and 'onBlurCapture' on the parent container, combined with 'aria-haspopup' and 'aria-expanded' on the trigger, allows these menus to be used via the Tab key and properly announced by screen readers.
**Action:** Always pair hover states with focus-based visibility logic for menus and ensure appropriate ARIA attributes are used to communicate state.
