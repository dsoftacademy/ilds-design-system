# ILDS Phase 5 — Supernova Documentation Portal
### Audience: Internal devs + stakeholders (PMs, designers) · Apr 2026
### Supernova project: app.supernova.io/718203-ilds-design-system

---

## OVERVIEW

Build a complete documentation portal covering:
1. Design Principles (colour, typography, spacing, accessibility)
2. Token Reference (colours, spacing, border radius — auto-synced)
3. Component Docs × 5 (Button, TextField, Chip, Dropdown, Toast)
4. Portal configuration + published URL

All token data is live in Supernova from the plugin sync. Component pages are written manually in Supernova's editor using the content in this brief.

---

## SECTION 1 — PORTAL STRUCTURE (Page hierarchy)

Configure in Supernova → Documentation → Pages panel:

```
ILDS Design System
├── Getting Started
│   ├── Introduction
│   └── How to use ILDS
├── Design Principles
│   ├── Colour
│   ├── Typography
│   ├── Spacing
│   └── Accessibility
├── Tokens
│   ├── Colour Tokens
│   ├── Spacing Tokens
│   └── Border Radius
└── Components
    ├── Button
    ├── Text Field
    ├── Chip
    ├── Dropdown
    └── Toast
```

---

## SECTION 2 — GETTING STARTED

### Page: Introduction

**Title:** ICICI Lombard Design System (ILDS)

**Body:**
> ILDS is the single source of truth for all digital product interfaces at ICICI Lombard. It provides Flutter components, design tokens, and Figma assets aligned to the ICICI Lombard brand.

**Key facts block:**
- Built with: Flutter (Dart)
- Token format: W3C DTCG, synced from Figma Variables
- Figma file: ILDS Master | Design
- GitHub: dsoftacademy/ilds-design-system

### Page: How to use ILDS

**Body:**
> Add the `ilds_tokens.dart` file to your Flutter project. Import individual component files from `lib/`. All components consume tokens from `ILDSTokens` — no hardcoded values.

**Flutter setup snippet:**
```dart
// Import tokens
import 'package:ilds/ilds_tokens.dart';

// Import components
import 'package:ilds/ilds_button.dart';
import 'package:ilds/ilds_chip.dart';
import 'package:ilds/ilds_text_field.dart';
import 'package:ilds/ilds_dropdown.dart';
import 'package:ilds/ilds_toast.dart';
```

---

## SECTION 3 — DESIGN PRINCIPLES

### Page: Colour

**Overview:**
> ILDS colours are organised into semantic groups. Always use token references — never hardcode hex values in components or screens.

**Colour groups:**
| Group | Purpose | Key tokens |
|---|---|---|
| Primary Orange | Brand, CTAs, interactive elements | orange/500 (rest), orange/600 (hover), orange/700 (pressed) |
| Secondary Maroon | Supporting brand colour | maroon/500 |
| Neutral Warm Gray | UI surfaces, text, borders | warmgray/50–900 |
| Neutral Cool Gray | Secondary surfaces | coolgray/50–900 |
| Error Red | Errors, destructive actions | red/500–700 |
| Warning Amber | Caution states | amber/500–600 |
| Success Green | Positive feedback | green/500–600 |
| Informative Blue | Neutral information | blue/400–600 |

**Interactive state rule:**
> Primary actions follow a consistent token scale: `/500` resting → `/600` hover → `/700` pressed. Never use a lighter shade for pressed state.

**Do/Don't:**
| ✅ Do | ❌ Don't |
|---|---|
| Use `ILDSTokens.orange500` for button backgrounds | Hardcode `#E8440C` |
| Use `ILDSTokens.amber600` for warning text | Use orange for warnings |
| Use `ILDSTokens.errorRed500` for error borders | Use red for brand elements |

---

### Page: Typography

**Overview:**
> ILDS uses Mulish as the primary typeface across all digital surfaces. Typography tokens define size, weight, and line-height for every text style.

**Type scale:**
| Style | Size | Weight | Use |
|---|---|---|---|
| Display XL | 72px | 700 | Hero headers |
| Display L | 64px | 700 | Page titles |
| Display M | 56px | 600 | Section headers |
| Display S | 48px | 600 | Card headers |
| Heading | 32–40px | 600 | Sub-sections |
| Title | 24–28px | 600 | Component headers |
| Label | 16–20px | 500 | Labels, captions |
| Body | 14–16px | 400 | Body text |

