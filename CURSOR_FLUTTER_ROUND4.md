# Cursor task — Flutter Round 4: typography tokens + Round-3a re-walk fixes

**Date:** 2026-06-18
**Author:** Claude — audited against branch `fix/flutter-fidelity-round3-a` with repo access
**Source:** Pratishek's re-walk of PR A in Chrome

Read fully. Verify every claim from source before changing it (file:line cited). Fix on branches, open PRs, goldens on Linux, no direct pushes to `main`, do not touch the token pipeline.

## Branch placement (keep PRs small)
- **PR D (NEW) — Typography token compliance.** Systemic, touches all components. Its own branch off `main` (or off the round-3 stack tip). P0.
- **Toast reposition** → fold into **PR B** (it already restructures Toast).
- **Scrollbar-on-scroll, TextArea counter/perf, Button icon-only, Badge icons** → small fixes; fold into **PR A** before it merges, or a tiny follow-up branch.

---

## PR D — Typography token compliance (P0, systemic)

### The bug (verified)
`lib/design_system/ilds_tokens.dart` DOES define typography tokens:
`fontFamilyPrimary = 'Mulish'`, `fontSize12/14/16/20`, `fontWeightRegular/Medium/Bold`, `lineHeight12/14/16/20`.

But components don't use them consistently:
- **14 of 17 components set NO `fontFamily` in their TextStyles** → they inherit the ambient theme font. In a consuming app that doesn't install the ILDS theme, all this text renders in the system font, not Mulish. Components must be self-contained.
  Missing `fontFamily`: **button, text_field, radio, checkbox, badge, tab, accordion, pagination, tag, search, switch, text_link, selection_button, text_area**.
- **Raw font sizes / line heights** instead of tokens: `button` (3), `toast` (3), `text_field` (6), `dropdown` (2). Example — `lib/ilds_button.dart:115-118`:
  ```dart
  return const TextStyle(
    fontSize: 16,          // should be ILDSTokens.fontSize16
    height: 1.25,          // should be ILDSTokens.lineHeight16
    fontWeight: ILDSTokens.fontWeightBold,  // already a token — good
  );
  ```

### The standard (apply to EVERY TextStyle in every `lib/ilds_*.dart`)
```dart
TextStyle(
  fontFamily: ILDSTokens.fontFamilyPrimary,
  fontSize:   ILDSTokens.fontSize14,     // pick the matching token, no raw numbers
  height:     ILDSTokens.lineHeight14,   // matching line-height token
  fontWeight: ILDSTokens.fontWeightMedium,
  // color stays per component state
)
```
Rules:
1. Every component TextStyle sets `fontFamily: ILDSTokens.fontFamilyPrimary`.
2. No raw `fontSize:` numbers — map to `ILDSTokens.fontSize12/14/16/20` by value.
3. No raw `height:` numbers — map to `ILDSTokens.lineHeight*` by value.
4. `fontWeight` uses `ILDSTokens.fontWeight*` (most already do).
5. If a component needs a size not in the token scale, STOP and flag it to Pratishek — don't invent a raw value.

### Enforcement (so this never regresses)
Add `test/typography_token_compliance_test.dart` that reads every `lib/ilds_*.dart` source and FAILS if any `TextStyle(` block:
- omits `fontFamily`, or
- contains a raw numeric `fontSize:` / `height:` (i.e. not `ILDSTokens.`).
Model it on the existing source-scanning checks in `tool/verify_token_exports.mjs`.

### Acceptance
- All 17 components: every TextStyle uses `ILDSTokens` for family/size/weight/line-height.
- New compliance test passes; it fails if you revert any one component.
- Visual: set the host app to a non-ILDS theme (e.g. default `ThemeData()` with no fontFamily) and confirm components still render in Mulish.

---

## PR A small fixes (fold in before A merges)

### A-fix-1. Scrollbar — artifact during scroll motion
Stationary is fixed; a second/!ghost bar still appears **while scrolling** (not at rest). Likely the page-level scroll surfaces during the gesture, or the inner `RawScrollbar` repaints against the wrong viewport mid-scroll.
- Pass an explicit, dedicated `ScrollController` to BOTH the `RawScrollbar` and the inner `ListView`, and ensure the demo panel's section is NOT inside the page's outer scroll for that region (or set `notificationPredicate` so the page scrollbar ignores the inner scroll).
- **Acceptance:** dragging/scrolling the 160px list shows exactly one scrollbar throughout the motion.

### A-fix-2. TextArea — counter position + drag perf
- The `0/150` counter renders far-right of the field. Check the Figma TextArea node for counter placement (likely bottom-right *under* the field, aligned to the field width — not floating at viewport right). Bring it to Figma.
- Drag feels sluggish: the grip's `onPanUpdate` calls `setState` on an `AnimatedContainer`, so every drag delta animates. During an active drag use a plain `Container` (or set `duration: Duration.zero` while dragging) so it tracks the pointer 1:1.
- **Acceptance:** counter matches Figma placement; grip tracks the cursor without lag.

### A-fix-3. Button — icon-only medium
`lib/ilds_button.dart` supports `IldsButtonSize.medium` in icon-only logic, but the **playground only demos L and S**.
- Check the Figma button set for an icon-only **medium** node. If it exists, add the medium icon-only demo (and confirm the component sizing matches). If Figma has only L/S icon-only, document that and leave as-is.
- **Acceptance:** playground matches Figma's icon-only sizes; no missing supported size.

