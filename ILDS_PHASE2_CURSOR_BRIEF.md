# ILDS Phase 2 — Flutter Component Library
## Complete Cursor Build Brief · All Remaining Components · Apr 2026
## Repo: dsoftacademy/ilds-design-system

---

## ⚠️ RULES BEFORE YOU START

1. Zero hardcoded values. Every colour, spacing, radius, border width from ILDSTokens class.
2. All files go in `lib/` directory. Naming: `ilds_{component}.dart`.
3. Follow the exact Flutter pattern established in Phase 1 (see Section 3).
4. Each component must compile with zero errors before submitting.
5. Figma component IDs in Section 4 are verified live. Use them for Code Connect mappings (Section 5).
6. Match Figma property names exactly — they are case-sensitive including spaces.
7. Semantics wrappers required on every interactive widget.
8. No external packages. Flutter SDK + material.dart only.

---

## SECTION 1 — WHAT YOU ARE BUILDING

12 Flutter widget files covering all remaining ILDS components:

| Priority | File | Figma component | Figma ID |
|---|---|---|---|
| Tier 1 | `ilds_radio.dart` | Radio Select + Radio Group | 13486:38485, 13486:38635 |
| Tier 1 | `ilds_checkbox.dart` | Checkbox Select | 13520:33495 |
| Tier 1 | `ilds_switch.dart` | Switch | 14371:6309 |
| Tier 1 | `ilds_text_area.dart` | Text Area | 14369:11586 |
| Tier 2 | `ilds_tab.dart` | Tab | 17667:2334 |
| Tier 2 | `ilds_pagination.dart` | Pagination | 17724:3361 |
| Tier 2 | `ilds_selection_button.dart` | Selection Button | 14776:1685 |
| Tier 3 | `ilds_badge.dart` | Badge | 13965:24550 |
| Tier 3 | `ilds_tag.dart` | Tag (Filter Tag) | 14018:6786 |
| Tier 3 | `ilds_accordion.dart` | Accordion | 17726:494 |
| Tier 3 | `ilds_text_link.dart` | Text Link | 13474:16003 |
| Tier 3 | `ilds_scrollbar.dart` | Scrollbar | 17730:521 |

Build in Tier order. Compile after each file. Report errors before proceeding.

---

## SECTION 2 — ILDSTokens CLASS (complete reference)

```dart
class ILDSTokens {
  // Orange
  static const Color orange50  = Color(0xFFFDF0EB);
  static const Color orange100 = Color(0xFFFAD9CC);
  static const Color orange200 = Color(0xFFF5B399);
  static const Color orange300 = Color(0xFFF08D66);
  static const Color orange400 = Color(0xFFEB6733);
  static const Color orange500 = Color(0xFFE8440C); // Primary brand
  static const Color orange600 = Color(0xFFB93409); // Hover
  static const Color orange700 = Color(0xFF8A2807); // Pressed

  // Neutral
  static const Color neutral0   = Color(0xFFFFFFFF);
  static const Color neutral50  = Color(0xFFFAFAFA);
  static const Color neutral100 = Color(0xFFF4F4F4);
  static const Color neutral200 = Color(0xFFE0E0E0);
  static const Color neutral300 = Color(0xFFADADAD);
  static const Color neutral400 = Color(0xFF6B6B6B);
  static const Color neutral500 = Color(0xFF3D3D3D);
  static const Color neutral600 = Color(0xFF2A2A2A);
  static const Color neutral900 = Color(0xFF111111);
  static const Color white      = Color(0xFFFFFFFF);

  // Blue (Info)
  static const Color blue50  = Color(0xFFEFF6FF);
  static const Color blue100 = Color(0xFFDBEAFE);
  static const Color blue300 = Color(0xFF93C5FD);
  static const Color blue500 = Color(0xFF2563EB);
  static const Color blue600 = Color(0xFF1D4ED8);
  static const Color blue700 = Color(0xFF1E40AF);

  // Green (Success)
  static const Color green50  = Color(0xFFDCFCE7);
  static const Color green100 = Color(0xFFBBF7D0);
  static const Color green300 = Color(0xFF86EFAC);
  static const Color green500 = Color(0xFF22C55E);
  static const Color green600 = Color(0xFF16A34A);
  static const Color green700 = Color(0xFF15803D);

  // Red (Error)
  static const Color red50  = Color(0xFFFEE2E2);
  static const Color red100 = Color(0xFFFECACA);
  static const Color red300 = Color(0xFFFCA5A5);
  static const Color red500 = Color(0xFFEF4444);
  static const Color red600 = Color(0xFFDC2626);
  static const Color red700 = Color(0xFFB91C1C);

  // Amber (Warning)
  static const Color amber50  = Color(0xFFFEF9C3);
  static const Color amber100 = Color(0xFFFEF08A);
  static const Color amber300 = Color(0xFFFCD34D);
  static const Color amber500 = Color(0xFFF59E0B);
  static const Color amber600 = Color(0xFFD97706);
  static const Color amber700 = Color(0xFFB45309);

  // Border Radius
  static const double borderRadiusXs   = 2.0;
  static const double borderRadiusSm   = 4.0;
  static const double borderRadiusMd   = 8.0;
  static const double borderRadiusLg   = 12.0;
  static const double borderRadiusXl   = 16.0;
  static const double borderRadius2xl  = 24.0;
  static const double borderRadiusFull = 9999.0;

  // Spacing
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

  // Border Width
  static const double borderWidth1 = 1.0;
  static const double borderWidth2 = 2.0;
  static const double borderWidth4 = 4.0;

  // Font Weights
  static const FontWeight fontWeightRegular = FontWeight.w400;
  static const FontWeight fontWeightMedium  = FontWeight.w500;
  static const FontWeight fontWeightBold    = FontWeight.w700;
}
```

