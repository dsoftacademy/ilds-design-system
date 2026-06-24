#!/usr/bin/env node
/**
 * Phase 5c — Propose a design-system change as a GitHub PR with the 5a template pre-filled.
 *
 * Local usage (primary):
 *   GITHUB_TOKEN=ghp_... node tool/propose_change.mjs \
 *     --branch feat/my-change \
 *     --title "fix(flutter): example" \
 *     --type component \
 *     --scope "Button loading spinner" \
 *     --platforms flutter \
 *     --figma "13472:2877" \
 *     --files lib/ilds_button.dart
 *
 * Open PR only (branch already pushed):
 *   node tool/propose_change.mjs --branch feat/my-change --title "..." --open-only
 *
 * Sample PR (demo / acceptance test):
 *   node tool/propose_change.mjs --sample
 *
 * Env:
 *   GITHUB_TOKEN or GH_TOKEN — repo scope: contents:write, pull-requests:write
 *   GITHUB_REPOSITORY — optional owner/repo (auto-detected from git remote)
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function git(cmd, options = {}) {
  const silent = options.silent ?? false;
  if (silent) {
    return execSync(`git ${cmd}`, { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  }
  execSync(`git ${cmd}`, { cwd: REPO_ROOT, stdio: 'inherit' });
  return '';
}

function gitSilent(cmd) {
  return git(cmd, { silent: true });
}

function configureGitCredentials(token, owner, repo) {
  if (!token) return;
  const authedUrl = `https://x-access-token:${token}@github.com/${owner}/${repo}.git`;
  gitSilent(`remote set-url origin ${authedUrl}`);
}

function parseRemote() {
  const envRepo = process.env.GITHUB_REPOSITORY;
  if (envRepo?.includes('/')) {
    const [owner, repo] = envRepo.split('/');
    return { owner, repo: repo.replace(/\.git$/, '') };
  }

  const url = gitSilent('remote get-url origin');
  const match = url.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
  if (!match) {
    throw new Error(`Could not parse GitHub owner/repo from origin: ${url}`);
  }
  return { owner: match[1], repo: match[2] };
}

function platformCheckboxes(platforms) {
  const selected = new Set(
    platforms
      .split(',')
      .map((p) => p.trim().toLowerCase())
      .filter(Boolean),
  );
  const rows = [
    ['react', 'React (Storybook / `web/src/`)'],
    ['flutter', 'Flutter (`lib/`, golden tests)'],
    ['ios', 'iOS (`ios/`)'],
    ['android', 'Android (`android/`)'],
  ];
  return rows
    .map(([key, label]) => `- [${selected.has(key) ? 'x' : ' '}] ${label}`)
    .join('\n');
}

function buildPrBody({
  changeType,
  scope,
  platforms,
  figma,
  chromatic,
  goldens,
  extra,
}) {
  return `## What changed

- **Type:** ${changeType || 'component'}
- **Scope:** ${scope || '_Describe the change._'}

${extra ? `${extra}\n\n` : ''}## Platforms affected

${platformCheckboxes(platforms || '')}

## Visual diff

- **Chromatic (React):** ${chromatic || '_Add Chromatic build URL from PR checks after CI runs._'}
- **Flutter goldens:** ${goldens || '_N/A unless Flutter UI changed — list files + Linux regen note._'}

## Figma reference(s)

- **Figma node(s):** ${figma || '_Node ID(s) or Figma URL._'}

## Checklist

- [ ] \`npm run verify:parity\` green (64/64)
- [ ] \`npm run verify:tokens\` green (124 tokens)
- [ ] \`flutter analyze lib/\` clean (if Flutter touched)
- [ ] Flutter goldens updated on **Linux** only (if Flutter UI changed)
- [ ] No hardcoded colors/spacing/typography outside \`ILDSTokens\` / design tokens
- [ ] Token pipeline internals **not** modified unless this PR is explicitly a token-pipeline change

## Human sign-off

- [ ] DS owner reviewed and approved
`;
}

async function githubRequest(token, method, apiPath, body) {
  const response = await fetch(`https://api.github.com${apiPath}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(
      `GitHub API ${method} ${apiPath} failed (${response.status}): ${
        data.message || text.slice(0, 400)
      }`,
    );
  }
  return data;
}

async function createPullRequest(token, owner, repo, { title, head, base, body }) {
  return githubRequest(token, 'POST', `/repos/${owner}/${repo}/pulls`, {
    title,
    head,
    base,
    body,
  });
}

function findExistingPr(token, owner, repo, head, base) {
  return githubRequest(
    token,
    'GET',
    `/repos/${owner}/${repo}/pulls?head=${owner}:${head}&base=${base}&state=open`,
  ).then((prs) => prs[0] ?? null);
}

const { values: args } = parseArgs({
  options: {
    branch: { type: 'string', short: 'b' },
    title: { type: 'string', short: 't' },
    base: { type: 'string', default: 'main' },
    type: { type: 'string', default: 'component' },
    scope: { type: 'string' },
    platforms: { type: 'string', default: '' },
    figma: { type: 'string', default: '' },
    chromatic: { type: 'string', default: '' },
    goldens: { type: 'string', default: '' },
    files: { type: 'string', multiple: true, default: [] },
    message: { type: 'string' },
    'open-only': { type: 'boolean', default: false },
    sample: { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (args.help) {
  console.log(`Usage: node tool/propose_change.mjs --branch NAME --title "..." [options]

Options:
  --branch, -b       Feature branch name (required unless --sample)
  --title, -t        PR title (required unless --sample)
  --base             Base branch (default: main)
  --type             Change type: component | token | variant | state | infrastructure
  --scope            Short description of what changed
  --platforms        Comma-separated: react,flutter,ios,android
  --figma            Figma node ID(s) or URL
  --chromatic        Chromatic note / URL placeholder
  --goldens          Flutter golden note
  --files            Paths to stage and commit (repeatable; default: all staged files)
  --message          Commit message (default: PR title)
  --open-only        Skip git commit/push; open PR for existing remote branch
  --sample           Create a demo branch + sample doc commit + PR (acceptance test)
  --dry-run          Print actions without git push or API calls
`);
  process.exit(0);
}

function resolveGithubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  try {
    return execSync('gh auth token', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }
}

function printTokenHelp() {
  console.error(`
Error: No GitHub token found.

Option 1 — gh CLI (run in your terminal, not pasted with comments):
  gh auth login
  npm run propose:change -- --open-only ...

Option 2 — personal access token:
  export GITHUB_TOKEN=ghp_xxxxxxxx
  npm run propose:change -- --open-only ...

  Create at: https://github.com/settings/tokens
  Scopes: repo (classic) OR contents + pull requests (fine-grained)

Option 3 — GitHub Actions (no local token):
  Actions → Evolution Propose PR → Run workflow (sample checked, branch main)
`);
}

const token = resolveGithubToken();
if (!token && !args['dry-run']) {
  printTokenHelp();
  process.exit(1);
}

let branch = args.branch;
let title = args.title;
let changeType = args.type;
let scope = args.scope;
let platforms = args.platforms;
let figma = args.figma;

if (args.sample) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const runId = process.env.GITHUB_RUN_ID;
  const suffix = runId ? `run-${runId}` : stamp;
  branch = branch || `feat/phase5-propose-sample-${suffix}`;
  title = title || 'chore(phase5): propose_change sample PR (safe to close)';
  changeType = changeType || 'infrastructure';
  scope = scope || 'Phase 5c acceptance — `tool/propose_change.mjs` sample run';
  platforms = platforms || 'infrastructure';
  figma = figma || 'N/A — tooling only';
}

if (!branch || !title) {
  console.error('Error: --branch and --title are required (or use --sample).');
  process.exit(1);
}

const { owner, repo } = parseRemote();
const base = args.base;
const commitMessage = args.message || title;
const body = buildPrBody({
  changeType,
  scope,
  platforms,
  figma,
  chromatic: args.chromatic,
  goldens: args.goldens,
  extra:
    args.sample
      ? '> **Sample PR** — generated by `tool/propose_change.mjs --sample`. Close without merging.'
      : '',
});

console.log(`Repository: ${owner}/${repo}`);
console.log(`Branch: ${branch} → ${base}`);
console.log(`Title: ${title}`);

if (!args['open-only']) {
  if (args['dry-run']) {
    console.log('[dry-run] would fetch, checkout branch, commit, and push');
    if (args.sample) {
      console.log('[dry-run] would create docs/samples/propose-change-sample.md');
    }
    if (args.files.length > 0) {
      console.log(`[dry-run] would git add: ${args.files.join(', ')}`);
    }
  } else {
    gitSilent('fetch origin');

    const samplePath = 'docs/samples/propose-change-sample.md';
    if (args.sample) {
      fs.mkdirSync(path.join(REPO_ROOT, 'docs/samples'), { recursive: true });
      fs.writeFileSync(
        path.join(REPO_ROOT, samplePath),
        `# propose_change sample\n\nGenerated: ${new Date().toISOString()}\n\nSafe to delete. Close this PR without merging.\n`,
      );
      if (!args.files.includes(samplePath)) {
        args.files.push(samplePath);
      }
    }

    const currentBranch = gitSilent('branch --show-current');
    if (currentBranch !== branch) {
      try {
        gitSilent(`rev-parse --verify ${branch}`);
        git(`checkout ${branch}`);
      } catch {
        git(`checkout -b ${branch} origin/${base}`);
      }
    }

    const filesToAdd = args.files.length > 0 ? args.files : null;
    if (filesToAdd) {
      for (const file of filesToAdd) {
        if (!fs.existsSync(path.join(REPO_ROOT, file))) {
          throw new Error(`File not found: ${file}`);
        }
        git(`add ${file}`);
      }
    } else {
      const staged = gitSilent('diff --cached --name-only');
      if (!staged) {
        throw new Error(
          'No staged files. Pass --files path/to/file or git add before running.',
        );
      }
    }

    const dirty = gitSilent('diff --cached --name-only');
    if (dirty) {
      console.log(`Committing:\n${dirty.split('\n').map((f) => `  - ${f}`).join('\n')}`);
      git(`commit -m ${JSON.stringify(commitMessage)}`);
    } else {
      console.log('No staged changes to commit — continuing to push/open PR.');
    }

    configureGitCredentials(token, owner, repo);
    git(`push -u origin ${branch}`);
  }
} else {
  console.log('--open-only: skipping commit/push');
}

if (args['dry-run']) {
  console.log('\n[dry-run] PR body preview:\n');
  console.log(body);
  console.log('\n[dry-run] would POST /repos/{owner}/{repo}/pulls');
  process.exit(0);
}

const existing = await findExistingPr(token, owner, repo, branch, base);
if (existing) {
  console.log(`\n✅ Open PR already exists: ${existing.html_url}`);
  process.exit(0);
}

const pr = await createPullRequest(token, owner, repo, {
  title,
  head: branch,
  base,
  body,
});

console.log(`\n✅ Pull request opened: ${pr.html_url}`);
console.log('CI should start on the pull_request event.');
