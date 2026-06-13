# QA Audit — Commit b0c50b4 Defect Report
**Audited by:** Claude  
**Date:** 2026-06-14  
**Commit:** b0c50b4 (Phase 3c + 4a + 4b)  
**Auditor verdict:** 2 build-blocking / data bugs found. Cursor report's "38/38 parity ✅" is CORRECT for React — the bugs are exclusively in Flutter. Flutter build is currently **broken**.

---

## 🔴 BUG 1 — CRITICAL (Flutter compile error)

**`ILDSTokens.neutral800` is undefined**

| Field | Value |
|---|---|
| File | `lib/ilds_tab.dart` |
| Lines | 130, 132 |
| Symbol | `ILDSTokens.neutral800` |
| Status | **Does not exist** in `lib/design_system/ilds_tokens.dart` |

`ilds_tokens.dart` neutral alias map:
```
neutral0   = globalWhite000
neutral50  = neutralCoolgray50
neutral100 = neutralCoolgray100
neutral200 = neutralCoolgray300  ← intentionally skips
neutral300 = neutralCoolgray500
neutral400 = neutralCoolgray600
neutral500 = neutralCoolgray800  ← #424242
neutral600 = neutralCoolgray900  ← #212121
neutral900 = globalBlack1000     ← #020202
```
`neutral700` and `neutral800` are **not defined**. The Flutter tab references `neutral800` in:
```dart
// Line 130 — pressed text color
if (_pressedIndex == index) return ILDSTokens.neutral800;
// Line 131 — hover text color  
if (_hoveredIndex == index) return ILDSTokens.neutral900;
// Line 132 — unselected default text
return _isHigh ? ILDSTokens.neutral800 : ILDSTokens.neutral800;
```

