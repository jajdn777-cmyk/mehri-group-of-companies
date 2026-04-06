## 2026-02-18 - [Header Accessibility & Semantics]
**Learning:** Using `div` with `onClick` for primary navigation elements (like a Logo or Profile) breaks keyboard accessibility and screen reader expectations. Semantic `<button>` elements with `aria-label` and `focus-visible` styles are essential for a professional UX.
**Action:** Always prefer `motion.button` over `motion.div` for interactive elements and ensure `aria-label` is present for icon-only or image-based buttons.
