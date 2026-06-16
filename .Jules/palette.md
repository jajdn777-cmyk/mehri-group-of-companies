## 2026-04-04 - [Accessibility & Semantic Markup]
**Learning:** In a project using extensive Framer Motion animations, interactive `motion.div` elements should be converted to `motion.button` to ensure they are naturally keyboard-accessible and recognized as interactive elements by screen readers. For all icon-only buttons, descriptive `aria-label` attributes are mandatory to provide context to assistive technologies.
**Action:** Always prefer `<button>` or `<motion.button>` with `type="button"` for clickable elements, and audit icon-only buttons for missing ARIA labels during any UI work.

## 2026-04-24 - [Semantic Triggers & Focus States]
**Learning:** Interactive `div` containers used as dropdown triggers should be converted to semantic `<button type="button">` elements. This provides native keyboard support (Enter/Space to activate) and allows for the use of `aria-haspopup="listbox"` and `aria-expanded` to communicate component state to assistive technologies. Additionally, pairing these with `focus-visible:ring-2` ensures a clear visual indicator for keyboard navigation.
**Action:** Identify and convert all "click-divs" to buttons, ensuring proper ARIA attributes are applied to manage state visibility for screen readers.

## 2026-04-28 - [Keyboard-Accessible Hover Menus & Valid Button Content]
**Learning:** For hover-triggered menus, use `onFocusCapture` and a refined `onBlurCapture` that checks `e.currentTarget.contains(e.relatedTarget)` to ensure the menu stays open when focus moves between the trigger and its children. Additionally, always use `span` instead of `div` inside `button` elements to maintain HTML validity while achieving desired layout.
**Action:** Implement robust focus management for all hover-based navigation and audit button children for invalid flow content.

## 2026-06-16 - [Focus-Dependent Visibility for Hidden Controls]
**Learning:** Interactive elements that are visually hidden until hover (using `opacity-0` or similar) must also be revealed when they or their container receives focus. Using Tailwind utilities like `focus-visible:opacity-100` or `group-focus-within:opacity-100` ensures that keyboard users can discover and interact with these controls during navigation. Additionally, when converting generic `div` containers to accessible buttons, dynamic `aria-label` attributes should be used to provide specific context (e.g., date and status) to screen readers.
**Action:** Always pair hover-based visibility transitions with focus-based reveals for interactive elements.
