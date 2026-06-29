# Cursor task — Phase 6 thin vertical slice

**Date:** 2026-06-29  
**Prerequisite:** Phase 5 complete (`docs/PHASE5_COMPLETE.md`)  
**Master:** `ILDS_PROJECT_MASTER.md` §408–502

## Goal

Prove **one** end-to-end component change through the Phase 5 pipeline before building the full DS Management Agent.

```text
Human/agent edits one Flutter component
  → npm run propose:change
  → PR with 5a template
  → CI: native-tests + web-tests + Chromatic (as paths allow)
  → Slack notify (#design-system-updates) with buttons
  → Human approves on GitHub (or reviewer PAT via Slack 5d-2)
  → Merge to main
  → Post-merge: component code on main only; tokens unchanged (see PHASE5_POST_MERGE.md)
```

## Suggested first change

**Target:** One legacy `_fontSize()` component — e.g. `lib/ilds_checkbox.dart`  
**Why:** Listed in `test/typography_token_compliance_test.dart` `_legacySpacingDerivedFontSize`; real Figma parity value, not spacing arithmetic.

**Scope:**

1. Replace spacing-derived `_fontSize()` with explicit `ILDSTokens` font sizes per Figma
2. Update golden `test/golden/ilds_checkbox_golden_test.dart` on **Linux** only
3. `flutter analyze lib/` clean
4. `npm run verify:parity` green

**Do not:** touch `tokens/tokens.json`, `build-tokens.yml`, or CI workflow files in this slice.

## Guardrails (Phase 6)

| Rule | This slice |
|------|------------|
| Human approval hard gate | Merge only after GitHub review + green checks |
| No auto-merge | Branch protection enforced |
| Scope firewall | `lib/` + `test/golden/` only |
| Rollback | Document `git revert <merge-sha>` in PR body |
| Eval harness | Defer full agent eval; manual checklist in PR template suffices for slice 1 |

## Acceptance

- [ ] PR opened via `propose_change` (not direct push to `main`)
- [ ] All required branch protection checks green
- [ ] Slack message in `#design-system-updates` with PR link + buttons
- [ ] Human merge after approval
- [ ] No token pipeline run (component-only paths)

## After slice 1

- Phase 6 agent orchestration (where it runs: Cursor automation / n8n / service TBD)
- Eval harness for agent-proposed diffs
- Cross-platform component proposals (Flutter → React manual parity still human/agent per platform)

## References

- `tool/propose_change.mjs`
- `docs/PHASE5_PR_AUTOMATION.md`
- `docs/PHASE5_POST_MERGE.md`
- `docs/PHASE5_SLACK_INTERACTIVE.md`
