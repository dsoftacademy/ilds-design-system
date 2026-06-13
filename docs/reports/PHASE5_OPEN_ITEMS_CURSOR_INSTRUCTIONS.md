# Phase 5 — Open Items: Cursor Execution Instructions
**Prepared by:** Claude  
**Date:** 2026-06-14  
**Prerequisite:** Commit `154378a` is on `origin/main`. All Phase 3/4 work is clean.

This document closes 5 outstanding items end-to-end. Execute them in order — items 1–3 have a verification/decision gate before code changes. Items 4–5 are fully self-contained.

---

## ORDERING GUIDE

| # | Item | Gate before coding | Can parallel |
|---|---|---|---|
| 1 | iOS Dropdown typography | Figma MCP verify → fix | No |
| 2 | Tag (React) | Figma MCP verify → build or defer | No |
| 3 | Dropdown focus ring WCAG | Designer decision (option A–C) | No |
| 4 | Chromatic visual regression | None — proceed directly | Yes (parallel with 5) |
| 5 | Flutter golden tests | None — proceed directly | Yes (parallel with 4) |

---

## ITEM 1 — iOS Dropdown label typography
**Status:** Open defect. Figma shows trigger text differently from iOS implementation.

### What the bug is

`ios/Sources/ILDSDesignSystem/IldsDropdown.swift` `IldsDropdownMetrics`:
```swift
case .large:
    triggerHeight = ILDSTokens.sp48    // 48px trigger
    fontSize = ILDSTokens.fontSize14   // 14px Regular  ← suspect
case .medium:
    triggerHeight = ILDSTokens.sp40    // 40px trigger
    fontSize = ILDSTokens.fontSize12   // 12px Regular  ← suspect
```

The field label (above trigger) is always `fontSize12, fontWeightMedium`. This is also suspect — Figma may show it as 16px Bold for the large size.

### Step 1 — Verify Figma

Pull these nodes using Figma MCP `get_design_context`:
- `13476:22317` (Empty/Default — large, standard)
- `13476:22349` (Filled — to see selected value typography)
- `13476:22326` (Disabled — compare label/trigger text)

Record exact values for:
- Field label (text above the trigger box): fontSize, fontWeight
- Trigger text (placeholder and selected value inside the box): fontSize, fontWeight

### Step 2 — Apply the fix

If Figma shows trigger text = 16px Bold:
```swift
case .large:
    triggerHeight = ILDSTokens.sp48
    fontSize = ILDSTokens.fontSize16  // was fontSize14
    fontWeight = ILDSTokens.fontWeightBold  // was fontWeightRegular
case .medium:
    triggerHeight = ILDSTokens.sp40
    fontSize = ILDSTokens.fontSize14  // was fontSize12
    fontWeight = ILDSTokens.fontWeightMedium  // was fontWeightRegular
```

Update the trigger text line:
```swift
Text(selectedOption?.label ?? placeholder)
    .font(.system(size: metrics.fontSize, weight: metrics.fontWeight))
```

Add `fontWeight: CGFloat` to `IldsDropdownMetrics`.

If Figma shows the **field label** as 16px Bold (unusual but possible for some ILDS patterns):
```swift
Text(label)
    .font(.system(size: ILDSTokens.fontSize16, weight: ILDSTokens.fontWeightBold))
```

### Step 3 — Cross-platform consistency check

After fixing iOS, verify that Android (`IldsDropdown.kt`) and Flutter (`lib/ilds_dropdown.dart`) use matching font values. If they differ, fix those too. All three platforms must match Figma.

### Step 4 — Add parity rule

Add a rule to `tool/verify_cross_platform_parity.mjs` (after the existing TextField rules):
```js
{
  component: 'Dropdown',
  state: 'trigger-typography',
  figma: '13476:22317',
  platforms: {
    swift: { must: ['fontSize16', 'fontWeightBold'] },   // adjust values to match verified Figma
    kotlin: { must: ['fontSize16', 'fontWeightBold'] },
  },
},
```

### Step 5 — Commit
```
fix(ios): correct Dropdown trigger text typography to match Figma (fontSize16 Bold)
```

---

## ITEM 2 — Tag (React)
**Status:** Deferred in Phase 3c. Flutter (`lib/ilds_tag.dart`) and iOS (`IldsTag.swift`) exist. Android (`IldsTag.kt`) should also exist. React `web/src/components/Tag/` is missing.

### Context

The Tag is **different from Chip**:
- Chip → `RoundedRectangle` (4px radius) — filter/selection control
- Tag → `Capsule` (full pill) — status/category label, can be removable

