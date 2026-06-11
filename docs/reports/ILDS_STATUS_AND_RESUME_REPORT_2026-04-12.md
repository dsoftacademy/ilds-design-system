# ILDS Design System — Status & Resume Report

**Date:** 12 April 2026  
**Audience:** Pratishek + Claude (or any assistant resuming after a break)  
**Repo:** `dsoftacademy/ilds-design-system` (local: `ilds-design-system/`)  
**Figma file:** ILDS Master | Design — file key `PCUj412f0Z1zZLLxQUX22e`

---

## How to use this document

Read **§1–2** for intent and architecture, **§3** for phase-by-phase status, **§4** for decision points, **§5** for what to do next. Older docs (`ILDS_PROJECT_REPORT.md`, phase briefs) are useful detail but **this report supersedes their status tables** where they conflict (especially automation: plugin replaced planned n8n token workflow).

---

## 1. Core objective and goal

### What ILDS is

**ILDS (ICICI Lombard Design System)** is a **Flutter package** (not an app) that provides:

- Reusable UI components (`lib/ilds_*.dart`)
- Design tokens (`tokens/tokens.json` + `lib/design_system/ilds_tokens.dart`)
- Figma ↔ code linkage via **Code Connect** (`*.figma.ts`)
- Automation from **Figma Variables → GitHub → Supernova → Slack**

It is intended for ICICI Lombard digital products (mobile/web Flutter consumers).

### Primary goal

Build a **reliable design-to-dev pipeline** where:

1. **Designers** change tokens in Figma (Variables collections).
2. **Automation** writes `tokens/tokens.json` to GitHub in **W3C DTCG** shape.
3. **CI** syncs tokens to **Supernova** (documentation portal).
4. **Developers** implement screens using **token-referenced** Flutter components (no hardcoded hex/spacing).
5. **Designers** see live code snippets in Figma via **Code Connect**.

### Non‑negotiable engineering rules

| Rule | Why |
|------|-----|
| No hardcoded colors/spacing in components | Tokens must stay the contract |
| `ILDSTokens.*` only in Dart UI code | Single runtime token API for Flutter |
| Figma is design source of truth | Avoid dual manual edits |
| `Semantics` on interactive widgets | Accessibility baseline |
| Flutter SDK + `material.dart` only in components | Keep package portable |

---

## 2. Target architecture (current)

```
FIGMA VARIABLES (Colours- All, Spacing, Border radius)
        │
        │  ILDS Token Sync Figma plugin (Phase 6) — one-click
        ▼
GitHub: tokens/tokens.json  (DTCG, root key "global")
        │
        ├──► GitHub webhook → n8n → Slack #design-system-updates
        │
        └──► GitHub Action: sync-supernova.yml
                    │
                    ▼
               Supernova DS 771068 (docs + token browser)

Parallel track (not auto-wired to tokens.json today):
  lib/design_system/ilds_tokens.dart  ← hand-maintained Dart constants used by components

Flutter components (lib/)  ←  consume ILDSTokens
*.figma.ts                 ←  Code Connect → Figma Dev Mode
ilds_component_playground_app/  ←  live QA / hot reload
```

**Important gap:** `tokens/tokens.json` (Figma-driven, rich palette) and `ilds_tokens.dart` (simplified orange/neutral/semantic set) are **not automatically synced**. Component work uses `ilds_tokens.dart`; pipeline work uses `tokens.json`. Future work may need a generator or alignment pass.

---

## 3. Phases, tasks, and status

Phases were planned across multiple briefs. There is **no Phase 4 brief** in the repo; automation work was later labeled **Phase 6 (plugin)**.

### Phase 0 — Foundation (implicit, ~early Apr 2026)

| Task | Status | Notes |
|------|--------|-------|
| Repo + Flutter package scaffold | ✅ Done | `pubspec.yaml`, Mulish fonts |
| `ILDSTokens` + `ILDSTheme` | ✅ Done | `lib/design_system/ilds_tokens.dart` |
| `tokens/tokens.json` DTCG structure | ✅ Done | Nested under `global.color`, spacing, borderRadius |
| GitHub repo `dsoftacademy/ilds-design-system` | ✅ Done | |
| Figma file linked | ✅ Done | `PCUj412f0Z1zZLLxQUX22e` |

---

### Phase 1 — Core Flutter components (Cursor, pre–Apr 5)