---

## SECTION 3 — FLUTTER PATTERN FROM PHASE 1

All Phase 1 components follow this exact pattern. Match it precisely.

### File structure
```dart
// lib/ilds_{component}.dart
import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

// 1. Enums first
enum IldsComponentVariant { ... }
enum IldsComponentState { ... }

// 2. StatefulWidget (for interactive) or StatelessWidget (for display-only)
class IldsComponent extends StatefulWidget {
  const IldsComponent({
    super.key,
    required this.requiredProp,
    this.optionalProp,
    this.onChanged,
  });

  final String requiredProp;
  final bool? optionalProp;
  final ValueChanged<T>? onChanged;

  @override
  State<IldsComponent> createState() => _IldsComponentState();
}

class _IldsComponentState extends State<IldsComponent> {
  // 3. Derived state variables
  bool _isHovered = false;
  bool _isPressed = false;
  bool _isFocused = false;

  // 4. Token resolution methods
  Color _resolveBackgroundColor() { ... }
  Color _resolveBorderColor() { ... }
  Color _resolveTextColor() { ... }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      // Always include Semantics
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        child: GestureDetector(
          onTapDown: (_) => setState(() => _isPressed = true),
          onTapUp: (_) => setState(() => _isPressed = false),
          onTap: widget.isDisabled ? null : widget.onChanged != null ? () => widget.onChanged!(value) : null,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            // ... layout
          ),
        ),
      ),
    );
  }
}
```

### Mandatory patterns from Phase 1
- `AnimatedContainer` with `duration: const Duration(milliseconds: 150)` for all state transitions
- `MouseRegion` for hover detection
- `GestureDetector` with `onTapDown` + `onTapUp` for pressed state overlay
- `InkWell` only when using Material ripple is appropriate (buttons)
- Disabled check: `if (widget.isDisabled) return;` before any callback
- Focus: `FocusNode` + `border: Border.all(color: ILDSTokens.orange500, width: ILDSTokens.borderWidth2)` on focus
- Size variants: `switch (widget.size) { case IldsSize.large: return ...; case IldsSize.medium: ... }`

---

## SECTION 4 — PER-COMPONENT SPECIFICATIONS

---

### 4.1 RADIO — `ilds_radio.dart`

**Figma:** Radio Select (ID: 13486:38485), Radio Group (ID: 13486:38635)

**Figma properties — Radio Select:**
- `isSelected`: Yes | No
- `Size`: Small | Medium | Large
- `State`: Default | Hover | Focus | Disabled | Error | Pressed

**Figma properties — Radio Group:**
- `Show Error#16012:62`: true (boolean)
- `Orientation`: Vertical | Horizontal
- `Sizes`: Large | Small | Medium

**Enums:**
```dart
enum IldsRadioSize { small, medium, large }
```

**Token mapping:**
| State | Outer ring border | Inner dot | Background |
|---|---|---|---|
| Default unselected | `neutral300` 1px | — | `white` |
| Default selected | `orange500` 2px | `orange500` | `white` |
| Hover unselected | `neutral400` 1px | — | `neutral50` |
| Hover selected | `orange600` 2px | `orange600` | `orange50` |
| Pressed | `orange700` 2px | `orange700` | `orange100` |
| Focused | `orange500` 2px + outer focus ring `orange500` 2px offset 2px | `orange500` | `white` |
| Disabled unselected | `neutral200` 1px | — | `neutral50` |
| Disabled selected | `neutral300` 2px | `neutral300` | `neutral50` |
| Error unselected | `red500` 1px | — | `red50` |
| Error selected | `red500` 2px | `red500` | `red50` |

