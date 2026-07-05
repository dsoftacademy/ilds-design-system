#!/usr/bin/env bash
# Start the ILDS review UI and open the sign-in page in your browser.
# Usage: ./tool/review_ui/start.sh   (from repo root)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
PORT="${ILDS_REVIEW_UI_PORT:-4400}"
URL="http://127.0.0.1:${PORT}"
PID_FILE="${TMPDIR:-/tmp}/ilds-review-ui.pid"

if [[ -f "$PID_FILE" ]]; then
  OLD_PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [[ -n "${OLD_PID}" ]] && kill -0 "$OLD_PID" 2>/dev/null; then
    echo "Review UI already running (pid ${OLD_PID}) at ${URL}"
    if command -v open >/dev/null 2>&1; then
      open "${URL}/login"
    fi
    exit 0
  fi
fi

node tool/review_ui/server.mjs &
SERVER_PID=$!
echo "$SERVER_PID" > "$PID_FILE"

for _ in $(seq 1 40); do
  if curl -sf "${URL}/login" >/dev/null 2>&1; then
    break
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "Review UI failed to start." >&2
    exit 1
  fi
  sleep 0.15
done

echo "ILDS UI Review Portal ready at ${URL}/login (pid ${SERVER_PID})"
if [[ -z "${ILDS_REVIEW_UI_NO_OPEN:-}" ]] && command -v open >/dev/null 2>&1; then
  open "${URL}/login"
elif [[ -z "${ILDS_REVIEW_UI_NO_OPEN:-}" ]]; then
  echo "Open ${URL}/login in your browser."
fi

wait "$SERVER_PID"
