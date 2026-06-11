# ILDS Flutter Component Library — Phase 3 Brief for Gemini
### Complete Context Document · Do Not Truncate · Version 1.0 · Apr 6, 2026

---

## ⚠️ CRITICAL RULES BEFORE YOU START

1. **Never hardcode a hex color, pixel value, font size, or border radius.** Every value must trace back to an `ILDSTokens.*` constant. If a value doesn't exist in ILDSTokens, flag it as `// TODO: add to ILDSTokens` and use the closest existing token.
2. **Never assume a spec value.** If you are unsure about a size, padding, or color for a specific state, say so explicitly and ask rather than guess.
3. **Never rewrite a working component from scratch.** Existing implementations are the baseline. You are completing and refining them, not replacing them.
4. **Never import anything except `package:flutter/material.dart` and `design_system/ilds_tokens.dart`** unless explicitly told to.
5. **Figma is the source of truth.** File key: `PCUj412f0Z1zZLLxQUX22e` (ILDS Master | Design, ICICI Lombard Org workspace). If you cannot access Figma, say so — do not invent specs.
6. **All tokens come from the class `ILDSTokens` in `lib/design_system/ilds_tokens.dart`.** The full class is pasted in Section 3 of this document.

---

## MANDATORY RESPONSE TEMPLATE

**You must use this exact structure for every component task. Do not deviate.**

```
## [COMPONENT NAME] — [TASK DESCRIPTION]

### What I'm reading
[Describe exactly which Figma frame/variant/state you are referencing, or state that you are working from the existing code + this brief only]

### Current state of the file
[Describe what the current .dart file already implements — be specific about which variants/states exist]

### Delta (what changes)
[List every addition or modification you are making. If you are adding a new prop, name it. If you are changing a token reference, show old → new]

### Token map
[List every ILDSTokens.* constant used in this output, e.g.:
- Background (default): ILDSTokens.white
- Border (error): ILDSTokens.red600
- Label text: ILDSTokens.neutral500]

### Output
```dart
// complete file content
```

### Verification checklist
- [ ] Zero hardcoded hex values
- [ ] Zero hardcoded pixel values that exist as tokens
- [ ] All documented states/variants are handled
- [ ] Semantics/accessibility label is set where applicable
- [ ] No imports beyond flutter/material.dart and ilds_tokens.dart
```

---

## SECTION 1 — PROJECT CONTEXT

### What is ILDS?
ILDS (ICICI Lombard Design System) is the Flutter UI component library and design token system for ICICI Lombard General Insurance. It is the single source of truth for all UI across ICICI Lombard mobile/web products.

### Repository
`dsoftacademy/ilds-design-system` (GitHub, main branch)

### Folder structure relevant to Phase 3
```
lib/
  design_system/
    ilds_tokens.dart          ← Token constants (colors, spacing, radius, weights)
  components/
    button/                   ← (will be reorganised here eventually)
  ilds_button.dart            ← Button component [EXISTS — complete]
  ilds_chip.dart              ← Chip component [EXISTS — scaffolded, needs completion]
  ilds_text_field.dart        ← Text field [EXISTS — scaffolded, needs completion]
  ilds_toast.dart             ← Toast [EXISTS — scaffolded, needs completion]
  ilds_dropdown.dart          ← Dropdown [DOES NOT EXIST — create from scratch]
assets/
  fonts/
    Mulish-Regular.ttf
    Mulish-Bold.ttf
    Mulish-ExtraBold.ttf
    Mulish-Black.ttf
```

### Typography convention
- Font family: **Mulish** (always, no exceptions)
- Weights in tokens: `fontWeightRegular` (w400), `fontWeightMedium` (w500), `fontWeightBold` (w700)
- Never use `FontWeight.w600` or any weight not in ILDSTokens
- Font sizes are NOT in ILDSTokens yet — use exact values from Figma spec (12, 14, 16 are the three standard sizes)

---

## SECTION 2 — AUTOMATION PIPELINE CONTEXT (awareness only)

The project has a live automation pipeline:
- **Figma Variables** → n8n workflow → `tokens/tokens.json` → GitHub commit → Slack notification
- **Figma Variables Sync plugin** → Supernova (documentation portal, 92 colors live)

This does NOT affect your Flutter work. You write Dart. The pipeline handles design token propagation separately.

---

