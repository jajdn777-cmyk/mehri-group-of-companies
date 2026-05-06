## 2026-04-04 - [Accessibility & Semantic Markup]
**Learning:** In a project using extensive Framer Motion animations, interactive `motion.div` elements should be converted to `motion.button` to ensure they are naturally keyboard-accessible and recognized as interactive elements by screen readers. For all icon-only buttons, descriptive `aria-label` attributes are mandatory to provide context to assistive technologies.
**Action:** Always prefer `<button>` or `<motion.button>` with `type="button"` for clickable elements, and audit icon-only buttons for missing ARIA labels during any UI work.

## 2026-04-24 - [Semantic Triggers & Focus States]
**Learning:** Interactive `div` containers used as dropdown triggers should be converted to semantic `<button type="button">` elements. This provides native keyboard support (Enter/Space to activate) and allows for the use of `aria-haspopup="listbox"` and `aria-expanded` to communicate component state to assistive technologies. Additionally, pairing these with `focus-visible:ring-2` ensures a clear visual indicator for keyboard navigation.
**Action:** Identify and convert all "click-divs" to buttons, ensuring proper ARIA attributes are applied to manage state visibility for screen readers.

## 2026-04-28 - [Keyboard-Accessible Hover Menus & Valid Button Content]
**Learning:** For hover-triggered menus, use `onFocusCapture` and a refined `onBlurCapture` that checks `e.currentTarget.contains(e.relatedTarget)` to ensure the menu stays open when focus moves between the trigger and its children. Additionally, always use `span` instead of `div` inside `button` elements to maintain HTML validity while achieving desired layout.
**Action:** Implement robust focus management for all hover-based navigation and audit button children for invalid flow content.

## 2026-05-06 - [Global Dashboard Accessibility Polish]
**Learning:** For a consistent keyboard navigation experience, every interactive element—including secondary buttons (Sync), tab switchers, and custom toggles—must have clear `focus-visible` ring indicators. Toggles specifically benefit from the `role="switch"` and `aria-checked` attributes to provide semantic clarity that matches their visual behavior.
**Action:** Audit core dashboard components for "silent" focus states and ensure all interactive controls have standardized focus rings and semantic roles.
