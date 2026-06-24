#!/usr/bin/env node
/**
 * Phase 5d-1 — Post a Slack notification when an ILDS PR is opened for review.
 *
 * Called from .github/workflows/pr-slack-notify.yml (primary).
 * Local dry-run:
 *   GITHUB_TOKEN=$(gh auth token) node tool/notify_pr_slack.mjs --pr 14 --dry-run
 *
 * Env:
 *   SLACK_WEBHOOK_URL — Slack incoming webhook for #design-system-updates
 *   GITHUB_TOKEN or GH_TOKEN — repo read (fetch PR body + Chromatic check URL)
 *   GITHUB_REPOSITORY — owner/repo (auto-detected from git remote if omitted)
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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

async function githubRequest(token, method, apiPath) {
  const response = await fetch(`https://api.github.com${apiPath}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
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

function cleanTemplateValue(raw) {
  if (!raw) return '—';
  let value = raw.replace(/<!--[\s\S]*?-->/g, '').trim();
  if (!value || /^_+.*_$/.test(value) || /describe the change/i.test(value)) {
    return '—';
  }
  return value;
}

function parsePrBody(body = '') {
  const normalized = body.replace(/\r\n/g, '\n');
  const type = cleanTemplateValue(normalized.match(/\*\*Type:\*\*[ \t]*([^\n]*)/)?.[1]);
  const scope = cleanTemplateValue(normalized.match(/\*\*Scope:\*\*[ \t]*([^\n]*)/)?.[1]);
  const platforms = [];
  if (/\[x\].*React/i.test(normalized)) platforms.push('React');
  if (/\[x\].*Flutter/i.test(normalized)) platforms.push('Flutter');
  if (/\[x\].*iOS/i.test(normalized)) platforms.push('iOS');
  if (/\[x\].*Android/i.test(normalized)) platforms.push('Android');

  const chromaticRaw =
    normalized.match(/\*\*Chromatic \(React\):\*\*[ \t]*([^\n]*)/)?.[1]?.trim() ?? '';
  const chromatic =
    chromaticRaw && /^https?:\/\//i.test(chromaticRaw) ? chromaticRaw : null;

  return {
    type,
    scope,
    platforms: platforms.length ? platforms.join(', ') : '—',
    chromatic,
  };
}

async function findChromaticDetailsUrl(token, owner, repo, ref) {
  const runs = await githubRequest(
    token,
    'GET',
    `/repos/${owner}/${repo}/commits/${encodeURIComponent(ref)}/check-runs?per_page=30`,
  );
  const chromatic = (runs.check_runs ?? []).find((run) =>
    /chromatic/i.test(run.name ?? ''),
  );
  if (!chromatic) return null;
  return chromatic.details_url || chromatic.html_url || null;
}

function buildSlackPayload({ pr, parsed, chromaticUrl, repo }) {
  const prUrl = pr.html_url;
  const checksUrl = `${prUrl}/checks`;
  const visualDiff = chromaticUrl
    ? `<${chromaticUrl}|Chromatic build>`
    : parsed.chromatic
      ? `<${parsed.chromatic}|Chromatic build>`
      : `<${checksUrl}|View PR checks (Chromatic pending)>`;

  return {
    text: `ILDS PR opened: ${pr.title}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📋 ILDS change proposed — review required',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*PR*\n<${prUrl}|#${pr.number}: ${pr.title}>` },
          { type: 'mrkdwn', text: `*Author*\n@${pr.user.login}` },
          { type: 'mrkdwn', text: `*Type*\n${parsed.type}` },
          { type: 'mrkdwn', text: `*Scope*\n${parsed.scope}` },
          { type: 'mrkdwn', text: `*Platforms*\n${parsed.platforms}` },
          { type: 'mrkdwn', text: `*Visual diff*\n${visualDiff}` },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `${repo} · Merge only after DS owner approval (Phase 5)`,
          },
        ],
      },
    ],
  };
}

async function postToSlack(webhookUrl, payload) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Slack webhook failed (${response.status}): ${text.slice(0, 400)}`);
  }
}

const { values: args } = parseArgs({
  options: {
    pr: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (args.help) {
  console.log(`Usage: node tool/notify_pr_slack.mjs --pr <number> [--dry-run]

Posts a rich Slack message for an open PR (Phase 5d-1).

Env: SLACK_WEBHOOK_URL, GITHUB_TOKEN (or GH_TOKEN), GITHUB_REPOSITORY (optional)`);
  process.exit(0);
}

const prNumber = args.pr;
if (!prNumber) {
  console.error('Error: --pr <number> is required');
  process.exit(1);
}

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!token) {
  console.error('Error: GITHUB_TOKEN or GH_TOKEN is required');
  process.exit(1);
}

const webhookUrl = process.env.SLACK_WEBHOOK_URL;
if (!webhookUrl && !args['dry-run']) {
  console.error('Error: SLACK_WEBHOOK_URL is required (or use --dry-run)');
  process.exit(1);
}

const { owner, repo } = parseRemote();
const repoSlug = `${owner}/${repo}`;

const pr = await githubRequest(token, 'GET', `/repos/${owner}/${repo}/pulls/${prNumber}`);
const parsed = parsePrBody(pr.body ?? '');
const chromaticUrl = await findChromaticDetailsUrl(
  token,
  owner,
  repo,
  pr.head.sha,
).catch(() => null);

const payload = buildSlackPayload({ pr, parsed, chromaticUrl, repo: repoSlug });

if (args['dry-run']) {
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

await postToSlack(webhookUrl, payload);
console.log(`Slack notification sent for PR #${prNumber}`);
