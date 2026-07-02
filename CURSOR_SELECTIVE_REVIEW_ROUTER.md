# Cursor task — Selective Review Router (Phase 5f, prerequisite to Phase 6)

**Date:** 2026-07-03
**Author:** Claude (with Pratishek)
**Why:** Phase 5a made *every* PR require Pratishek's approval on *all* paths, with no auto-merge — so the human became the merge operator for everything, including docs and tooling. That inverts the goal ("human vets only what needs judgment"). This must be fixed BEFORE the Phase 6 agent MVP, or the agent org drowns the single vetter in merge clicks.
**Cursor:** review against the current branch-protection setup; flag/revert tangents.

## Objective

Route each PR automatically. The human sees a PR **only** when it needs visual/judgment review. Everything else merges itself on green + clean adversary.

## Tiers

| Tier | Trigger | Outcome |
|------|---------|---------|
| **T0 — auto** | Changed files ALL within safe paths (`docs/**`, `**/*.md`, `test/**`, `tool/**`, non-protected `.github/**`) **AND** all required checks green **AND** (Phase 5f v1: no visual diff signal; Phase 6+: adversary clean) | Auto-merge. Human never sees it. |
| **T1 — human** | ANY change to `lib/ilds_*.dart`, `web/src/components/**`, `tokens/**`, `dist/**`; OR a Chromatic / Flutter-golden **visual diff**; OR the **adversary flags** anything (once live); OR classifier is unsure | Route to Pratishek with the decision packet; block until he approves. |

**Bias:** on any ambiguity, T1. Trust falls toward the human, never away.

## Phased rollout (do not block 5f on the adversary)

| Phase | T0 green gate | Adversary |
|-------|---------------|-----------|
| **5f v1 (ship now)** | All 7 required checks green + path classifier + no protected paths | Not built yet — **do not** require adversary check for T0 |
| **6 MVP (wire in)** | Same + **adversary check required** on every PR touching `lib/` / `web/src/` / `tokens/` | Blocks auto-merge when flagged; T1 regardless of paths |

This lets docs/tooling PRs auto-merge **immediately** after 5f lands, without waiting for the Agent SDK harness.

## Build

1. **`.github/workflows/review-router.yml`** — on PR open/sync:
   - Compute changed paths. If any touch a protected path (component source / tokens / dist) → label `needs-human`, stop.
   - Else query the adversary result + visual-diff status. Clean + green → label `auto-merge`; else `needs-human`.
2. **Auto-merge:** enable repo auto-merge. For `auto-merge` PRs, the bot (`uniquedesignpratishek-maker`) approves **only T0** and enables `gh pr merge --auto --squash`. Merges when required checks pass.
3. **CODEOWNERS scoped** (`.github/CODEOWNERS`): require Pratishek's review ONLY on `lib/**`, `web/src/**`, `tokens/**`, `dist/**`, `.github/workflows/**`. Remove the blanket `*` owner so docs/tooling/tests don't demand his approval.
4. **Branch-protection rulesets** (Pratishek applies in GitHub UI; document exact settings in `docs/PHASE5F_ROUTER_SETTINGS.md`): make the **adversary check** and the **router** required status checks; require review only on the CODEOWNERS paths; keep "no direct push to main."
5. **Notify:** T1 → Slack + GitHub review request to Pratishek with diff + rendered visual + adversary report. T0 → silent auto-merge, logged to `docs/adversary/SCOREBOARD.md` or a merge log.

## Guardrails (do not skip — this is where auto-merge gets dangerous)

- The bot **must never** approve a T1 PR. Enforce: bot approval cannot satisfy CODEOWNERS on protected paths.
- The **adversary is a required check** once Phase 6 MVP ships — until then, 5f v1 uses existing checks only. A red or missing adversary result blocks auto-merge even for T0 (after wire-in).
- A PR that mixes safe + protected paths is **T1** (any protected touch wins).
- The classifier is path-first: a "docs" PR that sneaks a `lib/` edit is caught by path, then by the adversary as a backstop (F-007-style "disguised change").

## Acceptance (5f v1 — before adversary exists)
- [ ] A docs/tooling PR (all checks green, safe paths only) auto-merges with **zero** human action.
- [ ] A `lib/ilds_*.dart` change routes to Pratishek and cannot merge without his approval.
- [ ] The bot cannot approve a T1 PR (verified by attempting it).
- [ ] Pratishek's merge count on T0 changes drops to zero.

## Acceptance (after Phase 6 adversary wired in)
- [ ] An adversary-flagged PR routes to Pratishek regardless of paths.
- [ ] Adversary red/missing blocks T0 auto-merge.

## DO NOT
- Do not auto-merge anything touching rendered component source, tokens, or dist.
- Do not let the bot's approval count for protected paths.
- Do not make the adversary optional — auto-merge without it is how a dodge ships.