## SECTION 3 — COMPLETE ILDSTOKENS REFERENCE

```dart
// lib/design_system/ilds_tokens.dart
import 'package:flutter/material.dart';

class ILDSTokens {
  // ── Orange (Primary Brand) ────────────────────────────────────────────────
  static const Color orange50  = Color(0xFFFDF0EB); // Hover surface
  static const Color orange100 = Color(0xFFFAD9CC);
  static const Color orange200 = Color(0xFFF5B399); // Disabled primary bg
  static const Color orange300 = Color(0xFFF08D66);
  static const Color orange400 = Color(0xFFEB6733);
  static const Color orange500 = Color(0xFFE8440C); // PRIMARY BRAND — buttons, links, focus rings
  static const Color orange600 = Color(0xFFB93409); // Hover state
  static const Color orange700 = Color(0xFF8A2807); // Pressed/active state

  // ── Neutral ───────────────────────────────────────────────────────────────
  static const Color neutral0   = Color(0xFFFFFFFF); // Pure white
  static const Color neutral50  = Color(0xFFFAFAFA); // Off-white surface
  static const Color neutral100 = Color(0xFFF4F4F4); // Light grey background / disabled fill
  static const Color neutral200 = Color(0xFFE0E0E0); // Default border
  static const Color neutral300 = Color(0xFFADADAD); // Disabled text / placeholder / disabled border
  static const Color neutral400 = Color(0xFF6B6B6B); // Secondary icon / subtle text / helper text
  static const Color neutral500 = Color(0xFF3D3D3D); // Secondary body text / labels
  static const Color neutral600 = Color(0xFF2A2A2A);
  static const Color neutral900 = Color(0xFF111111); // Primary body text — near black
  static const Color white      = Color(0xFFFFFFFF); // Alias for neutral0

  // ── Blue ──────────────────────────────────────────────────────────────────
  static const Color blue50  = Color(0xFFEFF6FF); // Info surface
  static const Color blue500 = Color(0xFF2563EB); // Info / link colour
  static const Color blue600 = Color(0xFF1D4ED8);

  // ── Green ─────────────────────────────────────────────────────────────────
  static const Color green50  = Color(0xFFDCFCE7); // Success surface
  static const Color green500 = Color(0xFF22C55E);
  static const Color green600 = Color(0xFF16A34A); // SUCCESS STATE — borders, icons, text

  // ── Red ───────────────────────────────────────────────────────────────────
  static const Color red50  = Color(0xFFFEE2E2); // Error surface
  static const Color red500 = Color(0xFFEF4444);
  static const Color red600 = Color(0xFFDC2626); // ERROR/DESTRUCTIVE — borders, icons, text

  // ── Amber ─────────────────────────────────────────────────────────────────
  static const Color amber50  = Color(0xFFFEF9C3); // Warning surface
  static const Color amber500 = Color(0xFFF59E0B); // WARNING — borders, icons
  static const Color amber600 = Color(0xFFD97706);

  // ── Border Radius ─────────────────────────────────────────────────────────
  static const double borderRadiusXs   = 2.0;
  static const double borderRadiusSm   = 4.0;
  static const double borderRadiusMd   = 8.0;    // Buttons, inputs, dropdowns, toasts
  static const double borderRadiusLg   = 12.0;   // Cards
  static const double borderRadiusXl   = 16.0;   // Modals, bottom sheets
  static const double borderRadius2xl  = 24.0;
  static const double borderRadiusFull = 9999.0; // Chips, pills, badges

  // ── Spacing ───────────────────────────────────────────────────────────────
  static const double spacing1  = 4.0;
  static const double spacing2  = 8.0;
  static const double spacing3  = 12.0;
  static const double spacing4  = 16.0;
  static const double spacing5  = 20.0;
  static const double spacing6  = 24.0;
  static const double spacing8  = 32.0;
  static const double spacing10 = 40.0;
  static const double spacing12 = 48.0;
  static const double spacing16 = 64.0;

  // ── Border Width ──────────────────────────────────────────────────────────
  static const double borderWidth1 = 1.0;
  static const double borderWidth2 = 2.0; // Focus ring width
  static const double borderWidth4 = 4.0;

  // ── Font Weights ──────────────────────────────────────────────────────────
  static const FontWeight fontWeightRegular = FontWeight.w400;
  static const FontWeight fontWeightMedium  = FontWeight.w500;
  static const FontWeight fontWeightBold    = FontWeight.w700;
}
```

