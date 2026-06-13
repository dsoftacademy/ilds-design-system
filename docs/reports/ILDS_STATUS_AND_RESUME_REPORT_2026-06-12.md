# ILDS Design System — Status & Resume Report

**Date:** 12 June 2026  
**Audience:** Pratishek + Cursor / Claude (resume after break)  
**Repo:** `dsoftacademy/ilds-design-system` · branch `main`  
**HEAD:** `f331aff63d51a8cc96c916c5ce6572b98481be15`  
**Figma file:** ILDS Master | Design — key `PCUj412f0Z1zZLLxQUX22e`  
**Button component set:** `13472:2804`

> **Supersedes:** `ILDS_STATUS_AND_RESUME_REPORT_2026-04-12.md` for phase/status tables.  
> **Canonical long-form:** `ILDS_PROJECT_MASTER.md` (update in progress alongside this report).

---

## How to use this document

| Section | Read when… |
|---------|------------|
| §1 Snapshot | You need 30-second orientation |
| §2 Milestones | You need what shipped this session / June 2026 |
| §3 Button parity | You resume Button or parity harness work |
| §4 Commands | You need to run analyze / Storybook / tests |
| §5 Next steps | User says "continue" or "what's left" |
| §6 Rules & traps | Before editing tokens or presuming Figma values |

---

## 1. Snapshot (12 Jun 2026)

| Field | Value |
|-------|-------|
| **Current phase** | **Phase 3b in progress** — React Button Milestone 1 largely complete; parity harness live |
| **Flutter** | 18 components in `lib/` · `flutter analyze lib/` clean |
| **React** | `web/` — Vite + React + TS + Tailwind 4.3 + Storybook 10.4 · **Button only** so far |
| **Tokens** | `tokens/tokens.json` (Figma-driven colors/spacing/radius) + repo-authored typography (Phase 8) |
| **Dart tokens** | `lib/design_system/ilds_tokens.dart` — generated via `dart run tool/generate_ilds_tokens.dart` |
| **Web tokens** | `dist/tokens.theme.css` — Style Dictionary v4, Tailwind v4 `@theme` |
| **Parity** | Playwright harness · **17/17** Button variants green (`web/specs/button.spec.json`) |
| **Automation** | Figma plugin preserve-merge proven · `build-tokens.yml` + `sync-supernova.yml` CI |

**Platform parity status:** Flutter ✅ full library · React 🟡 Button only · iOS/Android ❌ Phase 4.

---

## 2. Milestones achieved (June 2026 session arc)

### Phase 3a — Token export ✅ COMPLETE

- `style-dictionary.config.mjs` → `dist/tokens.css` + `dist/tokens.theme.css` (+ deprecated v3 shim)
- Typography in `tokens.json` + exports + Dart codegen (interim — **Phase 8** moves to Figma Variables)
- `.github/workflows/build-tokens.yml` — auto-commit `dist/` on token push
- Plugin preserve-merge validated (`585ee66` no-op, `a8477df` real value change, typography intact)

**Key commits:** `0652f8d`, `3951bcf`, `30439b3` (typography restore after stale plugin wipe)

### Phase 3b — Scaffold ✅

- `web/` package: Vite, React 19, TypeScript, Tailwind 4.3, Storybook 10.4
- Root scripts: `npm run storybook`, `npm run build:storybook`, `npm run build:tokens`
- ILDS-only Tailwind utilities (`p-sp-*`, `bg-primary-orange-500`, etc.) — no default Tailwind scale

**Commit:** `7f1da52`

### Phase 3b — Button Milestone 1 🟡 ~90% (gate pending)

| Deliverable | Status | Notes |
|-------------|--------|-------|
| React `IldsButton` | ✅ | `web/src/components/Button/Button.tsx` |
| Storybook stories | ✅ | States + icon variants + QA stories |
| Figma state alignment | ✅ | Hover/pressed/focus/disabled/gaps/heights/tertiary px |
| Icon slots L/M/S | ✅ | 24 / 20 / 12px (`13472:2805`, `3397`, `3713`) |
| Icon-only + `aria-label` | ✅ React | TS discriminated union; small icon-only `13472:3718` |
| Loading (leading visible, spinner trailing) | ✅ React | `13472:2877` |
| Parity harness | ✅ | `web/tests/parity.spec.ts` + `web/specs/button.spec.json` |
| CI workflow | ✅ | `.github/workflows/web-tests.yml` |
| Flutter pressed secondary/tertiary | ✅ | `StatefulWidget` + `onHighlightChanged` (`bae6756`) |
| Flutter ↔ React side-by-side gate | ⏳ | Playground has Button section; formal sign-off pending |
| Flutter icon slots / iconOnly | ❌ | React has them; Flutter `ilds_button.dart` not yet updated |
| Hover parity (web) | ⏳ | Story exists; mobile-first defer on Flutter |
| Skeleton state | ⏳ | PRESUMED visual in React only — no Figma node |
| Chip / TextField / Dropdown / Toast (React) | ❌ | Gated on Button sign-off |

**Button commit chain (newest first):**

```
f331aff fix(button): destructive tertiary pressed red-700 per designer update to 16186:2581
b6af270 fix(button): destructive pressed per Figma 16186:2051/2581
bae6756 fix(flutter): secondary/tertiary pressed states via explicit color resolution
3252f7e feat(button): Figma-verified icon slots, iconOnly, and loading behavior
aa2568a fix(button): secondary pressed orange-100 per updated Figma 13472:3024 + parity spec
a77c734 feat(web): Figma parity harness — Playwright + button.spec.json
fa2aa3a fix(button): align React + Flutter states to Figma set 13472:2804
7f1da52 feat(web): Phase 3b scaffold — Storybook 10.4 + Button milestone
```

