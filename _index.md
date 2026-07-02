---
title: ILDS Design System
aliases:
  - ilds-design-system
tags:
  - ilds
  - design-system
  - flutter
  - figma
  - tokens
  - code-connect
date: 2026-04-11
---

# ILDS Design System — index brief

**What it is:** ICICI Lombard Design System — a Flutter component library with DTCG design tokens, Figma Code Connect mappings, Supernova sync automation, and a Figma plugin for token workflows.

**Roadmap anchor:** Phases 3–4 = web + native platform parity; Phases 5–7 = evolution agent + AI screens. **Phase 8 (planned):** move typography into Figma Variables only — today typography is interim repo/plugin-authored until 3b + 4 are done. See `ILDS_PROJECT_MASTER.md` §5 Phase 8.

**Resume here (Jul 2026):** Phase 5 ✅ · Phase 6 thin slice ✅ · **Immediate:** Phase **5f** Selective Review Router (`CURSOR_SELECTIVE_REVIEW_ROUTER.md`) → then Phase 6 agent MVP (PR #24 org plan). Run `npm run verify:parity`.

**Primary stack:** Dart/Flutter (`lib/`), JSON tokens (`tokens/tokens.json`), TypeScript Code Connect (`*.figma.ts`), GitHub Actions (`.github/workflows/`), Figma plugin (`ilds-plugin/`).

## Map of the repo

| Area | Role |
|------|------|
| `lib/` | UI components (`ilds_*.dart`) and generated token access (`design_system/ilds_tokens.dart`) |
| `tokens/` | Token source of truth for automation |
| Root `*.figma.ts` | Figma ↔ code property mappings |
| `.github/workflows/` | CI/CD (e.g. Supernova sync) |
| `ilds-plugin/` | Figma plugin source |
| `example/` | Small in-repo demo app |
| `ilds_component_playground_app/` | Standalone playground (path-dep to package; hot reload on `lib/` changes) |
| `web/` | React + Storybook 10 + Playwright parity (`web/specs/*.spec.json`) |
| `ios/` | SwiftUI component library (SPM) — Phase 4b |
| `android/` | Jetpack Compose component library — Phase 4b |
| `dist/` | Style Dictionary output — `tokens.theme.css` (Tailwind v4), `ILDSTokens.swift` (iOS), `IldsTokens.kt` (Compose) |
| `docs/` | Process / handoff notes — **start with** `docs/reports/PHASE3_AND_PHASE4_COMPLETE_REPORT_2026-06-14.md` |

## Typical workflows

1. **Component work:** edit `lib/` → `flutter analyze lib/` → update matching `*.figma.ts` if the public API or Figma props change → `npm run code-connect:publish`.
2. **Visual / state testing:** run the playground app (see [[README]]).
3. **Contributing norms:** file placement, commit prefixes, hygiene — see [[CONTRIBUTING]].

## Quick commands (from README)

- Analyze package: `flutter analyze lib/`
- Build tokens (CSS + Tailwind + Swift + Compose): `npm run build:tokens`
- Phase 4b QA (Button + tokens): `npm run verify:phase4b`
- Cross-platform Figma parity: `npm run verify:parity` (38 matrix checks)
- iOS compile check: `cd ios && swift build`
- Storybook: `npm run storybook` (port 6006)
- Parity tests: `cd web && npm run build-storybook && npm run test:parity` (89 variants)
- Publish Code Connect: `npm run code-connect:publish`
- Playground: `cd ilds_component_playground_app` → `flutter pub get` → `flutter run -d chrome`

## Related notes in this vault

Link out to your own Obsidian pages for: Figma file URLs, Supernova project, n8n token pipelines, team onboarding — this file stays a **stable anchor** for “what lives where” in the git repo.