---

## SECTION 4 — COMPONENT 1: BUTTON (`ilds_button.dart`)

### Status: ✅ COMPLETE — do not rewrite

### What exists
Full implementation with:
- `IldsButtonType`: primary, secondary, tertiary
- `IldsButtonSize`: large, medium, small
- `IldsButtonAppearance`: normal, destructive
- `isDisabled`, `isLoading`, `leading` widget, `trailing` widget
- All state color resolution via `_ButtonColors`
- Correct token references throughout
- Semantics label

### What may need refinement (check against Figma)
- Verify pressed state: currently relies on InkWell ripple. Figma may show explicit `orange700` background on press for primary. If so, add `WidgetStateProperty` via `MaterialStateProperty` on the InkWell overlay color.
- Icon sizing per size variant: large=24px, medium=20px, small=16px — verify these match Figma.

### Figma reference
Component set node: `13472:2804`. Loading variants: `13472:2884`.

### Do NOT touch unless Figma review reveals discrepancy.

---

## SECTION 5 — COMPONENT 2: TEXT FIELD (`ilds_text_field.dart`)

### Status: 🔄 SCAFFOLDED — needs completion

### What exists
- `IldsTextFieldKind`: standard, password, otpX6, otpX4
- Basic state coloring: error (red600), success (green600), default (neutral200)
- Focus ring: orange500, borderWidth2
- Disabled fill: neutral100
- Password toggle icon
- OTP grid builder

### What is MISSING — complete these in order

**Missing 1: Leading icon support**
Add `Widget? leadingIcon` prop. When present, show it inside the field's left side using `prefixIcon:` in InputDecoration. Color: `neutral400` (default), `orange500` (focused), `red600` (error), `green600` (success).

**Missing 2: Trailing icon (non-password)**
Add `Widget? trailingIcon` prop. Independent of the password toggle — it shows on the right side for non-password fields (e.g., search icon, clear button).

**Missing 3: Character count**
Add `int? maxLength` prop. When provided, show `{currentLength}/{maxLength}` right-aligned below the field in `neutral400`, 12px. Do NOT use TextField's built-in counter (it doesn't match ILDS style) — implement manually.

**Missing 4: Read-only visual state**
When `isReadOnly: true`, background should be `neutral50`, border `neutral200`, text `neutral500`. Currently no distinct visual for read-only vs editable.

**Missing 5: Focused border state (error)**
When the field has an error AND is focused, the focus border should still be `red600` at `borderWidth2`, not orange. Add `errorBorder` and `focusedErrorBorder` to InputDecoration.

### Token map for text field states
| State | Border color | Border width | Fill | Text/icon |
|-------|-------------|-------------|------|-----------|
| Default | neutral200 | borderWidth1 | transparent | neutral900 |
| Focused | orange500 | borderWidth2 | transparent | neutral900 |
| Error | red600 | borderWidth1 | transparent | neutral900 |
| Error + Focused | red600 | borderWidth2 | transparent | neutral900 |
| Success | green600 | borderWidth1 | transparent | neutral900 |
| Disabled | neutral300 | borderWidth1 | neutral100 | neutral300 |
| Read-only | neutral200 | borderWidth1 | neutral50 | neutral500 |

### Label styles
- Field label (above): 12px, fontWeightMedium, neutral500
- Placeholder/hint: 14px, fontWeightRegular, neutral300
- Input text: 14px, fontWeightRegular, neutral900
- Helper/error/success text (below): 12px, fontWeightRegular, color per state

### OTP cell spec
- Width: 48px, Height: 56px, Gap: spacing2 (8px)
- Border radius: borderRadiusMd
- Font: 20px, fontWeightBold, neutral900
- Filled state (when digit entered): bg neutral50, border orange500

---

## SECTION 6 — COMPONENT 3: CHIP / TAG (`ilds_chip.dart`)

### Status: 🔄 SCAFFOLDED — needs completion

### What exists
- `IldsChipSize`: large (h=36), medium (h=28)
- Selected / unselected / disabled states
- Prefix icon, suffix (remove) button
- Pill shape via borderRadiusFull

### What is MISSING