**Size tokens:**
| Size | Outer diameter | Inner dot | Label font size | Gap (radio to label) |
|---|---|---|---|---|
| Small | 16px | 8px | 12px (spacing3 = 12) | spacing2 = 8 |
| Medium | 20px | 10px | 14px | spacing2 = 8 |
| Large | 24px | 12px | 16px | spacing2 = 8 |

**Radio component API:**
```dart
class IldsRadio extends StatefulWidget {
  const IldsRadio({
    super.key,
    required this.value,
    required this.groupValue,
    required this.onChanged,
    this.label,
    this.size = IldsRadioSize.medium,
    this.isDisabled = false,
    this.hasError = false,
    this.errorText,
  });
  final dynamic value;
  final dynamic groupValue;
  final ValueChanged<dynamic>? onChanged;
  final String? label;
  final IldsRadioSize size;
  final bool isDisabled;
  final bool hasError;
  final String? errorText;
}
```

**Radio Group API:**
```dart
class IldsRadioGroup extends StatelessWidget {
  const IldsRadioGroup({
    super.key,
    required this.options,   // List<IldsRadioOption>
    required this.groupValue,
    required this.onChanged,
    this.orientation = Axis.vertical,
    this.size = IldsRadioSize.medium,
    this.isDisabled = false,
    this.hasError = false,
    this.errorText,
  });
}

class IldsRadioOption {
  const IldsRadioOption({ required this.value, required this.label, this.isDisabled = false });
  final dynamic value;
  final String label;
  final bool isDisabled;
}
```

**Semantics:**
```dart
Semantics(
  label: widget.label ?? widget.value.toString(),
  inMutuallyExclusiveGroup: true,
  checked: isSelected,
  enabled: !widget.isDisabled,
)
```

**Implementation notes:**
- Draw outer circle with `Container` + `BoxDecoration(shape: BoxShape.circle, border: Border.all(...))`
- Draw inner dot conditionally when selected: nested `Container` centered inside, also `BoxShape.circle`
- Focus ring: outer `Container` with `border: Border.all(color: ILDSTokens.orange500, width: 2, ...)` + `borderRadius` = circle, gap of 2px using padding or offset
- `AnimatedContainer` the inner dot size from 0 to full for selection animation

---

### 4.2 CHECKBOX — `ilds_checkbox.dart`

**Figma:** Checkbox Select (ID: 13520:33495)

**Figma properties:**
- `Size`: Small | Medium | Large
- `State`: Default | Hover | Pressed | Focused | Disabled | Error
- `isSelected`: Yes | No

**Enums:**
```dart
enum IldsCheckboxSize { small, medium, large }
enum IldsCheckboxState { unchecked, checked, indeterminate }
```

**Token mapping:**
| State | Border | Fill | Check icon |
|---|---|---|---|
| Unchecked default | `neutral300` 1px | `white` | — |
| Checked default | `orange500` 2px | `orange500` | `white` check |
| Indeterminate | `orange500` 2px | `orange500` | `white` dash |
| Hover unchecked | `neutral400` 1px | `neutral50` | — |
| Hover checked | `orange600` 2px | `orange600` | `white` |
| Pressed | `orange700` 2px | `orange700` | `white` |
| Focused | `orange500` 2px + outer focus ring | `white` (unchecked) / `orange500` (checked) | — / `white` |
| Disabled unchecked | `neutral200` 1px | `neutral50` | — |
| Disabled checked | `neutral300` 1px | `neutral200` | `neutral400` check |
| Error unchecked | `red500` 1px | `red50` | — |
| Error checked | `red500` 2px | `red500` | `white` |

**Size tokens:**
| Size | Box | Border radius | Icon size | Label font |
|---|---|---|---|---|
| Small | 16×16 | `borderRadiusXs` (2) | 10 | 12px |
| Medium | 20×20 | `borderRadiusSm` (4) | 12 | 14px |
| Large | 24×24 | `borderRadiusSm` (4) | 16 | 16px |

**API:**
```dart
class IldsCheckbox extends StatefulWidget {
  const IldsCheckbox({
    super.key,
    required this.state,
    required this.onChanged,
    this.label,
    this.size = IldsCheckboxSize.medium,
    this.isDisabled = false,
    this.hasError = false,
    this.errorText,
  });
  final IldsCheckboxState state;
  final ValueChanged<IldsCheckboxState>? onChanged;
  final String? label;
  final IldsCheckboxSize size;
  final bool isDisabled;
  final bool hasError;
  final String? errorText;
}
```

