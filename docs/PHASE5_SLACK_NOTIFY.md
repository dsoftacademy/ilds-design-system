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

This is **notify-only** when using `SLACK_WEBHOOK_URL` alone. For **Approve / Request changes** buttons, see **5d-2:** `docs/PHASE5_SLACK_INTERACTIVE.md`.

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

- [ ] `SLACK_WEBHOOK_URL` secret configured on the repo
- [ ] Opening a non-draft PR posts a message in `#design-system-updates`
- [ ] Message includes working PR link and Chromatic/checks link
- [ ] Draft → ready triggers exactly one notification

## What this does **not** do

- Does not merge or approve PRs (human review on GitHub — branch protection)
- Does not add Slack interactive buttons (5d-2)
- Does not replace token-sync Slack messages from the plugin or n8n

## Next

- **5d-2:** Interactive approve/request-changes — `docs/PHASE5_SLACK_INTERACTIVE.md`
- **5e:** `docs/PHASE5_POST_MERGE.md`