**Missing 1: Tag variant (non-interactive)**
Add `bool isTag = false` prop. Tags are display-only (no tap, no selection state), shown with a solid colored background. Variants: default (neutral100 bg, neutral500 text), success (green50 bg, green600 text), warning (amber50 bg, amber600 text), error (red50 bg, red600 text), info (blue50 bg, blue500 text).
Add `IldsChipTagVariant` enum: default, success, warning, error, info.

**Missing 2: Avatar prefix**
Add `Widget? avatar` prop. When provided, shows a circular 20px (large) / 16px (medium) widget on the left, before the label. No additional icon when avatar is present.

**Missing 3: Count badge**
Add `int? count` prop. When provided, shows a small orange pill with white number on the right side (replaces suffix button). Example use: filter chip showing how many items match.

### Chip token map
| Property | Default | Selected | Disabled |
|----------|---------|----------|---------|
| Border | neutral200 | orange500 | neutral300 |
| Label color | neutral500 | orange500 | neutral300 |
| Background | transparent | orange500 @ 8% | transparent |
| Font weight | regular | bold | regular |

### Tag variant token map
| Variant | Background | Text/icon |
|---------|-----------|-----------|
| default | neutral100 | neutral500 |
| success | green50 | green600 |
| warning | amber50 | amber600 |
| error | red50 | red600 |
| info | blue50 | blue500 |

### Size spec
| Size | Height | H-padding | Font size | Icon size |
|------|--------|-----------|-----------|-----------|
| large | 36px | spacing3 (12) | 14px | 16px |
| medium | 28px | spacing2 (8) | 12px | 14px |

---

## SECTION 7 — COMPONENT 4: DROPDOWN (`ilds_dropdown.dart`)

### Status: ❌ DOES NOT EXIST — create from scratch

### Overview
A styled dropdown (single-select) that matches ILDS text field visual language. Uses an overlay for the options list rather than Flutter's DropdownButton (which cannot be styled to match ILDS spec).

### Props
```dart
enum IldsDropdownSize { large, medium }

class IldsDropdown extends StatefulWidget {
  final String label;
  final String placeholder;         // shown when no option selected
  final List<IldsDropdownOption> options;
  final String? selectedValue;      // the value of the selected option
  final ValueChanged<String?>? onChanged;
  final bool enabled;
  final bool isLoading;
  final String? errorText;
  final String? helperText;
  final IldsDropdownSize size;
}

class IldsDropdownOption {
  final String label;   // display text
  final String value;   // internal identifier
  final bool disabled;
}
```

### Visual spec

**Trigger row (closed state):**
- Same dimensions and border as IldsTextField standard
- Left: selected label (neutral900) or placeholder (neutral300)
- Right: chevron-down icon (neutral400), rotates 180° when open
- Border: neutral200 (default), orange500 @ borderWidth2 (open/focused), red600 (error), neutral300 (disabled)
- Background: white (default), neutral100 (disabled)
- Border radius: borderRadiusMd on all four corners when closed
- Top corners borderRadiusMd, bottom corners 0 when options overlay is open directly below

**Options overlay (open state):**
- Appears directly below the trigger
- White background, elevation 4
- Border: orange500, borderWidth2 on left+right+bottom (continues the open trigger border)
- Bottom border radius: borderRadiusMd
- Each option row: 48px height (large) / 40px (medium), hPadding spacing4
- Option text: 14px, fontWeightRegular, neutral900
- Hover/focused option: neutral50 background
- Selected option: orange50 background, orange500 text, fontWeightBold, checkmark icon right
- Disabled option: neutral300 text, not tappable
- Max visible: 5 options, scroll for more

**Size spec:**
| Size | Trigger height | Option row height | Font size |
|------|---------------|------------------|-----------|
| large | 48px | 48px | 14px |
| medium | 40px | 40px | 12px |

### States
- Default: border neutral200
- Open: border orange500, borderWidth2, chevron rotated
- Selected: trigger shows selected label in neutral900
- Error: border red600, errorText shown below
- Disabled: neutral100 fill, neutral300 border+text, no interaction
- Loading: spinner in trailing position (same as IldsTextField loading)

### Implementation approach
Use `Overlay` + `OverlayEntry` for the options list so it can appear above other widgets. Track `_isOpen` state and the trigger's RenderBox position to place the overlay.

### IMPORTANT: Do NOT use `DropdownButton`, `DropdownButtonFormField`, or `PopupMenuButton`. These cannot be styled to match the ILDS spec.