**Semantics:**
```dart
Semantics(
  label: widget.label,
  checked: widget.state == IldsCheckboxState.checked,
  mixed: widget.state == IldsCheckboxState.indeterminate,
  enabled: !widget.isDisabled,
)
```

**Implementation notes:**
- Box: `Container` + `BoxDecoration(borderRadius: ..., border: ..., color: ...)`
- Check mark: `CustomPaint` with `Path` drawing a checkmark (or `Icon(Icons.check)` at size)
- Indeterminate: horizontal dash — use `Container(height: 2, width: boxSize * 0.5, color: white)`
- `AnimatedSwitcher` for checked/unchecked transition

---

### 4.3 SWITCH — `ilds_switch.dart`

**Figma:** Switch (ID: 14371:6309)

**Figma properties:**
- `Show Label#555:0`: true (boolean)
- `Show Icon#555:31`: true (boolean)
- `Type`: Off | On
- `State`: Default | Hover | Focused | Disabled | Skeleton
- `Size`: Large | Medium | Small

**Enums:**
```dart
enum IldsSwitchSize { small, medium, large }
```

**Token mapping:**
| State | Track (Off) | Track (On) | Thumb | Label |
|---|---|---|---|---|
| Default Off | `neutral200` | — | `white` | `neutral900` |
| Default On | — | `orange500` | `white` | `neutral900` |
| Hover Off | `neutral300` | — | `white` | `neutral900` |
| Hover On | — | `orange600` | `white` | `neutral900` |
| Pressed Off | `neutral400` | — | `white` | `neutral900` |
| Pressed On | — | `orange700` | `white` | `neutral900` |
| Focused | `orange500` border 2px offset 2px | `orange500` border 2px | `white` | `neutral900` |
| Disabled Off | `neutral100` | — | `neutral200` | `neutral300` |
| Disabled On | — | `orange200` | `white` | `neutral300` |

**Size tokens:**
| Size | Track W×H | Thumb diameter | Track radius | Padding |
|---|---|---|---|---|
| Small | 36×20 | 16 | 10 | spacing1 (4) |
| Medium | 44×24 | 20 | 12 | spacing1 (4) |
| Large | 52×28 | 24 | 14 | spacing1 (4) |

**API:**
```dart
class IldsSwitch extends StatefulWidget {
  const IldsSwitch({
    super.key,
    required this.value,
    required this.onChanged,
    this.label,
    this.leadingIcon,
    this.showLabel = true,
    this.showIcon = false,
    this.size = IldsSwitchSize.medium,
    this.isDisabled = false,
  });
  final bool value;
  final ValueChanged<bool>? onChanged;
  final String? label;
  final IconData? leadingIcon;
  final bool showLabel;
  final bool showIcon;
  final IldsSwitchSize size;
  final bool isDisabled;
}
```

**Implementation notes:**
- `AnimatedPositioned` thumb: moves from left padding to `trackWidth - thumbSize - padding`
- `AnimatedContainer` track: animates background color between Off/On
- Duration: `const Duration(milliseconds: 200)` for switch (slightly longer than 150ms)
- `Semantics(toggled: widget.value, label: widget.label ?? 'Switch')`

---

### 4.4 TEXT AREA — `ilds_text_area.dart`

**Figma:** Text Area (ID: 14369:11586)

**Figma properties:**
- `Show Helper Row#16061:10`: true (boolean)
- `Show Label Row#16061:20`: true (boolean)
- `State`: Skeleton | Default | Focused | Hover | Filled | Active/Typing | Disabled | Success | Error

**Enums:** None needed — states driven by controller + focus + passed flags.

**API:**
```dart
class IldsTextArea extends StatefulWidget {
  const IldsTextArea({
    super.key,
    this.label,
    this.placeholder,
    this.helperText,
    this.errorText,
    this.successText,
    this.controller,
    this.minLines = 3,
    this.maxLines = 6,
    this.maxLength,
    this.showCharCount = false,
    this.isDisabled = false,
    this.isReadOnly = false,
    this.isLoading = false,
    this.onChanged,
  });
  final String? label;
  final String? placeholder;
  final String? helperText;
  final String? errorText;
  final String? successText;
  final TextEditingController? controller;
  final int minLines;
  final int maxLines;
  final int? maxLength;
  final bool showCharCount;
  final bool isDisabled;
  final bool isReadOnly;
  final bool isLoading;
  final ValueChanged<String>? onChanged;
}
```

