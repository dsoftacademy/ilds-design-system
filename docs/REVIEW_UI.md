# ILDS Visual Review Surface

The human's only interface. Rendered components + plain-language objectives.
Never code, never diffs, never adversary findings, never blind buttons.

## For Pratishek — how to run it

Two terminal commands, once per review session:

```bash
# 1. Start the component preview (from the repo root)
cd ilds_component_playground_app && flutter run -d web-server --web-port 8080

# 2. Start the review surface (new terminal, repo root)
ILDS_REVIEWER_TOKEN=<your token> node tool/review_ui/server.mjs
```

Open http://localhost:4400. Component cards show the **playground panel inline** (iframe)
next to the objective and verdict buttons — no tab-switching. Control-plane cards
still show Impact Summary text only.

- **Component card** → rendered preview + "What to check" + **Pass** / **Fail**
- **Control-plane card** → no visual exists. You get a plain-language impact
  summary (what changes, why, risk). **Authorize** or **Reject** from that.

Your Pass/Authorize submits a GitHub approval **as you** — that is what
satisfies branch protection. The bot then auto-merges. You never touch GitHub.

### Your token (one-time setup)

Create a fine-grained personal access token on **your** GitHub account
(github.com → Settings → Developer settings → Fine-grained tokens):

- Repository: `dsoftacademy/ilds-design-system` only
- Permissions: Pull requests → Read and write, Issues → Read and write
- Never use the bot's token here. The server detects bot tokens and
  refuses to submit verdicts with them (read-only mode).

## Invariants (agents: do not weaken)

1. A verdict button renders only when there is something to inspect:
   content PR → `## Visual Objective` section in the PR body;
   control-plane PR → `## Impact Summary` section. Missing section = the PR
   stays "with the agents". No blind approvals.
2. Only bot-authored (`uniquedesignpratishek-maker`) PRs appear at all.
3. PRs appear only when every check is green — adversary findings are fixed
   by agents *before* the human ever sees the work.
4. Verdicts use `ILDS_REVIEWER_TOKEN` (the human's identity). Bot tokens are
   demoted to read-only at startup (`tool/lib/pr_authorship.mjs` list).
5. `tool/review_ui/` is control-plane (`review_router_classify.mjs`) — changes
   to this surface themselves require an Impact Summary authorization.

## PR body contract (agents)

Every agent PR must carry exactly one of:

```markdown
## Visual Objective
<plain language: which panel, which states, what correct looks like.
Written for someone who will never read the code.>
```

```markdown
## Impact Summary
<plain language: what changes, why, risk level, blast radius, rollback.>
```

## Post-merge checks

`tool/review_ui/queue.json` holds visual checks for work that merged without
one (e.g. #42). Fail verdicts open a `visual-fail` GitHub issue automatically.
