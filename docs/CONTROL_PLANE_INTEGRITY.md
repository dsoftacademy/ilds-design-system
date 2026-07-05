# Control-plane integrity — the one gate that must never leak

**Date:** 2026-07-05
**Severity:** critical. Fix before any further agent work.
**Cursor:** this is control-plane; route to Pratishek. Build the CODE items; Pratishek applies the GitHub-settings items.

## The incident (why this exists)

PR **#35** (control-plane — it rewrites the merge router) merged with **zero human approval**. Timeline: `github-actions` labeled it `needs-human` → `uniquedesignpratishek-maker` enabled auto-merge → the same bot **merged it**. No "approved these changes" by any human. **Root cause:** branch protection did not require human approval at merge time (settings gap). **Closed 2026-07-05** via #39 + red-team proof + branch protection hardening.

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
| L12 | Approval moves to Slack and the Slack bridge approves as the bot / an unverified user | **Closed (2026-07-06):** Slack is notify-only; human verdicts go through **ILDS Review UI** (`tool/review_ui/`). No Slack Approve buttons; no reviewer PAT required. |

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
4. **Retroactive review of #35:** — **Signed off** 2026-07-05 in `docs/reports/PR35_RETROACTIVE_REVIEW.md` (code clean; breach was settings gap).

---

## Applied settings audit (2026-07-05)

Branch protection on `main` (GitHub API):

| Setting | Value |
|---------|--------|
| Required approving reviews | **1** |
| Require code owner reviews | **true** |
| Dismiss stale reviews | **true** |
| Enforce for admins | **true** |
| Required checks | parity QA, Flutter goldens/analyze, iOS/Android compile, `parity`, Chromatic, `review-router`, **`adversary-review`** |

Bot `uniquedesignpratishek-maker`: **Collaborator (Write)** on personal repo — not admin, not in CODEOWNERS.

**L8 PAT audit (owner action):** verify bot classic PAT at github.com/settings/tokens — scopes should be **`contents` + `pull_requests` only** (no `administration`). Current secret uses classic `repo` scope per §4 below — migrate to fine-grained when convenient.

---

## Slack notify (awareness only)

Slack posts T1 PR alerts to `#design-system-updates` with a link to **ILDS Review UI**
(`http://localhost:4400`). The human Pass/Fail or Authorize/Reject there — not in Slack.

- No Approve / Request changes buttons (removed 2026-07-06; superseded by Review UI).
- No `ilds-slack-reviewer` PAT or interactivity handler required.
- Legacy interactive path (`tool/slack_interactivity_server.mjs`) remains in repo but is
  **not deployed or required**; set `SLACK_NOTIFY_INTERACTIVE=true` only for rollback testing.

---

## Verification — prove each loophole is closed (red-team the gate)

Verified 2026-07-05 unless noted.

- [x] With **only the bot / zero human approval**, the PR **cannot** merge (auto-merge stays pending). — **Proven:** red-team PR #38 (`redteam-gate` workflow); re-confirmed on #39 gate. Closes L1, L2.
- [x] The **bot cannot submit an approving review** that satisfies the gate (bot approval present → still blocked). — **Proven:** #38/#39 stayed `REVIEW_REQUIRED` with bot auto-merge armed; `test:integrity` L4. Closes L4.
- [x] The **human author cannot self-approve** (PR authored by bot, so this can't arise; verify authorship). — **Proven:** #36 closed (human-authored); #39+#41+#42 bot-authored. Closes L3.
- [x] Pushing a **new commit after approval** re-requires approval. — **Configured:** `dismiss_stale_reviews: true` on `main` (API audit 2026-07-05). Closes L9.
- [x] A PR that **edits the classifier / a workflow / CODEOWNERS** is T1 and needs human review. — **Proven:** classifier tests L6/L7; #39 labeled `needs-human`. Closes L5, L6, L7.
- [ ] The bot's token **cannot change branch protection** (API call fails). — **L8:** classic `repo` PAT in use (broader than ideal). Owner: confirm at github.com/settings/tokens — must **not** include `administration`; prefer fine-grained `contents` + `pull_requests` only.
- [x] Slack **does not** offer Approve buttons — T1 alerts link to ILDS Review UI instead. — **Closed 2026-07-06** (L12 superseded by `tool/review_ui/`).

## Ordering
1. ~~Pratishek applies branch-protection + bot-permission settings~~ ✅ 2026-07-05
2. ~~Cursor lands PR-authorship→bot + CODEOWNERS catch-all + classifier + #35 retro~~ ✅ #39 merged
3. ~~Run red-team verification~~ ✅ #38/#39
4. ~~Slack approval as control-plane PR~~ **Superseded:** ILDS Review UI (#44 + polish).
5. **In progress:** Phase 6 debt sweep (#41 recalibrate, #42 selection-button, …).

## DO NOT
- Do not give the bot admin, or add it to any bypass list, or make it a code owner.
- Do not let any Slack/automation path approve as the bot or an unverified user. (Slack Approve buttons removed — Review UI only.)
- Do not add an admin-override escape hatch.
- Do not resume agent-org work until the red-team checklist passes.