**Token mapping:** Same as IldsTextField but multi-line:
- Focused border: `orange500` 2px
- Error border: `red500` 2px
- Success border: `green600` 1px
- Default border: `neutral300` 1px
- Disabled border: `neutral200`, bg: `neutral50`
- Border radius: `borderRadiusMd` (8)

**Implementation notes:**
- `TextField` with `maxLines: widget.maxLines`, `minLines: widget.minLines`
- Manual resize: add drag handle at bottom-right corner (`GestureDetector` + `onPanUpdate` updating height variable)
- Char count: Row(children: [Spacer(), Text('${count}/${maxLength}')])
- TODO comment: `// TODO: resize handle — exact drag handle dimensions from Figma spec`

**Semantics:**
```dart
Semantics(label: widget.label, hint: widget.placeholder, textField: true, multiline: true)
```

---

### 4.5 TAB — `ilds_tab.dart`

**Figma:** Tab (ID: 17667:2334)

**Figma properties (Tab container):**
- `Emphasis`: High | Medium
- `Type`: Fixed | Default
- `Alignment`: Center | Left
- `Icon`: True | False

**Figma properties (.Tab/Cell/Primary):**
- `State`: Default | Hover | Pressed | Active | Skeleton | Focused
- `Show Icon`: False | True

**Enums:**
```dart
enum IldsTabEmphasis { high, medium }
enum IldsTabType { fixed, scrollable }
enum IldsTabAlignment { center, left }
```

**Token mapping — Tab cell:**
| State | Label colour | Indicator | Background |
|---|---|---|---|
| Default (inactive) | `neutral400` | — | transparent |
| Hover | `neutral600` | — | `neutral50` |
| Pressed | `neutral900` | — | `neutral100` |
| Active (selected) High | `orange500` | `orange500` 3px bottom bar | transparent |
| Active (selected) Medium | `neutral900` | `neutral900` 3px bottom bar | transparent |
| Focused | `orange500` | `orange500` 2px | `orange50` |
| Disabled | `neutral200` | — | transparent |

**Container tokens:**
- Border bottom: `neutral200` 1px (full width — separates tabs from content)
- Height: Large = 48px, Small = 40px (no size prop — use padding: spacing2/spacing3)
- Horizontal padding per cell: `spacing3` (12) for default, equal distribution for fixed

**API:**
```dart
class IldsTabBar extends StatefulWidget {
  const IldsTabBar({
    super.key,
    required this.tabs,
    required this.onTabChanged,
    this.selectedIndex = 0,
    this.emphasis = IldsTabEmphasis.high,
    this.type = IldsTabType.scrollable,
    this.alignment = IldsTabAlignment.left,
  });
  final List<IldsTabItem> tabs;
  final ValueChanged<int> onTabChanged;
  final int selectedIndex;
  final IldsTabEmphasis emphasis;
  final IldsTabType type;
  final IldsTabAlignment alignment;
}

class IldsTabItem {
  const IldsTabItem({ required this.label, this.icon, this.isDisabled = false });
  final String label;
  final IconData? icon;
  final bool isDisabled;
}
```

**Implementation notes:**
- Use `Stack` + `AnimatedPositioned` for smooth indicator slide between tabs
- `SingleChildScrollView(scrollDirection: Axis.horizontal)` for scrollable type
- Row with `Expanded` for fixed type
- Do NOT use Flutter's built-in `TabBar` — build from scratch to match ILDS spec

---

### 4.6 PAGINATION — `ilds_pagination.dart`

**Figma:** Pagination (ID: 17724:3361)

