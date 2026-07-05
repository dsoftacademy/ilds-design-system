# Cursor agent rules — git, PRs, and the human (mandatory)

**Read with `docs/reports/HANDOFF_NEW_CHAT_2026-07-05.md` (updated §0–§6).**

## The human does NO git

Pratishek is a **visual tester only**. Never assign him:
- `git commit` / `git push` / merge / PR approval in GitHub
- "Authorize" control-plane PRs unless he explicitly asks
- Reading diffs, adversary output, or code review

His only action: **ILDS UI Review Portal** → rendered component + objective → **Pass / Fail**.

Portal: `npm run review:ui` → http://localhost:4400

## Agents own all git

Cursor (builder) and Claude (adversary/orchestrator) own commits, branches, and merge flow.

### NEVER open a PR as the human

```bash
# FORBIDDEN — creates dsoftacademy-authored PR (L3 violation, self-approval blocked)
gh pr create
```

### ALWAYS open agent PRs as the bot

1. Push your branch:
   ```bash
   git push -u origin feat/your-branch
   ```

2. Open PR via **bot-open-pr** workflow (uses `ILDS_AUTO_MERGE_TOKEN`):
   ```bash
   gh workflow run bot-open-pr.yml \
     -f head=feat/your-branch \
     -f title="feat(scope): short title" \
     -f body="$(cat <<'EOF'
   ## Visual Objective
   (component PRs — plain language for the human)

   ## Impact Summary
   (control-plane PRs only — what/why/risk)
   EOF
   )"
   ```

3. Confirm author is `uniquedesignpratishek-maker`:
   ```bash
   gh pr list --head feat/your-branch --json number,author
   ```

4. **T0 PRs** (docs/tests-only): checks green → bot auto-merges. Human not involved.

5. **T1 component PRs**: checks green + Visual Objective in body → appears in portal → human **Pass** → bot auto-merges.

6. **T1 control-plane PRs**: avoid batching unless necessary. Human is **not** the default approver for guardrail work — prefer T0 doc updates and bot-only merge paths. If control-plane must ship, use Impact Summary in body; do not nag the human on Slack or in chat.

## Pre-flight before telling the human anything

- [ ] PR authored by bot, not `dsoftacademy`
- [ ] All CI checks green (including `adversary-review`)
- [ ] Component PR has `## Visual Objective` with something inspectable
- [ ] Portal shows the item under "Waiting for your eyes" (not "With the agents")
- [ ] You are asking for **Pass/Fail on a render**, not "approve the PR"

## Current priority (2026-07-06)

1. Typography debt: `ilds_tag.dart`, `ilds_text_link.dart` (bot PR → portal visual gate)
2. Keep portal running; Slack is notify-only (links to portal)
3. Do not reopen Slack Approve or human-as-merge-driver loops
