#!/usr/bin/env node
/**
 * Phase 5d — Post a Slack notification when an ILDS PR is opened for review.
 *
 * 5d-1: SLACK_WEBHOOK_URL → rich message (no buttons)
 * 5d-2: SLACK_BOT_TOKEN + SLACK_CHANNEL_ID → message with Approve / Request changes buttons
 *
 * Called from .github/workflows/pr-slack-notify.yml (primary).
 * Local dry-run:
 *   GITHUB_TOKEN=$(gh auth token) node tool/notify_pr_slack.mjs --pr 14 --dry-run
 *
 * Env:
 *   SLACK_WEBHOOK_URL — incoming webhook (5d-1 fallback)
 *   SLACK_BOT_TOKEN — bot token with chat:write (5d-2 interactive buttons)
 *   SLACK_CHANNEL_ID — channel ID e.g. C0AN3J0DKJN (required with bot token)
 *   GITHUB_TOKEN or GH_TOKEN — repo read
 *   GITHUB_REPOSITORY — owner/repo (auto-detected from git remote if omitted)
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import {
  buildSlackPayload,
  findChromaticDetailsUrl,
  githubRequest,
  parsePrBody,
  postSlackBotMessage,
  postSlackWebhook,
} from './lib/slack_pr.mjs';

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

const { values: args } = parseArgs({
  options: {
    pr: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (args.help) {
  console.log(`Usage: node tool/notify_pr_slack.mjs --pr <number> [--dry-run]

Posts a rich Slack message for an open PR (Phase 5d).

Env: SLACK_BOT_TOKEN + SLACK_CHANNEL_ID (interactive) or SLACK_WEBHOOK_URL (notify-only)`);
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

const botToken = process.env.SLACK_BOT_TOKEN;
const channelId = process.env.SLACK_CHANNEL_ID;
const webhookUrl = process.env.SLACK_WEBHOOK_URL;
const interactive = Boolean(botToken && channelId);

if (!interactive && !webhookUrl && !args['dry-run']) {
  console.error(
    'Error: set SLACK_BOT_TOKEN + SLACK_CHANNEL_ID (5d-2) or SLACK_WEBHOOK_URL (5d-1), or use --dry-run',
  );
  process.exit(1);
}

const { owner, repo } = parseRemote();
const repoSlug = `${owner}/${repo}`;

const pr = await githubRequest(token, 'GET', `/repos/${owner}/${repo}/pulls/${prNumber}`);
const parsed = parsePrBody(pr.body ?? '');
const chromaticUrl = await findChromaticDetailsUrl(token, owner, repo, pr.head.sha).catch(
  () => null,
);

const payload = buildSlackPayload({
  pr,
  parsed,
  chromaticUrl,
  repo: repoSlug,
  interactive: interactive,
});

if (args['dry-run']) {
  console.log(JSON.stringify({ interactive, channelId, ...payload }, null, 2));
  process.exit(0);
}

if (interactive) {
  await postSlackBotMessage(botToken, channelId, payload);
  console.log(`Slack interactive notification sent for PR #${prNumber} (bot → ${channelId})`);
} else {
  await postSlackWebhook(webhookUrl, payload);
  console.log(`Slack notification sent for PR #${prNumber} (webhook, no buttons)`);
}