**Font loading:**
> Mulish font files live in `assets/fonts/Mulish/`. Register in `pubspec.yaml` before use.

---

### Page: Spacing

**Overview:**
> ILDS uses an 8-point spacing scale. All padding, margin, and gap values must reference spacing tokens from `ILDSTokens`.

**Spacing scale:**
| Token | Value | Use |
|---|---|---|
| `spacing1` | 2px | Micro gaps (icon to text) |
| `spacing2` | 4px | Tight padding |
| `spacing3` | 6px | Input internal padding |
| `spacing4` | 8px | Base unit |
| `spacing5` | 12px | Card padding (compact) |
| `spacing6` | 16px | Standard content padding |
| `spacing7` | 20px | Section gaps |
| `spacing8` | 24px | Card padding (standard) |
| `spacing9` | 32px | Large gaps |
| `spacing10` | 40px | Section separators |
| `spacing11` | 48px | Layout margins |
| `spacing12` | 56px | Hero sections |

---

### Page: Accessibility

**Overview:**
> All ILDS components target WCAG 2.1 AA compliance. Developers must not remove semantic wrappers or ARIA labels added by the component library.

**Requirements:**
| Requirement | ILDS implementation |
|---|---|
| Colour contrast 4.5:1 (text) | Verified across all token pairings |
| Colour contrast 3:1 (UI elements) | Border, icon tokens meet this threshold |
| Touch target ≥ 44×44dp | All interactive components enforce minimum |
| Keyboard navigation | Tab/Enter/Escape on all interactive components |
| Screen reader labels | `Semantics()` wrappers in all components |
| Focus indicators | `ILDSTokens.orange500` focus ring on all inputs |

**Semantic rules:**
- TextField: wraps with `Semantics(label:, hint:, textField: true)`
- Button: `Semantics(button: true, label:)`
- Toast: `Semantics(liveRegion: true)` for screen reader announcements
- OTP inputs: each cell labelled `'OTP digit N'`

---

## SECTION 4 — TOKEN REFERENCE PAGES

These pages auto-populate from the Supernova token sync. Configure display in Supernova → Design tokens → Colors/Spacing/Border radius. No manual content entry needed beyond headers.

### Page: Colour Tokens

**Header text:**
> 92 colour variables synced from Figma Variables → `tokens/tokens.json`. Updated automatically when the ILDS Token Sync plugin runs.

**Display setting:** Supernova → Colors → group by Collection → show swatches

### Page: Spacing Tokens

**Header text:**
> 12 spacing values from the 8-point scale. All token names prefixed `sp-` in the DTCG file.

**Display setting:** Supernova → Dimensions → Space → show as table

### Page: Border Radius

**Header text:**
> 8 border radius tokens covering null through massive. Used across cards, inputs, chips, and modals.

| Token name | Value | Used in |
|---|---|---|
| null | 0 | Rectangular elements |
| xsmall | 2px | Subtle rounding |
| small | 4px | Inputs, buttons (sm) |
| medium | 6px | Buttons (default), chips |
| large | 8px | Cards, dropdowns |
| xlarge | 12px | Modals, bottom sheets |
| 2xlarge | 16px | Large cards |
| massive | 999px | Pills, badges |

---

## SECTION 5 — COMPONENT: BUTTON

### Description
The primary action trigger across all ILDS screens. Supports three types, three appearances, two sizes, and loading/disabled states.

### Variants
| Property | Options |
|---|---|
| Type | `primary` · `secondary` · `text` |
| Appearance | `normal` · `destructive` |
| Size | `large` · `small` |

### Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `String` | required | Button text |
| `onPressed` | `VoidCallback?` | `null` | Null = disabled |
| `type` | `IldsButtonType` | `.primary` | Visual hierarchy |
| `appearance` | `IldsButtonAppearance` | `.normal` | Normal or destructive |
| `size` | `IldsButtonSize` | `.large` | Large or small |
| `isLoading` | `bool` | `false` | Shows spinner, blocks tap |
| `leadingIcon` | `Widget?` | `null` | Icon before label |
| `trailingIcon` | `Widget?` | `null` | Icon after label |

### States
| State | Visual |
|---|---|
| Default | `orange500` bg, white label |
| Hover | `orange600` bg |
| Pressed | `orange700` bg (overlay) |
| Disabled | `warmgray200` bg, `warmgray400` label |
| Loading | Spinner replaces label; non-interactive |