**Figma properties:**
- `Type`: Non-Selection | Selection
- `Verient`: Compact | Extended (note: typo in Figma — it's "Verient", not "Variant")

**Figma properties (.Pagination/Selection Button):**
- `State`: Default | Hover | Pressed | Selected | Disabled | Skeleton

**Enums:**
```dart
enum IldsPaginationType { nonSelection, selection }
enum IldsPaginationVariant { compact, extended }
```

**Token mapping — page number button:**
| State | Background | Text | Border |
|---|---|---|---|
| Default | transparent | `neutral600` | `neutral200` 1px |
| Hover | `neutral50` | `neutral900` | `neutral300` 1px |
| Pressed | `neutral100` | `neutral900` | `neutral300` 1px |
| Selected | `orange500` | `white` | — |
| Disabled | transparent | `neutral200` | `neutral100` 1px |

**API:**
```dart
class IldsPagination extends StatelessWidget {
  const IldsPagination({
    super.key,
    required this.currentPage,
    required this.totalPages,
    required this.onPageChanged,
    this.type = IldsPaginationType.selection,
    this.variant = IldsPaginationVariant.extended,
    this.pageSize,
    this.onPageSizeChanged,
    this.pageSizeOptions = const [10, 20, 50],
  });
  final int currentPage;
  final int totalPages;
  final ValueChanged<int> onPageChanged;
  final IldsPaginationType type;
  final IldsPaginationVariant variant;
  final int? pageSize;
  final ValueChanged<int>? onPageSizeChanged;
  final List<int> pageSizeOptions;
}
```

**Page number logic:**
- Extended: show first, last, current ±1, with `...` ellipsis
- Compact: show only prev/next arrows + `Page X of Y`
- Previous/Next buttons: `Icon(Icons.chevron_left/right)` with same token mapping
- Size: 36×36 each button, gap: `spacing1` (4)

---

### 4.7 SELECTION BUTTON — `ilds_selection_button.dart`

**Figma:** Selection Button (ID: 14776:1685)

**Figma properties:**
- `Size`: Large | Medium | Small
- `State`: Default | Disabled | Focused | Hover | Pressed | Skeleton | Selected
- `Variant`: Label + Suffix Icon | Label Only | Icon Only

**Enums:**
```dart
enum IldsSelectionButtonSize { small, medium, large }
enum IldsSelectionButtonVariant { labelOnly, labelWithSuffix, iconOnly }
```

**Token mapping:**
| State | Background | Text/Icon | Border |
|---|---|---|---|
| Default | `white` | `neutral700` | `neutral200` 1px |
| Hover | `neutral50` | `neutral900` | `neutral300` 1px |
| Pressed | `neutral100` | `neutral900` | `neutral300` 1px |
| Selected | `orange50` | `orange500` | `orange500` 2px |
| Disabled | `neutral50` | `neutral300` | `neutral100` 1px |
| Focused | `white` | `orange500` | `orange500` 2px |

**Size tokens:**
| Size | Height | H padding | Font size |
|---|---|---|---|
| Small | 32 | `spacing2` (8) | 12 |
| Medium | 40 | `spacing3` (12) | 14 |
| Large | 48 | `spacing4` (16) | 16 |

**API:**
```dart
class IldsSelectionButton extends StatefulWidget {
  const IldsSelectionButton({
    super.key,
    required this.label,
    required this.isSelected,
    required this.onTap,
    this.suffixIcon,
    this.variant = IldsSelectionButtonVariant.labelOnly,
    this.size = IldsSelectionButtonSize.medium,
    this.isDisabled = false,
  });
  final String label;
  final bool isSelected;
  final VoidCallback? onTap;
  final IconData? suffixIcon;
  final IldsSelectionButtonVariant variant;
  final IldsSelectionButtonSize size;
  final bool isDisabled;
}
```

---

### 4.8 BADGE — `ilds_badge.dart`

**Figma:** Badge (ID: 13965:24550)

**Figma properties:**
- `Show .Btn_Prefix Icon#14296:0`: true (boolean)
- `Variant`: Subtle | Intense | Success | Error | Warning | Info | Skeleton
- `Size`: Large | Medium | Small

**Enums:**
```dart
enum IldsBadgeVariant { subtle, intense, success, error, warning, info, skeleton }
enum IldsBadgeSize { small, medium, large }
```

**Token mapping — background / text:**
| Variant | Background | Text/Icon | Border |
|---|---|---|---|
| Subtle | `neutral100` | `neutral600` | — |
| Intense | `neutral900` | `white` | — |
| Success | `green50` | `green700` | — |
| Error | `red50` | `red700` | — |
| Warning | `amber50` | `amber700` | — |
| Info | `blue50` | `blue700` | — |
| Skeleton | `neutral100` | transparent | — |

**Size tokens:**
| Size | H padding | V padding | Font | Border radius |
|---|---|---|---|---|
| Small | `spacing2` (8) | 2 | 11 | `borderRadiusFull` |
| Medium | `spacing2` (8) | 4 | 12 | `borderRadiusFull` |
| Large | `spacing3` (12) | `spacing1` (4) | 13 | `borderRadiusFull` |

**API:**
```dart
class IldsBadge extends StatelessWidget {
  const IldsBadge({
    super.key,
    required this.label,
    this.variant = IldsBadgeVariant.subtle,
    this.size = IldsBadgeSize.medium,
    this.prefixIcon,
    this.isLoading = false,
  });
  final String label;
  final IldsBadgeVariant variant;
  final IldsBadgeSize size;
  final IconData? prefixIcon;
  final bool isLoading;
}
```

**Implementation notes:** StatelessWidget — no interaction. `Container` + `Row(children: [icon?, Text(label)])` with pill shape. Skeleton: animated shimmer using `AnimationController`.

---

### 4.9 TAG (FILTER TAG) — `ilds_tag.dart`

**Figma:** Tag (ID: 14018:6786) — this is the interactive Filter Tag, different from Chip Tag

**Figma properties:**
- `Suffix Button#493:0`: true (boolean) — remove/close button
- `Prefix Icon#493:13`: true (boolean)
- `Size`: Large | Medium
- `State`: Active | Default | Disabled | Hover | Skeleton | Focused

**Enums:**
```dart
enum IldsTagSize { medium, large }
```

**Token mapping:**
| State | Background | Border | Text |
|---|---|---|---|
| Default | `white` | `neutral200` 1px | `neutral700` |
| Hover | `neutral50` | `neutral300` 1px | `neutral900` |
| Active/Selected | `orange50` | `orange500` 2px | `orange600` |
| Focused | `white` | `orange500` 2px | `orange600` |
| Disabled | `neutral50` | `neutral100` 1px | `neutral300` |

**Size tokens:**
| Size | Height | H padding | Font | Border radius |
|---|---|---|---|---|
| Medium | 32 | `spacing2` (8) | 13 | `borderRadiusFull` |
| Large | 40 | `spacing3` (12) | 14 | `borderRadiusFull` |

**API:**
```dart
class IldsTag extends StatefulWidget {
  const IldsTag({
    super.key,
    required this.label,
    this.isActive = false,
    this.onTap,
    this.onRemove,
    this.prefixIcon,
    this.size = IldsTagSize.medium,
    this.isDisabled = false,
  });
  final String label;
  final bool isActive;
  final VoidCallback? onTap;
  final VoidCallback? onRemove;
  final IconData? prefixIcon;
  final IldsTagSize size;
  final bool isDisabled;
}
```

---

### 4.10 ACCORDION — `ilds_accordion.dart`

**Figma:** Accordion (ID: 17726:494)

**Figma properties:**
- `Open#121:4`: true (boolean)
- `Type`: Close | Open
- `State`: Default | Hover | Pressed | Focused

**Prefix:**
- `Prefix`: Icon | Number

**API:**
```dart
class IldsAccordion extends StatefulWidget {
  const IldsAccordion({
    super.key,
    required this.title,
    required this.content,
    this.prefix,
    this.prefixNumber,
    this.initiallyOpen = false,
    this.isDisabled = false,
  });
  final String title;
  final Widget content;
  final IconData? prefix;
  final int? prefixNumber;
  final bool initiallyOpen;
  final bool isDisabled;
}
```

**Token mapping — header:**
| State | Background | Text | Icon (chevron) |
|---|---|---|---|
| Default | `white` | `neutral900` | `neutral600` |
| Hover | `neutral50` | `neutral900` | `neutral700` |
| Pressed | `neutral100` | `neutral900` | `neutral900` |
| Focused | `white` | `orange500` | `orange500` |

**Implementation notes:**
- `AnimatedSize` + `ClipRect` for expand/collapse
- `AnimatedRotation` for chevron (0° closed → 180° open)
- Duration: `const Duration(milliseconds: 200)`
- Separator: `Divider(height: 1, color: ILDSTokens.neutral200)`
- `Semantics(expanded: _isOpen)`

---

### 4.11 TEXT LINK — `ilds_text_link.dart`

**Figma:** Text Link (ID: 13474:16003)

**Figma properties:**
- `Kind`: Standalone | Inline
- `Size`: Small | Medium | Large
- `Colour`: Default | White
- `States`: Default | Hover | Pressed | Focus | Visited | Disabled

**Enums:**
```dart
enum IldsTextLinkSize { small, medium, large }
enum IldsTextLinkColour { defaultBlue, white }
```

**Token mapping:**
| State | Colour (default) | Colour (white) | Decoration |
|---|---|---|---|
| Default | `blue500` | `white` | underline |
| Hover | `blue600` | `neutral200` | underline |
| Pressed | `blue700` | `neutral300` | underline |
| Focus | `blue500` | `white` | underline + focus ring |
| Visited | `neutral500` | `neutral300` | underline |
| Disabled | `neutral300` | `neutral400` | none |

**API:**
```dart
class IldsTextLink extends StatefulWidget {
  const IldsTextLink({
    super.key,
    required this.label,
    required this.onTap,
    this.size = IldsTextLinkSize.medium,
    this.colour = IldsTextLinkColour.defaultBlue,
    this.isVisited = false,
    this.isDisabled = false,
    this.prefixIcon,
    this.suffixIcon,
  });
  final String label;
  final VoidCallback? onTap;
  final IldsTextLinkSize size;
  final IldsTextLinkColour colour;
  final bool isVisited;
  final bool isDisabled;
  final IconData? prefixIcon;
  final IconData? suffixIcon;
}
```

---

### 4.12 SEARCH — `ilds_search.dart`

**Figma:** Search (ID: 13965:16190)

**Figma properties:**
- `State`: Focused | Active | Empty | Filled | Hover | Loading | Skeleton

**API:**
```dart
class IldsSearch extends StatefulWidget {
  const IldsSearch({
    super.key,
    this.placeholder = 'Search',
    this.controller,
    this.onChanged,
    this.onSubmitted,
    this.onClear,
    this.isLoading = false,
    this.autofocus = false,
  });
  final String placeholder;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onClear;
  final bool isLoading;
  final bool autofocus;
}
```

**Token mapping:**
| State | Border | Icon | Background |
|---|---|---|---|
| Empty | `neutral200` 1px | `neutral400` (search icon) | `white` |
| Hover | `neutral300` 1px | `neutral500` | `neutral50` |
| Focused | `orange500` 2px | `orange500` | `white` |
| Filled | `neutral300` 1px | clear icon `neutral500` | `white` |
| Loading | `neutral200` 1px | spinner `orange500` | `white` |

**Implementation notes:**
- Leading: `Icon(Icons.search)` in `neutral400`
- Trailing: `IconButton(icon: Icons.close)` when text is non-empty, else loading indicator
- Border radius: `borderRadiusFull` (pill shape — matches Figma spec)
- Height: 40px (medium), same as TextField

---

## SECTION 5 — CODE CONNECT FILES

After all 12 Flutter files compile, create Code Connect mapping files for each component. Place in repo root alongside existing `.figma.ts` files.

**Follow exact same pattern as the existing button.figma.ts, chip.figma.ts, text_field.figma.ts:**

For each component:
```typescript
// {component}.figma.ts
import figma from '@figma/code-connect';

figma.connect('{FIGMA_URL}?node-id={FIGMA_ID}', {
  props: {
    // Map Figma property names (exact, case-sensitive) to Flutter prop values
    size: figma.enum('Size', {
      'Large': 'IldsXxxSize.large',
      'Medium': 'IldsXxxSize.medium',
      'Small': 'IldsXxxSize.small',
    }),
    isDisabled: figma.enum('State', {
      'Disabled': 'true',
      'Default': 'false',
    }),
  },
  example: ({ size, isDisabled }) => `IldsXxx(
  size: ${size},
  isDisabled: ${isDisabled},
)`,
});
```

**Figma base URL:** `https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design`

**Component → Figma ID mapping:**
| Component | Primary Figma ID |
|---|---|
| Radio | 13486:38485 |
| Checkbox | 13520:33495 |
| Switch | 14371:6309 |
| Text Area | 14369:11586 |
| Tab | 17667:2334 |
| Pagination | 17724:3361 |
| Selection Button | 14776:1685 |
| Badge | 13965:24550 |
| Tag | 14018:6786 |
| Accordion | 17726:494 |
| Text Link | 13474:16003 |
| Search | 13965:16190 |

After creating all `.figma.ts` files, run from repo root:
```bash
npm run code-connect:publish
```

---

## SECTION 6 — BUILD + VERIFY CHECKLIST

For each component file:
- [ ] `flutter analyze lib/ilds_{component}.dart` — zero errors, zero warnings
- [ ] All colours reference `ILDSTokens.*` — grep for hex literals, must be zero
- [ ] All spacing references `ILDSTokens.spacing*` or `ILDSTokens.borderRadius*`
- [ ] `Semantics()` wrapper present
- [ ] `AnimatedContainer`/`AnimatedSize` for state transitions
- [ ] Disabled state: callback is null, visual tokens applied
- [ ] Size enum implemented where Figma shows Size: Small | Medium | Large

Global compile check after all files:
```bash
flutter analyze lib/
```
Expected: 0 issues.

---

## SECTION 7 — WHAT TO REPORT BACK

After completing each Tier, report:
```
TIER [N] COMPLETE
Files built: [list]
Compile status: ✅ 0 errors / ❌ [error list]
Tokens used: [any new tokens needed not in ILDSTokens?]
TODOs added: [list of TODO comments and why]
Code Connect files: [created / pending]
```

---

*Phase 2 Brief · Apr 8, 2026 · ILDS Design System · dsoftacademy/ilds-design-system*
