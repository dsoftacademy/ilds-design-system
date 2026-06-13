# Dropdown trigger focus indicator — a11y flag for designer

**Date:** 13 June 2026  
**Component:** React `IldsDropdown` trigger (`web/src/components/Dropdown/Dropdown.tsx`)  
**Figma reference:** Focused state `13476:22340`  
**Status:** Open — requires designer decision

---

## Current implementation (Figma-verified)

The dropdown **trigger** uses `focus-visible:` — not `focus-within:` and **no orange outline ring**:

```tsx
focus-visible:bg-neutral-coolgray-50
focus-visible:border-neutral-coolgray-800
```

When open (Active `13476:22390`), focus-visible styles are suppressed; the orange border + orange chevron indicate the open state instead.

This matches Figma. It is **intentional in code**, not an implementation omission.

---

## Accessibility concern

| Criterion | Issue |
|-----------|-------|
| **WCAG 2.4.7 Focus Visible (AA)** | Focus is conveyed only via background (`#FAFAFA`) and border (`#424242`) change — no dedicated focus ring. May be insufficient for users who rely on high-contrast focus indicators. |
| **WCAG 1.4.11 Non-text Contrast (AA)** | Border change from `#9E9E9E` → `#424242` on `#FAFAFA` background — contrast ratio should be verified against 3:1 for UI component boundaries. |

TextField uses an orange 2px outline ring on focus (empty state). Dropdown deliberately does not — creating inconsistent focus language across form controls.

---

## Options for designer review

| Option | Visual | Pros | Cons |
|--------|--------|------|------|
| **A — Keep Figma as-is** | bg + border only | Pixel parity with Figma | WCAG risk; inconsistent with TextField |
| **B — Add orange ring on trigger focus** | Match TextField `outline-primary-orange-600` | Strong focus visible; consistent | Breaks current Figma parity |
| **C — Hybrid** | Orange ring only for keyboard (`focus-visible`), not mouse | Best a11y + preserves hover/active Figma states | Requires Figma update + new parity variant |
| **D — Thicker/darker border on focus** | 2px coolgray-800 border, no ring | Middle ground | May still fail 2.4.7 for some users |

---

## Recommendation

**Option C (hybrid)** — add `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-orange-600` to the closed trigger, update Figma Focused variant to match, add parity spec variant. Preserves the no-ring behavior when open (Active state uses orange border instead).

---

## Action required

- [ ] Pratishek / design: pick Option A–D  
- [ ] If B or C: update Figma node `13476:22340` and `dropdown.spec.json`  
- [ ] If A: document accepted WCAG exception in component guidelines (Supernova / Storybook docs)

**Blocked on:** Designer sign-off — do not change React implementation until decision is recorded.