### Flutter Button pressed-state architecture (verified good)

- `IldsButton` → `StatefulWidget`
- Primary: `InkWell` overlay (`orange600` / `red700`) — unchanged
- Secondary/tertiary: `_pressed` flag via `onHighlightChanged` → `_pressedColors()` → full bg/border/label swap (overlay cannot express multi-property pressed)
- **TODO(hover):** web/desktop hover — out of scope mobile-first pass

### Lessons learned (repeat failures)

1. **Never presume React-parity for Figma values** — destructive secondary border (`16186:2051`) and tertiary label (`16186:2581`) were wrong until nodes pulled.
2. **Designer can update Figma after pull** — small icon slot 14→12px (`13472:3713`); destructive tertiary pressed 600→700 (`16186:2581` designer fix).
3. **Run from repo root** for `npm run build:tokens` / `npm run storybook` — not `ilds-plugin/`.

---

## 3. Button parity — 17 verified variants

**Spec:** `web/specs/button.spec.json`  
**Runner:** `web/tests/parity.spec.ts` (generic — add spec file per component)  
**Selector:** `#storybook-root button`

| Variant | Figma node | Interaction |
|---------|------------|-------------|
| primary-large-default | 13472:2816 | — |
| primary-large-hover | 13472:3060 | hover |
| primary-large-pressed | 13472:2988 | active |
| primary-large-focused | 13472:3135 | focus |
| primary-large-disabled | 13472:2916 | — |
| secondary-large-default | 13472:2852 | — |
| secondary-large-disabled | 13472:2952 | — |
| secondary-large-pressed | 13472:3024 | active |
| destructive-secondary-large-pressed | 16186:2051 | active |
| destructive-tertiary-large-pressed | 16186:2581 | active |
| tertiary-large-default | 13472:2870 | — |
| tertiary-large-disabled | 13472:2970 | — |
| destructive-primary-large-default | 13472:2834 | — |
| destructive-primary-large-pressed | 13472:3006 | active |
| primary-medium-default | 13472:3408 | — |
| primary-small-default | 13472:3724 | — |
| icon-only-small | 13472:3718 | — |

**Destructive pressed values (verified):**

| State | bg | border | label |
|-------|-----|--------|-------|
| Secondary destructive pressed | `error-red-100` #ffd5cd | `error-red-600` #e00903 | `error-red-700` #a30100 |
| Tertiary destructive pressed | transparent | — | `error-red-700` #a30100 |

---

## 4. Commands (copy-paste)

```bash
# Repo root
cd "/Users/pb09/ILDS Automation/ilds-design-system"

# Flutter
flutter analyze lib/
cd ilds_component_playground_app && flutter pub get && flutter run -d chrome

# Tokens
npm run build:tokens
dart run tool/generate_ilds_tokens.dart

# Web / Storybook (port 6006)
npm run storybook

# Parity (builds Storybook static first)
cd web && npm run build-storybook && npm run test:parity   # expect 17/17

# Plugin rebuild (before Figma sync)
cd ilds-plugin && npm run build
```

---

## 5. Next steps (priority order)

### 🔴 Immediate — close Button Milestone 1

1. **Side-by-side gate** — Flutter playground Button section vs Storybook; Pratishek sign-off.
2. **Flutter icon parity** (optional in M1 or fast-follow) — slots, iconOnly, loading-with-icons to match React.
3. **Hover** — add Flutter TODO remains; web hover variant already in spec (`13472:3060`).

### 🟡 Then — Phase 1 React components (4 remaining)

Chip → TextField → Dropdown → Toast. Each ships with:
- `web/src/components/<Name>/`
- Storybook stories (one per state)
- `web/specs/<name>.spec.json` + parity tests (same runner)

### 🟢 Later

- Public DS website (Vercel)
- Chromatic visual regression
- Phase 4 native token export + components
- Phase 8 Figma Typography Variables

---

## 6. Non-negotiable rules (agents)

| Rule | Detail |
|------|--------|
| Figma is truth | Pull node or mark **PRESUMED** — never invent hex |
| `ILDSTokens.*` only | Dart components; add missing constants from `tokens.json` via codegen |
| ILDS Tailwind names only | `p-sp-8`, not `p-2`; `bg-primary-orange-500`, not `bg-orange-500` |
| Parity before sprint | New React component = new `.spec.json` before claiming done |
| Commit + push = done | "Shipped" means on `origin/main` with SHA reported |

---

## 7. Key file map (web + button)

```
web/
  src/components/Button/
    Button.tsx          ← React component
    Button.stories.tsx  ← Storybook
    index.ts
  specs/
    button.spec.json    ← 17 Figma-verified variants
    parity-spec.schema.json
  tests/parity.spec.ts
  playwright.config.ts
lib/
  ilds_button.dart      ← Flutter (pressed states done; icons pending)
  design_system/ilds_tokens.dart
tokens/tokens.json
dist/tokens.theme.css
ilds_component_playground_app/lib/main.dart  ← Button nav section added
docs/briefs/ILDS_T2_PARITY_BRIEF.md
```

---

## 8. Open items / PRESUMED

| Item | Status |
|------|--------|
| Skeleton button visual | PRESUMED — `coolgray-200` pulse; no Figma node |
| Heart icon SVG in stories | Placeholder stroke path; not Figma asset export |
| Flutter Button icons | Not implemented — React is ahead |
| Hover (Flutter) | TODO — mobile-first defer |
| `white-000` | `#FFFFFF` on main (`a8477df`); watch plugin sync for `#FFFFFE` drift |
| Typography source | Repo/plugin until Phase 8 |

---

*Generated at end of June 12 2026 Button parity session. Update this file when Milestone 1 gates or Phase 1 React components land.*