| Task | Status | File(s) |
|------|--------|---------|
| Button (types, sizes, destructive, loading) | ✅ Done | `lib/ilds_button.dart` |
| Chip (selectable filter chip) | ✅ Done | `lib/ilds_chip.dart` |
| Text field (password, OTP, states) | ✅ Done | `lib/ilds_text_field.dart` |
| Toast (variants + `show()`) | ✅ Done | `lib/ilds_toast.dart` |
| Initial Code Connect (button, chip, text field) | ✅ Done | `button.figma.ts`, etc. |
| Token-only references in Phase 1 files | ✅ Done | Analyzer clean (Apr 12) |

---

### Phase 2 — Remaining components + Code Connect (Cursor, Apr 8)

**Brief:** `ILDS_PHASE2_CURSOR_BRIEF.md`  
**Commit reference:** `a936005 feat: add Phase 2 ILDS components and mappings`

| Tier | Component | Dart | Code Connect | Status |
|------|-----------|------|--------------|--------|
| 1 | Radio + Radio Group | `ilds_radio.dart` | `radio.figma.ts` | ✅ Done |
| 1 | Checkbox | `ilds_checkbox.dart` | `checkbox.figma.ts` | ✅ Done |
| 1 | Switch | `ilds_switch.dart` | `switch.figma.ts` | ✅ Done |
| 1 | Text Area | `ilds_text_area.dart` | `text_area.figma.ts` | ✅ Done |
| 2 | Tab | `ilds_tab.dart` | `tab.figma.ts` | ✅ Done (local mods uncommitted) |
| 2 | Pagination | `ilds_pagination.dart` | `pagination.figma.ts` | ✅ Done (local mods uncommitted) |
| 2 | Selection Button | `ilds_selection_button.dart` | `selection_button.figma.ts` | ✅ Done |
| 3 | Badge | `ilds_badge.dart` | `badge.figma.ts` | ✅ Done |
| 3 | Tag (filter) | `ilds_tag.dart` | `tag.figma.ts` | ✅ Done |
| 3 | Accordion | `ilds_accordion.dart` | `accordion.figma.ts` | ✅ Done |
| 3 | Text Link | `ilds_text_link.dart` | `text_link.figma.ts` | ✅ Done |
| 3 | Scrollbar | `ilds_scrollbar.dart` | `scrollbar.figma.ts` | ✅ Done (local mods uncommitted) |
| Extra | Search | `ilds_search.dart` | `search.figma.ts` | ✅ Done |

| Task | Status |
|------|--------|
| `flutter analyze lib/` — all Phase 2 files | ✅ Pass (Apr 12) |
| `npm run code-connect:publish` | ✅ Succeeded (Apr 8 handoff; re-run after mapping edits) |
| red500 → red600 correction (radio, checkbox, text area) | ✅ Done |

**Also added in same effort window:**

| Task | Status |
|------|--------|
| Enhanced `example/lib/main.dart` playground | ✅ Done (untracked locally) |
| `ilds_component_playground_app/` standalone app | ✅ Done (untracked locally) |
| `CONTRIBUTING.md`, `.editorconfig`, `docs/` | ✅ Written (mostly untracked) |
| Playground `NavigationRail` layout fix (web) | ✅ Fixed locally (remove scroll around rail) |

---

### Phase 3 — Refine core five components (Gemini brief, Apr 6)

**Brief:** `ILDS_PHASE3_GEMINI_BRIEF.md`  
**Intent:** Complete scaffolded button-adjacent components without rewriting Phase 1.

| # | Task | Status | Evidence |
|---|------|--------|----------|
| 3.1 | Text field: leading icon | ✅ Done | `leadingIcon` in `ilds_text_field.dart` |
| 3.2 | Text field: trailing icon | ✅ Likely done | `trailingIcon` pattern in file |
| 3.3 | Text field: character count | ✅ Done | `maxLength` + manual counter |
| 3.4 | Text field: read-only visuals | ⚠️ Verify vs Figma | Implement; needs design QA |
| 3.5 | Text field: error+focus border | ⚠️ Verify vs Figma | Implement; needs design QA |
| 3.6 | Chip: tag variant enum | ✅ Done | `IldsChipTagVariant` |
| 3.7 | Chip: avatar prefix | ✅ Done | `avatar` prop |
| 3.8 | Chip: count badge | ✅ Done | `count` prop |
| 3.9 | Dropdown: full custom overlay | ✅ Done | `lib/ilds_dropdown.dart` + `dropdown.figma.ts` (untracked) |
| 3.10 | Toast: title | ✅ Done | `title` prop |
| 3.11 | Toast: close button | ✅ Done | `showClose` |
| 3.12 | Toast: accent bar | ✅ Done | `showAccentBar` |
| 3.13 | Toast: persistent + position | ✅ Done | `isPersistent`, `IldsToastPosition` |
| 3.14 | Button: pressed state / icon sizing audit | ⚠️ Partial | Overlay color logic exists; Figma parity not formally signed off |

