# Phase 5e — Post-merge propagation

**Status:** Stage 5e deliverable  
**Purpose:** Document what runs automatically after a PR merges to `main`, and where the token vs component boundary is.

## Summary

| Change type | Auto-propagates on merge? | What runs |
|-------------|---------------------------|-----------|
| **Token** (`tokens/tokens.json`) | ✅ Yes | `build-tokens.yml` → all platform exports + `sync-supernova.yml` |
| **Component** (`lib/`, `web/src/`, etc.) | ❌ No codegen | CI on `main` push (path-filtered); no cross-platform generator |
| **Docs / tooling only** | N/A | Usually no propagation workflows |

Phase 5 delivers the **PR + regression + approval workflow** for components. Cross-platform component code remains hand-built per platform until Phase 6 automates it.

---

## Merge event → workflow map

All workflows below trigger on **push to `main`** (after merge) unless noted. Path filters mean a merge only runs jobs whose paths match the changed files.

### Token pipeline (automatic multi-platform)

```text
tokens/tokens.json merged to main
        │
        ├─► build-tokens.yml
        │     • npm run build:tokens (Style Dictionary → CSS, Tailwind, Swift, Kotlin)
        │     • dart run tool/generate_ilds_tokens.dart (Flutter)
        │     • npm run verify:tokens (124-token parity guard)
        │     • Commits refreshed dist/* + native token paths if exports changed
        │
        └─► sync-supernova.yml
              • supernova sync-tokens → Supernova design system portal
```

**Verified chain (source):**

| Workflow | Path trigger on `main` | Job |
|----------|------------------------|-----|
| `build-tokens.yml` | `tokens/tokens.json`, generators, `package.json` | Export tokens (web + Swift + Compose + Flutter) |
| `sync-supernova.yml` | `tokens/tokens.json`, `supernova.settings.json` | Push tokens to Supernova |

**Acceptance check (manual):** merge a token-only PR → confirm `build-tokens` and `sync-supernova` runs appear on the `main` commit → confirm Supernova portal reflects new values.

### Visual regression (React)

| Workflow | Trigger on `main` | Behavior |
|----------|-------------------|----------|
| `chromatic.yml` | `web/src/**`, `dist/tokens.theme.css`, workflow file | Chromatic snapshot with `--auto-accept-changes=main` — baselines update on main |

### Native / web test gates

| Workflow | Trigger on `main` (paths) | Jobs |
|----------|---------------------------|------|
| `native-tests.yml` | `lib/**`, `ios/**`, `android/**`, goldens, `tool/**`, tokens, etc. | Flutter goldens, analyze, iOS compile, Android compile, parity QA |
| `web-tests.yml` | `web/**`, `dist/tokens.theme.css`, tokens | Storybook build + Playwright parity |

These **verify** quality on main; they do not generate component code on other platforms.

### Slack notifications

| Source | When | Channel |
|--------|------|---------|
| `pr-slack-notify.yml` | PR **opened** / ready for review | `#design-system-updates` (5d) |
| n8n `P82tigHMhMfUl25s` | **Push** to `main` (any commit) | `#design-system-updates` |
| Figma plugin `postToSlack` | Plugin sync (if webhook configured) | `#design-system-updates` |

Post-merge, the n8n push notifier may fire on the merge commit itself. PR-open messages (5d) are separate and use the `📋 ILDS change proposed` header.

### Not triggered by component-only merges

| Workflow | Why |
|----------|-----|
| `build-tokens.yml` | No `tokens/tokens.json` change |
| `sync-supernova.yml` | Same |
| `figma-token-sync.yml` | Disabled / manual; plugin is primary token ingress |

---

## Component change — honest boundary

When a Flutter or React **component** PR merges:

1. **That platform's code** is updated in the repo (`lib/` or `web/src/`).
2. **Other platforms are not auto-generated.** iOS/Android/Flutter/React each have hand-maintained implementations.
3. **Goldens / Chromatic** on main refresh baselines for the platforms that ran in CI.
4. **Supernova** is not updated unless someone publishes docs separately.
5. **Phase 6 agent** will eventually propose cross-platform updates via `propose_change.mjs`; Phase 5 only provides the PR + approval rail.

---

## Token change — end-to-end (reference flow)

```text
Figma Variables → ILDS Plugin → commit tokens/tokens.json → PR
        → human review (GitHub + optional Slack 5d-2)
        → merge to main
        → build-tokens.yml regenerates all platform token files
        → sync-supernova.yml updates portal
        → n8n may Slack "push to main"
        → downstream apps consume dist/* / lib/design_system/ilds_tokens.dart on next pull
```

---

## Figma token ingress (related, not post-merge of every PR)

| Path | Role |
|------|------|
| **Plugin** (`ilds-plugin/`) | Primary: Sync → `tokens/tokens.json` → GitHub |
| `figma-token-sync.yml` | Optional Action (disabled); Enterprise Variables API |

Token PRs should not modify pipeline internals (`style-dictionary.config.mjs`, `build-tokens.yml`) unless explicitly a pipeline change.

---

## Verification checklist (5e acceptance)

- [ ] Token merge to `main` shows green `build-tokens` + `sync-supernova` on GitHub Actions
- [ ] `npm run verify:tokens` passes on resulting `main` (124 tokens, cross-platform parity)
- [ ] Supernova portal shows updated token values after sync
- [ ] Component-only merge does **not** run `build-tokens` (expected — path filter)
- [ ] This doc committed; team understands token auto-propagate vs component manual boundary

---

## Related docs

- `docs/PHASE5_BRANCH_PROTECTION.md` — merge gates
- `docs/PHASE5_REGRESSION_COVERAGE.md` — Chromatic + goldens
- `docs/PHASE5_PR_AUTOMATION.md` — opening PRs (`propose_change`)
- `docs/PHASE5_SLACK_NOTIFY.md` / `docs/PHASE5_SLACK_INTERACTIVE.md` — Slack on PR open
- `ILDS_PROJECT_MASTER.md` §369 (Phase 5), §408 (Phase 6)
