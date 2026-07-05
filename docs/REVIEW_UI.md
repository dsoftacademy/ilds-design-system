# ILDS Visual Review Surface

The human's only interface. Rendered components + plain-language objectives.
Never code, never diffs, never adversary findings, never blind buttons.

## For Pratishek — how to run it

### Quick start (recommended)

```bash
# 1. Component preview (once per session)
cd ilds_component_playground_app && flutter run -d web-server --web-port 8080

# 2. Review surface (new terminal, repo root)
npm run review:ui
# or: ./tool/review_ui/start.sh
```

Your browser opens **http://localhost:4400/login**. Sign in once with your
fine-grained GitHub token — the session is saved locally (`~/.ilds/review-ui/`,
mode 0600) so you are not prompted again until you log out.

### Auto-start at login (macOS)

```bash
./tool/review_ui/install-launchagent.sh
```

Starts the server when you log in to your Mac. Open http://localhost:4400/login
manually the first time each day (or bookmark it).

## Pages

| URL | Purpose |
|-----|---------|
| `/login` | Sign in with your GitHub token |
| `/` | Review queue — Pass/Fail or Authorize/Reject |
| `/log` | Decision log (serial #, time, verdict, state) |

Header shows **Signed in as &lt;username&gt;**, **Check log**, and **Logout**
(with confirmation modal).

Component cards show the playground **full width below** the objective and
verdict buttons. Control-plane cards show Impact Summary text only.

- **Component card** → rendered preview + "What to check" + **Pass** / **Fail**
- **Control-plane card** → plain-language impact summary. **Authorize** or **Reject**.

Your Pass/Authorize submits a GitHub approval **as you** — that satisfies branch
protection. The bot then auto-merges.

When nothing needs your action, the home page shows **No items for review.**

### Your token (one-time setup)

Create a fine-grained personal access token on **your** GitHub account
(github.com → Settings → Developer settings → Fine-grained tokens):

- Repository: `dsoftacademy/ilds-design-system` only
- Permissions: Pull requests → Read and write, Issues → Read and write
- Never use the bot's token here. Bot tokens are detected and verdicts are disabled.

## Invariants (agents: do not weaken)

1. A verdict button renders only when there is something to inspect:
   content PR → `## Visual Objective`; control-plane PR → `## Impact Summary`.
   Missing section = the PR stays "with the agents". No blind approvals.
2. Only bot-authored (`uniquedesignpratishek-maker`) PRs appear.
3. PRs appear only when every check is green.
4. Verdicts use the signed-in human's token. Bot tokens are read-only.
5. `tool/review_ui/` is control-plane — changes require Impact Summary authorization.

## Post-merge checks

`tool/review_ui/queue.json` holds visual checks for work that merged without one.
Fail verdicts open a `visual-fail` GitHub issue. All verdicts are appended to
`tool/review_ui/decision_log.json` and visible at `/log`.
