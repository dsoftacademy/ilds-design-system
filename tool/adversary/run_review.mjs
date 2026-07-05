#!/usr/bin/env node
/**
 * Adversary review — CI entry point and local debug.
 *
 *   node tool/adversary/run_review.mjs --pr 42
 *   node tool/adversary/run_review.mjs --file lib/ilds_radio.dart
 *
 * Env: ANTHROPIC_API_KEY, ILDS_ADVERSARY_REQUIRE_JUDGE=true (CI)
 *      GITHUB_TOKEN / GH_TOKEN (for --pr)
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { githubRequest } from '../lib/slack_pr.mjs';
import { runMachineChecksOnPrFiles } from './machine_checks.mjs';
import { runLlmJudge } from './llm_judge.mjs';
import { scoreFindings, formatReportMarkdown } from './score.mjs';
import { loadCatalog } from './catalog.mjs';
import { enrichFindingsWithScope } from './diff_scope.mjs';
import { applyAcknowledgements, loadDebtLedger } from './debt_ledger.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

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

function readLocalFile(relPath) {
  const full = path.join(REPO_ROOT, relPath);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, 'utf8');
}

function buildDiffFromFiles(files) {
  return files.map((f) => `--- ${f.filename}\n+++ ${f.filename}\n${f.patch ?? '(no patch)'}`).join('\n\n');
}

function dedupeFindings(findings) {
  const seen = new Set();
  return findings.filter((f) => {
    const key = `${f.id}:${f.source}:${f.summary}:${f.file ?? ''}:${f.anchor ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function finalizeFindings(rawFindings, prFiles) {
  const scoped = enrichFindingsWithScope(rawFindings, prFiles);
  const ledger = loadDebtLedger(REPO_ROOT);
  return applyAcknowledgements(scoped, ledger);
}

async function reviewChangedDart({ diff, prFiles, readFile }) {
  const machineFindings = runMachineChecksOnPrFiles(prFiles, readFile);
  const changedDart = prFiles
    .filter((f) => f.filename?.startsWith('lib/') && f.filename.endsWith('.dart'))
    .map((f) => ({ path: f.filename, content: readFile(f.filename) ?? '' }))
    .filter((f) => f.content);

  const { findings: judgeFindings, meta: judgeMeta } = await runLlmJudge({
    diff,
    changedFiles: changedDart,
  });

  const allFindings = finalizeFindings(
    dedupeFindings([...machineFindings, ...judgeFindings]),
    prFiles,
  );
  const judgeOnly = finalizeFindings(judgeFindings, prFiles);

  const combined = scoreFindings(allFindings);
  const judgeResult = scoreFindings(judgeOnly);

  return { machineFindings, judgeFindings: judgeOnly, judgeMeta, judgeResult, combined };
}

/**
 * @param {object} opts
 */
async function runReview(opts) {
  const catalog = loadCatalog();
  console.log(`Loaded ${catalog.length} catalog entries`);

  if (opts.pr) {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (!token) throw new Error('GITHUB_TOKEN required for --pr');
    const { owner, repo } = parseRemote();
    const pr = await githubRequest(token, 'GET', `/repos/${owner}/${repo}/pulls/${opts.pr}`);
    const prFiles = await fetchPrFiles(token, owner, repo, opts.pr);
    const diff = buildDiffFromFiles(prFiles);
    const meta = { prNumber: opts.pr, headSha: pr.head.sha, repo: `${owner}/${repo}` };

    const readFile = (filename) => {
      try {
        return execSync(
          `git fetch origin pull/${opts.pr}/head:refs/remotes/origin/pr-${opts.pr} 2>/dev/null; git show ${pr.head.sha}:${filename}`,
          { cwd: REPO_ROOT, encoding: 'utf8' },
        );
      } catch {
        return readLocalFile(filename);
      }
    };

    const { judgeMeta, judgeResult, combined } = await reviewChangedDart({ diff, prFiles, readFile });
    const report = formatReportMarkdown(
      { ...combined, judgeResult, judgeMeta },
      meta,
    );

    if (opts.output) fs.writeFileSync(opts.output, report);
    console.log(report);

    if (process.env.GITHUB_STEP_SUMMARY) {
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n${report}\n`);
    }

    return { ...combined, judgeResult, judgeMeta };
  }

  if (opts.file) {
    const content = readLocalFile(opts.file);
    if (!content) throw new Error(`File not found: ${opts.file}`);
    const diff = `# local review ${opts.file}\n`;
    const prFiles = [{ filename: opts.file, patch: diff, status: 'modified' }];
    const readFile = () => content;

    const { judgeMeta, judgeResult, combined } = await reviewChangedDart({ diff, prFiles, readFile });
    const report = formatReportMarkdown(
      { ...combined, judgeResult, judgeMeta },
      { repo: 'local', prNumber: opts.file },
    );
    console.log(report);
    if (opts.output) fs.writeFileSync(opts.output, report);
    return { ...combined, judgeResult, judgeMeta };
  }

  throw new Error('Provide --pr or --file');
}

const { values: args } = parseArgs({
  options: {
    pr: { type: 'string' },
    file: { type: 'string' },
    output: { type: 'string' },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (args.help) {
  console.log(`Usage:
  node tool/adversary/run_review.mjs --pr <number> [--output report.md]
  node tool/adversary/run_review.mjs --file lib/ilds_radio.dart`);
  process.exit(0);
}

runReview(args)
  .then((result) => {
    if (result.verdict === 'block') {
      console.error('\nAdversary verdict: BLOCK');
      process.exit(1);
    }
    console.log('\nAdversary verdict: PASS');
  })
  .catch((err) => {
    console.error(err.message ?? err);
    process.exit(1);
  });