iOS `IldsTag.swift` API surface (use as reference for React):
```swift
IldsTag(
  label: String,
  isActive: Bool,         // selected state
  onTap: (() -> Void)?,
  onRemove: (() -> Void)?, // enables suffix × button
  prefixIcon: (any View)?,
  size: .medium | .large,  // medium=32px h, large=40px h
  isDisabled: Bool
)
```

iOS visual tokens:
- Default: bg=`globalWhite000`, border=`neutralCoolgray200` (1px), text=`neutralCoolgray600`
- Active: bg=`primaryOrange50`, border=`primaryOrange500` (2px), text=`primaryOrange600`
- Pressed: bg=`neutralCoolgray100`, border=`neutralCoolgray300`, text=`neutralCoolgray900`
- Disabled: bg=`neutralCoolgray50`, border=`neutralCoolgray100`, text=`neutralCoolgray300`
- Shape: `Capsule()` (full pill radius)
- Font: 13px Medium (medium size), 14px Medium (large size)

### Step 1 — Verify Figma

Search for a "Tag Display" or "Tag" component in Figma file `PCUj412f0Z1zZLLxQUX22e` using `search_design_system` or `get_metadata`. Look for a component set that is NOT `14018:6786` (which is the Chip/filter Tag).

**Two outcomes:**

**A) Figma Tag node found:** Verify the Figma node values exactly (bg, border, text, border-radius, height, font). Build the React component against those values.

**B) No Figma Tag node:** Document this formally. Create `docs/deferred/TAG_REACT_DEFERRED.md` with: reason (no Figma source), existing native implementations as reference, required Figma deliverable before React can be built. Update `PHASE3C_FLUTTER_REACT_SIGNOFF.md` to reflect Tag as pending.

### Step 2A — If Figma node found, build React Tag

Create `web/src/components/Tag/Tag.tsx`:

```tsx
// Full component — do NOT produce a snippet
export type IldsTagSize = 'medium' | 'large';

export type IldsTagProps = {
  label: string;
  isActive?: boolean;
  isDisabled?: boolean;
  hasPrefixIcon?: boolean;
  prefixIcon?: ReactNode;
  hasSuffixButton?: boolean;  // shows × remove button
  onPress?: () => void;
  onRemove?: () => void;
  size?: IldsTagSize;
  className?: string;
};
```

