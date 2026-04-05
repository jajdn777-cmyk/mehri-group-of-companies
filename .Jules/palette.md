## 2026-04-05 - [Semantic Interactive Elements in Header]
**Learning:** Using non-semantic elements like `div` for primary navigation (Logo, Profile) prevents keyboard accessibility and fails screen reader expectations. In a high-end design system like 'Calorie AI', accessibility is a core pillar of the 'elite' experience.
**Action:** Always prefer `<button>` or `<a>` for interactive zones. For icon-only buttons, descriptive `aria-label` is mandatory. Use `focus-visible` to provide visual cues without compromising mouse-driven aesthetics.
