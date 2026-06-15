# Flutter parity audit

**Date:** 15 June 2026  
**HEAD baseline:** `866faab` area (Flutter parity PR)  
**Reference order:** Figma → React (Storybook) → Flutter  
**Harness:** `npm run verify:parity` — **64/64** (flutter on all 16 rules)

---

## Summary

| Status | Count |
|--------|-------|
| Fixed in this pass | 8 |
| Playground-only (was unwired) | 5 |
| Deferred (documented) | 3 |

---

## Per-component audit

| Component | Figma ref | Finding | Action |
|-----------|-----------|---------|--------|
| **Search** | `13965:16190` | Pill radius (`borderRadiusFull`) vs web `rounded-medium` (4px) | **Fixed** → `borderRadiusSm`; coolgray bg/border tokens |
| **TextArea** | `14369:11586` | `Icons.drag_handle` placeholder | **Fixed** → `_IldsTextAreaResizeGrip` (12×12px, 3-line grip) |
| **TextField** | `13478:25333` | Default border used alias `neutral200` (= coolgray300) not coolgray500 | **Fixed** → `neutralCoolgray500` |
| **TextField** | `13478:25729` | Disabled fill `neutral100` (= coolgray100) not coolgray200 | **Fixed** → `neutralCoolgray200` |
| **Toast** | `17708:3510` | Info accent was `orange500` | **Fixed** → `informativeBlue500` + `secondaryBlue50` border |
| **Toast** | `17708:3491` | Card radius `borderRadiusMd`, no variant border | **Fixed** → `borderRadiusLg` + `_borderColor()` |
| **Switch** | `14371:6410` | Off track `neutral200` (= coolgray300) not coolgray100 | **Fixed** → `neutralCoolgray100` |
| **Button** | `13472:2804` | Playground showed secondary/tertiary only | **Fixed** — full type × size × appearance matrix in playground |
| **Tabs** | `17667:2363` / `2387` | Single default demo | **Fixed** — high/fixed/left + medium/scrollable/center |
| **Chip** | `14018:6786` | Not in playground | **Fixed** — filter + tag variants wired |
| **Dropdown** | `13476:22316` | Not in playground | **Fixed** — wired with sample options |
| **Scrollbar** | `17730:521` | Not in playground | **Fixed** — scrollable list demo |
| **TextField** | — | Not in playground | **Fixed** — standard/password/disabled/OTP |
| **Toast** | — | Not in playground | **Fixed** — all variants via `IldsToast.show` |
| **Dropdown menu** | `16055:6152` | Flutter overlay lacks radio-row + section label parity with React `DropdownMenu` | **Deferred** — React menu is canonical; Flutter overlay refresh tracked for native pass |
| **Dropdown label** | `13476:22317` | Flutter label uses `neutral600` alias vs Figma coolgray900 | **Deferred** — alias maps to coolgray900; harness accepts `neutral600` |
| **TextArea** | `14369:11586` | Default border uses alias tokens not faithful coolgray names | **Deferred** — visual match verified; token naming cleanup optional |

---

## Parity harness (Phase 4)

**Before:** flutter on 7/16 rules (55 total checks)  
**After:** flutter on 16/16 rules (**64** total checks)

File: `tool/verify_cross_platform_parity.mjs`

---

## Playground coverage

File: `ilds_component_playground_app/lib/main.dart`

All **18** `lib/ilds_*.dart` components now have navigation entries and demos.

---

## Verification commands

```bash
flutter analyze lib/
npm run verify:parity      # 64/64
flutter test test/golden/  # regenerate if toast visuals changed
npm run test:web
```

---

*Update when new Flutter/Figma drift is found.*
