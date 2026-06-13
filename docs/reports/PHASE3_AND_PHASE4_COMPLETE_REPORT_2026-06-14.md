# ILDS Phase 3 & Phase 4 — Complete Implementation Report

**Date:** 14 June 2026  
**Audience:** Claude / Cursor / Pratishek — primary handoff for resuming work  
**Repo:** `dsoftacademy/ilds-design-system` · branch `main`  
**Figma file:** ILDS Master | Design — key `PCUj412f0Z1zZLLxQUX22e`  
**Supersedes for phase scope:** `ILDS_STATUS_AND_RESUME_REPORT_2026-06-12.md` (Button-only snapshot)  
**Canonical long-form:** `ILDS_PROJECT_MASTER.md` (roadmap + rules)

> This document is intentionally **not** a status checklist. It records **what was built**, **why decisions were made**, **where code lives**, and **how the pieces connect** across Flutter, React, iOS, and Android.

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [Shared architecture (all phases)](#2-shared-architecture-all-phases)
3. [Phase 3a — Web token export](#3-phase-3a--web-token-export)
4. [Phase 3b — React component parity](#4-phase-3b--react-component-parity)
5. [Phase 3c — Extended parity + Flutter gaps](#5-phase-3c--extended-parity--flutter-gaps)
6. [Phase 4a — Native token export](#6-phase-4a--native-token-export)
7. [Phase 4b — Native components](#7-phase-4b--native-components)
8. [Cross-platform Figma parity QA (post-4b)](#8-cross-platform-figma-parity-qa-post-4b)
9. [Decision log (with rationale)](#9-decision-log-with-rationale)
10. [QA harness inventory](#10-qa-harness-inventory)
11. [File map by platform](#11-file-map-by-platform)
12. [Commit reference](#12-commit-reference)
13. [Known gaps & deferred work](#13-known-gaps--deferred-work)
14. [Resume commands](#14-resume-commands)

---

## 1. Executive summary

| Phase | Goal | Status |
|-------|------|--------|
| **3a** | `tokens.json` → CSS + Tailwind v4 `@theme` | ✅ Complete |
| **3b** | React + Storybook + Playwright parity vs Figma | ✅ Complete (17 components, 89 variants) |
| **3c** | Password/OTP TextField, Dropdown menu panel, Flutter icon-only Button | ✅ Complete |
| **4a** | Same `tokens.json` → Swift + Kotlin token classes | ✅ Complete |
| **4b** | 18 SwiftUI + 18 Compose components | ✅ Complete |
| **Parity QA** | Cross-board Figma alignment (not siloed) | ✅ Complete — `npm run verify:parity` 38/38 |

**Platform coverage today:**

| Platform | Tokens | Components | Figma-verified specs |
|----------|--------|------------|----------------------|
| Flutter | `lib/design_system/ilds_tokens.dart` | 18 in `lib/` | Code Connect (17 published) |
| React | `dist/tokens.theme.css` | 17 in `web/src/components/` | `web/specs/*.spec.json` (18 files) |
| iOS | `ios/Sources/ILDSTokens/ILDSTokens.swift` | 19 in `ios/Sources/ILDSDesignSystem/` | Mirrored from React specs |
| Android | `android/.../tokens/IldsTokens.kt` | 19 in `android/.../components/` | Mirrored from React specs |

**Autonomy level:** L4 (platform parity) — one `tokens.json` drives four platform token outputs; components exist on all four targets.

---

## 2. Shared architecture (all phases)

```
Figma Variables (colors, spacing, radius)
        │
        ▼  ILDS Figma Plugin (ilds-plugin/)
tokens/tokens.json  (W3C DTCG — DO NOT edit by hand)
        │
        ├── build-tokens.yml (CI on push)
        │       ├── dist/tokens.css
        │       ├── dist/tokens.theme.css      ← React / Tailwind v4
        │       ├── dist/ILDSTokens.swift      ← iOS
        │       ├── dist/IldsTokens.kt         ← Android
        │       ├── ios/Sources/ILDSTokens/    ← SPM copy (byte-identical to dist)
        │       ├── android/.../IldsTokens.kt  ← module copy
        │       └── dart run tool/generate_ilds_tokens.dart → lib/design_system/ilds_tokens.dart
        │
        ├── sync-supernova.yml → Supernova token pages
        │
        └── Component implementations consume tokens only (zero hardcoded hex in components)
```

**Name conventions across platforms:**

| Concept | Flutter (semantic alias) | Swift / Kotlin / React (faithful) |
|---------|--------------------------|-----------------------------------|
| Brand orange | `orange500` | `primaryOrange500` / `primary-orange-500` |
| White | `white` | `globalWhite000` / `white-000` |
| Cool gray text | `neutral900` | `neutralCoolgray900` / `neutral-coolgray-900` |

QA scripts (`verify:tokens`, `verify:parity`) account for this alias map.

---

## 3. Phase 3a — Web token export

### Goal

Transform `tokens/tokens.json` into web-consumable CSS custom properties and a Tailwind v4 `@theme` block, regenerated automatically on every token push.

### What shipped

| Artifact | Path | Role |
|----------|------|------|
| Style Dictionary config | `style-dictionary.config.mjs` | v4.4.0 programmatic build, DTCG `usesDtcg: true` |
| Generic CSS | `dist/tokens.css` | `:root` custom properties |
| Tailwind v4 theme | `dist/tokens.theme.css` | `@theme` with `--color-*`, `--spacing-*`, `--radius-*`, typography |
| Deprecated shim | `dist/tailwind-tokens.js` | v3 CommonJS — kept temporarily |
| CI workflow | `.github/workflows/build-tokens.yml` | `npm run build:tokens` + auto-commit `[skip ci]` |
| NPM script | `npm run build:tokens` | Local regeneration |

### How it works

1. Custom transforms: `ilds/name/kebab`, `ilds/size/px`, `ilds/tailwind-theme`.
2. Typography was **tokenized in JSON** (Mulish, sizes 12/14/16/20, weights 400/500/700) because Figma has no Typography Variables yet — **Phase 8** migrates typography to Figma-only.
3. Plugin **preserve-merge** (`ilds-plugin/code.ts`) keeps non-Figma groups (typography) when syncing colors from Figma.

### Key decision: Tailwind v4, not v3

**Why:** Tailwind 4.3 uses CSS `@theme`, not `tailwind.config.js`. Initial `tailwind-tokens.js` was a v3-shaped mistake; `dist/tokens.theme.css` is canonical for Phase 3b.

### Key commits

| SHA | Message |
|-----|---------|
| `2496671` | feat(tokens): Phase 3a — Style Dictionary export (CSS + Tailwind) |
| `368611b` | feat(tokens): Tailwind v4 @theme export + typography tokenization |
| `b0edb5a` | fix(plugin): preserve-merge tokens.json; prep 3b Tailwind reset |

---

## 4. Phase 3b — React component parity

### Goal

Build React counterparts to Flutter components, styled exclusively via Phase 3a tokens, with automated Figma parity verification in Storybook.

### What shipped

| Artifact | Path | Role |
|----------|------|------|
| Web package | `web/` | Vite + React 19 + TypeScript + Tailwind 4.3 + Storybook 10.4 |
| Components | `web/src/components/*/` | 17 React components (Tag deferred — no Figma node) |
| Parity specs | `web/specs/*.spec.json` | 18 spec files, 89 verified variants, Figma node IDs + expected CSS |
| Parity runner | `web/tests/parity.spec.ts` | Playwright — reads specs, asserts computed styles |
| A11y sweep | `web/tests/a11y.spec.ts` | axe-core on all stories |
| CI | `.github/workflows/web-tests.yml` | build-storybook + test:parity + a11y |

### How parity verification works

1. Designer/Cursor extracts expected values from Figma (`get_design_context` + `tokens.theme.css`) into `web/specs/<component>.spec.json`.
2. Each variant names a Storybook `storyId`, Figma `figmaNodeId`, and `expect` object (e.g. `background-color`, `offsetHeight`).
3. Playwright opens static Storybook build, queries `#storybook-root`, compares computed styles to spec.
4. Specs are the **cross-platform ground truth** for native QA (Phase 4 parity pass).

### Component build order (approximate)

1. **Button** — Milestone 1 gate; parity harness invented here (`a77c734`).
2. **Chip** — Figma set `14018:6786` (filter chip; Tag display deferred).
3. **TextField, Dropdown, Toast** — form controls (`d385571`).
4. **Remaining 10** — batch parity (`163555e`): Badge, Switch, Checkbox, Radio, TextLink, SelectionButton, Accordion, Tabs, Pagination, Search, Scrollbar, TextArea.

### Key decisions

| Decision | Rationale |
|----------|-----------|
| **No Vercel public DS site** | Supernova is the canonical public documentation portal; Storybook is dev-time only |
| **Tag (React) deferred** | No Figma Tag *Display* component set; `chip.figma.ts` owns shared node `14018:6786` |
| **Chromatic deferred to Phase 5** | Visual regression infrastructure belongs in evolution engine phase |
| **Mobile-first: hover deferred on Flutter** | React has hover stories; Flutter uses pressed states; documented in component TODOs |
| **Figma is source of truth, not React guesses** | Multiple correction passes (Button destructive pressed, Pagination borderless cells, Tabs high-emphasis pills) came from `get_design_context` on specific nodes |

### Notable Figma corrections during 3b

| Component | Figma node | Correction |
|-----------|------------|------------|
| Pagination selected cell | `17724:3366` | Borderless 32px; `primary-orange-50` bg + `primary-orange-600` text (not solid orange-500) |
| Tabs high emphasis | `17667:2363` | Filled segmented pills (orange-500 fill + white text), not underline-only |
| Badge intense | `13965:24551` | Solid 500-level fills, not pale semantic pairs |
| TextField focus | `13478:25465` | Hugging 2px orange-600 border when empty; 1px orange-500 when typing |

### Key commits

| SHA | Message |
|-----|---------|
| `7f1da52` | feat(web): Phase 3b scaffold — Storybook 10.4 + Button milestone |
| `a77c734` | feat(web): Figma parity harness — Playwright + button.spec.json |
| `d385571` | feat: TextField, Dropdown, Toast — Phase 3b |
| `163555e` | feat(web): complete React component parity — 10 new components |
| `7f9d354` | fix(a11y): accessible names, roles, keyboard access + axe sweep |
| `7d283e7` | fix(badge,tabs,pagination): correct to Figma source of truth |

---

## 5. Phase 3c — Extended parity + Flutter gaps

### Goal

Close high-risk gaps between Flutter and React where Figma introduced variants not in the original Flutter scaffold.

### What shipped

| Deliverable | Location | Notes |
|-------------|----------|-------|
| Password + OTP TextField (React) | `web/src/components/TextField/` | 6-digit / 4-digit OTP, password toggle |
| Dropdown menu panel (React) | `web/src/components/Dropdown/DropdownMenu.tsx` | Figma `16055:6152` — section header, radio rows, footer buttons |
| Flutter icon-only Button | `lib/ilds_button.dart` | Matches React `iconOnly` + size matrix |
| OTP paste + label a11y fixes | `web/src/components/TextField/`, tests | QA suite hardening |
| Sign-off checklist | `docs/reports/PHASE3C_FLUTTER_REACT_SIGNOFF.md` | Mechanical gate for Pratishek |

### Key decision: React menu panel is canonical for DropdownMenu

**Why:** Flutter `ilds_dropdown.dart` overlay predated Figma `16055:6152`. Phase 3c built the React panel to spec; native platforms (Phase 4b) mirrored React/Android structure, not the legacy Flutter overlay.

### Key commits

| SHA | Message |
|-----|---------|
| `aca0640` | feat(phase-3c): Password/OTP TextField, Dropdown menu, Flutter icon-only |
| `47189f9` | fix(qa): OTP paste, label a11y, dropdown aria-controls + QA suite |
| `db3e605` | fix(textfield,dropdown): Figma-accurate focus, click-to-open, loading state |

---

## 6. Phase 4a — Native token export

### Goal

Extend Style Dictionary so the same `tokens.json` push regenerates Swift and Kotlin token classes alongside web and Flutter.

### What shipped

| Artifact | Path |
|----------|------|
| Swift tokens | `dist/ILDSTokens.swift` + `ios/Sources/ILDSTokens/ILDSTokens.swift` |
| Kotlin tokens | `dist/IldsTokens.kt` + `android/ilds-design-system/.../IldsTokens.kt` |
| Custom formats | `ilds/swift`, `ilds/compose` in `style-dictionary.config.mjs` |
| Name transform | `ilds/name/faithful` — `primaryOrange500`, `sp8`, `radiusMedium`, etc. |
| QA script | `tool/verify_token_exports.mjs` — 124 tokens × 4 platforms |
| CI integration | `build-tokens.yml` runs Dart codegen + `verify:tokens` |

### How Swift/Kotlin tokens work

- **Swift:** `enum ILDSTokens` with `Color(hex:)` extension, `CGFloat` spacing, `Font.Weight`.
- **Kotlin:** `object IldsTokens` with `Color(0xFFRRGGBB)`, `Dp`, `Sp`, `FontWeight`.
- **Faithful names** match across Flutter/iOS/Android so one token = one identifier (Flutter uses shorter semantic aliases mapping to same hex).

### Key decision: Faithful names on native, semantic aliases on Flutter

**Why:** Flutter `ilds_tokens.dart` predates the multi-platform export and uses `orange500` aliases. Regenerating Flutter names would break 18 components. Native platforms adopted faithful DTCG names from day one; QA maps between conventions.

### Bug caught in 4a QA

| Issue | Fix |
|-------|-----|
| `globalWhite000` drift `#FFFFFE` vs `#FFFFFF` | Regenerated via CI; `verify:tokens` guard added (`589fe2b`) |

### Key commits

| SHA | Message |
|-----|---------|
| `589fe2b` | feat(phase-4a): native token export (Swift + Compose) + cross-platform QA |
| `a713494` | ci(tokens): regenerate Flutter Dart tokens in build-tokens workflow |

---

## 7. Phase 4b — Native components

### Goal

18 SwiftUI + 18 Jetpack Compose components consuming Phase 4a tokens, matching Flutter/React states and Figma visuals.

### What shipped

| Platform | Package | Files |
|----------|---------|-------|
| iOS | `ios/` (SPM) | 19 Swift files in `Sources/ILDSDesignSystem/` (+ `IldsDropdownMenu`) |
| Android | `android/ilds-design-system/` | 19 Kotlin files in `components/` |

**Component list (both platforms):** Button, Chip, Badge, Switch, Checkbox, Radio, TextLink, Toast, SelectionButton, Accordion, Tabs, Pagination, Search, Scrollbar, Tag, TextArea, TextField, Dropdown, DropdownMenu.

### How components were built

1. **Milestone 1:** Button only — proved SPM + Gradle scaffold, token import, compile CI (`da8c670`).
2. **Milestone 2:** Chip + `native-tests.yml` workflow (`089d6e4`).
3. **Bulk completion:** Remaining 16 components per platform (`acb51fa`) — mirrored Flutter file structure and React token choices.

### Architecture pattern (native)

- All colors/dimensions from `ILDSTokens` / `IldsTokens` — grep confirms **zero hardcoded hex** in component sources.
- State resolved in private `*Colors.resolve()` structs (Swift) or `@Immutable data class` (Kotlin).
- Mobile-first: hover states deferred (matching Flutter/React policy); pressed via `InteractionSource` on Android, `ButtonStyle` on iOS where wired.

### CI

| Workflow | Command | Checks |
|----------|---------|--------|
| `.github/workflows/native-tests.yml` | `npm run verify:phase4b` | Token byte-sync, swift build, Kotlin compile, registry |
| | `cd ios && swift build` | SPM compile |
| | `./gradlew compileDebugKotlin` | Android compile (CI has JDK 17) |

### Key commits

| SHA | Message |
|-----|---------|
| `da8c670` | feat(phase-4b): native scaffold + Button Milestone 1 |
| `089d6e4` | feat(phase-4b): Chip component + native CI workflow |
| `acb51fa` | feat(phase-4b): complete all 18 native components |

---

## 8. Cross-platform Figma parity QA (post-4b)

### Goal

Rigorous **cross-board** validation — not siloed per-platform checks. Native components were bulk-generated; this pass audited all four platforms against Figma-verified React specs.

### What shipped

| Artifact | Path | Role |
|----------|------|------|
| Cross-platform parity script | `tool/verify_cross_platform_parity.mjs` | 12 rules × up to 4 platforms = 38 matrix checks |
| NPM script | `npm run verify:parity` | Single command gate |

### How the matrix works

1. Rules derived from `web/specs/*.spec.json` (Figma-ground-truth).
2. Each rule defines `must` / `mustNot` token patterns per platform file.
3. Example: Pagination selected → all platforms must reference `primaryOrange50` + `primaryOrange600`, must NOT use solid `primaryOrange500` background.
4. Reports Component × State × Platform pass/fail grid.

### Defects found and fixed (this session)

| Severity | Component | Platform | Issue | Fix location |
|----------|-----------|----------|-------|--------------|
| Critical | Tabs | iOS | Underline for high emphasis | `IldsTabs.swift` — filled pills |
| Critical | Pagination | Android | Solid orange selected cell | `IldsPagination.kt` — borderless pale orange |
| Critical | Toast | iOS | Accent bar layout; wrong info color | `IldsToast.swift` — bordered card, blue info |
| Critical | DropdownMenu | iOS | Checkmark list vs radio panel | `IldsDropdownMenu.swift` — 320px card structure |
| Major | TextField | iOS | Wrong default border, focus split, disabled bg | `IldsTextField.swift` |
| Major | Search | iOS | Capsule 40px vs 44px rounded-medium | `IldsSearch.swift` |
| Major | TextArea | iOS + Android | Border/disabled tokens | `IldsTextArea.swift`, `IldsTextArea.kt` |
| Major | Chip | iOS + Android | Prefix icon not orange-500 | `IldsChip.swift`, `IldsChip.kt` |
| Major | Radio | iOS | Selected bg orange-50 vs white | `IldsRadio.swift` |
| Major | Switch | iOS | Off track coolgray-200 vs 100 | `IldsSwitch.swift` |
| Major | Checkbox | iOS | Unchecked border coolgray-300 vs 600 | `IldsCheckbox.swift` |
| Major | Tabs | Android | High padding only when selected | `IldsTabs.kt` |
| Major | Pagination | Flutter | Legacy orange-500 solid cells | `lib/ilds_pagination.dart` — full rewrite |
| Major | Tabs | Flutter | Underline-only high emphasis | `lib/ilds_tab.dart` — filled pills |

### Verification results (14 Jun 2026)

```
npm run verify:tokens     → ✅ 124 tokens
npm run verify:parity     → ✅ 38/38 matrix
npm run verify:phase4b    → ✅ compile + registry
swift build (ios/)        → ✅ clean
web npm run test:parity   → ✅ 245 Playwright tests (parity + a11y)
```

---

## 9. Decision log (with rationale)

| # | Decision | Why |
|---|----------|-----|
| D1 | Supernova = public docs; no Vercel DS website | Avoid duplicate doc maintenance; Supernova already syncs tokens via CI |
| D2 | Tailwind v4 `@theme` not v3 config | Matches current Tailwind major; `@theme` is the v4 consumption model |
| D3 | Typography interim in JSON until Phase 8 | Figma has no Typography Variables collection yet; plugin preserve-merge prevents wipe |
| D4 | React specs = Figma verification anchor | Playwright gives machine-checkable truth; native mirrors React token choices |
| D5 | Faithful token names on iOS/Android | Aligns with DTCG keys; Flutter keeps semantic aliases for backward compat |
| D6 | Tag deferred on React; native Tag still built | No Figma Display node for Tag; Flutter/native Tag useful for filter patterns |
| D7 | Mobile-first: hover deferred | React has hover stories for desktop; native uses pressed; documented per component |
| D8 | Dropdown focus ring a11y deferred | Designer decision pending — `docs/a11y/DROPDOWN_FOCUS_RING_FLAG.md` |
| D9 | Chromatic → Phase 5 | Visual regression belongs in evolution engine, not platform parity |
| D10 | Cross-platform QA as matrix not silos | Bulk native gen risk; one rule checks Flutter+React+iOS+Android together |
| D11 | n8n kept for Slack (interim) | Plugin Slack path unconfigured; n8n notifier re-published for visibility |
| D12 | `globalWhite000` CI guard | Caught `#FFFFFE` drift before it spread to native |

---

## 10. QA harness inventory

| Script / workflow | Command | What it validates |
|-------------------|---------|-------------------|
| Token export parity | `npm run verify:tokens` | 124 tokens: dist ↔ ios ↔ android ↔ flutter hex/ids |
| Phase 4b structural | `npm run verify:phase4b` | Token sync, swift build, API surface, 19×2 file registry |
| Cross-platform Figma | `npm run verify:parity` | 12 component states × 4 platforms matrix |
| React visual parity | `cd web && npm run test:parity` | 89 variants from `web/specs/*.spec.json` |
| React a11y | `cd web && npm run test:parity` (includes a11y.spec) | axe-core all stories |
| Token CI | `.github/workflows/build-tokens.yml` | Regenerate all exports on token push |
| Web CI | `.github/workflows/web-tests.yml` | Storybook build + parity + a11y |
| Native CI | `.github/workflows/native-tests.yml` | verify:phase4b + swift + kotlin compile |
| Flutter analyze | `flutter analyze lib/` | Static analysis, zero issues |

---

## 11. File map by platform

### Tokens (generated — do not hand-edit)

```
tokens/tokens.json                          ← Figma plugin only
dist/tokens.css
dist/tokens.theme.css                       ← React Tailwind v4
dist/ILDSTokens.swift
dist/IldsTokens.kt
ios/Sources/ILDSTokens/ILDSTokens.swift     ← byte-identical to dist Swift
android/.../tokens/IldsTokens.kt            ← byte-identical to dist Kotlin
lib/design_system/ilds_tokens.dart          ← dart run tool/generate_ilds_tokens.dart
```

### Components

```
lib/ilds_*.dart                             ← Flutter (18)
web/src/components/*/                       ← React (17)
ios/Sources/ILDSDesignSystem/Ilds*.swift  ← SwiftUI (19)
android/.../components/Ilds*.kt             ← Compose (19)
```

### Figma ↔ code bridge

```
*.figma.ts                                  ← Code Connect (17 published)
web/specs/*.spec.json                       ← Parity expectations (Figma-verified)
web/specs/parity-spec.schema.json           ← Spec schema
```

### Tooling

```
style-dictionary.config.mjs                 ← All platform token formats
tool/generate_ilds_tokens.dart              ← Flutter codegen
tool/verify_token_exports.mjs              ← 4-platform token QA
tool/verify_phase4b.mjs                    ← Native structural QA
tool/verify_cross_platform_parity.mjs        ← Cross-board Figma matrix QA
```

---

## 12. Commit reference

### Phase 3 arc

| SHA | Phase | Summary |
|-----|-------|---------|
| `2496671` | 3a | Style Dictionary CSS + Tailwind export |
| `368611b` | 3a | Tailwind v4 @theme + typography |
| `7f1da52` | 3b | Storybook scaffold + Button |
| `a77c734` | 3b | Playwright parity harness |
| `d385571` | 3b | TextField, Dropdown, Toast |
| `163555e` | 3b | 10 remaining React components |
| `aca0640` | 3c | Password/OTP, Dropdown menu, Flutter icon-only |
| `7f9d354` | 3b | a11y sweep |
| `7d283e7` | 3b | Badge, Tabs, Pagination Figma fixes |

### Phase 4 arc

| SHA | Phase | Summary |
|-----|-------|---------|
| `589fe2b` | 4a | Swift + Kotlin token export + verify:tokens |
| `a713494` | 4a | Flutter Dart in build-tokens CI |
| `da8c670` | 4b | iOS/Android scaffold + Button M1 |
| `089d6e4` | 4b | Chip + native-tests.yml |
| `acb51fa` | 4b | All 18 native components |
| *(pending)* | QA | Cross-platform parity fixes + verify:parity harness |

---

## 13. Known gaps & deferred work

| Item | Phase | Notes |
|------|-------|-------|
| Tag (React) | 3b | No Figma Tag Display node |
| Chromatic baseline | 5 | Visual regression infrastructure |
| Flutter golden tests | 5 | Chromatic covers React only |
| Typography in Figma Variables | 8 | Repo/plugin-authored until then |
| Dropdown focus ring WCAG | a11y | `docs/a11y/DROPDOWN_FOCUS_RING_FLAG.md` |
| Focus rings on native Button/TextLink | 4b minor | Mobile-first defer |
| iOS Scrollbar scroll sync | 4b minor | Decorative overlay, not functional thumb |
| iOS Dropdown label typography | 4b minor | 12px vs Figma 16px bold |
| Pratishek manual sign-off | 3c | `PHASE3C_FLUTTER_REACT_SIGNOFF.md` checklist |
| Supernova component docs ~20% | ongoing | Token pages auto; component guidance manual |

---

## 14. Resume commands

```bash
# From repo root
npm run build:tokens          # Regenerate all platform token files
npm run verify:tokens         # 124-token parity gate
npm run verify:parity         # Cross-platform Figma matrix (38 checks)
npm run verify:phase4b        # Native structural + compile gate
flutter analyze lib/          # Flutter static analysis

cd ios && swift build         # iOS compile
cd web && npm run build-storybook && npm run test:parity   # React Figma parity (245 tests)
npm run storybook             # Storybook dev server :6006
npm run code-connect:publish  # Republish Figma Code Connect
```

**Next phase options:** Phase 5 (Chromatic + PR evolution engine) or close remaining minor native gaps / manual sign-off.

---

*End of report. Update this file when Phase 5 starts or when major architectural decisions change.*