---

## SECTION 8 — COMPONENT 5: TOAST (`ilds_toast.dart`)

### Status: 🔄 SCAFFOLDED — needs completion

### What exists
- `IldsToastVariant`: info, success, warning, error
- Static `show()` method via ScaffoldMessenger
- Icon per variant
- Action label (TextButton)
- White card with elevation 4

### What is MISSING

**Missing 1: Title support**
Add `String? title` prop. When provided, render above the message in 14px, fontWeightBold, neutral900. Message in that case becomes 14px, fontWeightRegular, neutral500.

**Missing 2: Close button**
Add `bool showClose = false` prop. When true, show an X icon button (neutral400) in the top-right corner. Tapping it dismisses the snackbar via `ScaffoldMessenger.of(context).hideCurrentSnackBar()`.

**Missing 3: Left accent bar**
Add `bool showAccentBar = true` prop (default true). When true, render a 4px wide vertical bar on the left edge of the toast card using the accent color. This is the ILDS standard toast style.

**Missing 4: Persistent toast**
Add `bool isPersistent = false` prop to `show()`. When true, set duration to `const Duration(days: 365)` (effectively forever until manually dismissed). Only works with `showClose: true`.

**Missing 5: Position control**
`show()` currently always uses `SnackBarBehavior.floating`. Add `IldsToastPosition` enum (bottom, top) to `show()`. Top position requires `margin: EdgeInsets.only(top: X)` calculated from MediaQuery.

### Toast token map
| Variant | Accent color | Icon color | Surface |
|---------|-------------|------------|---------|
| info | orange500 | orange500 | white |
| success | green600 | green600 | white |
| warning | amber500 | amber500 | white |
| error | red600 | red600 | white |

### Accent bar spec
- Width: 4px (use `borderWidth4` token)
- Height: full card height
- Color: same as `_accent()`
- Implementation: `Container` on the left side of the outer Row, with `borderRadius: BorderRadius.only(topLeft: Radius.circular(borderRadiusMd), bottomLeft: Radius.circular(borderRadiusMd))`

---

## SECTION 9 — CODE CONNECT PHASE (awareness only, do NOT implement now)

After Phase 3, each component will get a `.figma.ts` file mapping Flutter props to Figma component properties. Example:
```typescript
// button.figma.ts — maps IldsButton props to Figma component set 13472:2804
figma.connect(IldsButton, 'figma.com/...', {
  props: {
    type: figma.enum('Type', { primary: IldsButtonType.primary }),
    label: figma.string('Label'),
    isDisabled: figma.boolean('Disabled'),
  }
});
```
Stub files (button.figma.ts, chip.figma.ts, etc.) already exist in the repo root.

---

## SECTION 10 — TASK ORDER FOR PHASE 3

Execute in this order:

1. **Text Field completion** (Missing 1–5 from Section 5)
2. **Chip completion** (Missing 1–3 from Section 6)
3. **Dropdown creation** (full implementation, Section 7)
4. **Toast completion** (Missing 1–5 from Section 8)
5. **Button verification** (check pressed state + icon sizing against Figma, Section 4)

For each task, use the mandatory response template from the top of this document.

---

## SECTION 11 — WHAT TO DO IF YOU ARE UNSURE

- **Unsure about a color?** → Ask, do not guess. State which state/variant is unclear.
- **Unsure about a size?** → Check Figma. If Figma is unavailable, ask.
- **Token not in ILDSTokens?** → Do NOT hardcode. Mark as `// TODO: add token — using closest approximation` and explain.
- **Figma says something contradicts this brief?** → Figma wins. Explicitly note the discrepancy.
- **A prop or variant isn't in this brief?** → Ask before implementing.

---

## SECTION 12 — CALLING CLAUDE FOR HELP

If Gemini hallucinates or gets stuck, Pratishek will switch to Claude (me) for correction. When that happens, share:
1. The exact Gemini output that was wrong
2. Which component and which state
3. What the expected behavior should be

Claude has full context of this project and will correct without restarting from scratch.

---

*Document generated: Apr 6, 2026 · ILDS Design System · ICICI Lombard General Insurance*
*Figma file: PCUj412f0Z1zZLLxQUX22e · GitHub: dsoftacademy/ilds-design-system*
