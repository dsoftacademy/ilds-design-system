# Phase 5b — Visual regression coverage

**Date:** 2026-06-24 · completed on `feat/phase5-5b-regression-coverage`  
**Audited against:** `main` `bad0d78` → extended by this PR  
**Purpose:** master §369 deliverable #1 — every component has a visual baseline. React → Chromatic (Storybook); Flutter → golden tests; iOS/Android → compile-only today (no visual baseline yet).

## Coverage matrix

| Component | React / Chromatic | Flutter golden | iOS | Android |
|-----------|:---:|:---:|:---:|:---:|
| Accordion | ✅ | ✅ | compile-only | compile-only |
| Badge | ✅ | ✅ | compile-only | compile-only |
| Button | ✅ | ✅ | compile-only | compile-only |
| Checkbox | ✅ | ✅ | compile-only | compile-only |
| Chip | ✅ | ✅ | compile-only | compile-only |
| Dropdown | ✅ | ✅ | compile-only | compile-only |
| Pagination | ✅ | ✅ | compile-only | compile-only |
| Radio | ✅ | ✅ | compile-only | compile-only |
| Scrollbar | ✅ | ✅ | compile-only | compile-only |
| Search | ✅ | ✅ | compile-only | compile-only |
| SelectionButton | ✅ | ✅ | compile-only | compile-only |
| Switch | ✅ | ✅ | compile-only | compile-only |
| Tabs | ✅ | ✅ | compile-only | compile-only |
| Tag | — (React deferred¹) | ✅ | compile-only | compile-only |
| TextArea | ✅ | ✅ | compile-only | compile-only |
| TextField | ✅ | ✅ | compile-only | compile-only |
| TextLink | ✅ | ✅ | compile-only | compile-only |
| Toast | ✅ | ✅ | compile-only | compile-only |

¹ Tag React deferred — see `docs/deferred/TAG_REACT_DEFERRED.md` (no Figma Tag Display node).

**React / Chromatic:** 17 components with Storybook stories under `web/src/components/*/`. Chromatic workflow (`.github/workflows/chromatic.yml`) runs on `pull_request` + push to `main` with `--auto-accept-changes=main`; baselines are approved on `main` (verified: 17 story files, workflow green on recent `main` pushes).

**Flutter / golden:** 18 components × `test/golden/ilds_*_golden_test.dart` (one file per component). **63** snapshot assertions, **63** PNGs in `test/goldens/`. All PNGs **Linux-authored** (`ghcr.io/cirruslabs/flutter:stable`).

## Flutter golden inventory (18 files)

| Component | Test file | Key states captured |
|-----------|-----------|---------------------|
| Accordion | `ilds_accordion_golden_test.dart` | closed, open, disabled |
| Badge | `ilds_badge_golden_test.dart` | all variants (excl. skeleton) |
| Button | `ilds_button_golden_test.dart` | primary L default/disabled/loading, tertiary L |
| Checkbox | `ilds_checkbox_golden_test.dart` | unchecked, checked, disabled, error |
| Chip | `ilds_chip_golden_test.dart` | large default/selected/disabled, medium default |
| Dropdown | `ilds_dropdown_golden_test.dart` | default, filled, error, disabled, menu-open |
| Pagination | `ilds_pagination_golden_test.dart` | page 1/3 selected, last page |
| Radio | `ilds_radio_golden_test.dart` | unselected, selected, disabled |
| Scrollbar | `ilds_scrollbar_golden_test.dart` | list with thumb (scrolled) |
| Search | `ilds_search_golden_test.dart` | empty, filled, loading |
| SelectionButton | `ilds_selection_button_golden_test.dart` | unselected, selected, disabled |
| Switch | `ilds_switch_golden_test.dart` | off, on, disabled |
| Tabs | `ilds_tabs_golden_test.dart` | high selected, medium underline, disabled |
| Tag | `ilds_tag_golden_test.dart` | default, active, disabled |
| TextArea | `ilds_text_area_golden_test.dart` | default + char counter, error |
| TextField | `ilds_text_field_golden_test.dart` | default, error, success, disabled, otp-x6 |
| TextLink | `ilds_text_link_golden_test.dart` | default, disabled, white-on-dark |
| Toast | `ilds_toast_golden_test.dart` | info, success, warning, error |

**Deduped:** removed `ilds_textfield_golden_test.dart`; canonical file is `ilds_text_field_golden_test.dart`.

## Native platforms (documented scope — not 5b deliverable)

iOS and Android have **no visual regression baselines** today — only compile gates in `native-tests.yml` (`swift build`, `compileDebugKotlin`). Snapshot testing for SwiftUI / Compose is a **future** item.

## Authoring goldens

```bash
# Linux only — macOS PNGs fail the ubuntu CI job
docker run --rm -v "$(pwd):/work" -w /work ghcr.io/cirruslabs/flutter:stable \
  bash -lc 'flutter pub get && flutter test test/golden/ --update-goldens'
```

Re-run without `--update-goldens` to verify:

```bash
flutter test test/golden/
```

CI job: `native-tests.yml` → **Flutter golden tests** on `ubuntu-latest`.

## Acceptance (5b) — complete

- [x] All 18 Flutter components have a golden test; 6 gaps closed; TextField dedup'd.
- [x] `flutter test test/golden/` green on Linux (63/63).
- [x] React Chromatic baselines confirmed for all 17 Storybook components on `main`.
- [x] This doc updated to all-✅ for React + Flutter columns.

## Next (Phase 5c+)

See `CURSOR_PHASE5_EVOLUTION_ENGINE.md` — PR automation (`tool/propose_change.mjs`), Slack notify + interactive approval, post-merge doc.

**5c:** `docs/PHASE5_PR_AUTOMATION.md` · `tool/propose_change.mjs` · `.github/workflows/evolution-propose.yml`