### Do/Don't
| ✅ Do | ❌ Don't |
|---|---|
| Use primary for the single main action per screen | Use two primary buttons side by side |
| Use destructive appearance for delete/remove | Use destructive for cancel |
| Use `isLoading` during async operations | Disable the button instead of showing loading |
| Keep label to 1–3 words | Write paragraph-length labels |

### Flutter code
```dart
IldsButton(
  label: 'Submit',
  type: IldsButtonType.primary,
  appearance: IldsButtonAppearance.normal,
  size: IldsButtonSize.large,
  onPressed: () => handleSubmit(),
);

// Loading state
IldsButton(
  label: 'Submitting',
  isLoading: true,
  onPressed: null,
);

// With leading icon
IldsButton(
  label: 'Add Policy',
  leadingIcon: const Icon(Icons.add),
  onPressed: () {},
);
```

### Accessibility
- Role: `button`
- Keyboard: Enter/Space activates. Tab to focus.
- Screen reader: announces label + state (disabled if applicable)
- Minimum touch target: 44×44dp enforced via `MinimumInteractiveDimension`

---

## SECTION 6 — COMPONENT: TEXT FIELD

### Description
The standard text input for forms and search flows. Supports label, placeholder, helper text, prefix/suffix icons, error state, OTP variant, and skeleton loading.

### Variants
| Property | Options |
|---|---|
| State | `default` · `hover` · `focused` · `filled` · `filled & read only` · `disabled` · `typing` · `success` · `error` · `loading` · `skeleton` |
| Prefix | Icon or text |
| Suffix | Icon, clear button, or visibility toggle |

### Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `String` | `''` | Floating label text |
| `placeholder` | `String` | `''` | Hint text |
| `helperText` | `String?` | `null` | Helper below field |
| `errorText` | `String?` | `null` | Error message (sets error state) |
| `controller` | `TextEditingController?` | `null` | External controller |
| `prefixIcon` | `Widget?` | `null` | Leading icon |
| `suffixIcon` | `Widget?` | `null` | Trailing icon |
| `isReadOnly` | `bool` | `false` | Non-editable filled state |
| `isDisabled` | `bool` | `false` | Fully non-interactive |
| `isLoading` | `bool` | `false` | Skeleton/spinner state |
| `isOtp` | `bool` | `false` | Renders 6-cell OTP layout |
| `otpLength` | `int` | `6` | Number of OTP cells |
| `obscureText` | `bool` | `false` | Password masking |

### States
| State | Border colour | Label colour |
|---|---|---|
| Default | `warmgray300` | `warmgray500` |
| Focused | `orange500` (2px) | `orange500` |
| Error | `errorRed500` (2px) | `errorRed500` |
| Success | `successGreen500` | `successGreen500` |
| Disabled | `warmgray200` | `warmgray300` |

### Do/Don't
| ✅ Do | ❌ Don't |
|---|---|
| Always include a label | Use placeholder as a label substitute |
| Show `errorText` for validation messages | Use a Toast for field-level errors |
| Use `isReadOnly` for confirmation screens | Disable fields that need to display values |
| Use OTP variant for PIN/OTP entry | Use 6 separate TextField widgets for OTP |

### Flutter code
```dart
// Standard
IldsTextField(
  label: 'Mobile Number',
  placeholder: 'Enter 10-digit number',
  prefixIcon: const Icon(Icons.phone),
  helperText: 'We will send an OTP to this number',
  controller: _mobileController,
);

// Error state
IldsTextField(
  label: 'PAN Number',
  errorText: 'Invalid PAN format',
  controller: _panController,
);

// OTP
IldsTextField(
  isOtp: true,
  otpLength: 6,
  onOtpComplete: (otp) => verifyOtp(otp),
);
```

### Accessibility
- Role: `textField`
- Semantics label: field label, hint: placeholder text
- OTP cells: each labelled `'OTP digit N'`
- Error text announced on state change

---

## SECTION 7 — COMPONENT: CHIP

### Description
Compact elements for selection, filtering, status display, and categorisation. Two families: interactive chips and static tag chips.

### Variants
| Family | Types |
|---|---|
| Interactive chips | `filter` · `input` · `assist` · `suggestion` |
| Tag chips | `default` · `success` · `warning` · `error` · `info` |