**Phase 3 summary:** ~**90% complete** — remaining work is **Figma parity QA**, not greenfield coding.

---

### Phase 4 — (not documented)

No `ILDS_PHASE4_*.md` exists. Historically this slot was **n8n Figma Variables → GitHub** (see `N8N_FIGMA_TOKENS_WORKFLOW.md` + `ILDS_PROJECT_REPORT.md` Task 1). That path was **superseded by Phase 6 plugin** (see §3.6).

---

### Phase 5 — Supernova documentation portal (manual, Apr 8)

**Brief:** `ILDS_PHASE5_SUPERNOVA_BRIEF.md`  
**Supernova:** workspace `718203`, design system `771068`

| Task | Status |
|------|--------|
| Token sync into Supernova (automated) | ✅ Working path exists (plugin → GitHub → Action) |
| Portal page hierarchy (Getting Started, Principles, Tokens, Components) | ⏳ Manual — content in brief, not confirmed live |
| Component docs: Button | ⏳ Unknown |
| Component docs: Text Field | ⏳ Was empty per Apr 5 report |
| Component docs: Chip, Dropdown, Toast | ⏳ Unknown |
| Design principles pages (colour, type, spacing, a11y) | ⏳ Manual entry required |
| Portal publish + Slack announcement | ⏳ Not confirmed |

**Phase 5 summary:** **Automation side ~done; editorial/docs ~largely pending.**

---

### Phase 6 — Figma Token Sync plugin (Apr 7–8)

**Briefs:** `ILDS_PHASE6_PLUGIN_BRIEF.md`, `CURSOR_PHASE6_INSTRUCTIONS.md`  
**Location:** `ilds-plugin/`

| Task | Status | Notes |
|------|--------|-------|
| Plugin scaffold (`code.ts`, `ui.html`, `manifest.json`) | ✅ Done | |
| TypeScript build → `code.js` | ✅ Done | `npm run build` in `ilds-plugin/` |
| Extract 3 Figma collections → DTCG | ✅ Done | Colours- All (92), Spacing (12), Border radius (8) |
| GitHub PUT `tokens/tokens.json` | ✅ Done | Many commits: `ci: sync Figma Variables... [ILDS Plugin]` |
| Slack notification | ✅ Implemented | Via webhook in plugin config |
| 409 stale SHA retry | ✅ Done | Commit `ed7c74c` |
| Replace n8n token extraction | ✅ **Decision executed** | Plugin is primary; n8n Variables workflow not required |

| Task | Status |
|------|--------|
| Plugin distributed to Figma org / team onboarding doc | ⚠️ Unknown |
| Credentials stored per-user in `figma.clientStorage` | ✅ Pattern in code |

---

### Automation & integrations (cross-phase)

| Integration | ID / ref | Status |
|-------------|----------|--------|
| GitHub Action `sync-supernova.yml` | | ✅ Hardened (fail on CLI error patterns) |
| `supernova.settings.json` | `tokenSets: ["global"]`, brand `Default` | ✅ Fixed Apr 8 (`bc771d4`, `8b6d278`) |
| `mergeWithExistingTokens` | `false` | ✅ Prevents stale merge |
| GitHub secret `SUPERNOVA_API_KEY` | | ✅ Assumed set |
| n8n: GitHub Push → Slack | `P82tigHMhMfUl25s` | ✅ Was working |
| n8n: Figma Library Monitor | `q6TjuM7fUilBJUtA` | ✅ Was active |
| n8n: Figma Variables → GitHub | Planned | ⏸️ **Superseded by plugin** |
| Slack: strip `Made-with: Cursor` from messages | `N8N_FIX_CURSOR_MESSAGE.md` | ⏳ Likely still pending |
| Code Connect publish | `npm run code-connect:publish` | ✅ Works; needs `.env` with Figma token |
| Obsidian + LM Studio pipeline | `~/ai-system-setup/pipelines/ilds_pipeline.py` | ⚠️ **Blocked** — LM Studio read timeout (300s) |

---

### Side systems (outside main repo phases)

| System | Purpose | Status |
|--------|---------|--------|
| Obsidian vault `ILDS-Project` | Notes, `_BRIEF.md`, pipeline output | Active (path in `ai-system-setup/pipelines/config.py`) |
| `ilds_pipeline.py` | Figma components → LM Studio → `pipeline-notes/component-metadata.json` | ⚠️ Figma OK (1166 records); LM step failed |
| Duplicate Code Connect `ilds_*.figma.tsx` | Alternate React-style stubs | ⚠️ Untracked — clarify vs canonical `*.figma.ts` |
| `_index.md` | Obsidian anchor for repo | ✅ Created |

