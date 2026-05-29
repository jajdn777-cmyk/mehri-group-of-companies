## 2026-04-04 - [Accessibility & Semantic Markup]
**Learning:** In a project using extensive Framer Motion animations, interactive `motion.div` elements should be converted to `motion.button` to ensure they are naturally keyboard-accessible and recognized as interactive elements by screen readers. For all icon-only buttons, descriptive `aria-label` attributes are mandatory to provide context to assistive technologies.
**Action:** Always prefer `<button>` or `<motion.button>` with `type="button"` for clickable elements, and audit icon-only buttons for missing ARIA labels during any UI work.

## 2026-04-24 - [Semantic Triggers & Focus States]
**Learning:** Interactive `div` containers used as dropdown triggers should be converted to semantic `<button type="button">` elements. This provides native keyboard support (Enter/Space to activate) and allows for the use of `aria-haspopup="listbox"` and `aria-expanded` to communicate component state to assistive technologies. Additionally, pairing these with `focus-visible:ring-2` ensures a clear visual indicator for keyboard navigation.
**Action:** Identify and convert all "click-divs" to buttons, ensuring proper ARIA attributes are applied to manage state visibility for screen readers.

## 2026-04-28 - [Keyboard-Accessible Hover Menus & Valid Button Content]
**Learning:** For hover-triggered menus, use `onFocusCapture` and a refined `onBlurCapture` that checks `e.currentTarget.contains(e.relatedTarget)` to ensure the menu stays open when focus moves between the trigger and its children. Additionally, always use `span` instead of `div` inside `button` elements to maintain HTML validity while achieving desired layout.
**Action:** Implement robust focus management for all hover-based navigation and audit button children for invalid flow content.

## 2026-05-22 - [Keyboard-Accessible Calendar & Focus States]
**Learning:** For grid-based components like calendars where cells are interactive but implemented as `div` elements for layout control, adding `role="button"`, `tabIndex`, and an `onKeyDown` handler (supporting Enter/Space) is essential for keyboard accessibility. Pairing this with descriptive `aria-label` attributes and the project's standard `focus-visible` ring styles ensures a cohesive and accessible user experience.
**Action:** When implementing or auditing grid-based interactive elements, ensure they follow the accessible "click-div" pattern: role, tabIndex, keydown support, and focus rings.
