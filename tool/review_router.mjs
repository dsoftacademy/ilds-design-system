#!/usr/bin/env node
/**
 * Phase 5f — selective review router CLI.
 *
 *   node tool/review_router.mjs classify --pr 42
 *   node tool/review_router.mjs auto-merge --pr 42
 *
 * Env:
 *   GITHUB_TOKEN or GH_TOKEN — classify/label uses GITHUB_TOKEN; auto-merge uses ILDS_AUTO_MERGE_TOKEN
 *   GITHUB_REPOSITORY — owner/repo
 *   ILDS_AUTO_MERGE_TOKEN — bot PAT for T0 auto-merge only
 *   ILDS_HUMAN_REVIEWER — GitHub login to request on T1 (default: dsoftacademy)
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { classifyFiles } from './lib/review_router_classify.mjs';
import { githubRequest } from './lib/slack_pr.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LABEL_AUTO = 'auto-merge';
const LABEL_HUMAN = 'needs-human';

function parseRemote() {
  const envRepo = process.env.GITHUB_REPOSITORY;
  if (envRepo?.includes('/')) {
    const [owner, repo] = envRepo.split('/');
    return { owner, repo: repo.replace(/\.git$/, '') };
  }
  const url = execSync('git remote get-url origin', { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  const match = url.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
  if (!match) throw new Error(`Could not parse GitHub owner/repo from origin: ${url}`);
  return { owner: match[1], repo: match[2] };
}

function token() {
  const value = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!value) throw new Error('GITHUB_TOKEN or GH_TOKEN is required');
  return value;
}

function autoMergeToken() {
  return process.env.ILDS_AUTO_MERGE_TOKEN || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
}

async function fetchPrFiles(auth, owner, repo, prNumber) {
  const files = [];
  let page = 1;
  while (true) {
    const batch = await githubRequest(
      auth,
      'GET',
      `/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100&page=${page}`,
    );
    if (!Array.isArray(batch) || batch.length === 0) break;
    for (const entry of batch) {
      if (entry.filename) files.push(entry.filename);
    }
    if (batch.length < 100) break;
    page += 1;
  }
  return files;
}

async function setRouterLabels(auth, owner, repo, prNumber, tier) {
  const pr = await githubRequest(auth, 'GET', `/repos/${owner}/${repo}/pulls/${prNumber}`);
  const current = new Set((pr.labels ?? []).map((label) => label.name));
  const wantAuto = tier === 'T0';
  const wantHuman = tier === 'T1';

  if (wantAuto && !current.has(LABEL_AUTO)) {
    await githubRequest(auth, 'POST', `/repos/${owner}/${repo}/issues/${prNumber}/labels`, {
      labels: [LABEL_AUTO],
    });
  }
  if (wantHuman && !current.has(LABEL_HUMAN)) {
    await githubRequest(auth, 'POST', `/repos/${owner}/${repo}/issues/${prNumber}/labels`, {
      labels: [LABEL_HUMAN],
    });
  }
  if (wantAuto && current.has(LABEL_HUMAN)) {
    await githubRequest(
      auth,
      'DELETE',
      `/repos/${owner}/${repo}/issues/${prNumber}/labels/${encodeURIComponent(LABEL_HUMAN)}`,
    );
  }
  if (wantHuman && current.has(LABEL_AUTO)) {
    await githubRequest(
      auth,
      'DELETE',
      `/repos/${owner}/${repo}/issues/${prNumber}/labels/${encodeURIComponent(LABEL_AUTO)}`,
    );
  }
}

async function requestHumanReviewer(auth, owner, repo, prNumber) {
  const reviewer = process.env.ILDS_HUMAN_REVIEWER || 'dsoftacademy';
  try {
    await githubRequest(auth, 'POST', `/repos/${owner}/${repo}/pulls/${prNumber}/requested_reviewers`, {
      reviewers: [reviewer],
    });
    console.log(`Requested review from @${reviewer}`);
  } catch (error) {
    console.warn(`Could not request review from @${reviewer}: ${error.message}`);
  }
}

async function classifyCommand(prNumber) {
  const auth = token();
  const { owner, repo } = parseRemote();
  const files = await fetchPrFiles(auth, owner, repo, prNumber);
  const result = classifyFiles(files);

  console.log(`PR #${prNumber}: ${result.tier} (${result.reason})`);
  if (result.triggerFile) console.log(`Trigger file: ${result.triggerFile}`);
  console.log(`Changed files (${files.length}): ${files.slice(0, 8).join(', ')}${files.length > 8 ? '…' : ''}`);

  await setRouterLabels(auth, owner, repo, prNumber, result.tier);

  if (result.tier === 'T1') {
    await requestHumanReviewer(auth, owner, repo, prNumber);
  }

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `tier=${result.tier}\nreason=${result.reason}\ntrigger_file=${result.triggerFile ?? ''}\n`,
    );
  }

  return result;
}

async function findPullRequestForSha(auth, owner, repo, sha) {
  const pulls = await githubRequest(auth, 'GET', `/repos/${owner}/${repo}/commits/${sha}/pulls`);
  if (!Array.isArray(pulls) || pulls.length === 0) return null;
  return pulls.find((pr) => pr.state === 'open') ?? pulls[0];
}

async function autoMergeCommand(prNumber, { reclassify = true } = {}) {
  const auth = autoMergeToken();
  if (!auth) throw new Error('ILDS_AUTO_MERGE_TOKEN or GITHUB_TOKEN is required for auto-merge');

  const { owner, repo } = parseRemote();
  const pr = await githubRequest(auth, 'GET', `/repos/${owner}/${repo}/pulls/${prNumber}`);

  if (pr.draft) {
    console.log(`PR #${prNumber} is draft — skipping auto-merge`);
    return { skipped: 'draft' };
  }

  if (pr.merged || pr.state !== 'open') {
    console.log(`PR #${prNumber} is not open — skipping auto-merge`);
    return { skipped: 'not-open' };
  }

  const labels = new Set((pr.labels ?? []).map((label) => label.name));
  if (!labels.has(LABEL_AUTO)) {
    console.log(`PR #${prNumber} lacks label ${LABEL_AUTO} — skipping auto-merge`);
    return { skipped: 'no-auto-merge-label' };
  }

  if (labels.has(LABEL_HUMAN)) {
    console.log(`PR #${prNumber} has ${LABEL_HUMAN} — bot must not auto-merge`);
    return { skipped: 'needs-human-label' };
  }

  if (reclassify) {
    const files = await fetchPrFiles(auth, owner, repo, prNumber);
    const result = classifyFiles(files);
    if (result.tier !== 'T0') {
      console.log(`PR #${prNumber} reclassified as ${result.tier} — bot must not auto-merge`);
      await setRouterLabels(auth, owner, repo, prNumber, result.tier);
      if (result.tier === 'T1') await requestHumanReviewer(auth, owner, repo, prNumber);
      return { skipped: 'reclassified-t1', result };
    }
  }

  if (pr.auto_merge) {
    console.log(`PR #${prNumber} already has auto-merge enabled`);
    return { skipped: 'already-enabled' };
  }

  execSync(`gh pr merge ${prNumber} --repo ${owner}/${repo} --auto --squash`, {
    env: { ...process.env, GH_TOKEN: auth, GITHUB_TOKEN: auth },
    stdio: 'inherit',
  });

  console.log(`Enabled auto-merge (squash) for PR #${prNumber}`);
  return { enabled: true };
}

const { values: args, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    pr: { type: 'string' },
    sha: { type: 'string' },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (args.help || positionals.length === 0) {
  console.log(`Usage:
  node tool/review_router.mjs classify --pr <number>
  node tool/review_router.mjs auto-merge --pr <number>
  node tool/review_router.mjs auto-merge --sha <commit>`);
  process.exit(args.help ? 0 : 1);
}

const command = positionals[0];

try {
  if (command === 'classify') {
    if (!args.pr) throw new Error('--pr is required for classify');
    await classifyCommand(args.pr);
  } else if (command === 'auto-merge') {
    const auth = autoMergeToken();
    const { owner, repo } = parseRemote();
    let prNumber = args.pr;
    if (!prNumber && args.sha) {
      const match = await findPullRequestForSha(auth, owner, repo, args.sha);
      if (!match) {
        console.log(`No open PR for sha ${args.sha}`);
        process.exit(0);
      }
      prNumber = String(match.number);
    }
    if (!prNumber) throw new Error('--pr or --sha is required for auto-merge');
    await autoMergeCommand(prNumber);
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
} catch (error) {
  console.error(error.message ?? error);
  process.exit(1);
}