---

## 4. Key decision points (timeline)

Understanding **why** the project looks the way it does:

| # | Decision | Alternatives considered | Outcome / rationale |
|---|----------|-------------------------|---------------------|
| D1 | **Figma Variables as sole token input** | Manual JSON edits, dual sources | Avoids conflict; designers own tokens |
| D2 | **W3C DTCG JSON in repo** | Tokens Studio flat export only | Supernova CLI + industry format |
| D3 | **`global` wrapper in `tokens.json`** | Flat `color` root (older draft) | Matches Figma collection export + `tokenSets: ["global"]` |
| D4 | **Separate `ilds_tokens.dart` for Flutter** | Auto-generate Dart from JSON | Faster component dev; **technical debt**: two token layers |
| D5 | **Flutter package, not app** | Monolithic demo app | Consumers import package; playgrounds are separate |
| D6 | **Custom dropdown (Overlay)** | `DropdownButton` | Material widgets can't match ILDS visual spec |
| D7 | **Phase 2 bulk build in Cursor** | One component at a time in Gemini | Speed; Gemini brief kept for refinement only |
| D8 | **Figma plugin replaces n8n token workflow** | n8n polling/webhook (`N8N_FIGMA_TOKENS_WORKFLOW.md`) | Plugin uses Variables API in-file; fewer moving parts; designer-triggered sync |
| D9 | **Keep GitHub Action for Supernova** | Plugin calls Supernova directly | Single CI gate; auditable logs; secret stays on GitHub |
| D10 | **Supernova mapping fixes** | `tokensTheme`, numeric brand URL, `merge: true` | False-green CI + stale tokens; fixed to `tokenSets` + `Default` + `merge: false` |
| D11 | **Code Connect for all components** | Docs-only | Designers see Flutter snippets in Figma |
| D12 | **Standalone playground app** | Only `example/` | Easier to split/share; path dep enables hot reload |
| D13 | **Tool split: Cursor / Gemini / Supernova UI** | Single agent | Cursor = codegen; Gemini = spec-following refinement; Supernova = human docs |
| D14 | **red600 for error/destructive** | red500 | Aligns with Figma semantic error scale |

---

## 5. Current repo reality (12 Apr 2026)

### Analyzer

```
flutter analyze lib/  →  No issues found
```

### Components shipped (19 Dart files under `lib/`)

`ilds_accordion`, `ilds_badge`, `ilds_button`, `ilds_checkbox`, `ilds_chip`, `ilds_dropdown`, `ilds_pagination`, `ilds_radio`, `ilds_scrollbar`, `ilds_search`, `ilds_selection_button`, `ilds_switch`, `ilds_tab`, `ilds_tag`, `ilds_text_area`, `ilds_text_field`, `ilds_text_link`, `ilds_toast`, `design_system/ilds_tokens.dart`

### Code Connect (18 `*.figma.ts` at repo root)

All major components mapped; `figma.config.json` also includes `**/*.figma.tsx` (untracked duplicates exist — pick one convention).

### Git state (local checkout)

- Branch: `main` — **ahead 1, behind 5** vs `origin/main` (needs pull/reconcile before push)
- **Large untracked set**: docs, phase briefs, playground app, `example/`, many `ilds_*.figma.tsx`, `dropdown.figma.ts`, `_index.md`, etc.
- **Modified uncommitted**: several `lib/*.dart`, `*.figma.ts`, `package.json`, README, etc.

**Risk:** Significant work exists only on disk; not fully backed up to GitHub.

### Recent commits on `main` (remote history pattern)

Plugin token syncs and Supernova fixes dominate; latest local commit message: `chore(flutter): fix analyzer deprecations in button, chip, text field`.

---

## 6. What to pick up now (prioritized)

### P0 — Restore team continuity (today)

1. **`git pull --rebase origin main`** then resolve the ahead/behind state.
2. **Commit and push** untracked high-value work in logical chunks:
   - Chunk A: `docs/`, `CONTRIBUTING.md`, `_index.md`, phase briefs (optional)
   - Chunk B: `ilds_component_playground_app/`, `example/`
   - Chunk C: `lib/ilds_dropdown.dart`, `dropdown.figma.ts`, any component fixes
3. **Run end-to-end token test:** Figma plugin → GitHub commit → Action green → Supernova UI shows updated value (e.g. `white-000`).

### P1 — Confirm automation health

