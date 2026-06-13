# WCAG color-contrast exceptions — brand palette (designer review)

**Date:** 13 June 2026
**Status:** Open — designer decision (Figma is source of truth)
**Scope:** ILDS React components (`web/`). Same tokens drive Flutter.

---

## Why this exists

The automated a11y sweep (`web/tests/a11y.spec.ts`, axe-core, WCAG 2.1 AA) hard-fails
on every **structural** violation (names, roles, labels, keyboard access). The
`color-contrast` rule is **disabled in the harness** because the failures are all
driven by ILDS **brand design tokens** defined in Figma — not by implementation
mistakes. Overriding them in code would break parity with the source of truth.

These need a **designer decision** (adjust token, accept exception, or restrict usage).

---

## Known AA contrast gaps (token-level)

| Where | Foreground | Background | Ratio | WCAG AA (4.5:1 text / 3:1 UI) |
|-------|-----------|-----------|-------|-------------------------------|
| Primary button label | `white-000` #ffffff | `primary-orange-500` #e3530f | ~3.1:1 | Fails normal text; ~OK as large/bold |
| Selected control text | `primary-orange-500` #e3530f | `white-000` #ffffff | ~3.4:1 | Fails normal text |
| Selection button selected | `primary-orange-500` #e3530f | `primary-orange-50` #fff2ed | ~3.2:1 | Fails normal text |
| Subtle badge | `neutral-coolgray-600` #757575 | `neutral-coolgray-100` #f5f5f5 | ~4.2:1 | Just under 4.5:1 |
| Tabs (unselected) | `neutral-coolgray-400` #bdbdbd | `white-000` #ffffff | ~2.6:1 | Fails (de-emphasized by design) |
| Visited text link | `neutral-coolgray-500` #9e9e9e | `white-000` #ffffff | ~2.8:1 | Fails (visited de-emphasis) |
| Dropdown / input placeholder | `neutral-coolgray-500` #9e9e9e | `white-000` #ffffff | ~2.8:1 | Placeholder (exempt-ish, still flagged) |

Disabled-state contrast is exempt under WCAG 1.4.3 and is not listed.

---

## Options per gap

1. **Accept** — document as a known brand exception (e.g. primary orange is the
   established ICICI Lombard brand color; large/bold usage mitigates).
2. **Darken token** — e.g. shift `primary-orange-500` toward `primary-orange-600`
   (#c74c01, ~4.5:1 with white) for text-bearing surfaces. Requires Figma update +
   token resync + parity respec.
3. **Restrict usage** — only use low-contrast pairings for large/bold text or
   non-essential/de-emphasized content (tabs, visited links).

## Recommendation

- **Primary orange on white/orange-50 for text:** consider Option 2 for text-bearing
  components (use orange-600 for labels) while keeping orange-500 for fills/indicators.
- **Tabs unselected / visited links / placeholders:** Option 1 (accept) — these are
  intentionally de-emphasized; ensure they're never the only cue.

## Action required

- [ ] Pratishek / design: decide per row (accept / darken / restrict)
- [ ] If darken: update Figma tokens → `npm run build:tokens` → re-verify parity
- [ ] Re-enable `color-contrast` in `a11y.spec.ts` once tokens meet target
