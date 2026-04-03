## 2026-04-03 - [Header Accessibility and Keyboard Navigation]
**Learning:** Replacing non-semantic interactive `div` elements with semantic `button` elements is critical for out-of-the-box keyboard support (focusability, 'Enter'/'Space' triggers) and ARIA communication (`aria-expanded`). Without this, interactive states remain invisible to screen readers and inaccessible to keyboard-only users.
**Action:** Always prefer semantic `<button>` or `<a>` for interactive elements. If using a `motion` component, use `motion.button`. Ensure `aria-label` is present on all icon-only buttons.