### Props — Interactive
| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `String` | required | Chip text |
| `variant` | `IldsChipVariant` | `.filter` | Chip type |
| `isSelected` | `bool` | `false` | Selected/active state |
| `isDisabled` | `bool` | `false` | Non-interactive |
| `prefixIcon` | `Widget?` | `null` | Leading icon |
| `suffixButton` | `Widget?` | `null` | Remove/close button |
| `onTap` | `VoidCallback?` | `null` | Tap handler |
| `count` | `int?` | `null` | Count badge (orange bg) |

### Props — Tag
| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `String` | required | Tag text |
| `tagVariant` | `IldsChipTagVariant` | `.default` | Colour variant |

### Tag colour tokens
| Variant | Background | Text/Border |
|---|---|---|
| `default` | `warmgray100` | `warmgray700` |
| `success` | `green50` | `green600` |
| `warning` | `amber50` | `amber600` |
| `error` | `errorRed50` | `errorRed600` |
| `info` | `blue50` | `blue600` |

### Flutter code
```dart
// Filter chip
IldsChip(
  label: 'Motor',
  variant: IldsChipVariant.filter,
  isSelected: _motorSelected,
  prefixIcon: const Icon(Icons.directions_car),
  onTap: () => setState(() => _motorSelected = !_motorSelected),
);

// Tag
IldsChipTag(
  label: 'Active',
  tagVariant: IldsChipTagVariant.success,
);

// Input chip with remove
IldsChip(
  label: 'Pratishek Bansal',
  variant: IldsChipVariant.input,
  suffixButton: IconButton(
    icon: const Icon(Icons.close, size: 16),
    onPressed: () => removeTag(),
  ),
);
```

### Do/Don't
| ✅ Do | ❌ Don't |
|---|---|
| Use filter chips for multi-select filtering | Use buttons for filtering |
| Use tag chips for non-interactive status | Make tag chips tappable |
| Use count badge for unread/total counts | Use count badge for actions |

### Accessibility
- Selected state: `Semantics(selected: true/false)`
- Role: interactive chip = button, tag chip = text
- Remove button labelled `'Remove [label]'`

---

## SECTION 8 — COMPONENT: DROPDOWN

### Description
A single-select trigger that opens an overlay menu below the field. Uses `CompositedTransformFollower` for correct positioning. Does not use Flutter's `DropdownButton`.

### Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `String` | `''` | Floating label |
| `placeholder` | `String` | `''` | Unselected hint |
| `options` | `List<String>` | required | Menu items |
| `selectedValue` | `String?` | `null` | Controlled selection |
| `onChanged` | `ValueChanged<String>?` | `null` | Selection callback |
| `helpText` | `String?` | `null` | Helper below trigger |
| `errorText` | `String?` | `null` | Error message |
| `isDisabled` | `bool` | `false` | Non-interactive |
| `isLoading` | `bool` | `false` | Loading skeleton |
| `isReadOnly` | `bool` | `false` | Filled & read-only |
| `showLabel` | `bool` | `true` | Show/hide label |
| `showHelpText` | `bool` | `true` | Show/hide helper |

### States
| State | Visual |
|---|---|
| Empty | Placeholder text, `warmgray300` border |
| Focused/Open | `orange500` border top + sides (no bottom — merges with menu) |
| Filled | Selected value shown, `warmgray300` border |
| Error | `errorRed500` border (2px) |
| Disabled | `warmgray100` bg, no chevron |
| Loading | Skeleton pulse |

### Do/Don't
| ✅ Do | ❌ Don't |
|---|---|
| Use for 4+ options | Use for 2–3 options (use radio buttons instead) |
| Pre-select a default when most users pick it | Leave empty when a value is almost always needed |
| Use `helpText` to explain the field | Rely on the label alone for complex fields |

### Flutter code
```dart
IldsDropdown(
  label: 'State',
  placeholder: 'Select your state',
  options: IndianStates.all,
  selectedValue: _selectedState,
  onChanged: (state) => setState(() => _selectedState = state),
  helpText: 'Based on your registered address',
);

// Error
IldsDropdown(
  label: 'Policy Type',
  options: policyTypes,
  errorText: 'Please select a policy type',
  onChanged: (val) => _handlePolicyType(val),
);
```

### Accessibility
- Role: combobox
- Overlay menu items: each a focusable `ListTile`
- Keyboard: Enter opens, arrow keys navigate, Enter selects, Escape closes
- Selected value announced on change

---

