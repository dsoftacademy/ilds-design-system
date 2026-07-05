# Phase 5d-1 — Slack notify on PR open

**Status:** ✅ Complete (notify path)  
**Workflow:** `.github/workflows/pr-slack-notify.yml`  
**Tool:** `tool/notify_pr_slack.mjs`  
**Interactive (5d-2):** `docs/PHASE5_SLACK_INTERACTIVE.md`

## Purpose

When a pull request is opened (non-draft) or marked **ready for review**, post a rich message to `#design-system-updates` with:

- PR title and link
- Author
- **Type** and **Scope** (parsed from the 5a PR template body)
- **Platforms** (from checked boxes in the template)
- **Visual diff** — Chromatic check URL when available, otherwise a link to PR checks

This is **notify-only**. T1 alerts include a link to **ILDS Review UI** (`http://localhost:4400`)
where the human Pass/Fail or Authorize/Reject. Slack Approve buttons (5d-2) are **deprecated**
— no `ilds-slack-reviewer` PAT required. See `docs/REVIEW_UI.md`.

## One-time setup (repo admin)

1. In Slack, create or reuse an **Incoming Webhook** for `#design-system-updates`.
   - Slack app → **Incoming Webhooks** → Add to `#design-system-updates`
   - Copy the webhook URL (`https://hooks.slack.com/services/...`)

2. In GitHub: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `SLACK_WEBHOOK_URL`
   - Value: the webhook URL

3. Merge the PR that adds `pr-slack-notify.yml`. The workflow triggers on the next real PR.

> **Note:** The Figma plugin and n8n may also post to this channel (token sync / push notifications). PR-open messages use the `📋 ILDS change proposed` header so they are easy to distinguish.

## When it fires

| Event | Notifies? |
|-------|-----------|
| PR opened (non-draft) | ✅ |
| Draft PR opened | ❌ (waits for ready) |
| Draft → Ready for review | ✅ |
| New commits pushed | ❌ (no duplicate spam) |
| PR reopened | ❌ |

## Local dry-run

Preview the Slack payload without posting (requires `gh auth login`):

```bash
export GITHUB_TOKEN="$(gh auth token)"
node tool/notify_pr_slack.mjs --pr 14 --dry-run
```

To send a real message locally (use sparingly):

```bash
export GITHUB_TOKEN="$(gh auth token)"
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
node tool/notify_pr_slack.mjs --pr 14
```

## Acceptance (5d-1)

- [x] `SLACK_WEBHOOK_URL` secret configured on the repo
- [x] Opening a non-draft PR posts a message in `#design-system-updates`
- [x] Message includes working PR link and Chromatic/checks link
- [x] Draft → ready triggers exactly one notification (by design: no duplicate on push)

## What this does **not** do

- Does not merge or approve PRs (human review on GitHub — branch protection)
- Interactive buttons — see **5d-2:** `docs/PHASE5_SLACK_INTERACTIVE.md`
- Does not replace token-sync Slack messages from the plugin or n8n

## Next

- **5d-2:** `docs/PHASE5_SLACK_INTERACTIVE.md` ✅
- **5e:** `docs/PHASE5_POST_MERGE.md` ✅
- **Summary:** `docs/PHASE5_COMPLETE.md`
