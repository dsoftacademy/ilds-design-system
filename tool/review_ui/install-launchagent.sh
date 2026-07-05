#!/usr/bin/env bash
# Install macOS LaunchAgent so the review UI opens at login each day.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PLIST_SRC="$ROOT/tool/review_ui/com.ilds.review-ui.plist.template"
PLIST_DEST="$HOME/Library/LaunchAgents/com.ilds.review-ui.plist"

mkdir -p "$HOME/Library/LaunchAgents"
sed "s|REPO_ROOT|${ROOT}|g" "$PLIST_SRC" > "$PLIST_DEST"
launchctl unload "$PLIST_DEST" 2>/dev/null || true
launchctl load "$PLIST_DEST"
echo "Installed LaunchAgent → $PLIST_DEST"
echo "Review UI will start at login and open http://localhost:4400/login"
echo "Logs: /tmp/ilds-review-ui.log"