**What it should be:** iOS `IldsTabs.swift` uses `neutralCoolgray800` (#424242) for unselected tab text = `neutral500` in the Flutter alias system.

**Fix:** Replace `ILDSTokens.neutral800` → `ILDSTokens.neutral500` in `lib/ilds_tab.dart`.

---

## 🟠 BUG 2 — MAJOR (wrong text color across 13 Flutter files)

**`ILDSTokens.neutral900` = `globalBlack1000` = `#020202` — NOT neutralCoolgray900 (#212121)**

The `neutral900` alias maps to `globalBlack1000 = Color(0xFF020202)` — near-black, not the intended dark-neutral-text color. All Flutter component files that use `neutral900` for label/body text are rendering `#020202` instead of `#212121` (off by ~33 luminance units).

The CORRECT token for "dark neutral text" (neutralCoolgray900) is `ILDSTokens.neutral600`.

**Affected files and line numbers:**

| File | Lines | Usage context |
|---|---|---|
| `lib/ilds_dropdown.dart` | 181, 238 | Selected item text, default text |
| `lib/ilds_toast.dart` | 170 | Message heading text |
| `lib/ilds_accordion.dart` | 46, 51 | Header text, pressed text |
| `lib/ilds_selection_button.dart` | 80 | Pressed/hovered label |
| `lib/ilds_text_field.dart` | 181, 288 | Input text, label |
| `lib/ilds_tag.dart` | 63 | Hovered/pressed text |
| `lib/ilds_search.dart` | 124 | Input text |
| `lib/ilds_pagination.dart` | 99, 121, 150 | Unselected page number, ellipsis, compact text |
| `lib/ilds_switch.dart` | 97 | Label text |
| `lib/ilds_text_area.dart` | 109 | Input text |
| `lib/ilds_radio.dart` | 172 | Label text |
| `lib/ilds_checkbox.dart` | 183 | Label text |
| `lib/ilds_tab.dart` | 131 | Hover text |

**Fix:** Replace ALL `ILDSTokens.neutral900` with `ILDSTokens.neutral600` in the 13 component files above. Do NOT touch `lib/design_system/ilds_tokens.dart` itself.

---

## 🟡 BUG 3 — MINOR (cross-platform inconsistency, needs Figma confirm)

**Chip prefix icon: wrong color in disabled state on React, iOS, Android**

| Platform | Prefix icon color (disabled) | Correct? |
|---|---|---|
| Flutter | `labelColor` = `neutralCoolgray500` (#9e9e9e) ✅ | ✅ Adapts |
| React | `text-primary-orange-500` always | ⚠️ Stays orange |
| iOS | `ILDSTokens.primaryOrange500` always | ⚠️ Stays orange |
| Android | `LocalContentColor provides IldsTokens.primaryOrange500` always | ⚠️ Stays orange |

Flutter correctly adapts the prefix icon color to match the label color in disabled state (neutralCoolgray500 = #9e9e9e). The other 3 platforms always use orange regardless of disabled state.

**Action required:** Verify Figma Chip disabled + prefix variant. If Figma shows gray icon in disabled state, fix React, iOS, Android.

React fix: Change `prefixIconSlotClasses` to be a function that accepts `isDisabled` and returns `text-neutral-coolgray-500` when disabled.

iOS fix: Replace `.foregroundStyle(ILDSTokens.primaryOrange500)` with `.foregroundStyle(isDisabled ? ILDSTokens.neutralCoolgray500 : ILDSTokens.primaryOrange500)`.

Android fix: Wrap `CompositionLocalProvider` in disabled check — use `colors.label` (already neutralCoolgray500 in disabled state) instead of hardcoded `primaryOrange500`.

---

## ℹ️ TOOL BUG 4 — `tool/verify_cross_platform_parity.mjs` HEX_TO_TOKEN errors

Three wrong hex→token mappings (informational only — does not affect rule enforcement):

| Hex | Current mapping | Correct mapping | Actual token value |
|---|---|---|---|
| `#bdbdbd` | `neutralCoolgray300` | `neutralCoolgray400` | `Color(hex: 0xBDBDBD)` = coolgray400 |
| `#a30100` | `errorRed800` | `errorRed700` | `Color(0xFFA30100)` = errorRed700 per ilds_tokens.dart |
| `#edf3ff` | `secondaryBlue50` | `informativeBlue50` | `informativeBlue50 = Color(hex: 0xEDF3FF)` confirmed in dist/ILDSTokens.swift |

Note: `secondaryBlue50 = #edf6ff` (correct in map) and `informativeBlue50 = #edf3ff` (currently mislabeled). These are different blues with different semantic meanings.

---

## ℹ️ TOOL BUG 5 — No Checkbox rule in `verify_cross_platform_parity.mjs`

Phase 3c claims Checkbox parity across all platforms. The parity tool has 12 rules but none covers Checkbox. The `web/specs/checkbox.spec.json` exists and is verified, but no cross-platform rule enforces that iOS/Android/Flutter use the correct checked color (`primaryOrange500`).

The iOS `IldsCheckbox.swift` was manually verified and is correct. But this gap means future regressions won't be caught automatically.

---

## ✅ WHAT IS CONFIRMED GOOD

Everything passing verification in this audit:

- **React parity**: 38/38 matrix checks ✅, 124 tokens ✅
- **iOS IldsChip.swift**: sizes 24/20, tokens correct, font Regular 12px ✅
- **iOS IldsTabs.swift**: high/medium emphasis split correct, primaryOrange500/globalWhite000 for selected ✅
- **iOS IldsToast.swift**: info border = secondaryBlue50 (#edf6ff), icon = informativeBlue500 ✅
- **iOS IldsPagination.swift**: selected = primaryOrange50 + primaryOrange600 ✅
- **iOS IldsCheckbox.swift**: all states correct (checked/unchecked/indeterminate/error), sizes 16/20/24 ✅
- **Android IldsPagination.kt**: selected = primaryOrange50 + primaryOrange600, no border ✅
- **Flutter ilds_chip.dart**: 15 defects fixed — sizes, padding, colors all correct ✅
- **Flutter ilds_pagination.dart**: selected = orange50 + orange600, nav color = orange500 ✅
- **Flutter ilds_tab.dart**: logic structure correct (emphasis split, scrollable indicator, key measurement) — only the undefined symbol is broken ✅
- **web/specs/chip.spec.json**: hover bg=#e0e0e0 (coolgray-300), border=#757575 (coolgray-600) ✅
- **web/specs/badge.spec.json**: subtle = #edf6ff (correct = secondaryBlue50), all 6 variants ✅
- **web/specs/checkbox.spec.json**: checked = #e3530f, unchecked border = #757575, sizes 16/20/24 ✅
- **React Chip.tsx**: hover classes `neutral-coolgray-300` / `neutral-coolgray-600` correct ✅
- No hardcoded hex in any native component files ✅

---

## FIX SUMMARY FOR CURSOR

**2 files need immediate fix (broken build + wrong colors):**

### Fix 1: `lib/ilds_tab.dart` — replace `neutral800` → `neutral500` (3 occurrences)
```dart
// Line 130: change
if (_pressedIndex == index) return ILDSTokens.neutral500;
// Line 131: change
if (_hoveredIndex == index) return ILDSTokens.neutral600;
// Line 132: change
return _isHigh ? ILDSTokens.neutral500 : ILDSTokens.neutral500;
```

Note: hover (line 131) uses `neutral900` in the original which was intended as dark text. Replace with `neutral600` (= neutralCoolgray900 = #212121).

### Fix 2: All 13 Flutter files — replace `ILDSTokens.neutral900` → `ILDSTokens.neutral600`

Run this sed command (or Cursor batch replace):
```bash
# In each file, replace neutral900 with neutral600 (component files only)
files=(
  lib/ilds_dropdown.dart
  lib/ilds_toast.dart
  lib/ilds_accordion.dart
  lib/ilds_selection_button.dart
  lib/ilds_text_field.dart
  lib/ilds_tag.dart
  lib/ilds_search.dart
  lib/ilds_pagination.dart
  lib/ilds_switch.dart
  lib/ilds_text_area.dart
  lib/ilds_radio.dart
  lib/ilds_checkbox.dart
  lib/ilds_tab.dart
)
for f in "${files[@]}"; do
  sed -i 's/ILDSTokens\.neutral900/ILDSTokens.neutral600/g' "$f"
done
```

After both fixes: run `flutter analyze` to confirm zero errors.

### Fix 3 (Figma confirm first): Chip disabled prefix icon
After confirming Figma disabled+prefix variant, update React, iOS, Android to adapt icon color to neutral in disabled state.

### Fix 4: `tool/verify_cross_platform_parity.mjs`
```js
// Line 22: change
'#bdbdbd': 'neutralCoolgray400',  // was neutralCoolgray300
// Line 36: change  
'#a30100': 'errorRed700',         // was errorRed800
// Line 33: change
'#edf3ff': 'informativeBlue50',   // was secondaryBlue50
```

---

## Priority Order

| Priority | Bug | Action |
|---|---|---|
| P0 | Bug 1: neutral800 compile error | Fix now — Flutter won't build |
| P0 | Bug 2: neutral900 wrong color (13 files) | Fix now — all Flutter text is wrong color |
| P1 | Bug 3: chip prefix icon disabled | Verify Figma first, then fix |
| P2 | Bug 4: HEX_TO_TOKEN tool | Fix in next tooling pass |
| P2 | Bug 5: No Checkbox rule | Add rule in next tooling pass |

---

## Resolution (2026-06-14)

All items addressed in commit **`ad7056b`** (`fix(flutter): correct neutral alias usage and Chip disabled prefix parity`).

| Bug | Status |
|-----|--------|
| P0 Bug 1 — `neutral800` compile error | ✅ Fixed (`ilds_tab.dart` → `neutral500` / `neutral600`) |
| P0 Bug 2 — `neutral900` wrong text color (13 files) | ✅ Fixed (`neutral900` → `neutral600`) |
| P1 Bug 3 — Chip disabled prefix icon | ✅ Fixed (React, iOS, Android; Figma `14018:6812` confirmed) |
| P2 Bug 4 — HEX_TO_TOKEN tool | ✅ Fixed |
| P2 Bug 5 — No Checkbox rule | ✅ Added (matrix now 47/47) |

**Verification after fix:**
- `flutter analyze lib/` — zero issues
- `npm run verify:parity` — 47/47 passed

**Cleanup:** Accidental Flutter scaffold at repo root (`android/app/`, `ios/Flutter/`, `ios/Runner/`) removed; paths added to `.gitignore`. Root `ios/` remains the SwiftPM package (`Sources/ILDSDesignSystem/`); use `ilds_component_playground_app/` for Flutter app runs.
