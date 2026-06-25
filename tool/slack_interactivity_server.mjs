#!/usr/bin/env node
/**
 * Phase 5d-2 — Slack interactivity handler for PR Approve / Request changes.
 *
 * Host this at a public HTTPS URL and register it in the Slack app:
 *   Features → Interactivity → Request URL → https://<host>/slack/interactions
 *
 * Local dev (with tunnel):
 *   GITHUB_TOKEN=ghp_... SLACK_SIGNING_SECRET=... node tool/slack_interactivity_server.mjs
 *   cloudflared tunnel --url http://127.0.0.1:3847
 *
 * Env:
 *   SLACK_SIGNING_SECRET — Slack app signing secret (required)
 *   GITHUB_TOKEN or GH_TOKEN — PAT with pull-requests:write (required)
 *   SLACK_APPROVER_USER_IDS — optional comma-separated Slack user IDs allowed to review
 *   PORT — default 3847
 *   HOST — default 127.0.0.1
 */

import http from 'node:http';
import { parseArgs } from 'node:util';
import {
  blocksAfterReview,
  isApproverAllowed,
  parsePrActionValue,
  postSlackResponseUrl,
  reviewEventForAction,
  statusLineForReview,
  submitPullRequestReview,
  verifySlackSignature,
} from './lib/slack_pr.mjs';

const { values: args } = parseArgs({
  options: {
    port: { type: 'string', default: process.env.PORT ?? '3847' },
    host: { type: 'string', default: process.env.HOST ?? '127.0.0.1' },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (args.help) {
  console.log(`Usage: node tool/slack_interactivity_server.mjs [--port 3847] [--host 127.0.0.1]

Slack interactivity endpoint for ILDS PR approve / request-changes buttons.`);
  process.exit(0);
}

const signingSecret = process.env.SLACK_SIGNING_SECRET;
const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

if (!signingSecret) {
  console.error('Error: SLACK_SIGNING_SECRET is required');
  process.exit(1);
}
if (!githubToken) {
  console.error('Error: GITHUB_TOKEN or GH_TOKEN is required');
  process.exit(1);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function handleInteraction(rawBody) {
  const params = new URLSearchParams(rawBody);
  const payload = JSON.parse(params.get('payload') ?? '{}');

  if (payload.type !== 'block_actions') {
    return { ok: true };
  }

  const action = payload.actions?.[0];
  if (!action) return { ok: true };

  const user = payload.user ?? {};
  if (!isApproverAllowed(user.id)) {
    await postSlackResponseUrl(payload.response_url, {
      response_type: 'ephemeral',
      replace_original: false,
      text: 'You are not authorized to approve ILDS PRs from Slack. Ask a DS owner to add your Slack user ID to SLACK_APPROVER_USER_IDS.',
    });
    return { ok: true };
  }

  const { owner, repo, prNumber } = parsePrActionValue(action.value);
  const reviewEvent = reviewEventForAction(action.action_id);
  const who = user.username ? `@${user.username}` : user.name ?? user.id;
  const reviewBody =
    reviewEvent === 'APPROVE'
      ? `Approved via Slack by ${who} (Phase 5d-2).`
      : `Changes requested via Slack by ${who} (Phase 5d-2).`;

  await submitPullRequestReview(githubToken, owner, repo, prNumber, {
    event: reviewEvent,
    body: reviewBody,
  });

  const statusLine = statusLineForReview(reviewEvent, user);
  const updatedBlocks = blocksAfterReview(payload.message?.blocks, statusLine);

  await postSlackResponseUrl(payload.response_url, {
    replace_original: true,
    blocks: updatedBlocks,
    text: statusLine,
  });

  return { ok: true, owner, repo, prNumber, reviewEvent };
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('ok');
      return;
    }

    if (req.method !== 'POST' || req.url !== '/slack/interactions') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('not found');
      return;
    }

    const rawBody = await readBody(req);
    const signature = req.headers['x-slack-signature'];
    const timestamp = req.headers['x-slack-request-timestamp'];

    if (!verifySlackSignature(signingSecret, signature, timestamp, rawBody)) {
      res.writeHead(401, { 'Content-Type': 'text/plain' });
      res.end('invalid signature');
      return;
    }

    const result = await handleInteraction(rawBody);
    console.log(
      `[slack] ${result.reviewEvent ?? 'noop'} ${result.owner ?? ''}/${result.repo ?? ''}#${result.prNumber ?? ''}`,
    );

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('');
  } catch (error) {
    console.error('[slack] handler error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('error');
  }
});

const port = Number(args.port);
const host = args.host;

server.listen(port, host, () => {
  console.log(`ILDS Slack interactivity server listening on http://${host}:${port}`);
  console.log(`  POST /slack/interactions`);
  console.log(`  GET  /health`);
});
