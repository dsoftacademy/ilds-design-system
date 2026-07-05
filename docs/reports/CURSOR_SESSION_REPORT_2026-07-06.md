# Cursor session report for Claude — 2026-07-05/06

**Audience:** Claude (adversary/orchestrator/doc author)  
**Author:** Cursor session with Pratishek (`dsoftacademy`)  
**Repo:** `dsoftacademy/ilds-design-system`  
**Purpose:** Full record of what was built, merged, decided, and why — including merge/Slack/review flows. Read this before continuing agent work.

**Companion files (read in order):**
1. `docs/reports/HANDOFF_NEW_CHAT_2026-07-05.md` — updated §0–§6 (on branch `chore/agent-handoff-2026-07-06`, PR #46)
2. `docs/CURSOR_AGENT_RULES.md` — mandatory git/PR rules for Cursor (same branch as #46)
3. `docs/REVIEW_UI.md` — portal runbook (on `main`)
4. `docs/CONTROL_PLANE_INTEGRITY.md` — L1–L12 gate (on `main`, L12 updated)
5. `.cursor/rules/ilds-human-and-git.mdc` — Cursor rule (local workspace only; **not yet on `main`**)

---

## Executive summary

Today we **shipped the human's only interface** (ILDS UI Review Portal), **retired Slack as an approval path**, and **clarified that Pratishek is a visual tester only — not a git/merge driver**. Phase 7 review surface MVP (#44) and a large polish PR (#45) are **merged to `main`**. A docs-only bot PR (#46) documents the corrected operating model for future agents.

**Critical lesson for Claude:** Cursor mistakenly used `gh pr create` for #45 (human-authored). That violated L3 and recreated the "please approve my PR" loop. **All future agent PRs must use `gh workflow run bot-open-pr.yml`.** Do not ask Pratishek to authorize control-plane or git work unless he explicitly opts in.

---

## Timeline (IST evening 2026-07-05 → early 2026-07-06)

| Time (approx) | Event |
|---------------|--------|
| Earlier session | PR #44 merged — review UI MVP on `main` |
| User tested portal | Login, Slack notify, authorized #44 via portal |
| Cursor build | Login/session, header, log, full-width iframe, `start.sh` |
| User request | Remove Slack reviewer; rename portal; multi-platform; profile switcher; notifications |
| PR #45 opened | **Wrong:** `gh pr create` as `dsoftacademy` (human author) |
| PR #45 merged | Portal polish + Slack notify-only on `main` (`035db3f`) |
| User frustration | Still asked to "approve git"; handoff doc stale |
| Cursor fix | Updated handoff, `CURSOR_AGENT_RULES.md`, bot PR #46, local Cursor rule |
| L8 PAT audit | User verified `ilds-auto-merge-bot` — `repo` only, passes L8 |

---

## PRs — status and authorship

| PR | Title | Author | State | Notes |
|----|--------|--------|-------|-------|
| **#44** | Phase 7 review surface MVP | `uniquedesignpratishek-maker` ✅ | **MERGED** | First portal: server, index, queue, playground deep-link, classifier entry for `tool/review_ui/` |
| **#45** | Login, session, log, Slack retire, multi-platform | `dsoftacademy` ❌ | **MERGED** | Should have been bot-authored; merged anyway (user had authorized via portal earlier in session) |
| **#46** | Handoff + Cursor agent git rules | `uniquedesignpratishek-maker` ✅ | **OPEN** | T0 docs-only; `auto-merge` label; CI green; may sit at `REVIEW_REQUIRED` until code-owner approval — **do not nag Pratishek** |

**Open PRs:** #46 only.

---

## 1. ILDS UI Review Portal (Phase 7)

### What it is

The **single admin surface** for human review. Replaces GitHub UI and Slack Approve for the human's job.

- **Run:** `npm run review:ui` or `./tool/review_ui/start.sh` → http://localhost:4400/login
- **Auth:** Fine-grained GitHub PAT (user account), stored in `~/.ilds/review-ui/profiles.json` (mode 0600)
- **Poll:** GitHub every 20s; optional browser notifications when new items need eyes

### File map (`tool/review_ui/`)

| File | Role |
|------|------|
| `server.mjs` | HTTP server, GitHub API, verdict submission, `/api/state`, session APIs |
| `session.mjs` | Multi-profile store (`profiles.json`), cookie `ilds_review_sid` |
| `decision_log.mjs` | Append-only log + **seed** of historical decisions (#44, #42 queue item) |
| `platforms.mjs` | Cross-platform component registry + preview URL builder |
| `portal.js` | Shared client: header, profile dropdown, platform tabs, notifications |
| `index.html` | Main review queue UI |
| `login.html` | Sign-in / add account |
| `log.html` | Decision log table |
| `common.css` | Styles (responsive, platform tabs, modal) |
| `queue.json` | Post-merge visual checks (e.g. selection button after #42 — **passed**) |
| `start.sh` | Start server + open browser |
| `install-launchagent.sh` + `com.ilds.review-ui.plist.template` | Optional macOS login autostart |
| `review_ui.test.mjs` | Unit tests (13 cases) |

### Human-visible behavior

**Header:** "ILDS UI Review Portal" · Review · Check log · **profile dropdown** (switch accounts, + Add account) · Logout (modal)

**Sections on home page:**
- **Waiting for your eyes** — ready PRs + pending queue items (verdict buttons)
- **With the agents** — checks not green / missing Visual Objective or Impact Summary
- **Recently decided** — approved PRs waiting merge + completed queue items
- **Empty:** "No items for review."

**Component cards:**
- Badges: COMPONENT + platform tags (REACT, FLUTTER, IOS, ANDROID)
- Objective text → Pass/Fail → **full-width platform tabs below**
  - **React:** Storybook iframe (`localhost:6006`, env `ILDS_STORYBOOK_URL`)
  - **Flutter:** Playground iframe (`localhost:8080`, env `ILDS_PLAYGROUND_URL`)
  - **iOS / Android:** Native hints + source paths (no web embed; compile/preview guidance)

**Control-plane cards:**
- Impact Summary only — Authorize/Reject (no iframe)
- **Policy shift (2026-07-06):** Pratishek does **not** want to be default approver for control-plane. Prefer bot-only paths for guardrails; component visual gate is his only job.

### Verdict → GitHub (unchanged from #44 design)

- **Pass/Authorize** → `submitPullRequestReview` with **human's token** → GitHub `APPROVE`
- **Fail/Reject** → `REQUEST_CHANGES` (+ issue for queue fails)
- Bot tokens detected at login → **read-only** (no verdicts)
- Only **bot-authored** open PRs listed (`uniquedesignpratishek-maker`)
- Buttons render only when: checks green + section present + not already approved

### Decision log

- Path: `tool/review_ui/decision_log.json` (gitignored locally when runtime)
- **Seed on empty:** PR #44 (approved — merged), selection button post-merge check (passed)
- Appended on each verdict via portal

### Tests

```bash
npm run test:review-ui   # 13/13
npm run test:integrity   # includes L12 notify-only test
```

---

## 2. Slack reviewer — retired (NOT auto-merge logic)

### What changed

**Slack is notify-only.** Human does not approve from Slack.

| File | Change |
|------|--------|
| `tool/notify_pr_slack.mjs` | Default `interactive = false` unless `SLACK_NOTIFY_INTERACTIVE=true` |
| `tool/lib/slack_pr.mjs` | When non-interactive, adds "Open review surface" link to portal |
| `.github/workflows/review-router.yml` | `SLACK_NOTIFY_INTERACTIVE: 'false'`, `ILDS_REVIEW_UI_URL: http://localhost:4400` |
| `.github/workflows/pr-slack-notify.yml` | Same env vars |
| `docs/PHASE5_SLACK_NOTIFY.md` | Documents portal link, deprecates 5d-2 buttons |
| `docs/CONTROL_PLANE_INTEGRITY.md` | L12 closed; Slack section rewritten |
| `tool/control_plane_integrity.test.mjs` | L12 test: payload has no Approve buttons, has Review UI link |
| `package.json` | Removed `slack:interactivity-server` script |

### Why

- User confirmed Slack Approve is useless with the new portal
- Slack Approve was undeployed (n8n 404), duplicated the human gate, risked blind approval
- Single approval surface = portal only (L12)

### What was NOT removed

- `tool/slack_interactivity_server.mjs` — still in repo for rollback (`SLACK_NOTIFY_INTERACTIVE=true`)
- `ilds-slack-reviewer` PAT — user can delete on GitHub (no longer required)
- Slack **notifications** on T1 PRs — still fire with PR summary + portal link

---

## 3. Auto-merge / router — what changed vs what did NOT

### ⚠️ Important for Claude

**`tool/review_router.mjs` auto-merge logic was NOT modified today.**

T0/T1 classification and auto-merge behavior remain as merged in Phase 5f:

| Tier | Classifier | Labels | Bot approval on enable? | Merge when |
|------|------------|--------|-------------------------|------------|
| **T0** | Safe docs/tests/allowlisted tools | `auto-merge` | **Yes** — bot submits `APPROVE` (does not satisfy Code Owner per L4) | Checks green + approval gate satisfied |
| **T1** | `lib/`, control-plane, ambiguous `tool/` | `needs-human` | **No** — only enables auto-merge queue | Human approval (portal Pass/Authorize) + checks green |

**Code reference:** `tool/review_router.mjs` → `autoMergeCommand()` → `autoMergePlanForTier()`:
- T0: `plan.botApproves = true` → bot APPROVE then `gh pr merge --auto --squash`
- T1: human must approve; bot arms auto-merge only

### What we changed today (merge-adjacent only)

1. **Human approval path:** Slack buttons removed → portal Pass/Fail (components) or Authorize (control-plane — **discouraged for Pratishek now**)
2. **Slack workflow env:** Forces notify-only (see §2)
3. **No change** to: branch protection, `ILDS_AUTO_MERGE_TOKEN`, classifier patterns, T0 allowlist, bot-open-pr workflow

### Bot-open-pr workflow (use this)

`.github/workflows/bot-open-pr.yml` — opens PR as `uniquedesignpratishek-maker` (L3).

```bash
git push -u origin feat/your-branch
gh workflow run bot-open-pr.yml \
  -f head=feat/your-branch \
  -f title="..." \
  -f body="## Visual Objective ... or ## Impact Summary ..."
```

**Never** `gh pr create` as `dsoftacademy`.

### PR #45 authorship incident

- Cursor used `gh pr create` → author `dsoftacademy` → L3 violation (can't self-approve)
- Still merged — likely portal authorization or admin merge before policy was clarified
- **#46 opened correctly** via bot-open-pr as demonstration

---

## 4. Control-plane integrity updates

| Item | Status |
|------|--------|
| L1–L7 | Closed (prior session) |
| L8 PAT | User audited `ilds-auto-merge-bot` — `repo` scope only, **pass** |
| L12 Slack approve | **Closed 2026-07-06** — notify-only + portal |
| `tool/review_ui/` in classifier | Control-plane (T1) — from #44 |

See `docs/CONTROL_PLANE_INTEGRITY.md` lines 79–114.

---

## 5. Classifier / protection for review UI

From #44 (`tool/lib/review_router_classify.mjs`):

```javascript
/^tool\/review_ui\//,  // CONTROL_PLANE_PATTERNS
```

Any change to the portal requires T1 + Impact Summary in PR body (unless split into T0 docs elsewhere).

---

## 6. Playground / Storybook integration

From #44 + #45:

- `ilds_component_playground_app/lib/main.dart` — `?panel=<slug>` deep link for Flutter panels
- Storybook story IDs mapped in `tool/review_ui/platforms.mjs` (e.g. `components-selection-button--default`)
- Portal shows service warnings if :8080 or :6006 offline

**Pratishek's typical dev setup:**
```bash
# Terminal 1
cd ilds_component_playground_app && flutter run -d web-server --web-port 8080
# Terminal 2 (optional, for React tab)
npm run storybook
# Terminal 3
npm run review:ui
```

---

## 7. Security notes (session)

- Leaked `gho_…` OAuth in git remote — user advised to revoke; use keychain + fine-grained tokens
- Review UI token: user account only, stored `~/.ilds/review-ui/`
- Bot token: `ILDS_AUTO_MERGE_TOKEN` — auto-merge + bot PR creation only

---

## 8. Operating model — final state for Claude

### Pratishek (human)

- **Does:** Portal visual Pass/Fail on components with render + objective
- **Does not:** git, merge, read diffs/adversary, Slack approve, routine control-plane Authorize
- **Tokens:** Fine-grained PAT for portal login only; `ilds-slack-reviewer` obsolete

### Cursor (builder)

- Implements features; pushes branches; **bot-open-pr only**
- Never assigns Pratishek git/merge tasks
- Pre-flight: bot author, CI green, portal shows item under "Waiting for your eyes"

### Claude (you)

- Adversary/orchestrator/docs; verify claims against repo
- Update handoff when state changes
- Do not reopen Slack approve loop
- Next component work: **tag + text_link typography** → bot PR → Visual Objective → portal only

---

## 9. What's on `main` vs in flight

### On `main` (HEAD `035db3f` + merge commit)

- Full `tool/review_ui/` portal (MVP + polish)
- Slack notify-only
- `docs/REVIEW_UI.md`, updated `CONTROL_PLANE_INTEGRITY.md`
- `npm run review:ui`, `npm run test:review-ui`
- Playground deep-link

### Not on `main` yet

| Item | Location |
|------|----------|
| Updated handoff §0–§6 | Branch `chore/agent-handoff-2026-07-06`, PR **#46** |
| `docs/CURSOR_AGENT_RULES.md` | Same |
| `.cursor/rules/ilds-human-and-git.mdc` | **Local workspace only** (untracked) |

---

## 10. Known issues / open questions

1. **Control-plane human gate:** GitHub requires code-owner approval; portal Authorize satisfies it but Pratishek rejects being merge driver. **Open:** how guardrail PRs merge without him (T0 splits? batch policy?).
2. **#46 merge:** Bot-authored T0 docs; may need code-owner approval to land — OK to leave open.
3. **#45 human authorship:** Bad precedent; do not repeat.
4. **Handoff doc filename** still `HANDOFF_NEW_CHAT_2026-07-05.md` but content updated 2026-07-06.
5. **Typography debt:** `ilds_tag.dart`, `ilds_text_link.dart` — not started today.

---

## 11. Commands reference

```bash
# Portal
npm run review:ui
npm run test:review-ui

# Open bot PR
gh workflow run bot-open-pr.yml -f head=BRANCH -f title="..." -f body="..."

# Integrity tests
npm run test:integrity

# Classify a PR
npm run router:classify -- classify --pr N
```

---

## 12. File index for Claude (grep starting points)

| Topic | Paths |
|-------|--------|
| Portal server | `tool/review_ui/server.mjs` |
| Sessions / profiles | `tool/review_ui/session.mjs` |
| Platforms / previews | `tool/review_ui/platforms.mjs` |
| Decision log seed | `tool/review_ui/decision_log.mjs` |
| Router / auto-merge | `tool/review_router.mjs`, `tool/lib/review_router_classify.mjs` |
| Slack notify | `tool/notify_pr_slack.mjs`, `tool/lib/slack_pr.mjs` |
| Workflows | `.github/workflows/review-router.yml`, `pr-slack-notify.yml`, `bot-open-pr.yml` |
| Gate docs | `docs/CONTROL_PLANE_INTEGRITY.md` |
| Human role / agent git | `docs/CURSOR_AGENT_RULES.md`, `docs/reports/HANDOFF_NEW_CHAT_2026-07-05.md` |
| Portal runbook | `docs/REVIEW_UI.md` |
| Integrity tests | `tool/control_plane_integrity.test.mjs` |

---

*End of report. Verify all claims against `main` and open PRs before acting.*