| Action | Pass criteria |
|--------|----------------|
| Trigger plugin sync from Figma | New commit on `tokens/tokens.json` |
| Check GitHub Actions | `sync-supernova.yml` succeeds, no grep errors in log |
| Open Supernova DS 771068 | Colours match latest Figma export |
| Check Slack | Notification fires (plugin and/or n8n on push) |
| Fix n8n Slack message | First line only (no `Made-with: Cursor`) if still noisy |

### P2 — Design QA pass (Phase 3 closure)

- Open **`ilds_component_playground_app`** → `flutter run -d chrome` (canonical harness).
- Per component: compare active/hover/error/disabled states to Figma.
- Log gaps in Obsidian or `docs/reports/`.

### P3 — Supernova portal (Phase 5)

- Follow `ILDS_PHASE5_SUPERNOVA_BRIEF.md` section 1 page tree.
- Start with **Introduction** + **Button** + auto token pages.
- Extend component pages beyond original five as needed (now 18 components exist).

### P4 — Code Connect hygiene

- Decide: **`*.figma.ts` only** (current publish path) vs keep `ilds_*.figma.tsx`.
- Re-run `npm run code-connect:publish` after any prop/API change.
- Update mappings when Figma property names change (case-sensitive).

### P5 — Token architecture debt

- Plan **JSON → Dart token generation** (or expand `ilds_tokens.dart` to match Figma groups: warmgray, maroon, etc.).
- Until then, document which token layer app teams should import.

### P6 — Obsidian / LM pipeline (optional)

- Start LM Studio with model `google/gemma-4-26b-a4b` (or update model in `ilds_pipeline.py`).
- Re-run: `python3.10 ilds_pipeline.py PCUj412f0Z1zZLLxQUX22e`
- Output target: `{OBSIDIAN_ILDS}/pipeline-notes/component-metadata.json`

### P7 — Future components (roadmap)

From `ILDS_PROJECT_REPORT.md` §12: Card, Modal, Bottom Sheet, Navigation Bar — **not started**.

---

## 7. Quick command reference

```bash
# Repo root
cd "/Users/pb09/ILDS Automation/ilds-design-system"

# Analyze components
/Users/pb09/flutter/bin/flutter analyze lib/

# Code Connect publish (requires .env with Figma credentials)
npm run code-connect:publish

# Playground (recommended)
cd ilds_component_playground_app
/Users/pb09/flutter/bin/flutter pub get
/Users/pb09/flutter/bin/flutter run -d chrome

# Plugin build
cd ilds-plugin && npm install && npm run build
```

---

## 8. Document map (where to read more)

| Document | Use when |
|----------|----------|
| `README.md` | Day-to-day repo layout |
| `CONTRIBUTING.md` | Commit flow, file placement |
| `_index.md` | Obsidian vault anchor |
| `ILDS_PROJECT_REPORT.md` | Apr 5 snapshot + n8n setup (⚠️ automation status outdated) |
| `ILDS_PHASE2_CURSOR_BRIEF.md` | Per-component Flutter specs |
| `ILDS_PHASE3_GEMINI_BRIEF.md` | Refinement checklist for core five |
| `ILDS_PHASE5_SUPERNOVA_BRIEF.md` | Portal copy-paste content |
| `ILDS_PHASE6_PLUGIN_BRIEF.md` | Plugin transform + DTCG rules |
| `docs/reports/CLAUDE_HANDOFF_2026-04-08.md` | Apr 8 session log |
| `N8N_FIGMA_TOKENS_WORKFLOW.md` | Legacy n8n path (superseded) |
| `N8N_FIX_CURSOR_MESSAGE.md` | One-line Slack fix |

---

## 9. Overall completion estimate

| Area | % complete | Blocker |
|------|------------|---------|
| Flutter component library (planned set) | **~95%** | Figma QA + future Card/Modal/etc. |
| Token file + plugin sync | **~90%** | Verify Supernova UI; git hygiene |
| Supernova CI | **~85%** | Confirm latest Action run |
| Supernova written docs (Phase 5) | **~20%** | Manual content entry |
| Code Connect | **~90%** | Re-publish after API changes; dedupe `.tsx` |
| n8n (notifications) | **~80%** | Cursor footer fix optional |
| Obsidian/LM metadata pipeline | **~40%** | LM Studio timeout |
| Git / repo hygiene | **~60%** | Large untracked + behind remote |

**Single best “resume here” action:**  
→ **Reconcile git, push local work, run one full plugin → Supernova sync, open playground in Chrome for visual QA.**

---

*Report generated for project resumption · 12 Apr 2026 · Maintainer: Pratishek Bansal / dsoftacademy*
