# Control-plane integrity — the one gate that must never leak

**Date:** 2026-07-05
**Severity:** critical. Fix before any further agent work.
**Cursor:** this is control-plane; route to Pratishek. Build the CODE items; Pratishek applies the GitHub-settings items.

## The incident (why this exists)

PR **#35** (control-plane — it rewrites the merge router) merged with **zero human approval**. Timeline: `github-actions` labeled it `needs-human` → `uniquedesignpratishek-maker` enabled auto-merge → the same bot **merged it**. No "approved these changes" by any human. The bot bypassed the required review, and because PRs are authored by the human's own account (`dsoftacademy`), a valid human approval was impossible anyway. **The control-plane gate does not currently exist.**

## The invariant (the whole point, in one line)

> **No control-plane or protected-content PR reaches `main` without a genuine approving review from a human who did not author it — and neither the bot, an agent, nor an admin shortcut can forge, skip, or bypass that review.**

Everything below exists to make that invariant true and keep it true.

---

## Threat model — every loophole and its closure

| # | Loophole (how the gate leaks) | Closure |
|---|-------------------------------|---------|
| L1 | Bot has admin / bypass rights → auto-merge completes without review (THIS incident) | Bot = **write** access only, never admin. Remove it from every branch-protection bypass/allowlist. |
| L2 | Branch protection doesn't enforce review against admins/bots | Turn ON **"Do not allow bypassing the above settings"** (include administrators). Require ≥1 approval **and** Code Owners review. |
| L3 | Human can't approve because they authored the PR | **All agent/CI PRs are authored by the bot** (`uniquedesignpratishek-maker`); the human (`dsoftacademy`) approves. |
| L4 | Bot submits an approving review to satisfy "require approvals" | Bot is **not** a code owner. `CODEOWNERS` lists humans only, and "require Code Owners review" is on → a bot approval never satisfies the gate. Router code also never calls approve for T1 (keep the test). |
| L5 | A new control-plane file is added with no `CODEOWNERS` entry → no owner required | `CODEOWNERS` ends with a **catch-all** `* @dsoftacademy` so *everything* has a human owner; safe T0 paths are allowed to auto-merge by the router, not by dropping their owner. Classifier stays **default-deny** for `tool/`. |
| L6 | A PR quietly edits a workflow to remove the adversary/router as a required check, then merges | Workflow files (`.github/**`) are control-plane (CODEOWNERS + classifier T1) → human review required. Required checks are also pinned in branch protection (settings, not editable by the bot). |
| L7 | Router classifier is edited to mark `lib/` or control-plane as T0 (self-modification) | Already closed (#29): classifier + governance tooling are CONTROL_PLANE, `tool/` is default-deny, and a test asserts a classifier change is T1. Keep that test; add the runner + this doc to CONTROL_PLANE patterns. |
| L8 | Bot's token/PAT can change branch protection via API → disable the gate, then merge | Bot token has **no admin/repo-administration scope**. Branch protection / rulesets are editable only by a human owner. |
| L9 | Stale approval: human approves, agent pushes a new commit, auto-merge fires on the old approval | **"Dismiss stale pull request approvals when new commits are pushed"** = ON. Re-approval required after any new commit. |
| L10 | An "emergency override" / admin-merge escape hatch becomes the routine bypass | **No override path.** If a real emergency needs a bypass, it is a deliberate, logged, human-only settings change — never a standing feature. |
| L11 | Squash/rebase merge lets the bot merge as itself without review gate | Merge method doesn't change the review requirement — L1/L2 cover it. Bot merging is fine *only after* GitHub confirms the human review + checks (which L1/L2 enforce). |
| L12 | Approval moves to Slack and the Slack bridge approves as the bot / an unverified user | See the Slack section — the bridge submits the review **as the human's GitHub identity**, verifies the Slack signing secret, and verifies the clicking user is the authorized human. Slack is a trigger for a real human approval, never a substitute. |

---

## Fixes — who does what

### Pratishek (GitHub settings — I can't do these from here)
Branch protection / ruleset on `main`:
1. Require a pull request before merging.
2. Require **≥1 approving review**.
3. Require **review from Code Owners**.
4. Require status checks: `review-router`, adversary check, web + native test jobs, Chromatic.
5. **Dismiss stale approvals on new commits** = ON.
6. **Do not allow bypassing the above settings** (include administrators) = ON.
7. **Bot permissions:** `uniquedesignpratishek-maker` → **Write** role, remove from any bypass/allowlist, ensure it is **not** an org/repo admin and **not** in `CODEOWNERS`.
8. Bot PAT scopes: `contents:write` + `pull-requests:write` only. **No** `administration` / repo-settings scope.

Document the exact applied settings in `docs/PHASE5F_ROUTER_SETTINGS.md`.

### Cursor (code / CI)
1. **PR authorship → bot.** All agent/CI PR creation (`tool/propose_change.mjs`, the agent-org runner, adversary flows) opens PRs as `uniquedesignpratishek-maker`, never the human. Add a check/test. — **landed in `tool/lib/pr_authorship.mjs` + `propose_change.mjs`**
2. **CODEOWNERS catch-all:** add `* @dsoftacademy` as the final line (humans own everything by default); keep the explicit control-plane entries above it. Confirm the bot is not an owner anywhere. — **landed**
3. **Classifier:** add `tool/review_router.mjs`, `tool/lib/review_router_classify*`, and this doc to CONTROL_PLANE patterns (extend #29's set); keep default-deny + the self-modification test. — **landed**
4. **Retroactive review of #35:** #35 merged unreviewed — re-open its diff for human review (or a follow-up PR that re-applies it under review) and confirm nothing unintended landed. — **`docs/reports/PR35_RETROACTIVE_REVIEW.md`**

---

## Slack approval (Pratishek's mobile ask) — done safely

Goal: Pratishek approves/rejects from Slack (incl. phone); GitHub stays the enforcement point.

**Design (non-negotiable properties):**
- Slack is a **trigger**, not the source of truth. The gate remains GitHub's required human review.
- On a T1 PR, the bot posts the **plain-language decision card** (from `PREEXISTING_DEBT_POLICY.md`) to Slack with **Approve / Reject** buttons and a deep link.
- On tap, the interactivity endpoint MUST:
  1. **Verify the Slack signing secret** (request authenticity).
  2. **Verify the clicking Slack user is Pratishek** (authorization — a fixed allowlist of Slack user IDs; nobody else's tap counts).
  3. Submit the GitHub review **as Pratishek's own GitHub identity** (his OAuth token, obtained via a one-time "Sign in with GitHub" for the Slack app; stored encrypted). This makes GitHub record a **real human Code-Owner approval** — not a bot approval (which L4 would reject anyway).
  4. **Log** the action (who, which PR, decision, time) to `docs/adversary/DEBT_LEDGER.md` or an audit log.
- **The bot's own token must never be used to approve.** If Pratishek's identity/token is unavailable, the action fails closed (no approval) — never falls back to a bot approval.
- Reject → posts "changes requested" as Pratishek; auto-merge cannot fire.
- This is its **own** control-plane build (`tool/slack_*`), reviewed by Pratishek, and it depends on the GitHub gate above already being fixed — Slack must sit *on top of* a working gate, never replace it.

**Why acting-as-human, not a GitHub App:** a GitHub App review counts as a bot review, which (by L4) does not satisfy Code-Owner approval. Only Pratishek's user identity produces the human approval GitHub enforces. Hence per-user OAuth.

---

## Verification — prove each loophole is closed (red-team the gate)

Do these on a throwaway control-plane PR:
- [ ] With **only the bot / zero human approval**, the PR **cannot** merge (auto-merge stays pending). — closes L1, L2, L12.
- [ ] The **bot cannot submit an approving review** that satisfies the gate (bot approval present → still blocked). — L4.
- [ ] The **human author cannot self-approve** (PR authored by bot, so this can't arise; verify authorship). — L3.
- [ ] Pushing a **new commit after approval** re-requires approval. — L9.
- [ ] A PR that **edits the classifier / a workflow / CODEOWNERS** is T1 and needs human review. — L5, L6, L7.
- [ ] The bot's token **cannot change branch protection** (API call fails). — L8.
- [ ] Slack **Approve by a non-Pratishek user** does nothing; Slack Approve by Pratishek records **his** GitHub approval. — L12.

If any box can't be checked, the gate is still open — stop and fix before proceeding.

## Ordering
1. Pratishek applies the branch-protection + bot-permission settings (closes the live hole immediately).
2. Cursor lands PR-authorship→bot + CODEOWNERS catch-all + classifier extension + #35 retroactive review.
3. Run the red-team verification above.
4. Only then: build Slack approval as its own reviewed control-plane PR.
5. Only then: resume Phase 6 org work.

## DO NOT
- Do not give the bot admin, or add it to any bypass list, or make it a code owner.
- Do not let any Slack/automation path approve as the bot or an unverified user.
- Do not add an admin-override escape hatch.
- Do not resume agent-org work until the red-team checklist passes.
