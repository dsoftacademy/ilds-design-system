#!/usr/bin/env node
/**
 * CI entry for the required `adversary-review` check — routes by PR path:
 *   component → run_review.mjs (catalog + Opus judge)
 *   control-plane → test:integrity (L1–L8)
 *   safe T0 only → explicit skip report (Chromatic pattern)
 *
 *   node tool/adversary/pr_gate.mjs --pr 42 [--output report.md]
 */

import fs from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { githubRequest } from '../lib/slack_pr.mjs';
import {
  routePrGate,
  controlPlaneGateReportMarkdown,
  safeContentSkipReportMarkdown,
} from './scope.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const RUN_REVIEW = path.join(REPO_ROOT, 'tool/adversary/run_review.mjs');

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

async function fetchPrFiles(token, owner, repo, prNumber) {
  const files = [];
  let page = 1;
  while (true) {
    const batch = await githubRequest(
      token,
      'GET',
      `/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100&page=${page}`,
    );
    if (!Array.isArray(batch) || batch.length === 0) break;
    files.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }
  return files;
}

function writeReport(report, outputPath) {
  console.log(report);
  if (outputPath) fs.writeFileSync(outputPath, report);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n${report}\n`);
  }
}

function runComponentReview(prNumber, outputPath) {
  const args = ['--pr', String(prNumber)];
  if (outputPath) args.push('--output', outputPath);
  const result = spawnSync(process.execPath, [RUN_REVIEW, ...args], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    env: process.env,
  });
  return result.status ?? 1;
}

function runControlPlaneIntegrity() {
  const result = spawnSync('npm', ['run', 'test:integrity'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: process.env,
  });
  const output = [result.stdout, result.stderr].filter(Boolean).join('\n');
  return { passed: result.status === 0, output };
}

async function main(opts) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN required for --pr');
  const { owner, repo } = parseRemote();
  const pr = await githubRequest(token, 'GET', `/repos/${owner}/${repo}/pulls/${opts.pr}`);
  const prFiles = await fetchPrFiles(token, owner, repo, opts.pr);
  const meta = { prNumber: opts.pr, headSha: pr.head.sha, repo: `${owner}/${repo}` };
  const mode = routePrGate(prFiles);

  console.log(`PR gate mode: ${mode} (${prFiles.length} files)`);

  if (mode === 'component') {
    const code = runComponentReview(opts.pr, opts.output);
    process.exit(code);
  }

  if (mode === 'control-plane') {
    const { passed, output } = runControlPlaneIntegrity();
    const report = controlPlaneGateReportMarkdown(prFiles, meta, { passed, output });
    writeReport(report, opts.output);
    process.exit(passed ? 0 : 1);
  }

  const report = safeContentSkipReportMarkdown(meta);
  writeReport(report, opts.output);
  process.exit(0);
}

const { values: args } = parseArgs({
  options: {
    pr: { type: 'string' },
    output: { type: 'string' },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (args.help) {
  console.log('Usage: node tool/adversary/pr_gate.mjs --pr <number> [--output report.md]');
  process.exit(0);
}

if (!args.pr) {
  console.error('--pr is required');
  process.exit(1);
}

main(args).catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
