# Phase 5f+ — Auto-merge on approval (T1)

**Decision (Pratishek, 2026-07-05):** the human's action on a T1 PR is the **decision** (approve / reject / fix / acknowledge), never the git mechanic. Today the router only auto-merges T0; T1 makes the human approve *and* click Merge. Close that gap.

## Goal
For a T1 (`needs-human`) PR, once the required **human approving review** is in and all required checks pass, the **bot completes the merge**. The human clicks **Approve** (the decision) and nothing else — never the green Merge button, even for control-plane.

## Why this is safe
GitHub's "enable auto-merge" is **not** "merge now" — it queues the merge to fire **only when every branch-protection requirement is met**, which for T1 paths includes the **CODEOWNERS human review**. So enabling auto-merge on a `needs-human` PR cannot merge it without the human: GitHub holds it until the human approves. The bot never approves and never bypasses review — it only pre-arms the merge so the human's approval is the trigger.

## Change
In `tool/review_router.mjs` (control-plane):
- Today: the `auto-merge` step **skips** any PR labeled `needs-human` ("bot must not auto-merge").
- New: for `needs-human` PRs, **enable GitHub auto-merge (squash)** via the bot token — do **not** skip. GitHub will hold the merge until the required human review + checks are satisfied, then merge.
- Keep unchanged for T0: enable auto-merge (merges on checks only, no review required).

## Hard guardrails (must hold)
- The **bot must never submit an approving review.** It only enables auto-merge. The human's review is the sole approval; that's non-negotiable for control-plane.
- Branch protection stays: CODEOWNERS review required on `lib/`, `web/src/`, `tokens/`, `dist/`, and all control-plane paths; `dismiss stale approvals` on (a new commit re-requires human approval → auto-merge re-holds).
- If the human requests changes or the adversary blocks, auto-merge does not fire.
- The "acknowledge pre-existing debt" path (`PREEXISTING_DEBT_POLICY.md`) counts as the human decision that releases auto-merge; the bot still never acknowledges.

## Acceptance
- [ ] Approving a T1 PR (control-plane or component) merges it automatically, with **no** human merge click.
- [ ] A T1 PR with no human approval never merges (bot-enabled auto-merge stays pending).
- [ ] The bot cannot and does not submit the approving review (verified by attempting it).
- [ ] Pratishek's manual merge clicks → zero, on both T0 and T1.

## Note
This is a control-plane change (`tool/review_router.mjs`) — it routes to Pratishek for review, and it's the last merge he clicks by hand: after it lands, approval is the only action.
