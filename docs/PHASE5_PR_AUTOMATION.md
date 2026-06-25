# Phase 5c — PR automation (`propose_change`)

**Status:** Stage 5c deliverable  
**Tool:** `tool/propose_change.mjs`  
**Workflow:** `.github/workflows/evolution-propose.yml` (optional `workflow_dispatch` sample)

## Purpose

Create a feature branch, commit staged changes, push to GitHub, and open a pull request with the [5a PR template](.github/pull_request_template.md) pre-filled. Phase 6 agents will call this instead of pushing to `main`.

## Token requirements

| Secret / env | Scopes | Used by |
|--------------|--------|---------|
| `GITHUB_TOKEN` (Actions) | `contents:write`, `pull-requests:write` | `evolution-propose.yml` |
| `GH_TOKEN` or `GITHUB_TOKEN` (local) | Fine-grained PAT or classic: **repo** (or `contents:write` + `pull-requests:write`) | `node tool/propose_change.mjs` |

Store local PATs outside the repo (shell env, `gh auth login`, or Cursor secrets). **Never commit tokens.**

## Local usage (primary)

### 1. Stage your changes

```bash
git checkout main && git pull origin main
# edit files…
git add lib/ilds_button.dart test/golden/ilds_button_golden_test.dart
```

### 2. Propose the PR

```bash
export GITHUB_TOKEN=ghp_...   # or: gh auth token

node tool/propose_change.mjs \
  --branch feat/flutter-button-tweak \
  --title "fix(flutter): Button loading alignment" \
  --type component \
  --scope "Align loading spinner trailing edge with Figma 13472:2877" \
  --platforms flutter \
  --figma "13472:2877" \
  --goldens "test/golden/ilds_button_golden_test.dart — regen on Linux" \
  --files lib/ilds_button.dart test/golden/ilds_button_golden_test.dart
```

The script will:

1. Create/checkout the feature branch from `origin/main`
2. Commit the listed files (or all staged files if `--files` omitted)
3. Push to `origin`
4. Open a PR with the template body populated
5. Print the PR URL

### Open PR only (branch already pushed)

```bash
node tool/propose_change.mjs \
  --branch feat/flutter-button-tweak \
  --title "fix(flutter): Button loading alignment" \
  --type component \
  --scope "..." \
  --platforms flutter \
  --open-only
```

### Sample / acceptance test

Creates `docs/samples/propose-change-sample.md`, opens a PR safe to close:

```bash
# Requires a GitHub token with repo + pull-request scope:
gh auth login
export GITHUB_TOKEN=$(gh auth token)

npm run propose:change -- --sample
```

**If push succeeded but PR open failed** (branch exists on GitHub, no PR):

```bash
npm run propose:change -- \
  --branch feat/phase5-propose-sample-YYYY-MM-DD-... \
  --title "chore(phase5): propose_change sample PR (safe to close)" \
  --type infrastructure \
  --scope "Phase 5c sample" \
  --open-only
```

### Option B — GitHub Actions (`workflow_dispatch`)

1. **Actions** → **Evolution Propose PR** → **Run workflow**
2. Branch: **main**
3. Leave **sample** checked → **Run workflow**
4. A sample PR should appear — **close without merging**

If the workflow fails, merge the latest workflow-fix PR and re-run.

### Dry run

```bash
npm run propose:change -- --sample --dry-run
```

## npm script

```bash
npm run propose:change -- --sample
```

## Acceptance (5c)

- [ ] `node tool/propose_change.mjs --sample` opens a real PR with template sections filled
- [ ] CI jobs fire on the new PR (`native-tests`, `web-tests` as path filters allow)
- [ ] `evolution-propose.yml` `workflow_dispatch` sample run succeeds

## What this does **not** do

- Does not auto-generate cross-platform component code (Phase 6)
- Does not merge PRs (human approval required — branch protection)
- Does not modify the token pipeline (`style-dictionary.config.mjs`, `build-tokens.yml`, etc.)

## Next

- **5d-1:** Slack notify on PR open — see `docs/PHASE5_SLACK_NOTIFY.md`
- **5e:** `docs/PHASE5_POST_MERGE.md`
