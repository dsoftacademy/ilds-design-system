# Phase 5d-2 — Slack interactive PR approval

**Status:** Stage 5d-2 deliverable  
**Notify:** `tool/notify_pr_slack.mjs` (bot mode with buttons)  
**Handler:** `tool/slack_interactivity_server.mjs` (hosted HTTPS endpoint)

## Purpose

Extend 5d-1 Slack notifications with **Approve** and **Request changes** buttons. Clicking a button posts a **GitHub pull request review** (`APPROVE` or `REQUEST_CHANGES`). It does **not** auto-merge — branch protection, required checks, and the merge button on GitHub still apply.

## Architecture

```text
PR opened → pr-slack-notify.yml
              → notify_pr_slack.mjs (SLACK_BOT_TOKEN)
              → #design-system-updates message + action buttons

User clicks button → Slack POST → your HTTPS handler
              → verify X-Slack-Signature
              → GitHub API POST /pulls/{n}/reviews
              → update Slack message (buttons removed, status line added)
```

## One-time setup

### 1. Slack app (same app as webhook, or dedicated)

In [api.slack.com/apps](https://api.slack.com/apps):

| Setting | Value |
|---------|--------|
| **OAuth scopes (Bot)** | `chat:write`, `chat:write.public` (if posting to public channel without joining) |
| **Interactivity** | On → Request URL = `https://<your-host>/slack/interactions` |
| **Install to workspace** | Copy **Bot User OAuth Token** (`xoxb-...`) |
| **Basic Information** | Copy **Signing Secret** |

Invite the bot to `#design-system-updates` (`/invite @YourBot`).

Channel ID for `#design-system-updates`: `C0AN3J0DKJN` (verify in Slack channel details).

### 2. GitHub secrets (Actions — for notify with buttons)

| Secret | Purpose |
|--------|---------|
| `SLACK_BOT_TOKEN` | `xoxb-...` — posts messages with buttons |
| `SLACK_CHANNEL_ID` | `C0AN3J0DKJN` |
| `SLACK_WEBHOOK_URL` | *(optional fallback)* 5d-1 notify-only if bot secrets missing |

Keep `SLACK_WEBHOOK_URL` during migration if you want a fallback without buttons.

### 3. Host the interactivity handler

The handler **must** be reachable at a stable public HTTPS URL. Options:

#### Option A — n8n (recommended for ILDS stack)

1. Import or recreate a **Webhook** workflow on `ilds.app.n8n.cloud`
2. Webhook path: `/slack/ilds-pr-interactions` (POST, raw body)
3. Forward raw body + headers to a small VM/container running `node tool/slack_interactivity_server.mjs`, **or** implement the same verify + GitHub review logic in an n8n Code node (see signing verification in `tool/lib/slack_pr.mjs`)
4. Paste the n8n webhook URL into Slack app **Interactivity → Request URL**

#### Option B — Node server + tunnel (dev / light prod)

```bash
export SLACK_SIGNING_SECRET=...
export GITHUB_TOKEN=ghp_...   # pull-requests:write
export SLACK_APPROVER_USER_IDS=U0AN75TAWDS   # optional allowlist

node tool/slack_interactivity_server.mjs --port 3847
# In another terminal:
cloudflared tunnel --url http://127.0.0.1:3847
# Register https://<tunnel>.trycloudflare.com/slack/interactions in Slack
```

#### Option C — Cloud VM / Railway / Fly.io

Run `node tool/slack_interactivity_server.mjs` bound to `0.0.0.0` behind HTTPS termination. Set env vars in the host dashboard.

### 4. Handler environment

| Env | Required | Notes |
|-----|----------|-------|
| `SLACK_SIGNING_SECRET` | ✅ | From Slack app |
| `GITHUB_TOKEN` or `GH_TOKEN` | ✅ | PAT with `repo` or `pull-requests:write` — posts reviews as **that GitHub user** |
| `SLACK_APPROVER_USER_IDS` | Optional | Comma-separated Slack user IDs; if set, only those users can click buttons |
| `PORT` | Optional | Default `3847` |

**Do not** commit tokens. Store handler secrets in the host environment only.

> **Self-PR rule:** GitHub rejects `APPROVE` and `REQUEST_CHANGES` on a PR you authored. The handler `GITHUB_TOKEN` must belong to a **reviewer** (not the PR author). For solo testing, approve on GitHub in the browser instead, or use a second GitHub account PAT.

## npm scripts

```bash
npm run notify:pr-slack -- --pr 16 --dry-run
npm run slack:interactivity-server
```

## Acceptance (5d-2)

- [x] `SLACK_WEBHOOK_URL` posts messages **with Approve / Request changes buttons** (PR #19; bot token optional)
- [x] `SLACK_CHANNEL_ID` set in GitHub Actions secrets
- [x] Interactivity handler verified locally (`run_5d2_acceptance.sh` + cloudflared)
- [x] Click reaches handler; GitHub review API called
- [x] Self-PR blocked with clear Slack ephemeral message (GitHub rule)
- [ ] **Production:** stable Interactivity URL on n8n/VM (`docs/n8n/SLACK_PR_INTERACTIVITY.md`)
- [ ] **Production:** `GITHUB_TOKEN` = reviewer account (not PR author)
- [x] PR is **not** auto-merged by Slack

## Security notes

- Signing secret verification is mandatory (`tool/lib/slack_pr.mjs`)
- Use `SLACK_APPROVER_USER_IDS` in production to restrict who can approve from Slack
- Handler PAT should be a machine user or fine-grained PAT scoped to this repo only
- Buttons submit **reviews**, not merges — aligns with Phase 5 human gate

## What this does **not** do

- Does not merge PRs
- Does not bypass required CI checks
- Does not replace GitHub Code Owner review if branch protection requires it from a specific account (Slack approval uses the PAT owner's GitHub identity)

## Next

- **5e:** `docs/PHASE5_POST_MERGE.md` ✅
- **Phase 6:** `CURSOR_PHASE6_THIN_SLICE.md`