## SECTION 9 — COMPONENT: TOAST

### Description
Ephemeral notifications that appear at the bottom (default) or top of the screen. Supports 4 semantic variants, optional title, close button, and left accent bar.

### Variants
| Property | Options |
|---|---|
| Variant | `success` · `error` · `warning` · `info` |
| Position | `bottom` (default) · `top` |
| Dismissal | Auto-dismiss (default 4s) · persistent (requires close button) |

### Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `message` | `String` | required | Body text |
| `title` | `String?` | `null` | Optional bold title above message |
| `variant` | `IldsToastVariant` | `.info` | Semantic colour |
| `showClose` | `bool` | `false` | Show X button |
| `showAccentBar` | `bool` | `true` | Left 4px colour bar |
| `duration` | `Duration` | `4s` | Auto-dismiss duration |
| `isPersistent` | `bool` | `false` | No auto-dismiss (requires `showClose: true`) |
| `position` | `IldsToastPosition` | `.bottom` | Screen position |

### Variant tokens
| Variant | Accent bar | Icon | Background |
|---|---|---|---|
| `success` | `green500` | check_circle | `green50` |
| `error` | `errorRed500` | error | `errorRed50` |
| `warning` | `amber500` | warning | `amber50` |
| `info` | `blue500` | info | `blue50` |

### Do/Don't
| ✅ Do | ❌ Don't |
|---|---|
| Use for non-blocking feedback (save success, network error) | Use for critical blocking errors (use a modal) |
| Set `isPersistent: true` with `showClose: true` for errors | Set `isPersistent: true` without a close button |
| Keep message to 1–2 lines | Write multi-paragraph toast messages |
| Use `title` for scan-friendly context | Repeat the same info in title and message |

### Flutter code
```dart
// Show success toast
IldsToast.show(
  context,
  message: 'Policy renewed successfully',
  variant: IldsToastVariant.success,
  title: 'Renewal Complete',
);

// Persistent error toast
IldsToast.show(
  context,
  message: 'Unable to connect. Check your internet and try again.',
  variant: IldsToastVariant.error,
  isPersistent: true,
  showClose: true,
  position: IldsToastPosition.top,
);
```

### Accessibility
- `Semantics(liveRegion: true)` — screen reader announces on appearance
- Close button labelled `'Dismiss notification'`
- Persistent toasts remain until user dismisses (no auto timeout)

---

## SECTION 10 — PORTAL CONFIGURATION STEPS

Do these in Supernova UI after adding all page content.

### Step 1 — Set portal name and logo
Supernova → Portal (New) → Settings:
- Name: `ILDS Design System`
- Subtitle: `ICICI Lombard · Flutter · Apr 2026`
- Logo: upload from `assets/fonts/` directory or ICICI Lombard brand asset

### Step 2 — Configure navigation
Portal → Navigation → drag pages into order matching Section 1 structure above.

### Step 3 — Set access
Portal → Access:
- For internal + stakeholders: set to **"Anyone with the link"** or **"Invite only"** with specific email domains

### Step 4 — Enable code blocks
Portal → Settings → Code:
- Primary language: `Flutter`
- Syntax highlighting: enabled

### Step 5 — Publish
Portal → Publish → **Publish portal**
- Note the portal URL (format: `yourorg.supernova.io/...`)
- Share URL in `#design-system-updates` Slack channel

### Step 6 — Announce in Slack
Post in `#design-system-updates`:
```
🎨 ILDS Design System Portal is live!

Docs cover: Button, TextField, Chip, Dropdown, Toast + full token reference + design principles.

Access: [portal URL]

Token sync is automated — portal updates whenever Figma Variables change.
```

---

## SECTION 11 — SUPERNOVA CONTENT ENTRY GUIDE

Supernova's editor is block-based (like Notion). For each component page:

1. Click **+ New Page** under Components
2. Add a **Text** block → paste Description
3. Add a **Table** block → paste Variants table
4. Add a **Table** block → paste Props table
5. Add a **Table** block → paste States table
6. Add a **Code** block → set language to `dart` → paste Flutter code
7. Add a **Table** block → paste Do/Don't (two columns: ✅ Do, ❌ Don't)
8. Add a **Text** block → paste Accessibility notes

For token reference pages: use **Design tokens** block (auto-renders from Supernova token store).

---

*Phase 5 Brief · Apr 8, 2026 · ILDS Design System · dsoftacademy/ilds-design-system*
