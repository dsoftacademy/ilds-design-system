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

Then in Slack app → Interactivity → enable → Request URL:
  https://<tunnel-host>/slack/interactions
(run this script again — it prints the tunnel URL)

EOF
  exit 1
fi

# Load secrets without executing command substitutions in the file.
SLACK_SIGNING_SECRET="$(
  grep -E '^[[:space:]]*SLACK_SIGNING_SECRET=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '[:space:]"'"'"
)"
SLACK_WEBHOOK_URL="$(
  grep -E '^[[:space:]]*SLACK_WEBHOOK_URL=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '[:space:]"'"'" || true
)"
export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH:-}"
export SLACK_SIGNING_SECRET
export SLACK_WEBHOOK_URL
export GITHUB_TOKEN="${GITHUB_TOKEN:-$(gh auth token)}"
export PORT

if [[ -z "${SLACK_SIGNING_SECRET:-}" ]]; then
  echo "Error: SLACK_SIGNING_SECRET is empty in .env.5d2"
  exit 1
fi

free_port() {
  local pids
  pids="$(lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    echo "Stopping existing process on port $PORT..."
    kill $pids 2>/dev/null || true
    sleep 1
  fi
  pids="$(pgrep -f "cloudflared tunnel --url http://127.0.0.1:${PORT}" 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    kill $pids 2>/dev/null || true
    sleep 1
  fi
}

cleanup() {
  [[ -n "${SERVER_PID:-}" ]] && kill "$SERVER_PID" 2>/dev/null || true
  [[ -n "${TUNNEL_PID:-}" ]] && kill "$TUNNEL_PID" 2>/dev/null || true
  [[ -n "${TUNNEL_LOG:-}" && -f "$TUNNEL_LOG" ]] && rm -f "$TUNNEL_LOG"
}
trap cleanup EXIT

free_port

node "$ROOT/tool/slack_interactivity_server.mjs" --host 127.0.0.1 --port "$PORT" &
SERVER_PID=$!

for _ in $(seq 1 10); do
  if curl -fsS "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
    break
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "Error: interactivity server exited before health check passed."
    exit 1
  fi
  sleep 0.5
done

if ! curl -fsS "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
  echo "Error: interactivity server not healthy on http://127.0.0.1:${PORT}/health"
  exit 1
fi

if [[ ! -x "$CLOUDFLARED" ]]; then
  echo "Error: cloudflared not found at $CLOUDFLARED"
  exit 1
fi

TUNNEL_LOG="$(mktemp)"
"$CLOUDFLARED" tunnel --url "http://127.0.0.1:${PORT}" 2>"$TUNNEL_LOG" &
TUNNEL_PID=$!

TUNNEL_URL=""
for _ in $(seq 1 45); do
  TUNNEL_URL="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG" 2>/dev/null | head -1 || true)"
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
echo "Local:   http://127.0.0.1:${PORT}/health"
echo "Public:  ${TUNNEL_URL}/health"
echo ""
echo "Slack → ILDS Notifier → Interactivity → Request URL:"
echo "  ${INTERACT_URL}"
echo ""
echo "Waiting 20s — paste the URL in Slack and Save..."
sleep 20

if curl -fsS "${TUNNEL_URL}/health" >/dev/null; then
  echo "Public handler health: ok"
else
  echo "Warning: public health check failed — tunnel may still be warming up. Retry in Slack after 30s."
fi

cd "$ROOT"
if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
  echo "Posting interactive Slack notify locally for PR #${PR_NUMBER:-19}..."
  node tool/notify_pr_slack.mjs --pr "${PR_NUMBER:-19}" || true
fi

if [[ "${SKIP_SAMPLE_PR:-}" != "1" ]]; then
  echo "Opening sample PR..."
  npm run propose:change -- --sample || echo "Sample PR skipped or failed — tunnel is still running."
fi

echo ""
echo "Ready: click Approve on the Slack PR message, then check GitHub reviews."
echo "Leave this terminal open. Press Ctrl+C to stop handler + tunnel."

wait "$SERVER_PID"
