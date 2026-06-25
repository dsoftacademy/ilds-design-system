#!/usr/bin/env bash
# Phase 5d-2 acceptance — start interactivity handler + tunnel, then fire a sample PR notify.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env.5d2"
PORT="${PORT:-3847}"
CLOUDFLARED="${CLOUDFLARED:-/opt/homebrew/bin/cloudflared}"

if [[ ! -f "$ENV_FILE" ]]; then
  cat <<'EOF'
Missing .env.5d2 — create it in the repo root (gitignored):

  SLACK_SIGNING_SECRET=<from Slack app → Basic Information → Signing Secret>
  GITHUB_TOKEN=$(gh auth token)
  # Optional: same webhook used in GitHub Actions (for local notify test)
  # SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

Then in Slack app → Interactivity → enable → Request URL:
  https://<tunnel-host>/slack/interactions
(run this script again — it prints the tunnel URL)

EOF
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

export GITHUB_TOKEN="${GITHUB_TOKEN:-$(gh auth token)}"
export SLACK_SIGNING_SECRET
export PORT

if [[ -z "${SLACK_SIGNING_SECRET:-}" ]]; then
  echo "Error: SLACK_SIGNING_SECRET is empty in .env.5d2"
  exit 1
fi

cleanup() {
  [[ -n "${SERVER_PID:-}" ]] && kill "$SERVER_PID" 2>/dev/null || true
  [[ -n "${TUNNEL_PID:-}" ]] && kill "$TUNNEL_PID" 2>/dev/null || true
}
trap cleanup EXIT

node "$ROOT/tool/slack_interactivity_server.mjs" --host 127.0.0.1 --port "$PORT" &
SERVER_PID=$!
sleep 1

if [[ ! -x "$CLOUDFLARED" ]]; then
  echo "Error: cloudflared not found at $CLOUDFLARED"
  exit 1
fi

TUNNEL_LOG="$(mktemp)"
"$CLOUDFLARED" tunnel --url "http://127.0.0.1:${PORT}" 2>"$TUNNEL_LOG" &
TUNNEL_PID=$!

TUNNEL_URL=""
for _ in $(seq 1 30); do
  TUNNEL_URL="$(rg -o 'https://[a-z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG" | head -1 || true)"
  [[ -n "$TUNNEL_URL" ]] && break
  sleep 1
done

if [[ -z "$TUNNEL_URL" ]]; then
  echo "Could not detect cloudflared URL. Log:"
  cat "$TUNNEL_LOG"
  exit 1
fi

INTERACT_URL="${TUNNEL_URL}/slack/interactions"
echo ""
echo "=== 5d-2 interactivity handler ==="
echo "Health:  ${TUNNEL_URL}/health"
echo "Slack Interactivity Request URL (paste in api.slack.com → your app → Interactivity):"
echo "  ${INTERACT_URL}"
echo ""
echo "Waiting 15s for you to save the Slack Interactivity URL (if not set yet)..."
sleep 15

curl -fsS "${TUNNEL_URL}/health" >/dev/null && echo "Handler health: ok"

cd "$ROOT"
if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
  echo "Posting interactive Slack notify locally..."
  node tool/notify_pr_slack.mjs --pr "${PR_NUMBER:-1}" --dry-run >/dev/null 2>&1 || true
fi

echo "Opening sample PR (triggers GitHub Actions notify when merged workflow is on branch)..."
npm run propose:change -- --sample

echo ""
echo "Check #design-system-updates for buttons. Click Approve → verify GitHub PR review."
echo "Leave this terminal open while testing (tunnel + handler run here)."

wait "$SERVER_PID"
