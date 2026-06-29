# n8n — Slack PR interactivity handler (5d-2 production)

**Purpose:** Stable HTTPS endpoint for Slack **ILDS Notifier** interactivity (Approve / Request changes buttons). Replaces dev-only `cloudflared` tunnels.

**Instance:** `ilds.app.n8n.cloud`  
**Slack app:** ILDS Notifier (`A0ANLP2UHTK`)  
**Channel:** `#design-system-updates` (`C0AN3J0DKJN`)

---

## Architecture

```text
Slack button click
  → n8n Webhook (POST, raw body)
  → HTTP Request → your handler OR Code node (verify signature + GitHub review)
  → GitHub POST /pulls/{n}/reviews
  → Slack response_url (update message)
```

**Recommended:** n8n Webhook forwards to a small always-on service running `node tool/slack_interactivity_server.mjs` (simplest — reuse repo code).

---

## Option A — Webhook → external Node service (recommended)

### 1. Deploy handler

On a VM, Railway, or Fly.io:

```bash
export SLACK_SIGNING_SECRET=...
export GITHUB_TOKEN=ghp_...   # reviewer account, NOT PR author
export PORT=3847
node tool/slack_interactivity_server.mjs --host 0.0.0.0 --port 3847
```

Public URL example: `https://ilds-slack-handler.yourdomain.com`

### 2. n8n workflow (proxy + health)

| Node | Config |
|------|--------|
| **Webhook** | POST path `slack-ilds-pr-interactions`, Raw body, Response: last node |
| **HTTP Request** | POST `https://ilds-slack-handler.yourdomain.com/slack/interactions` |
| | Body: `{{ $json.body }}` or raw passthrough |
| | Headers: forward `X-Slack-Signature`, `X-Slack-Request-Timestamp`, `Content-Type` |

**Slack Interactivity Request URL:** `https://ilds.app.n8n.cloud/webhook/slack-ilds-pr-interactions` (or your n8n webhook URL).

### 3. Secrets in n8n

Store as n8n credentials / env — never commit:

- `SLACK_SIGNING_SECRET`
- `GITHUB_TOKEN` (reviewer PAT, `pull-requests:write`)

---

## Option B — Dev tunnel (acceptance only)

```bash
SKIP_SAMPLE_PR=1 ./tool/run_5d2_acceptance.sh
```

Paste printed `https://….trycloudflare.com/slack/interactions` into Slack app → Interactivity. **URL changes every run.**

---

## Health checks

| Endpoint | Expected |
|----------|----------|
| `GET /health` | `ok` |
| Slack → Approve on test PR | Ephemeral error if self-PR; review on GitHub if reviewer PAT |

---

## GitHub self-PR rule

GitHub returns 422 if the handler token user **authored the PR**. Use a **second GitHub account** PAT for production, or approve on GitHub in the browser.

---

## Related

- `docs/PHASE5_SLACK_INTERACTIVE.md`
- `tool/slack_interactivity_server.mjs`
- `tool/run_5d2_acceptance.sh`