CSS shape must be `rounded-full` (Capsule = full pill) — NOT `rounded-medium` (that's Chip).

Size heights: medium = `h-[32px]`, large = `h-[40px]`.

Add `data-testid="tag"` on root element.

Create `web/src/components/Tag/Tag.stories.tsx` with stories for all variants.

Create `web/specs/tag.spec.json` with Figma-verified hex values for default/active/disabled variants. All variants `verified: true`.

Create `web/src/components/Tag/index.ts` exporting `IldsTag`.

Add `IldsTag` to `web/src/index.ts` barrel export.

Add parity rule to `tool/verify_cross_platform_parity.mjs`:
```js
{
  component: 'Tag',
  state: 'active-colors',
  figma: '<figma node id>',
  platforms: {
    react: { must: ['rounded-full', 'primary-orange-50', 'primary-orange-500'] },
    swift: { must: ['Capsule', 'primaryOrange50', 'primaryOrange500'] },
    kotlin: { must: ['CircleShape', 'primaryOrange50', 'primaryOrange500'] },
  },
},
```

Run `npm run build-storybook` → `npm run test:parity` — all variants must be `verified: true` and passing.

Commit: `feat(web): add Tag component — pill-shape filter label with active/disabled states`

---

## ITEM 3 — Dropdown focus ring WCAG
**Status:** Designer decision required FIRST. Do not implement until Pratishek confirms the option below.

### Background

Current Figma-verified behavior (committed, passing parity): keyboard focus on the closed dropdown trigger shows only a background+border change (`#FAFAFA` bg, `#424242` border) — no orange outline ring. This is intentional in Figma `13476:22340` but creates a WCAG 2.4.7 Focus Visible risk.

TextField by contrast uses a 2px orange outline ring on focus.

Full analysis: `docs/a11y/DROPDOWN_FOCUS_RING_FLAG.md`

### Decision gate

**Pratishek must confirm Option A, B, or C before Cursor touches any code.**

| Option | Behavior | WCAG risk |
|---|---|---|
| **A — Accept as-is** | Keep current bg/border-only focus | Documented WCAG exception; inconsistent with TextField |
| **B — Add orange ring** | Match TextField `outline-primary-orange-600` always on `focus-visible:` | Fully AA; consistent; requires Figma update to `13476:22340` |
| **C — Hybrid (recommended)** | Orange ring on keyboard-only (`focus-visible:`), no ring on click | Best coverage; aligns with platform conventions |

**Recommendation: Option C.**

### Step 1 — Get sign-off

Share `docs/a11y/DROPDOWN_FOCUS_RING_FLAG.md` with the designer. Get written confirmation of Option A, B, or C before proceeding.

### Step 2 — Implement Option C (if approved)

In `web/src/components/Dropdown/Dropdown.tsx` `triggerClasses()`, add to the closed-trigger default return:
```tsx
'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-orange-600'
```

The final default return (not open, not error, not disabled) becomes:
```tsx
return `${base} ${focusVisible} bg-white-000 border-neutral-coolgray-500 
  hover:bg-neutral-coolgray-100 hover:border-neutral-coolgray-800
  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-orange-600`;
```

Note: `focus-visible:` only fires on keyboard navigation, not mouse clicks — this is exactly what Option C requires.

### Step 3 — Update Figma (designer)

Designer must update Figma node `13476:22340` (Focused state) to show the 2px orange ring. This is a Figma update, not a code change. Pratishek handles this.

### Step 4 — Update spec and parity

Add a new variant to `web/specs/dropdown.spec.json`:
```json
{
  "name": "focused-keyboard",
  "storyId": "components-dropdown--empty-default",
  "figmaNodeId": "13476:22340",
  "interaction": "focus",
  "verified": true,
  "expect": {
    "background-color": "#fafafa",
    "border-color": "#424242",
    "outline-color": "#c74c01",
    "outline-width": "2px",
    "outline-offset": "2px"
  }
}
```

Run `npm run build-storybook` → `npm run test:parity`. All variants passing.

### Step 5 — Update a11y doc and commit

Update `docs/a11y/DROPDOWN_FOCUS_RING_FLAG.md`:
- Mark status as `Resolved — Option C implemented`
- Record decision date and who approved

Commit:
```
fix(a11y): add keyboard focus ring to Dropdown trigger (Option C, WCAG 2.4.7)

Designer-approved Option C: 2px orange outline via focus-visible: only (keyboard-only).
Does not fire on mouse click. Figma 13476:22340 updated to match.
Closes DROPDOWN_FOCUS_RING_FLAG.md
```

### If Option A is chosen instead

Update `docs/a11y/DROPDOWN_FOCUS_RING_FLAG.md`:
- Mark status: `Accepted WCAG exception — designer decision 2026-XX-XX`
- Note: exception accepted for Dropdown trigger only; all other form controls retain orange ring
- No code change needed

---

## ITEM 4 — Chromatic visual regression
**Status:** No gate. Execute directly.

### What Chromatic does

Chromatic builds Storybook and takes screenshots of every story on every change. It diffs against the last approved baseline and blocks merge on visual regression. It catches what Playwright parity misses: layout drift, spacing errors, icon misalignment, font rendering issues.

### Step 1 — Create Chromatic project

Go to https://www.chromatic.com → sign in with GitHub → "Add project" → select `ilds-design-system`. Copy the `project-token`.

### Step 2 — Add GitHub secret

In the GitHub repo → Settings → Secrets and variables → Actions → New repository secret:
- Name: `CHROMATIC_PROJECT_TOKEN`
- Value: the token from Step 1

### Step 3 — Install Chromatic in web/

```bash
cd web && npm install --save-dev chromatic
```

Add to `web/package.json` scripts:
```json
"chromatic": "chromatic --project-token=$CHROMATIC_PROJECT_TOKEN --exit-zero-on-changes"
```

The `--exit-zero-on-changes` flag means Chromatic posts a PR check but doesn't fail the build on first-review snapshots — a human must approve. Remove this flag once baselines are stable (after first full baseline capture).

### Step 4 — Add GitHub Actions workflow

Create `.github/workflows/chromatic.yml`:

```yaml
name: Chromatic Visual Regression

on:
  pull_request:
    paths:
      - 'web/src/**'
      - 'web/specs/**'
      - 'dist/tokens.theme.css'
      - 'tokens/**'
  push:
    branches: [main]
    paths:
      - 'web/src/**'
      - 'dist/tokens.theme.css'

jobs:
  chromatic:
    name: Chromatic snapshot test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # full history required for Chromatic baseline tracking
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
          cache-dependency-path: web/package-lock.json
      - name: Install dependencies
        run: npm ci
        working-directory: web
      - name: Run Chromatic
        uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          workingDir: web
          buildScriptName: build-storybook
          exitZeroOnChanges: true   # remove after baselines captured
          autoAcceptChanges: main   # auto-accept on main pushes (new baseline)
```

**Critical:** `fetch-depth: 0` is required. Chromatic uses git history to identify which stories changed. Without full history it re-runs every story every time.

**`autoAcceptChanges: main`** means pushes to main auto-accept as the new baseline. PRs against main are compared to the current main baseline — any visual change requires a human approval in the Chromatic UI before the PR check goes green.

### Step 5 — Capture first baseline

Merge this change to main. The first Chromatic run on main will capture baseline snapshots for all Storybook stories. After that run completes, remove `exitZeroOnChanges: true` from the workflow so future PRs actually block on unreviewed visual changes.

### Step 6 — Configure viewport and themes

In `web/.storybook/main.ts` (or existing config), ensure the Storybook viewport is set consistently:
```ts
// Chromatic captures at 1280px by default. Add mobile:
parameters: {
  chromatic: {
    viewports: [375, 1280],
  },
}
```

This gives you both mobile and desktop snapshots per story.

### Commit
```
ci(chromatic): add Chromatic visual regression workflow

Captures Storybook snapshots on web/src + token changes. PRs against main
require human approval of visual diffs before merge. Baselines auto-accepted
on main. Viewports: 375px (mobile) + 1280px (desktop).
```

---

## ITEM 5 — Flutter golden tests
**Status:** No gate. Execute directly.

### What Flutter golden tests do

Golden tests render a widget to an image and compare it to a saved reference file (`.png`). They catch rendering regressions that code review misses: wrong padding, icon size, color value, layout overflow. They are the Flutter equivalent of Chromatic.

### Architecture decision

Golden tests are **OS/renderer-specific** — a macOS dev and Linux CI render fonts slightly differently. To avoid false failures, all goldens must be generated and compared on the SAME OS. **Use Linux (Ubuntu) only.** Generated goldens are committed to the repo. Regeneration only happens via a CI-triggered `--update-goldens` run.

Do NOT use macOS runner for goldens. Use `ubuntu-latest` consistently.

### Step 1 — Create test directory structure

```
test/
  golden/
    helpers/
      golden_test_helpers.dart   ← shared setup (fonts, theme, wrapper)
    ilds_button_golden_test.dart
    ilds_chip_golden_test.dart
    ilds_checkbox_golden_test.dart
    ilds_radio_golden_test.dart
    ilds_switch_golden_test.dart
    ilds_textfield_golden_test.dart
    ilds_dropdown_golden_test.dart
    ilds_toast_golden_test.dart
    ilds_badge_golden_test.dart
    ilds_tabs_golden_test.dart
    ilds_pagination_golden_test.dart
    ilds_tag_golden_test.dart
    ilds_chip_golden_test.dart
  goldens/
    (generated .png files go here — committed to repo)
```

### Step 2 — Create shared test helper

Create `test/golden/helpers/golden_test_helpers.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

// Wraps a widget with MaterialApp + ILDS font setup for consistent golden rendering.
Widget goldenWrap(Widget child, {double width = 400, double height = 200}) {
  return MaterialApp(
    debugShowCheckedModeBanner: false,
    home: Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: SizedBox(
          width: width,
          height: height,
          child: child,
        ),
      ),
    ),
  );
}

// Call this in setUpAll() in every golden test file.
Future<void> loadIldsTestFonts() async {
  // Loads Mulish from assets so goldens render correctly.
  // Requires 'assets/fonts/Mulish-Regular.ttf' etc. in pubspec.yaml.
  final fontLoader = FontLoader('Mulish')
    ..addFont(rootBundle.load('assets/fonts/Mulish-Regular.ttf'))
    ..addFont(rootBundle.load('assets/fonts/Mulish-Bold.ttf'))
    ..addFont(rootBundle.load('assets/fonts/Mulish-Medium.ttf'));
  await fontLoader.load();
}
```

### Step 3 — Write golden test files

Example pattern — `test/golden/ilds_chip_golden_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_chip.dart';
import 'helpers/golden_test_helpers.dart';

void main() {
  setUpAll(loadIldsTestFonts);

  group('IldsChip goldens', () {
    testWidgets('large-default', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsChip(label: 'Label', size: IldsChipSize.large),
      ));
      await expectLater(
        find.byType(IldsChip),
        matchesGoldenFile('../../test/goldens/chip_large_default.png'),
      );
    });

    testWidgets('large-selected', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsChip(label: 'Label', size: IldsChipSize.large, isSelected: true),
      ));
      await expectLater(
        find.byType(IldsChip),
        matchesGoldenFile('../../test/goldens/chip_large_selected.png'),
      );
    });

    testWidgets('large-disabled', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsChip(label: 'Label', size: IldsChipSize.large, isDisabled: true),
      ));
      await expectLater(
        find.byType(IldsChip),
        matchesGoldenFile('../../test/goldens/chip_large_disabled.png'),
      );
    });

    testWidgets('medium-default', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsChip(label: 'Label', size: IldsChipSize.medium),
        width: 200,
        height: 80,
      ));
      await expectLater(
        find.byType(IldsChip),
        matchesGoldenFile('../../test/goldens/chip_medium_default.png'),
      );
    });
  });
}
```

Write equivalent test files for every component in the `test/golden/` list above. Cover: default, selected/checked/active, disabled, error states. Skip hover/pressed states (those require pointer simulation and are fragile in goldens).

**Minimum variants per component:**
- Button: primary/secondary/tertiary + disabled + loading
- Chip: large-default, large-selected, large-disabled, medium-default
- Checkbox: unchecked/checked/indeterminate + disabled + error
- Radio: unselected/selected + disabled
- Switch: on/off + disabled
- TextField: default/focused/error/success/disabled
- Dropdown: default/filled/error/disabled
- Toast: info/success/warning/error
- Badge: all 6 variants (subtle/intense/success/error/warning/info)
- Tabs: high-selected, medium-selected-underline, disabled
- Pagination: page 1 selected, page 3 selected (middle), last page
- Tag: default/active/disabled

### Step 4 — Generate initial baselines

Run locally on Linux (or in a throwaway CI job with `--update-goldens`):
```bash
flutter test test/golden/ --update-goldens
```

Commit all `.png` files in `test/goldens/`:
```
test(flutter): add golden baseline snapshots for all 12 components
```

### Step 5 — Add CI job

Add a `flutter-golden` job to `.github/workflows/native-tests.yml`:

```yaml
  flutter-golden:
    name: Flutter golden tests
    runs-on: ubuntu-latest   # MUST be ubuntu — goldens are OS-specific
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          channel: stable
          cache: true
      - name: Get packages
        run: flutter pub get
      - name: Run golden tests
        run: flutter test test/golden/
      - name: Upload golden diffs on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: flutter-golden-failures
          path: test/goldens/failures/
```

The `failures/` directory is auto-generated by Flutter when a golden test fails — it contains a diff image showing expected vs actual. The artifact upload lets you see exactly what changed in CI.

### Step 6 — Golden update workflow

When a component intentionally changes (e.g., new Figma spec), update goldens by:

1. Open a PR with the code change
2. The golden CI job will fail (expected)
3. Run locally: `flutter test test/golden/ilds_COMPONENT_golden_test.dart --update-goldens`
4. Commit the updated `.png` files alongside the code change
5. The CI job will now pass against the new baseline

Never auto-update goldens in CI — always update them manually and commit. This keeps the baseline trustworthy.

### Commit
```
test(flutter): add golden test suite for all 12 Flutter components

Covers default/active/disabled/error variants. Generated on ubuntu-latest
to ensure CI consistency. CI uploads diff artifacts on failure.
Regenerate with: flutter test test/golden/ --update-goldens
```

---

## POST-COMPLETION CHECKLIST

After all 5 items are closed, verify:

- [ ] iOS Dropdown: `swift build` in `ios/` passes, typography matches Figma
- [ ] Tag (React): if built — `npm run test:parity` passes, all variants verified; if deferred — `TAG_REACT_DEFERRED.md` exists
- [ ] Dropdown WCAG: either Option A documented in a11y doc, or Option C in code + parity spec
- [ ] Chromatic: first baseline captured on main; PR check visible in GitHub
- [ ] Flutter goldens: `flutter test test/golden/` passes on `ubuntu-latest`; `.png` baselines committed
- [ ] `verify:parity` still passes (run `npm run verify:parity` — expect 47+ checks)
- [ ] `native-tests` CI workflow passes all 4 jobs: verify, flutter, ios, android

Commit everything to `origin/main` and update `PHASE3_AND_PHASE4_COMPLETE_REPORT_2026-06-14.md` resolution section to mark Phase 5 items as closed.
