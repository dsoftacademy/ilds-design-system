# ILDS — Automated Design System · Project Master Document

> **This is the single source of project truth.**
> All other briefs, status reports, and handoff docs in this repo are superseded by this file.
> Last updated: June 11, 2026 · Maintained by: Pratishek (Principal Designer & DS Lead)

---

## For Agents Reading This File

If you are Cursor, Claude, or any other AI assistant working on this project, read this entire document before taking any action. It tells you:

- What this project is and what it is trying to become
- Exactly what has been built and where the files live
- What is incomplete, broken, or deferred — and in what order to address it
- What the architecture looks like and why decisions were made
- What you must never do (hardcode values, change the token source, skip review)

When the user says "continue", "next step", or "what's left" — consult **Section 7: Pending Tasks** first, in the listed priority order.

---

## Table of Contents

1. [Project Identity](#1-project-identity)
2. [The Terminal Vision](#2-the-terminal-vision)
3. [Current State — Honest Assessment](#3-current-state--honest-assessment)
4. [Architecture](#4-architecture)
5. [Phase Breakdown & Progress](#5-phase-breakdown--progress)
6. [Completed Work — Full Log](#6-completed-work--full-log)
7. [Pending Tasks — Priority Order](#7-pending-tasks--priority-order)
8. [Component Registry](#8-component-registry)
9. [Token Registry](#9-token-registry)
10. [Known In-Code TODOs](#10-known-in-code-todos)
11. [File Map](#11-file-map)
12. [Non-Negotiable Rules](#12-non-negotiable-rules)
13. [Tech Stack Reference](#13-tech-stack-reference)

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Project name** | ICICI Lombard Design System (ILDS) |
| **Organisation** | ICICI Lombard — India's largest private general insurer |
| **Repo** | `dsoftacademy/ilds-design-system` (GitHub, `main` branch) |
| **Package type** | Flutter package — NOT a Flutter app. No `main.dart` at root. Components live in `lib/`. |
| **Primary platform** | Flutter (iOS + Android) |
| **DS Lead** | Pratishek — Principal Designer, 11 years experience |
| **Started** | March 2026 |
| **Current phase** | Phase 2 complete. Phase 3 not started. |
| **Automation stack** | Figma · Custom Figma Plugin · GitHub · GitHub Actions · Supernova · Slack |

### What ILDS Is

ILDS is a token-driven Flutter component library with a fully automated publish pipeline. A designer changes a token value in Figma, clicks Sync in the custom plugin, and within ~2 minutes that change is reflected in the GitHub repository, the Supernova documentation portal, and the #design-system-updates Slack channel — with no human relay in the chain.

The library contains 18 production-ready Flutter components, 112 design tokens, and 18 Figma Code Connect files. Every component references only the `ILDSTokens` Dart class — zero hardcoded values exist anywhere in the codebase.

---

## 2. The Terminal Vision

> The goal is not a component library. The goal is a design infrastructure that creates, manages, evaluates, and evolves itself — with one or two humans in a steering and approval role, not an execution role.

### What "Done" looks like at the terminal state

- A designer submits a PRD, brief, or user flow doc — and at ingestion defines the design language (style, brand direction) and pastes reference links (Figma files, screens, inspiration). The AI Design Assistant reads all of it, queries the ILDS component library, and composes complete UI screens — layouts, flows, spacing, and interactions — using ILDS components, guided by the defined design style, pasted references, and universal design guidelines. Everything lands in Figma frames, ready for designer review.
- If the AI Design Assistant encounters a gap — a screen that requires a component that doesn't exist or needs an update — it creates a best-effort DS-aligned version, flags it clearly as unvalidated, completes all screens without blocking, and simultaneously channels the requirement to the DS Management Agent to handle in parallel. When the DS Management Agent releases the validated update, the designer decides whether to update the flow.
- A developer inspects any Figma component in Dev Mode and sees executable code in their target language (Flutter, React, SwiftUI, Compose, or any configured platform) — already aligned to the latest token values.
- Token changes propagate to **all platforms** (Flutter, React, iOS SwiftUI, Android Compose) automatically via a single Style Dictionary pipeline triggered by a Figma save.
- The DS Management Agent — working alongside human design and dev managers — owns the design system entirely. It receives component requests (from the AI Design Assistant or any other source), validates them against the existing system, builds or updates the component, and simultaneously pushes the update to every touch-point: Supernova, Figma, Storybook, DS website, Slack. Human managers approve what ships. The agent handles everything else.
- Documentation is always current because it is generated, not written — and when it is regenerated, it validates against the previous version and propagates updates simultaneously across all touch-points: the DS website, Storybook, Supernova, and Figma.

### Autonomy levels (honest framing)

| Level | Description | Current status |
|---|---|---|
| **L1 — Token propagation** | Token changes flow automatically to `tokens.json` + Supernova + Slack + Flutter (`dart run tool/generate_ilds_tokens.dart` regenerates the Dart class from `tokens.json`). Multi-platform (React, iOS, Android) requires Phases 3–4. **Typography is interim repo/plugin-authored until Phase 8** (Figma Variables). | ✅ Flutter achieved (colors/spacing/radius); ⚠️ typography → Phase 8 |
| **L2 — Component consistency** | All components built to a single architectural pattern, zero hardcoded values | ✅ Achieved |
| **L3 — Handoff automation** | Dev Mode shows real Flutter code for all 18 components. Multi-language handoff (React, SwiftUI, Compose) requires Phases 3–4. | ✅ Flutter only |
| **L4 — Platform parity** | Same token file drives Flutter, React, iOS, Android simultaneously | ❌ Phase 3–4 |
| **L5 — Evolution infrastructure** | System proposes, visually regression-tests, and stages component updates via PRs for human sign-off | ❌ Phase 5 |
| **L6 — DS Management Agent** | Intelligent agent owns DS end-to-end alongside human managers — validates, builds, deploys, and communicates all changes across all platforms simultaneously | ❌ Phase 6 |
| **L7 — AI-assisted screen design** | AI generates complete UI screens from PRD + design style + references, with non-blocking component gap routing to the DS Management Agent | ❌ Phase 7 |

**We are at L3 of 7.** The foundation is the right foundation — every future level builds directly on what exists.

---

## 3. Current State — Honest Assessment

### What is fully working today

- The Figma plugin extracts 112 tokens from Figma Variables, converts to W3C DTCG JSON, and pushes to `tokens/tokens.json` on GitHub with SHA-retry conflict handling
- The GitHub Action (`sync-supernova.yml`) detects changes to `tokens/tokens.json`, syncs to Supernova **token pages**, and fails loudly on any CLI error
- Slack notifications — see the verified mechanism note below (the working source was n8n, not the plugin).

> **Slack source — VERIFIED via Slack API (Jun 2026):** Every message in `#design-system-updates` came from the n8n "GitHub Push Notifier to Slack" workflow (`P82tigHMhMfUl25s`, bot `ILDS Notifier`), which fired on **every push** (docs commits included) — confirmed by the `Automated with this n8n workflow` footer and the GitHub-push message format. The plugin's `postToSlack` (`ilds-plugin/code.ts`) has **never actually fired** — its `slackWebhookUrl` is not saved in `clientStorage`, so zero plugin-format (`🎨 ILDS Token Sync`) messages exist in the channel. **Verified Jun 2026: the plugin's Slack path is fully implemented** — UI field (`ui.html` → `Slack Webhook URL (optional)`), `clientStorage` persistence (`ilds_slack_webhook`), and `run()` Step 4 (`if (config.slackWebhookUrl) postToSlack(...)`). It is **unconfigured, not broken**; configuring the webhook field is the only step needed.
>
> **Decision (Jun 2026): keep n8n as the Slack source for now.** Unpublishing the n8n notifier left Slack silent (the plugin webhook was never configured), so `P82tigHMhMfUl25s` is **re-published and remains the active Slack notifier**. Configuring the plugin's own webhook is a deferred, low-priority cosmetic cleanup — the core pipeline (Figma → plugin → GitHub → Supernova) does **not** depend on n8n; only the Slack message does. Decision (Jun 2026): the n8n push-notifier was **unpublished** (too noisy / every-push). **Slack is now silent until the plugin webhook is configured** — add the Slack incoming webhook in the plugin Settings, Sync once, and confirm the `🎨 ILDS Token Sync` message appears. Once done, the plugin is the sole Slack source and n8n is fully out of the stack (the Figma→GitHub n8n leg was already disabled in Task 5).
- 18 Flutter components are in `lib/` — all passing `flutter analyze` with zero issues
- 18 Code Connect files are published — Dev Mode shows real Flutter code for all components

### What is functionally incomplete (known gaps)

- **`ILDSTokens` Dart class drift — resolved (June 2026).** Codegen script (`tool/generate_ilds_tokens.dart`) built, run, Figma-verified, and committed (`17d7120`). All 112 tokens now Figma-canonical. Do not manually edit the class — always regenerate via script after any Figma token sync.
- **Supernova component documentation is ~20% complete** — token pages sync automatically; component pages (usage, anatomy, states, guidance) are written manually and lag behind implementation. This is a separate workstream from the token pipeline and needs explicit resourcing.
- ~~Several `*.figma.ts` Code Connect files edited locally but not republished~~ **Resolved (Jun 2026, Task 2):** full republish done — 17 active `.figma.ts` published, no duplicate node mappings. Dev Mode spot-check remains a manual visual step.
- ~~**Tab scrollable indicator** — TODO at line 191 of `ilds_tab.dart`; full-width neutral bar placeholder.~~ **Resolved (Jun 2026, Task 6):** scroll-linked indicator implemented — `GlobalKey`-measured selected-tab position/width, `AnimatedPositioned` inside the scroll content, auto scroll-into-view on select. `flutter analyze` clean.
- **Playground app NavigationRail overflow** — `RenderFlex` overflow in `ilds_component_playground_app/lib/main.dart`.

### What has not been started

- ~~Style Dictionary config (zero% started — prerequisite for all of Phases 3, 4, 6, 7)~~ **Done (Jun 2026, Phase 3a):** `style-dictionary.config.mjs` → `dist/tokens.css` + `dist/tailwind-tokens.js`, auto-built in CI.
- Multi-platform token export — **web done (Phase 3a)**; iOS/Android (Swift/Kotlin) still pending — Phase 4a
- **Figma Typography Variables** — typography tokenized in JSON (Phase 3a) but **not** Figma-driven yet; **Phase 8** (after 3b + 4)
- Component Evolution Engine (visual regression + PR infrastructure) — Phase 5
- DS Management Agent (intelligent DS ownership alongside human managers) — Phase 6
- AI Design Assistant Figma plugin (full screen UI generation from PRD) — Phase 7

---

## 4. Architecture

### The Live Automation Pipeline

```
┌─────────────────────────────────────────────────────────┐
│  FIGMA VARIABLES (Single Source of Truth)               │
│  Designer updates token values in Figma Variables panel │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼  (Designer clicks "Sync" in plugin)
┌─────────────────────────────────────────────────────────┐
│  ILDS FIGMA PLUGIN  (ilds-plugin/)                      │
│  • Reads all Variables via figma.variables API          │
│  • Converts to W3C DTCG JSON format                     │
│  • Pushes to GitHub via Contents API                    │
│  • SHA-retry on 409 Conflict                            │
│  • Credentials stored in figma.clientStorage (never git)│
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  GITHUB — tokens/tokens.json (main branch)              │
│  • Version-controlled, full commit history              │
│  • Triggers CI on every push to this file               │
│  • Full rollback available via git revert               │
└──────────┬────────────────────────┬──────────────────────┘
           │                        │
           ▼                        ▼
┌──────────────────┐   ┌──────────────────────────────────┐
│  GitHub Action   │   │  Flutter codebase                │
│  sync-supernova  │   │  ILDSTokens.dart regenerated     │
│  .yml            │   │  from tokens.json on demand      │
│                  │   │  (manual script, not CI-auto yet)│
│  path trigger:   │   └──────────────────────────────────┘
│  tokens/*.json   │
│                  │
│  Fails loudly:   │
│  grep-based      │
│  error detection │
└──────────┬───────┘
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│  SUPERNOVA — Documentation Portal                       │
│  • Receives live token updates                          │
│  • Always current — not manually maintained             │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  SLACK — #design-system-updates                         │
│  • Webhook notification on every successful sync        │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions (Do Not Reverse Without Justification)

| Decision | Rationale |
|---|---|
| Custom Figma Plugin over REST API | Plugin API runs inside Figma with full Variable access regardless of REST permission level. No REST tokens needed. Credentials stay in `figma.clientStorage`. |
| W3C DTCG token format | Platform-agnostic standard. Supernova, Style Dictionary, and all modern tooling support it natively. Every future platform target consumes the same `tokens.json` without transformation. |
| GitHub Actions for Supernova sync, not n8n | Sync must only run when `tokens.json` changes on `main`. Path-based GitHub Actions triggers make this exact. n8n is reserved for cross-service orchestration. |
| Grep-based CI failure detection | Supernova CLI exits 0 even on internal errors. Explicit grep-based exit-1 on known failure strings prevents silent drift. |
| All components consume `ILDSTokens` only | No hardcoded values anywhere. Token changes flow to components automatically. Brand refresh = one Figma save. |

### Component Architecture Pattern (applies to all 18 components)

Every ILDS Flutter component is built to this structural contract:

```
AnimatedContainer(duration: 150ms)          ← all state transitions
  └── MouseRegion                            ← cursor feedback (desktop/web)
        └── GestureDetector(opaque)          ← full bounding-box touch target
              └── Focus + FocusNode          ← keyboard navigation + orange500 ring
                    └── Semantics(...)       ← screen reader — meaningful, not generic
                          └── [widget tree]  ← ILDSTokens.* only, zero hardcoded values
```

---

## 5. Phase Breakdown & Progress

### Phase 1 — Foundation ✅ COMPLETE

**Goal:** Establish the token pipeline and prove the architecture with 5 core components.

- [x] Figma Variables structure defined (112 tokens across 10 groups)
- [x] Custom Figma plugin built (`ilds-plugin/`) — TypeScript, compiles clean
- [x] W3C DTCG token format implemented
- [x] GitHub push with SHA-retry conflict handling
- [x] `tokens/tokens.json` on main branch — version controlled
- [x] `ILDSTokens` Dart class generated from `tokens.json` via `tool/generate_ilds_tokens.dart` — all 112 tokens, Figma-canonical
- [x] GitHub Action `sync-supernova.yml` — hardened with grep-based failure detection
- [x] Supernova `supernova.settings.json` — `tokenSets: ["global"]`, `supernovaBrand: "Default"` (fixed from numeric ID)
- [x] Slack webhook notification on sync
- [x] 5 Phase 1 components: Button, TextField, Chip, Dropdown, Toast
- [x] All Phase 1 components pass `flutter analyze` — zero issues

**Files delivered:** `ilds-plugin/`, `tokens/tokens.json`, `.github/workflows/sync-supernova.yml`, `supernova.settings.json`, `lib/design_system/ilds_tokens.dart`, `lib/ilds_button.dart`, `lib/ilds_text_field.dart`, `lib/ilds_chip.dart`, `lib/ilds_dropdown.dart`, `lib/ilds_toast.dart`

---

### Phase 2 — Component Library + Code Connect ✅ COMPLETE

**Goal:** Expand to 18 components, publish Code Connect for all, clean up deprecations.

#### Tier 1 — Form Controls
- [x] `ilds_radio.dart` — Radio + RadioGroup, error state uses `red600` (corrected from `red500`)
- [x] `ilds_checkbox.dart` — tri-state (unchecked/checked/indeterminate), error uses `red600`
- [x] `ilds_switch.dart` — AnimatedPositioned thumb, 200ms (documented deviation from 150ms standard)
- [x] `ilds_text_area.dart` — full lifecycle (initState/didUpdateWidget/dispose), error uses `red600`

#### Tier 2 — Navigation & Selection
- [x] `ilds_tab.dart` — Fixed mode (Stack+Positioned orange indicator) + Scrollable mode (full-width neutral bar, see TODO §10)
- [x] `ilds_pagination.dart` — threshold uses `7` not `ILDSTokens.spacing2` (semantic misuse corrected)
- [x] `ilds_selection_button.dart` — uses `neutral600` (Cursor self-corrected from nonexistent `neutral700`)

#### Tier 3 — Display & Utility
- [x] `ilds_badge.dart` — `borderRadiusFull` pill, semantic colours (green50/700, red50/700, etc.)
- [x] `ilds_tag.dart` — filter tag, pill shape
- [x] `ilds_accordion.dart` — collapse/expand with AnimatedContainer
- [x] `ilds_text_link.dart` — `Semantics(link: true)`, focus ring adapts to colour variant
- [x] `ilds_scrollbar.dart` — full token depth: 6px default, 12px hover/drag, track/thumb/active colours

#### Bonus
- [x] `ilds_search.dart` — suggestions, disabled state

#### Deprecation Cleanup (commit 53533d2)
- [x] `MaterialStateProperty` → `WidgetStateProperty` (ilds_button.dart, ilds_text_field.dart)
- [x] `MaterialState` → `WidgetState`
- [x] `MaterialStateColor` → `WidgetStateColor`
- [x] `withOpacity(0.08)` → `withValues(alpha: 0.08)` (ilds_chip.dart)
- [x] Unreachable `default` case removed from switch (ilds_chip.dart)

#### Code Connect
- [x] 18 `.figma.ts` Code Connect files authored and published
- [x] All files use `figma.enum()` for variant property mapping
- ℹ️ `.figma.tsx` shim files are **gitignored and local-only** — they exist on individual machines as Code Connect tooling artefacts but are NOT tracked in the repo and are NOT completed deliverables

#### Playground App
- [x] `ilds_component_playground_app/` created — all 18 components rendered
- [x] `NavigationRail` overflow present (see Pending Tasks §7 — Item 3)

#### Handoff Report
- [x] `docs/reports/CLAUDE_HANDOFF_2026-04-08.md` — Cursor-authored handoff doc
- [x] `docs/reports/ILDS_STATUS_AND_RESUME_REPORT_2026-04-12.md`

**Figma component node IDs (for Dev Mode verification):**
| Component | Node ID |
|---|---|
| Radio | 13486:38485 |
| Tab | 17667:2334 |
| Accordion | 17726:494 |
| Scrollbar | 17730:521 |

---

### Phase 3 — Web Platform (React) 🔴 NOT STARTED

**Goal:** Extend ILDS to React. Deliver a Storybook site and a live public design system website.

> ✅ **Style Dictionary foundation now exists (Jun 2026, Phase 3a complete).** The token-export pipeline (CSS + Tailwind) is built, runs in CI, and is the base that Phases 4, 6, and 7 extend. Phase 3b (React components) can now proceed.

#### Phase 3a — Token Export via Style Dictionary ✅ COMPLETE (Jun 2026)

**Goal:** Configure Style Dictionary to transform `tokens/tokens.json` → CSS custom properties + Tailwind config. Run this export in CI on every `tokens/tokens.json` push.

**What shipped:**
- `style-dictionary.config.mjs` — Style Dictionary **v4.4.0** programmatic build (DTCG `usesDtcg: true`). Custom hooks: `ilds/name/kebab`, `ilds/size/px`, `ilds/font/family`, `ilds/tailwind-theme` (`@theme` block for **Tailwind CSS v4**), and `ilds/tailwind` (deprecated v3 CommonJS shim).
- `dist/tokens.css` — generic `:root` CSS custom properties (colors + spacing + borderRadius + **typography**).
- `dist/tokens.theme.css` — **Tailwind v4 `@theme` block** with namespace prefixes (`--color-*`, `--spacing-*`, `--radius-*`, `--font-*`, `--text-*`, `--text-*--line-height`, `--font-weight-*`). Primary web consumption target for Phase 3b.
- `dist/tailwind-tokens.js` — deprecated v3 CommonJS shim (kept temporarily; delete once 3b scaffold lands on `@theme`).
- **Typography tokenized** in `tokens.json` (flat DTCG: `font-family`, `font-size`, `font-weight`, `line-height`) + wired into all exports + `tool/generate_ilds_tokens.dart`. **Interim source:** repo-authored in `tokens.json` only — plugin **preserve-merge** keeps non-Figma groups (typography) on sync; does **not** hardcode typography in plugin source. Migrate to Figma-only in **Phase 8** (after 3b + 4).
- `npm run build:tokens` script; `style-dictionary` added as devDependency.
- CI: `.github/workflows/build-tokens.yml` — on push to `main` touching `tokens/tokens.json` (or the generator), runs `npm ci && npm run build:tokens` and **auto-commits** refreshed `dist/` back (`[skip ci]`, `contents: write`). `dist/*` is gitignored except the two committed exports.

**Scope notes:** Typography is tokenized for export (Jun 2026) but **Figma-driven typography is Phase 8** — see §5 Phase 8. Display-scale sizes (48–72px) can be added in Phase 8 when the Figma collection is created. Phase 4a extends this same config to Swift + Kotlin.

> **Tailwind v4 decision (Jun 2026):** Phase 3b targets **Tailwind CSS v4** (`npm view tailwindcss` → 4.3.0 as of Jun 2026). v4 uses CSS `@theme`, not `tailwind.config.js`. The initial `tailwind-tokens.js` export was a v3-shaped mistake; `dist/tokens.theme.css` is the canonical web target. **Storybook 10** (`npm view storybook` → 10.4.4) — not Storybook 8.

**Status:** `- [x]` Complete — validated locally (`npm run build:tokens` regenerates both files); CI auto-commit path wired for the Figma → plugin → push → rebuild loop.

#### Phase 3b — React Component Parity (depends on Phase 3a) — NOT STARTED

**Goal:** Build 18 React components matching Flutter component states, styled via the Phase 3a token output.

**Locked stack (verify against npm before scaffold — Jun 2026):**
- **Tailwind CSS v4** — import `dist/tokens.theme.css` (`@theme`); no `tailwind.config.js`
- **Storybook 10** (10.4.x) — not Storybook 8
- React + TypeScript, Vite scaffold

**Tailwind default reset (mandatory in 3b scaffold):** `dist/tokens.theme.css` resets `--spacing: initial` and `--color-*` / `--radius-*: initial` before ILDS tokens, so utilities like `p-2` / `bg-red-500` do **not** resolve to Tailwind defaults — only ILDS names (`p-sp-2`, `bg-primary-orange-500`, etc.). Verify in Storybook that no component uses default Tailwind scale classes.

**Tailwind reset warnings (read before first component):**
1. **`--color-*: initial` removes Tailwind's built-in `white`/`black` utilities.** ILDS exports `--color-white-000` / `--color-black-1000` (Figma keys `white-000` / `black-1000`). **Decision (Jun 2026, 3b scaffold):** Style Dictionary also emits `--color-white` / `--color-black` aliases (same values) so `bg-white` / `text-black` work in React. Canonical Figma keys remain `white-000` / `black-1000`.
2. **`--spacing: initial` removes all numeric spacing utilities** (`p-2`, `gap-4`, and numeric `w-*` / `h-*` / `size-*` derived from the default scale). Only ILDS names (`p-sp-2`, `gap-sp-4`, etc.) and arbitrary values (`p-[12px]`) work. First scaffolded component will "lose" widths if it uses `w-4` — enforce ILDS spacing names in code review.

**Pre-3b gate (manual — plugin runs in Figma):** ~~Revert test drift via plugin sync~~ **Passed Jun 2026** — preserve-merge proven on no-op sync `585ee66` (typography intact). **Note:** `#E3530F` was restored by manual commit `30439b3` (typography fix after stale `code.js` wipe), not by plugin sync; merge-with-actual-value-change proven on `a8477df` (`white-000` `#FFFFFE` → `#FFFFFF`, typography intact). **`white-000`:** reverted to `#FFFFFF` via plugin sync `a8477df` (Jun 2026) — first real value change through preserve-merge (typography intact).

**3b delivery sequence (do not sprint five components):**
1. Scaffold: Vite + React + TS + **Tailwind 4.3** + **Storybook 10.4** (`npm view tailwindcss storybook` before install).
2. **Milestone 1 — Button only:** full state parity with `lib/ilds_button.dart`; one Storybook story per state; tokens via `@import` of `dist/tokens.theme.css` only.
3. Side-by-side check vs Flutter playground **before** Chip, TextField, Dropdown, Toast.
4. Gate remaining four Phase-1 components on Button sign-off.

**Status:** `- [~]` In progress — `web/` scaffold (Vite + React + TS + Tailwind 4.3 + Storybook 10.4); Milestone 1 Button stories landed; side-by-side playground gate pending.

**Scope:**
- React + TypeScript component library (same 18 components, same 18 × states)
- Tailwind CSS v4 consuming `dist/tokens.theme.css` + typography tokens
- Storybook 10 — all components, all states documented
- Public design system website — Vercel, auto-deploys on every merge to `main`
- This is significant engineering effort: 18 components × full state coverage = 18× the effort of Phase 3a

**Why this phase matters:** ILDS currently only serves Flutter. Web engineers have no design system. Phase 3 closes that gap and makes ILDS a true cross-platform system.

**Suggested tech decisions:**
- Style Dictionary for token export from `tokens.json` → CSS custom properties (Phase 3a)
- Vercel for DS website hosting (connects to GitHub, auto-deploys)
- Storybook 10 with Chromatic for visual regression

---

### Phase 4 — Native Platform Parity (iOS + Android) 🔴 NOT STARTED

**Goal:** Same `tokens.json` drives SwiftUI (iOS) and Compose (Android) — one token change reaches all 4 platforms.

> ⚠️ **Style Dictionary prerequisite:** Same as Phase 3. Style Dictionary must be configured before any Phase 4 work begins. Phase 4 extends the same Style Dictionary config to emit Swift and Kotlin token classes.

#### Phase 4a — Token Export for Native Platforms (depends on Phase 3a Style Dictionary foundation)

**Goal:** Extend Style Dictionary to output Swift color/spacing constants (iOS) and a Kotlin/Compose token class (Android). Extend GitHub Action to emit these on every `tokens/tokens.json` push.

**Status:** `- [ ]` Not started

#### Phase 4b — Native Component Parity (depends on Phase 4a)

**Goal:** 18 SwiftUI components (iOS) + 18 Jetpack Compose components (Android), consuming Phase 4a token output. Same states and architecture pattern as Flutter.

**Why this phase matters:** ICICI Lombard's product spans iOS and Android natively. Today only Flutter gets token updates. Phase 4 completes the platform story.

**Status:** `- [ ]` Not started

---

### Phase 5 — Component Evolution Engine 🔴 NOT STARTED

**Goal:** Build the mechanical infrastructure that Phase 6 (DS Management Agent) will run on. The system can propose component changes as GitHub PRs, run visual regression against a baseline, and surface them for human sign-off. This phase does not introduce autonomous decision-making — it establishes the tooling and workflow that makes autonomous management possible in Phase 6.

**What Phase 5 delivers (infrastructure, not intelligence):**
- Chromatic visual regression baseline established for all 18 components
- GitHub Branch API integration — automated PR creation from a component diff
- PR template with mandatory fields: what changed, which screens affected, visual diff
- Slack integration — PR notification with approve/reject action
- Human sign-off loop — merge only on explicit approval
- Automated post-merge trigger — approved component update flows through the existing token pipeline to all platforms

**Architecture:**

```
Change proposal (manual or triggered)
        │
        ▼
GitHub Branch API — creates feature branch + PR
        │
        ▼
Chromatic — visual regression against component baseline
        │
        ▼
Slack notification — diff shown, human approval required
        │
        ▼  (on human approve)
GitHub merge → existing token + platform pipeline triggers
        │
        ▼
All platforms updated simultaneously
```

**Why Phase 5 before Phase 6:** Phase 6 (DS Management Agent) needs a validated, working PR + regression + approval pipeline to operate through. Phase 5 builds that pipeline with humans still initiating the proposals. Phase 6 adds the intelligence layer that initiates proposals autonomously.

**Status:** `- [ ]` Not started

---

### Phase 6 — DS Management Agent 🔴 NOT STARTED

**Goal:** An intelligent agent that is the primary owner and manager of the ILDS design system — working alongside human design and dev managers. It receives component requirements (from the AI Design Assistant or any source), validates them, builds or updates the component across all platforms, and simultaneously deploys to every touch-point. Humans approve. The agent executes everything else.

**Requires:** Phase 5 complete (PR + regression + approval pipeline must exist before the agent can use it).

#### Role and Authority

| Responsibility | Agent | Human managers |
|---|---|---|
| Receive and triage DS change requests | ✅ Agent | — |
| Validate request against existing system | ✅ Agent | — |
| Propose component build / update | ✅ Agent | Reviews and approves |
| Build component (all platforms) | ✅ Agent | — |
| Run visual regression (Chromatic) | ✅ Agent | — |
| Approve and merge | — | ✅ Human required |
| Deploy to all touch-points post-merge | ✅ Agent | — |
| Communicate update to all comms | ✅ Agent | — |
| Override or reject agent proposal | — | ✅ Human authority |

#### Trigger Sources

The DS Management Agent can be triggered by:
1. **Phase 7 AI Design Assistant** — flagged new/updated component requirement (primary trigger once Phase 7 is live)
2. **Human manager** — direct request via Slack command or GitHub issue
3. **Proactive monitoring** — agent detects drift, inconsistency, or missing states across platforms

#### What "managing the DS" means operationally

When a requirement arrives, the agent:
1. Reads the requirement and queries the existing component library
2. Determines: new component / variant addition / token change / state update
3. Validates it against DS rules (zero hardcoded values, architecture pattern, WCAG)
4. Builds the update — Flutter first, then React, iOS, Android via Style Dictionary
5. Raises a PR through the Phase 5 pipeline — includes visual regression, diff, affected screens
6. Notifies human design + dev managers in Slack with full context for approval decision
7. On approval: merges PR → token pipeline triggers → all platforms updated simultaneously → all touch-points notified

#### Communication on Release

When an update is approved and deployed, the agent simultaneously notifies:
- Slack `#design-system-updates` — what changed, which component, which platforms
- Supernova — documentation auto-updated
- DS website — regenerated
- Storybook — updated and redeployed
- Figma — component and Code Connect updated
- Phase 7 AI Design Assistant — notified to update any flagged screens using the new validated component

**Architecture:**

```
Requirement received (from Phase 7 / human / monitoring)
        │
        ▼
Claude API — analyses requirement vs. existing DS
  • What type of change? (new / update / token / variant)
  • Does it conflict with existing patterns?
  • What platforms are affected?
        │
        ▼
Agent builds component update
  • Flutter (Dart) — lib/ + ILDSTokens
  • React (via Style Dictionary) — Phase 3 output
  • iOS SwiftUI + Android Compose (via Style Dictionary) — Phase 4 output
  • Code Connect updated — all platforms
        │
        ▼
Phase 5 pipeline — PR raised, Chromatic regression run
        │
        ▼
Slack — human design + dev manager approval required
        │
        ▼  (on approval)
GitHub merge → existing token pipeline → all platforms
        │
        ▼
Simultaneous notification: Supernova + DS website + Storybook + Figma + Slack + Phase 7
```

**Key technical requirements:**
- Claude API — requirement analysis, DS rules validation, component code generation
- GitHub Branch + PR API — automated PR creation with structured description
- Chromatic — visual regression against established baseline (Phase 5 prerequisite)
- Style Dictionary — multi-platform output from single component definition
- Figma Plugin API — component and Code Connect update on release
- Slack API — approval workflow with action buttons (Approve / Request Changes)
- All Phase 5 pipeline infrastructure

#### Phase 6 Guardrails (required before going live)

| Guardrail | Description |
|---|---|
| **Eval harness** | Automated test suite that validates agent outputs against a known-good component set before any agent-proposed PR is raised |
| **Human approval hard gate** | No component change can merge without explicit human approval in Slack. This is enforced at the GitHub PR level — no auto-merge rules may be set on this repo |
| **Rollback plan** | Every agent-initiated merge must include a one-command rollback (git revert + re-publish). Agent must confirm rollback path before raising PR |
| **Thin vertical slice first** | Before building all Phase 6 capabilities, build and validate a single end-to-end flow: one component update → PR → visual regression → Slack approval → merge → multi-platform deploy. Ship nothing else until this slice is proven |
| **Scope firewall** | Agent operates on `lib/` components only. It may not modify `tokens/tokens.json`, GitHub Action files, or CI configuration without explicit human instruction |

**Status:** `- [ ]` Not started

---

### Phase 7 — AI Design Assistant Figma Plugin 🔴 NOT STARTED

**Goal:** A Figma plugin that takes a PRD or brief as input, accepts design style definitions and reference links from the designer at ingestion, and generates complete UI screens — layouts, flows, components, spacing, and interactions — using ILDS components exclusively, placed directly into Figma frames.

**Requires:** Phase 3 and Phase 4 complete (component index must cover all platforms and all 18+ components must have Code Connect published). Phase 6 (DS Management Agent) must also be operational — the Design Assistant routes all component gap requests to it.

#### Ingestion Stage (what the designer provides at session start)

| Input | Format | Purpose |
|---|---|---|
| PRD / brief / user flow | Text doc or paste | Defines screens, goals, user journeys |
| Design language definition | Text or short doc | Brand voice, visual style, tone, design direction |
| Reference links | Figma file links, image URLs | Visual references — style, layout patterns, inspiration |

The plugin reads all three inputs at session start before generating anything.

#### Generation Rules (enforced on every screen)

1. **ILDS components only** — every interactive or UI element must be an ILDS component. No custom one-off elements.
2. **Design style adherence** — layout decisions, density, typographic hierarchy must align with the designer's ingested style definition.
3. **Universal design guidelines** — WCAG accessibility contrast ratios, minimum touch target sizes, logical reading order, meaningful labels on all interactive elements.
4. **Reference alignment** — layout patterns and visual language must be consistent with pasted reference links.

#### Component Gap Handling (non-blocking parallel flow)

```
AI identifies a screen requires Component X
        │
        ├── Component X exists in ILDS?
        │       │
        │       YES → place it, continue
        │       │
        │       NO (or needs update)
        │              │
        │              ├── Create best-effort version in Figma
        │              │   (DS-aligned, visually correct, NOT thoroughly validated)
        │              │
        │              ├── Flag clearly: ⚠️ NEW COMPONENT — REQUIRES DS ADHERENCE CHECK
        │              │
        │              ├── Complete remaining screens without blocking
        │              │
        │              └── Fire requirement → DS Management Agent (Phase 6) [parallel]
        │
        ▼
All screens completed and delivered to designer
        │
        (Later, async)
        ▼
DS Management Agent releases validated component update
        │
        ▼
Designer / AI Assistant updates the flagged screens accordingly
```

#### Technical Architecture

```
Designer inputs (PRD + style definition + reference links)
        │
        ▼
Claude API — reads all inputs, extracts:
  • Screen list and user flows
  • Per-screen component requirements
  • Layout intent and design style constraints
        │
        ▼
ILDS Component Index (Figma API — reads published components)
  — searched semantically to match requirements to components
        │
        ▼
figma.importComponentByKeyAsync — places components into frames
  — applies variants, spacing (ILDSTokens), layout structure
  — follows WCAG and universal guidelines as generation constraints
        │
        ├── All known components → placed and complete
        │
        └── Unknown/gap components → flagged + routed to Phase 6 (DS Management Agent) in parallel
        │
        ▼
Figma frames delivered — designer reviews, iterates, or approves
```

**Key technical requirements:**
- Figma Plugin API — `figma.importComponentByKeyAsync`, `figma.createFrame`, layout APIs
- Claude API — multimodal (reads reference images) + text (reads PRD, style doc)
- ILDS Component Index — built from published Figma components + Code Connect metadata
- Reference link reading — Figma API for Figma links; Claude vision for image references
- Flagging mechanism — Figma annotation layer or plugin panel listing all unvalidated components
- Slack/webhook — fires gap requirements to Phase 6 (DS Management Agent) pipeline on detection

**Note on Supabase pgvector:** Not in scope for initial Phase 7 build. Component index uses Figma API directly. pgvector-based persistent indexing is a future upgrade once the Phase 7 plugin is validated.

#### Phase 7 Guardrails (required before going live)

| Guardrail | Description |
|---|---|
| **Eval harness** | Test suite that validates generated screens against: WCAG contrast ratios, correct ILDS component usage, no custom one-off elements, design style adherence. Must pass before any screen is delivered to the designer |
| **Designer review gate** | All generated screens land in a Figma frame clearly labelled `[AI DRAFT — REVIEW REQUIRED]`. Designer explicitly approves or revises before screens are used |
| **Component gap transparency** | Every ⚠️ flagged component must appear in a visible plugin panel summary at session end — component name, screen(s) affected, DS Management Agent ticket reference |
| **Thin vertical slice first** | Before building the full plugin, validate: one PRD → one screen → correct ILDS components placed in Figma → component gap correctly flagged and routed to Phase 6. Ship nothing else until this is proven |
| **No hallucinated components** | The plugin must refuse to place any Figma component that is not in the published ILDS component index. Best-effort gap components must be visually distinct (dashed border or annotation layer) |

**Status:** `- [ ]` Not started

---

### Phase 8 — Figma Typography Variables (token source completeness) 🔴 NOT STARTED

**Goal:** Move typography into Figma Variables so **every** token in `tokens/tokens.json` — including font family, sizes, weights, and line-heights — is extracted by the ILDS plugin on sync. Remove the interim repo-authored / plugin-hardcoded typography block. Achieve true single-source-of-truth: **Figma Variables only** for the full token set.

**Why this phase exists (do not skip):** Phase 3a tokenized typography in `tokens.json` so React/native exports would not hardcode Mulish and font sizes on day one. That block is **repo-authored** and re-injected by `TYPOGRAPHY_TOKENS` in `ilds-plugin/code.ts` because Figma has no Typography variable collection yet. Colors, spacing, and border radius are Figma-driven; typography is not. Until Phase 8 ships, L1 “token propagation” is **incomplete** — a designer cannot change typography in Figma and have it flow to Flutter, CSS, Tailwind, or Supernova.

**Requires:** Phases **3b** and **4** complete (Flutter, React, iOS, and Android components all consuming the interim typography tokens). Run **after** platform parity work so typography values are stable across all targets before migrating the source. Does not block Phases 5–7, but **must be scheduled before** claiming “Figma is the only token source” or closing the token-debt backlog.

#### Scope

| Step | Work |
|---|---|
| 1. Figma | Create a **Typography** variable collection in the ILDS Figma file: flat tokens aligned with the current set (`Mulish`; sizes 12/14/16/20; weights 400/500/700; line-heights 1.333/1.143/1.25/1.2). Optionally add display-scale sizes (48–72px) from the Supernova brief in the same pass. Naming must match plugin normalisation rules. |
| 2. Plugin | Extend `buildDTCG()` in `ilds-plugin/code.ts` to extract typography from Figma Variables (same pattern as Spacing / Border radius). Typography moves from preserve-merge into Figma-managed groups. |
| 3. Pipeline | End-to-end validation: change a typography variable in Figma → Sync → `tokens/tokens.json` → `build-tokens.yml` → `dist/tokens.css` + `dist/tokens.theme.css` → `dart run tool/generate_ilds_tokens.dart` → all platforms reflect the change. |
| 4. Docs | Supernova typography page auto-syncs from `tokens.json`; remove “repo-authored typography” caveats from Phase 3a notes and this doc. |

**Technical notes:**
- Prefer **flat DTCG tokens** (`fontFamily`, `fontWeight`, `dimension`, `number`) over composite `$type: typography` objects — same choice as Jun 2026 interim tokenization; Supernova-safer and matches existing Style Dictionary transforms.
- Style Dictionary config (`style-dictionary.config.mjs`) already emits typography to CSS and `@theme`; expect no format changes unless Figma naming differs from the interim keys.
- Flutter `tool/generate_ilds_tokens.dart` already reads `global.typography` from JSON; no structural change expected once the plugin exports it.

**Success criteria:**
- [ ] Zero hand-authored typography in `tokens/tokens.json` (plugin-only on sync)
- [ ] `TYPOGRAPHY_TOKENS` removed from `ilds-plugin/code.ts`
- [ ] Designer changes `font-size/14` (or equivalent) in Figma → all four platform token outputs update without a code change
- [ ] Master doc + Phase 3a caveats updated to “typography Figma-driven”

**Status:** `- [ ]` Not started — **scheduled after Phases 3b + 4; mandatory before token-source closure**

---

## 6. Completed Work — Full Log

### Infrastructure
- [x] Custom Figma Plugin (TypeScript) — `ilds-plugin/code.ts`
  - Reads Figma Variables via Plugin API (not REST)
  - Converts to W3C DTCG format
  - Pushes to GitHub with SHA-retry
  - Credentials in `figma.clientStorage`
  - Fixed: RGB interface renamed to `FigmaColor` (naming conflict with Figma typings)
  - Fixed: `btoa` replaced with pure TS implementation (not available in ES2017)
  - Fixed: `skipLibCheck: true` in `tsconfig.json`

- [x] GitHub Action `sync-supernova.yml`
  - Path trigger: `tokens/tokens.json`
  - Supernova CLI sync
  - Grep-based failure detection (exits 1 on known error strings)
  - Fixed: `supernovaBrand: "Default"` (was numeric ID `817254`)
  - Fixed: `tokenSets: ["global"]` (was `tokensTheme: "global"`)

- [x] `ILDSTokens` Dart class — `lib/design_system/ilds_tokens.dart`
  - Regenerated from `tokens.json` via `tool/generate_ilds_tokens.dart` (June 2026). All 112 tokens. Full Figma ramp now present, including `secondaryMaroon*` (previously missing entirely).
  - Single import for all components
  - Zero hardcoded values enforced via code review
  - `flutter analyze lib/` clean on all 18 components post-regeneration

- [x] `tool/generate_ilds_tokens.dart` — codegen script
  - Run: `dart run tool/generate_ilds_tokens.dart`
  - Regenerates `lib/design_system/ilds_tokens.dart` from `tokens/tokens.json`. Always re-run after any Figma token sync.

### Components — 18 total, all passing `flutter analyze`
See Section 8 for full component registry.

### Code Connect — 18 files
See `*.figma.ts` at repo root. **17 active files published** (Jun 2026, Task 2); `tag.figma.ts.disabled` is held back until a real Figma Tag Display component exists. Scrollbar republished.

### Documentation
- [x] `docs/reports/CLAUDE_HANDOFF_2026-04-08.md`
- [x] `docs/reports/ILDS_STATUS_AND_RESUME_REPORT_2026-04-12.md`
- [x] `ILDS_ADMIN_REPORT.docx` — comprehensive admin report (tracked in git via force-add; `ILDS_*.docx` ignore rule keeps other stray docs out)
- [x] `ILDS_ADMIN_ACTION_ITEMS.docx` — 12 action cards
- [x] `ILDS_CASE_STUDY.docx` — portfolio case study (Principal Designer voice)
- [x] `ILDS_PROJECT_REPORT.docx` — project report

---

## 7. Pending Tasks — Priority Order

Work through these in the order listed. Do not skip ahead.

---

### 🔴 IMMEDIATE — Close Phase 2 (must complete before Phase 3 starts)

#### Task 0 — ✅ COMPLETE — 🔐 SECURITY: Rotate Figma PAT
**Why:** The Figma PAT (`figd_…xr9O`) was committed in plaintext in `N8N_FIGMA_TOKENS_WORKFLOW.md` (3×) and `ILDS_PROJECT_REPORT.md` (2×). Both files have been redacted and the amended commit pushed. However, the PAT was live in chat history and docs — it must be considered compromised regardless of redaction.

**Resolution (Jun 2026):** Old token revoked in Figma. New pipeline token issued and stored in `config.py`, verified against the Figma API. Git history confirmed clean — `git log -S` shows **0 commits** ever contained the leaked token (secret-scanning blocked it before it landed), so no history rewrite is needed.

**Who:** Pratishek only (Figma account access required)

**Note:** The Figma PAT is consumed **only by REST clients outside Figma** — the Python pipeline (`~/ai-system-setup/pipelines/config.py` → `FIGMA_TOKEN`) and the legacy n8n workflow (superseded by the plugin, per D8). The `ilds-plugin/` does **not** use a Figma PAT — it reads variables via the in-file Plugin API and only stores a *GitHub* PAT in `figma.clientStorage`. Do not put a Figma PAT in the plugin.

**Steps:**
1. Figma → avatar (home: top-right) → Settings → **Security** tab → Personal access tokens
2. Revoke the old token (`figd_…xr9O`)
3. Generate a new PAT — **set scopes** (e.g. `file_content:read`); copy once
4. Store it in `~/ai-system-setup/pipelines/config.py` (not a git repo — safe) and/or the n8n credential if still used — never in any `.md`, `.env` committed to a repo, or `figma.clientStorage`

- [x] Old PAT revoked in Figma (confirmed by Pratishek, Jun 2026)
- [x] New PAT issued and stored securely (in `config.py`; verified `/me` + `/files/{id}/components` return 200, Jun 2026)

**Figma token inventory (3 distinct PATs — keep them straight):**

| Token | Where it lives | Consumed by | Status |
|---|---|---|---|
| `figd_…xr9O` | (none — was in docs/chat) | legacy n8n workflow only | ✅ **Revoked** |
| `figd_…Bu2` | `~/ai-system-setup/pipelines/config.py` → `FIGMA_TOKEN` | Python pipelines: `ilds_pipeline.py`, `figma_pipeline.py`, `generate_stubs.py` | ✅ Active (new) |
| `figd_…lQ0u` | this repo's `.env` (gitignored) → `FIGMA_ACCESS_TOKEN` | Code Connect publish (`npm run code-connect:publish`) | ✅ Active (separate, never leaked) |

**Not affected by Figma-PAT rotation** (verified Jun 2026): `ilds-plugin/` stores only a *GitHub* PAT in `figma.clientStorage`; `sync-supernova.yml` uses `secrets.SUPERNOVA_API_KEY`. Neither uses a Figma token. The only consumer that breaks on revoke is the legacy n8n workflow, which is superseded by the plugin (D8) — disable/delete it.

---

#### Task 1 — ✅ COMPLETE — Token Codegen Script (`tokens.json → ilds_tokens.dart`)

**Completed June 2026.** Script is `tool/generate_ilds_tokens.dart`. Run with `dart run tool/generate_ilds_tokens.dart`.

Key value shifts confirmed on commit:
| Token | Old (drifted) | New (Figma-canonical) |
|---|---|---|
| `orange500` | `#E8440C` | `#E3530F` |
| `orange600` | `#B93409` | `#C74C01` |
| `red600` | `#DC2626` | `#E00903` |
| `green600` | `#16A34A` | `#038542` |
| `amber500` | `#F59E0B` | `#E49F04` |
| `blue500` | `#2563EB` | `#2168F6` |

Full ramps now present: `primaryOrange*`, `errorRed*`, `warningAmber*`, `successGreen*`, `neutralWarmgray*`, `neutralCoolgray*`, `secondaryMaroon*` (new), `secondaryBlue*`, `informativeBlue*`, `globalWhite000/Black1000`.
Radius + spacing unchanged (not yet in `tokens.json` pipeline — separate future task).
`flutter analyze lib/` clean on all 18 components.

- [x] Codegen script runs cleanly
- [x] All drifted tokens corrected (Figma-canonical values confirmed against Figma MCP)
- [x] `flutter analyze` passes with zero issues
- [x] Committed and pushed (`17d7120`)
- [x] Visual QA pass — `red600`, `orange500` verified correct in Figma screenshots
- [x] `informative-blue` trailing-space keys fixed in Figma Variables (June 2026) — 4 variables renamed (`/50`, `/100`, `/200`, `/300`), 0 whitespace-tainted keys remain. Codegen trim is now a no-op safety net.

---

#### Task 2 — ✅ COMPLETE — Republish All Code Connect Files + Dev Mode Verification
**Why:** Multiple `*.figma.ts` files were edited locally since the last publish — not just Scrollbar. A full republish is required. Verify all 17 active components show correct bindings in Dev Mode afterwards.

**Who:** Cursor or developer
**Command:**
```bash
cd /path/to/ilds-design-system
npm run code-connect:publish
```

**Resolution (Jun 2026):**
- **Duplicate-publish bug fixed.** `figma.config.json` `include` matched both `**/*.figma.ts` (18 canonical, tracked) and `**/*.figma.tsx` (18 gitignored stubs) → every component double-published. Removed the `.tsx` glob (commit `8011da2`) and **deleted the 18 stray `ilds_*.figma.tsx` stubs** from disk.
- **Chip/Tag node collision deferred.** Both `chip.figma.ts` (IldsChip) and `tag.figma.ts` (IldsTag) targeted the **same** Figma node `14018-6786`. Per the documented note, that node is the Figma "Tag/Filter" component whose real Flutter widget is `IldsChip`; `IldsTag` (display variant) has **no Figma node yet**. Resolution: `tag.figma.ts` renamed to `tag.figma.ts.disabled` (preserved in git, not published) so `IldsChip` owns the node. **Re-enable when the designer publishes a real Tag Display component set** — rename back and update the node URL.
- **Republished cleanly:** 17 distinct nodes, each mapped once. No duplicates.

**Verify these 4 in Dev Mode (highest change risk):**
| Component | Node ID | What to verify |
|---|---|---|
| Radio | 13486:38485 | `isSelected`, `isDisabled`, `hasError` bindings |
| Tab | 17667:2334 | `type` (fixed/scrollable), `isDisabled` |
| Accordion | 17726:494 | `isExpanded` |
| Scrollbar | 17730:521 | `orientation` |

- [x] `npm run code-connect:publish` run successfully (17 components, no duplicate node mappings)
- [ ] Radio Dev Mode verified  ← *visual check in Figma, Pratishek*
- [ ] Accordion Dev Mode verified  ← *visual check in Figma, Pratishek*
- [ ] Scrollbar Dev Mode verified  ← *visual check in Figma, Pratishek*

---

#### Task 3 — ✅ COMPLETE — Fix Playground NavigationRail Overflow
**Why:** `RenderFlex overflow` error in the playground app. Not a production issue (playground is dev tooling), but it makes the playground unusable for testing.

**File:** `ilds_component_playground_app/lib/main.dart`

**Fix applied (Jun 2026):** Wrapping `NavigationRail` directly in a `SingleChildScrollView` throws an *unbounded height* error (the rail needs a bounded height). The correct recipe uses `LayoutBuilder` to get the viewport height, then `ConstrainedBox(minHeight)` + `IntrinsicHeight` so the rail fills the viewport when content is short and scrolls when content is tall:

```dart
SizedBox(
  width: 128,
  child: LayoutBuilder(
    builder: (context, constraints) => SingleChildScrollView(
      child: ConstrainedBox(
        constraints: BoxConstraints(minHeight: constraints.maxHeight),
        child: IntrinsicHeight(
          child: NavigationRail(/* selectedIndex, destinations, ... */),
        ),
      ),
    ),
  ),
)
```
- [x] Fix applied (`flutter analyze` clean)
- [ ] Playground runs without overflow on all screen sizes  ← *visual check, Pratishek*

---

#### Task 4 — ✅ COMPLETE — End-to-End Pipeline Test
**Why:** Admin Action 11. A full sync test confirms the entire pipeline is live and correctly wired: Figma → Plugin → GitHub → Supernova → Slack.

**Pre-flight verified from repo (Jun 2026):**
- GitHub Action `sync-supernova.yml` — **last 5 runs all `success`** (Apr 8 → May 19, 2026); 19 runs total. Backbone proven repeatedly.
- Last real sync commit: `e31033e` (2026-05-19) `ci: sync Figma Variables to tokens.json [ILDS Plugin]`.
- Plugin defaults correct (`dsoftacademy/ilds-design-system`, `main`, `tokens/tokens.json`).
- `supernova.settings.json` correct per D10 (`tokenSets:["global"]`, brand `Default`, `merge:false`, DS `771068`).
- ⚠️ Slack notification (step 6) is posted by the **plugin**, not the Action — ensure the plugin Settings has the Slack webhook saved, else step 6 won't fire even on a green sync.

**Steps:**
1. Open Figma → change any token value by 1 step (e.g., `orange500` hex by 1 digit)
2. Open ILDS plugin → click Sync
3. Verify `tokens/tokens.json` commit appears on GitHub (`main` branch)
4. Verify GitHub Action `sync-supernova.yml` runs green
5. Verify Supernova shows updated token value
6. Verify Slack `#design-system-updates` received notification
7. Revert the test token change in Figma → Sync again

**Live test results (Jun 11, 2026):**
- Plugin Sync → commit `d91d3c5` on `main` (`white-000` `#FFFFFF` → `#FFFFFE`).
- Same export also confirmed the **informative-blue trailing-space fix end-to-end** — keys now export clean (`"50"/"100"/"200"/"300"`, correctly ordered) instead of `"50 "` etc.
- Action run `27367921596` → **success**.

- [x] Token change synced to GitHub (`d91d3c5`)
- [x] GitHub Action ran green (run `27367921596`)
- [x] Supernova shows updated value (confirmed by Pratishek)
- [x] Slack notification received (confirmed by Pratishek)
- [x] Token reverted and resynced cleanly (`13bdf1c` → Action success, `white-000` back to `#FFFFFF`)

---

#### Task 5 — ✅ COMPLETE — Disable Legacy n8n Figma→GitHub Workflow
**Why:** The n8n workflow that previously pushed Figma Variables to GitHub has been superseded by the custom Figma plugin. The workflow's PAT (`figd_…xr9O`) was revoked as part of Task 0 — so the workflow is already broken. Leaving a broken, unmonitored workflow in n8n is noise. Disable or delete it to keep the pipeline clean and avoid future confusion about which mechanism is authoritative.

**Resolution (Jun 2026):** Confirmed disabled by Pratishek. The `ilds-plugin/` is now the sole authoritative Figma→GitHub sync path.

**What to do:**
1. Open your n8n instance
2. Find the workflow named something like "Figma Variables → GitHub" (or similar)
3. Disable it (or delete it if you're certain it has no other dependencies)
4. Note: the plugin (`ilds-plugin/`) is the authoritative Figma→GitHub sync mechanism — no other path should exist

- [x] Legacy n8n Figma workflow disabled/deleted (confirmed by Pratishek, Jun 2026)

---

### 🟡 SOON — Code Quality

#### Task 6 — Tab Scrollable Indicator (GlobalKey-based) ✅ COMPLETE (Jun 2026)
**Why:** `ilds_tab.dart` shipped a full-width neutral placeholder bar in scrollable mode instead of an indicator that tracks the selected tab.

**Location:** `lib/ilds_tab.dart`

**What shipped:**
- A `GlobalKey` (`KeyedSubtree`) on each tab + a container key on the tab `Row`; the selected tab's left offset and width are measured post-layout via `RenderBox.localToGlobal(..., ancestor: containerBox)`.
- The indicator is an `AnimatedPositioned` placed **inside** the horizontal scroll content (Stack), so it tracks the selected tab while scrolling — no manual scroll-offset math needed.
- `LayoutBuilder` re-measures on resize; `_scheduleMeasure()` (post-frame, guarded) remeasures on select/`didUpdateWidget`; `setState` only fires when position/width actually change (no rebuild loop).
- Selecting a tab calls `Scrollable.ensureVisible(alignment: 0.5)` to bring it into view.
- Fixed-mode indicator unchanged; thickness unified via `_indicatorThickness()`.

- [x] GlobalKey assigned to each tab
- [x] Tab positions measured post-render
- [x] Indicator left position computed from selected tab key
- [x] Indicator placed in scroll content (tracks tab without offset math)
- [x] Animated transition between selected tabs (`AnimatedPositioned`)
- [x] `flutter analyze` clean (main package)

---

### 🟢 PHASE 3 — Phase 2 Closure Complete ✅ (Tasks 0–5 done) — Ready to Start

See Section 5, Phase 3 for full scope.

**Phase 3a (token export) — ✅ COMPLETE (Jun 2026):**
- [x] Style Dictionary config (`style-dictionary.config.mjs`, v4.4.0) authored and committed
- [x] Output: `dist/tokens.css` + `dist/tokens.theme.css` (Tailwind v4 `@theme`) + `dist/tailwind-tokens.js` (deprecated v3 shim)
- [x] Typography tokenized in `tokens.json` + all exports + Dart codegen
- [x] GitHub Action (`build-tokens.yml`): token export runs + auto-commits `dist/` on `tokens/tokens.json` push — run #1 green (Jun 12, no-op commit; `dist/` already current)
- [x] Validated locally; CI auto-commit path wired for Figma → plugin → GitHub → CSS rebuild

**Phase 3b (React components — depends on 3a):**
- [ ] React + TypeScript component library (18 components, full state parity with Flutter)
- [ ] Tailwind CSS consuming Phase 3a token output
- [ ] Storybook 10 — all components, all states
- [ ] Public DS website — Vercel, auto-deploys on merge
- [ ] Visual regression via Chromatic

---

### 🟢 PHASE 4 — Start After Phase 3 Is Shipped

See Section 5, Phase 4.

**Phase 4a:** Style Dictionary extended to Swift + Kotlin. Token export runs on CI.
**Phase 4b:** 18 SwiftUI (iOS) + 18 Compose (Android) components consuming Phase 4a output.

---

### 🟢 PHASES 5, 6, 7 & 8 — Future

See Section 5 for full scope of each phase.

- **Phase 5** (Component Evolution Engine) — can begin after Phase 4. Builds the PR + regression + approval infrastructure that Phase 6 depends on.
- **Phase 6** (DS Management Agent) — requires Phase 5 complete. The agent operates through the Phase 5 pipeline; the pipeline must exist and be validated first.
- **Phase 7** (AI Design Assistant) — requires Phases 3, 4, and 6 complete. Component index must cover all platforms, and the DS Management Agent must be operational to receive component gap requests.
- **Phase 8** (Figma Typography Variables) — **after Phases 3b + 4.** Move typography into Figma Variables; remove repo/plugin hardcode; complete L1 single-source-of-truth. **Do not skip** before closing token debt.

**Phase 8 checklist (§5):**
- [ ] Typography variable collection in Figma (family, sizes, weights, line-heights)
- [ ] Plugin extracts typography; `TYPOGRAPHY_TOKENS` removed
- [ ] E2E: Figma typography change → all platform exports update
- [ ] Docs/Supernova caveats cleared

---

## 8. Component Registry

All components live in `lib/`. All pass `flutter analyze` with zero issues as of Phase 2 completion.

| # | Component | File | Phase | States | Code Connect | Status |
|---|---|---|---|---|---|---|
| 1 | Button | `ilds_button.dart` | 1 | Default · Hover · Pressed · Focused · Disabled · Loading · Destructive | `button.figma.ts` | ✅ Live |
| 2 | TextField | `ilds_text_field.dart` | 1 | Default · Focused · Filled · Error · Success · Disabled | `text_field.figma.ts` | ✅ Live |
| 3 | Chip | `ilds_chip.dart` | 1 | Unselected · Selected · Disabled · Large · Medium | `chip.figma.ts` | ✅ Live |
| 4 | Dropdown | `ilds_dropdown.dart` | 1 | Closed · Open · Error · Disabled | `dropdown.figma.ts` | ✅ Live |
| 5 | Toast | `ilds_toast.dart` | 1 | Info · Success · Warning · Error · Auto-dismiss | `toast.figma.ts` | ✅ Live |
| 6 | Radio | `ilds_radio.dart` | 2 | Default · Selected · Focused · Disabled · Error · H/V layout | `radio.figma.ts` | ✅ Live |
| 7 | Checkbox | `ilds_checkbox.dart` | 2 | Unchecked · Checked · Indeterminate · Disabled · Error | `checkbox.figma.ts` | ✅ Live |
| 8 | Switch | `ilds_switch.dart` | 2 | Off · On · Focused · Disabled-Off · Disabled-On | `switch.figma.ts` | ✅ Live |
| 9 | Text Area | `ilds_text_area.dart` | 2 | Default · Focused · Error · Success · ReadOnly · Loading | `text_area.figma.ts` | ✅ Live |
| 10 | Tab Bar | `ilds_tab.dart` | 2 | Fixed · Scrollable · Active · Hover · Pressed · Disabled | `tab.figma.ts` | ✅ Live |
| 11 | Pagination | `ilds_pagination.dart` | 2 | Default · Current · Disabled · Ellipsis · Compact | `pagination.figma.ts` | ✅ Live |
| 12 | Selection Button | `ilds_selection_button.dart` | 2 | Unselected · Selected · Hover · Focused · Disabled | `selection_button.figma.ts` | ✅ Live |
| 13 | Badge | `ilds_badge.dart` | 2 | Subtle · Intense · Success · Error · Warning · Info · Loading | `badge.figma.ts` | ✅ Live |
| 14 | Tag | `ilds_tag.dart` | 2 | Default · Selected · Disabled | `tag.figma.ts.disabled` | ⏸️ Deferred — no Figma node yet (shared chip node) |
| 15 | Accordion | `ilds_accordion.dart` | 2 | Collapsed · Expanded · Hover · Disabled | `accordion.figma.ts` | ✅ Live |
| 16 | Text Link | `ilds_text_link.dart` | 2 | Default · Hover · Pressed · Visited · Disabled · White | `text_link.figma.ts` | ✅ Live |
| 17 | Scrollbar | `ilds_scrollbar.dart` | 2 | Default(6px) · Hover(12px) · Dragged · V · H | `scrollbar.figma.ts` | ✅ Live (republished Jun 2026) |
| 18 | Search | `ilds_search.dart` | 2 | Default · Focused · Filled · Suggestions · Disabled | `search.figma.ts` | ✅ Live |

Tab scrollable indicator implemented (Jun 2026, Task 6) — scroll-linked, GlobalKey-measured.

---

## 9. Token Registry

All tokens live in `tokens/tokens.json` (W3C DTCG format) and are mirrored in `lib/design_system/ilds_tokens.dart`.

> ℹ️ **Canonical values:** All values below are from `tokens.json` (Figma source of truth). The Dart class was regenerated via `tool/generate_ilds_tokens.dart` in June 2026 and committed (`17d7120`), Figma-verified. Always run `dart run tool/generate_ilds_tokens.dart` after any Figma token sync.

| Token Group | Count | Description | Example Flutter ref |
|---|---|---|---|
| `primary-orange` | 10 | Brand orange — primary actions, interactive states, focus rings | `ILDSTokens.orange500` (#E3530F) |
| `secondary-maroon` | 10 | Secondary brand — supporting CTAs, selected states | `ILDSTokens.maroon500` |
| `secondary-blue` | 10 | ICICI blue accent | `ILDSTokens.secondaryBlue500` |
| `neutral-warmgray` | 12 | Warm-toned neutrals — backgrounds, dividers, disabled | `ILDSTokens.neutralWarmgray200` |
| `neutral-coolgray` | 12 | Cool-toned neutrals — text, borders, icons | `ILDSTokens.neutralCoolgray900` |
| `informative-blue` | 8 | Informational states | `ILDSTokens.informativeBlue500` |
| `success-green` | 8 | Success / positive states | `ILDSTokens.successGreen600` (#16A34A) |
| `warning-amber` | 8 | Warning states | `ILDSTokens.warningAmber500` |
| `error-red` | 8 | Error / destructive states | `ILDSTokens.errorRed600` (#DC2626) |
| `global` | 16 | Spacing (12), border radius (8) | `ILDSTokens.spacing4` (16px), `ILDSTokens.borderRadiusMd` (8px) |
| **Total** | **112** | 92 colour + 12 spacing + 8 radius | |

### Critical token usage rules (enforced in code review)
- `orange500 = #E3530F` (canonical brand orange). The old drifted Dart value `#E8440C` was corrected by the codegen (`17d7120`); `ilds_tokens.dart` now matches Figma.
- `red600` (#DC2626) is the error/destructive colour — NOT `red500`
- `neutral300` is the disabled text colour — NOT `neutral200` (neutral200 is a border)
- Spacing tokens (`spacingN`) are for layout/padding/margin only — never as numeric thresholds in logic
- `borderRadiusFull` (9999px) is for pills — `borderRadiusMd` (8px) is for standard components

---

## 10. Known In-Code TODOs

These are tracked issues inside source files that need to be addressed.

| Priority | File | Line | Issue | Fix |
|---|---|---|---|---|
| ~~Medium~~ ✅ | `lib/ilds_tab.dart` | — | ~~Scrollable mode indicator is a full-width neutral bar placeholder~~ Fixed Jun 2026 (Task 6) | GlobalKey-measured `AnimatedPositioned` indicator inside scroll content (see Task 6 in §7) |
| ~~Low~~ ✅ | `ilds_component_playground_app/lib/main.dart` | NavigationRail section | ~~RenderFlex overflow~~ Fixed Jun 2026 | LayoutBuilder + ConstrainedBox(minHeight) + IntrinsicHeight (see Task 3 in §7) |
| ~~Low~~ ✅ | `scrollbar.figma.ts` | Orientation binding | ~~Updated but not republished~~ Republished Jun 2026 (Task 2) | Done — full Code Connect republish completed |

---

## 11. File Map

### Repository Root (key files)
```
ilds-design-system/
├── ILDS_PROJECT_MASTER.md          ← THIS FILE — project source of truth
├── tokens/
│   └── tokens.json                 ← W3C DTCG token file — DO NOT edit manually
├── lib/
│   ├── design_system/
│   │   └── ilds_tokens.dart        ← Single token source for Flutter — DO NOT hardcode
│   ├── ilds_button.dart
│   ├── ilds_text_field.dart
│   ├── ilds_chip.dart
│   ├── ilds_dropdown.dart
│   ├── ilds_toast.dart
│   ├── ilds_radio.dart
│   ├── ilds_checkbox.dart
│   ├── ilds_switch.dart
│   ├── ilds_text_area.dart
│   ├── ilds_tab.dart               ← scroll-linked indicator (Task 6, Jun 2026)
│   ├── ilds_pagination.dart
│   ├── ilds_selection_button.dart
│   ├── ilds_badge.dart
│   ├── ilds_tag.dart
│   ├── ilds_accordion.dart
│   ├── ilds_text_link.dart
│   ├── ilds_scrollbar.dart
│   └── ilds_search.dart
├── tool/
│   └── generate_ilds_tokens.dart   ← run: dart run tool/generate_ilds_tokens.dart
├── ilds-plugin/
│   ├── code.ts                     ← Figma plugin source (TypeScript)
│   ├── code.js                     ← compiled output
│   ├── manifest.json
│   └── ui.html
├── .github/
│   └── workflows/
│       └── sync-supernova.yml      ← token sync CI — hardened with grep failure detection
├── supernova.settings.json         ← tokenSets: ["global"], supernovaBrand: "Default"
├── figma.config.json               ← Code Connect config
├── *.figma.ts                      ← 18 Code Connect files (one per component) — tracked in git
├── *.figma.tsx                     ← local-only Code Connect tooling artefacts — gitignored, NOT deliverables
├── ilds_component_playground_app/  ← dev playground — NavigationRail overflow (Task 3)
└── docs/
    └── reports/
        ├── CLAUDE_HANDOFF_2026-04-08.md
        └── ILDS_STATUS_AND_RESUME_REPORT_2026-04-12.md
```

### Files to NEVER edit manually
- `tokens/tokens.json` — updated only by the Figma plugin
- `lib/design_system/ilds_tokens.dart` — regenerated from `tokens.json` via the codegen script (script is being built by Cursor — do NOT manually edit values)

> ℹ️ `ILDS_PROJECT_MASTER.md` is tracked and version-controlled (committed since `17d7120`; updated through Phase 2 closure).

---

## 12. Non-Negotiable Rules

These apply to every agent, every session, every PR.

1. **Zero hardcoded values.** Every colour, spacing, radius, and weight in every Flutter component must reference `ILDSTokens`. If a value is not in the token class, add it to the token class first. No exceptions. Verified by `flutter analyze` + code review on every PR.

2. **One source of truth.** Tokens are defined in Figma Variables only. `tokens.json` is downstream. `ILDSTokens.dart` is downstream. If you need a new token, add it in Figma first, sync via plugin, regenerate the class.

3. **Error colour is `red600`, not `red500`.** `red600` = #DC2626. This was a real bug caught in Phase 2. Any error state, destructive action, or validation failure uses `red600`. The focus ring colour is `orange500` = #E3530F (canonical, from `tokens.json`).

4. **Spacing tokens are for spacing.** `ILDSTokens.spacingN` values must never be used as numeric thresholds in business logic. Use plain integer literals for logic gates.

5. **The pipeline must fail loudly.** If any CI step produces ambiguous output, add explicit failure detection. Silent success with wrong output is worse than a visible failure.

6. **Every interactive component follows the architecture pattern.** AnimatedContainer (150ms) → MouseRegion → GestureDetector (opaque) → Focus + FocusNode → Semantics (contextual) → token-only widget tree. No shortcuts.

7. **Do not touch `sync-supernova.yml` without understanding the grep failure detection.** The Supernova CLI exits 0 on failure. The grep-based exit-1 logic is intentional and critical.

---

## 13. Tech Stack Reference

| Layer | Tool | Version / Notes |
|---|---|---|
| Component platform | Flutter (Dart) | Package — no `main.dart` |
| Token format | W3C DTCG JSON | `tokens/tokens.json` |
| Design tool | Figma | Variables API (Plugin) |
| Plugin language | TypeScript | `ilds-plugin/` |
| Version control | GitHub | `dsoftacademy/ilds-design-system` |
| CI/CD | GitHub Actions | `.github/workflows/` |
| Documentation portal | Supernova | Synced via CLI in CI |
| Notifications | Slack | `#design-system-updates` webhook |
| Code Connect | Figma Code Connect | 18 `.figma.ts` files at repo root |
| Phase 3 target | React + TypeScript | Not started |
| Phase 3 styling | Tailwind CSS v4 (`@theme` via `dist/tokens.theme.css`) | Not started |
| Phase 3 docs | Storybook 10 (verify npm) | Not started |
| Phase 3 hosting | Vercel | Not started |
| Phase 3a token export | Style Dictionary v4 (CSS + Tailwind) | ✅ Done (Jun 2026) — `style-dictionary.config.mjs`, CI `build-tokens.yml` |
| Phase 4 export | Style Dictionary (Swift + Kotlin) | Not started — extends the Phase 3a config |
| Phase 4 iOS | SwiftUI | Not started |
| Phase 4 Android | Jetpack Compose | Not started |
| Phase 5 visual regression | Chromatic (Storybook/web only) + **Flutter golden tests** | Not started — ⚠️ Chromatic covers React/Storybook only; Flutter components need golden tests (repo currently has none beyond one boilerplate `widget_test.dart`). Phase 5 also only depends on 3b (Storybook), not all of Phase 4 |
| Phase 5 PR automation | GitHub Branch + PR API | Not started |
| Phase 6 DS agent intelligence | Claude API (requirement analysis + code generation) | Not started |
| Phase 6 approval workflow | Slack API with action buttons | Not started |
| Phase 6 multi-platform deploy | Style Dictionary + existing token pipeline | Not started |
| Phase 7 AI (screen generation) | Claude API (multimodal) + Figma Plugin API | Not started |
| Phase 7 references | Claude vision + Figma API for reference link reading | Not started |
| Phase 8 typography | Figma Variables (replace repo/plugin-authored typography) | Not started — after 3b + 4 |
| Phase 5–7 future upgrade | Supabase pgvector (component + project indexing) | Post-validation |

---

## Resolved design decisions

- **Toast surface (resolved Jun 2026):** White surface (`color.neutral.0`) + per-variant colored accent (left 4px bar + icon + action): `info`→orange500, `success`→green600, `warning`→amber500, `error`→red600. Ratified to match shipped `lib/ilds_toast.dart` and the Phase 3 Gemini brief; the Phase 5 Supernova brief's "tinted surface per variant" spec was **corrected** to white+accent (tinted surfaces belong to the **Tag** component, not Toast).
- **Web token target (resolved Jun 2026):** Phase 3b uses **Tailwind CSS v4** + `dist/tokens.theme.css` (`@theme`), not v3 `tailwind.config.js` / `tailwind-tokens.js`. Storybook **10**, not 8. Verify versions against `npm view` before scaffold.
- **Typography source (planned — Phase 8):** Interim typography lives in `tokens.json` + plugin `TYPOGRAPHY_TOKENS` until **Phase 8** moves it to Figma Variables only. Scheduled after Phases 3b + 4; mandatory before claiming full Figma single-source-of-truth for tokens.

---

*End of ILDS_PROJECT_MASTER.md*
*To update this file: edit directly and commit to `main`. This is a living document.*