### A-fix-4. Badge — correct icons
Playground passes placeholder Material icons; badges render `Icon(prefixIcon, …)` (`lib/ilds_badge.dart:108-109`).
- Check the Figma Badge node: do badges carry a status icon, and if so which? If Figma badges have NO icon, drop `prefixIcon` from the badge demo (skeleton already passes none). If they do, use the correct ILDS icon assets, not generic `Icons.*`.
- **Acceptance:** badge icons match Figma (or none), no placeholder glyphs.

---

## PR B addition — Toast reposition (architectural)

`lib/ilds_toast.dart` routes through `ScaffoldMessenger…showSnackBar`. SnackBar is **bottom-anchored by design**, so:
- Toast shows at the bottom; Pratishek wants **top-right**.
- Width appears to fill the page despite `width: 320` (floating SnackBar width handling on web).

Fix: replace the SnackBar mechanism with an **`Overlay` / `OverlayEntry`** toast host:
- Position top-right (stack downward when multiple), with a top/right inset token.
- **Max width 320** (Figma); content that's long grows the **height**, never beyond the 320 width.
- Keep auto-dismiss duration, close button, dual actions (from B1), per-variant styling.
- Confirm the canonical position against Figma; if Figma specifies a position, that wins over "top-right".
- **Acceptance:** toasts appear top-right, capped at 320 wide, height grows with content; no page-width fill; no freeze.

---

## Verification (every PR)
1. `flutter analyze lib/` clean.
2. `npm run verify:tokens` → 124.
3. `npm run verify:parity` → green.
4. New typography compliance test passes (PR D).
5. Goldens authored on Linux for any visual change (toast, badge, textarea, scrollbar).
6. One PR each, green on CI (`pull_request` trigger).
7. Pratishek re-walk per area.

## DO NOT
- Do not rely on the app theme for component fonts — set `fontFamily` on the component.
- Do not invent font sizes/line-heights outside the token scale — flag instead.
- Do not author goldens on macOS. Do not push to `main`. Do not touch the token pipeline.

## ADDENDUM (2026-06-18, after PR-A/B/D pushed)

### Correction — Button icon-only MEDIUM exists in Figma
Pratishek confirmed visually: the Figma button set has Large / Medium / Small, each with an **Icon Only** variant. Cursor's note "Figma icon-only is L+S only / no medium node" is **wrong** — remove it.
- The Flutter component already supports it (`_padding()` has a medium icon-only path `vertical: 8`, plus a medium icon-slot size).
- Find the Figma **medium icon-only** node in the button set, verify the component's medium icon-only padding + icon size against it, and **add the medium icon-only demo** to the playground (currently shows L + S only).
- Acceptance: playground shows icon-only L/M/S; component sizing matches the Figma medium icon-only node.

### RESOLVED — Badge font sizes (Pratishek checked Figma 2026-06-18)
Cursor's `_fontSize()` returning 11/13 is **wrong on both ends**. Figma truth:
- **Large + Medium badge = 12px**, line-height 16 (`Mobile/Body/Small.12 · 12/16`) → `ILDSTokens.fontSize12` + `lineHeight12` (already in scale; lineHeight12 = 1.333 = 16/12).
- **Small badge = 10px**, line-height 12, Mulish Medium → off-scale.

Action (Pratishek 2026-06-18: `fontSize10` token DEFERRED to a later typography pass; fix values now):
1. Badge large/medium → `ILDSTokens.fontSize12` + `lineHeight12` (Figma 12/16). Weight `fontWeightMedium`.
2. Badge small → **10px** — Figma value, but `fontSize10` is NOT yet a token. Keep it as a **documented outlier** for now: a clearly-commented raw `10` (`// OUTLIER: Figma small badge = 10px; tokenize as fontSize10 in the future typography pass`).
3. **Exempt Badge small from the PR D compliance test** with a named whitelist entry referencing this TODO, so the test stays green without hiding the debt.
4. Remove the wrong 11/13 entirely.

**DONE on `main` via `fix/flutter-phase3c-closeout` (2026-06-18).** Badge large/medium use `ILDSTokens.fontSize12` + `lineHeight12`; small uses documented `10` / `1.2` outliers with a named compliance-test whitelist — **not** spacing/border arithmetic. Compliance test now rejects `fontSize` derived from `spacing*` / `borderWidth*`.

### DONE — Button icon-only medium (2026-06-18)
Playground shows icon-only **L / M / S**; false "no medium node" note removed.

### DONE — Sign-off stamp (2026-06-18)
`docs/reports/PHASE3C_FLUTTER_REACT_SIGNOFF.md` → Approved, Pratishek, 18 June 2026.

### Historical — Badge font sizes (Pratishek checked Figma 2026-06-18)
Cursor's `_fontSize()` returning 11/13 is **wrong on both ends**. Figma truth:
Top-right overlay is implemented on `fix/flutter-fidelity-round3-b` (verified: `IldsToastPosition.top` default, `OverlayEntry` host, 320px). On `round3-a` the toast is still bottom — that's expected, not a regression. Re-walk the toast on `round3-b`.

## File index
`lib/design_system/ilds_tokens.dart` (typography tokens, read-only ref) · all `lib/ilds_*.dart` (PR D) · `lib/ilds_toast.dart` + `main.dart:_toastPanel` (Toast) · `lib/ilds_scrollbar.dart` + `main.dart:_scrollbarPanel` (A-fix-1) · `lib/ilds_text_area.dart` (A-fix-2) · `lib/ilds_button.dart` + playground (A-fix-3) · `lib/ilds_badge.dart` + playground (A-fix-4) · new `test/typography_token_compliance_test.dart`
