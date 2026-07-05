#!/usr/bin/env node
/**
 * ILDS Visual Review Surface — the human's ONLY interface.
 *
 * Invariants (docs/CONTROL_PLANE_INTEGRITY.md, §0 operating model):
 *  - The human sees rendered components + plain-language objectives. NEVER code,
 *    diffs, or adversary findings.
 *  - A verdict button only renders when there is something to inspect:
 *    content PR → Visual Objective; control-plane PR → Impact Summary.
 *    No section → "waiting on agents", no buttons. No blind approvals, ever.
 *  - Verdicts are submitted with ILDS_REVIEWER_TOKEN — the human's own token.
 *    Bot tokens are detected at startup and demoted to read-only.
 *
 * Run:  ILDS_REVIEWER_TOKEN=... node tool/review_ui/server.mjs
 * Env:  GITHUB_REPOSITORY (default dsoftacademy/ilds-design-system)
 *       ILDS_REVIEW_UI_PORT (default 4400)
 *       ILDS_PLAYGROUND_URL (default http://localhost:8080)
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { githubRequest, submitPullRequestReview } from '../lib/slack_pr.mjs';
import { classifyFiles } from '../lib/review_router_classify.mjs';
import { ILDS_BOT_LOGIN, isBotReviewer } from '../lib/pr_authorship.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const QUEUE_PATH = path.join(DIR, 'queue.json');
const PORT = Number(process.env.ILDS_REVIEW_UI_PORT || 4400);
const REPO = process.env.GITHUB_REPOSITORY || 'dsoftacademy/ilds-design-system';
const [OWNER, NAME] = REPO.split('/');
const PLAYGROUND_URL = process.env.ILDS_PLAYGROUND_URL || 'http://localhost:8080';
const TOKEN = process.env.ILDS_REVIEWER_TOKEN || '';

if (!TOKEN) {
  console.error('ILDS_REVIEWER_TOKEN is required (your token — never the bot PAT).');
  process.exit(1);
}

/** Set at startup after identity check. */
let reviewer = { login: null, readOnly: true, reason: 'identity not verified yet' };

async function verifyIdentity() {
  const user = await githubRequest(TOKEN, 'GET', '/user');
  if (isBotReviewer(user.login)) {
    reviewer = {
      login: user.login,
      readOnly: true,
      reason: 'bot token detected — verdicts disabled; use your own token',
    };
  } else {
    reviewer = { login: user.login, readOnly: false, reason: null };
  }
  console.log(
    `Reviewer identity: ${reviewer.login}${reviewer.readOnly ? ' (READ-ONLY: ' + reviewer.reason + ')' : ''}`,
  );
}

/**
 * Extract a markdown section body by heading (## Heading), case-insensitive.
 * Returns null when missing or empty — null means NOT READY, no buttons.
 * @param {string} body
 * @param {string} heading
 */
export function extractSection(body, heading) {
  if (!body) return null;
  const lines = body.split(/\r?\n/);
  const target = heading.toLowerCase();
  let collecting = false;
  const out = [];
  for (const line of lines) {
    const m = line.match(/^#{2,3}\s+(.*)$/);
    if (m) {
      if (collecting) break;
      collecting = m[1].trim().toLowerCase() === target;
      continue;
    }
    if (collecting) out.push(line);
  }
  const text = out.join('\n').trim();
  return text.length > 0 ? text : null;
}

/** Map a changed lib file to a playground panel slug. */
export function panelSlugForFiles(files) {
  const map = {
    ilds_button: 'button',
    ilds_radio: 'radio',
    ilds_checkbox: 'checkbox',
    ilds_switch: 'switch',
    ilds_text_field: 'textfield',
    ilds_text_area: 'text_area',
    ilds_dropdown: 'dropdown',
    ilds_tabs: 'tab',
    ilds_pagination: 'pagination',
    ilds_selection_button: 'selection_button',
    ilds_badge: 'badge',
    ilds_chip: 'chip',
    ilds_tag: 'tag',
    ilds_accordion: 'accordion',
    ilds_text_link: 'text_link',
    ilds_search: 'search',
    ilds_scrollbar: 'scrollbar',
    ilds_toast: 'toast',
  };
  for (const f of files) {
    const m = f.match(/^lib\/(ilds_[a-z_]+)\.dart$/);
    if (m && map[m[1]]) return map[m[1]];
  }
  return null;
}

async function fetchPendingPrs() {
  const prs = await githubRequest(
    TOKEN,
    'GET',
    `/repos/${OWNER}/${NAME}/pulls?state=open&per_page=50`,
  );
  const cards = [];
  for (const pr of prs) {
    if (pr.draft) continue;
    if (pr.user?.login !== ILDS_BOT_LOGIN) continue; // agent PRs only

    const files = await githubRequest(
      TOKEN,
      'GET',
      `/repos/${OWNER}/${NAME}/pulls/${pr.number}/files?per_page=100`,
    );
    const fileNames = files.map((f) => f.filename);
    const classification = classifyFiles(fileNames);
    const type = classification.reason === 'control-plane' ? 'control-plane' : 'content';

    const checkRuns = await githubRequest(
      TOKEN,
      'GET',
      `/repos/${OWNER}/${NAME}/commits/${pr.head.sha}/check-runs?per_page=50`,
    );
    const runs = checkRuns.check_runs ?? [];
    const failing = runs.filter(
      (r) => r.status === 'completed' && !['success', 'neutral', 'skipped'].includes(r.conclusion),
    );
    const pendingChecks = runs.filter((r) => r.status !== 'completed');
    const checksGreen = runs.length > 0 && failing.length === 0 && pendingChecks.length === 0;

    const reviews = await githubRequest(
      TOKEN,
      'GET',
      `/repos/${OWNER}/${NAME}/pulls/${pr.number}/reviews?per_page=50`,
    );
    const alreadyApproved = reviews.some(
      (r) => r.state === 'APPROVED' && !isBotReviewer(r.user?.login),
    );

    const objective = extractSection(pr.body, 'Visual Objective');
    const impact = extractSection(pr.body, 'Impact Summary');
    const section = type === 'content' ? objective : impact;
    const ready = checksGreen && !!section && !alreadyApproved;

    cards.push({
      number: pr.number,
      title: pr.title,
      type,
      component: panelSlugForFiles(fileNames),
      section,
      ready,
      alreadyApproved,
      checksGreen,
      waitingReason: alreadyApproved
        ? 'approved — waiting on merge'
        : !checksGreen
          ? 'agents still working (checks not green)'
          : !section
            ? `agents must supply a ${type === 'content' ? 'Visual Objective' : 'Impact Summary'}`
            : null,
      playgroundUrl: null, // set below for content
    });
  }
  for (const c of cards) {
    if (c.type === 'content' && c.component) {
      c.playgroundUrl = `${PLAYGROUND_URL}/?panel=${c.component}`;
    }
  }
  return cards;
}

function readQueue() {
  try {
    return JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
}

async function submitVerdict({ number, verdict, note }) {
  if (reviewer.readOnly) throw new Error(`read-only: ${reviewer.reason}`);
  if (!['pass', 'fail'].includes(verdict)) throw new Error('verdict must be pass|fail');
  if (verdict === 'fail' && !note) throw new Error('a fail needs a plain-language note');
  const event = verdict === 'pass' ? 'APPROVE' : 'REQUEST_CHANGES';
  const body =
    verdict === 'pass'
      ? `Visual review: PASS (via ILDS review surface, reviewer ${reviewer.login})`
      : `VISUAL_FAIL: ${note}\n\n(Recorded via ILDS review surface — agents own the fix.)`;
  await submitPullRequestReview(TOKEN, OWNER, NAME, number, { event, body });
  return { ok: true };
}

async function submitQueueVerdict({ id, verdict, note }) {
  if (reviewer.readOnly) throw new Error(`read-only: ${reviewer.reason}`);
  if (verdict === 'fail' && !note) throw new Error('a fail needs a plain-language note');
  const queue = readQueue();
  const item = queue.find((q) => q.id === id);
  if (!item) throw new Error(`unknown queue item: ${id}`);
  item.status = verdict === 'pass' ? 'passed' : 'failed';
  item.verdictAt = new Date().toISOString();
  item.reviewer = reviewer.login;
  if (note) item.note = note;
  writeQueue(queue);
  if (verdict === 'fail') {
    await githubRequest(TOKEN, 'POST', `/repos/${OWNER}/${NAME}/issues`, {
      title: `VISUAL_FAIL: ${item.component} — ${item.title}`,
      body: `${note}\n\nObjective that failed:\n\n${item.objective}\n\n(Post-merge visual check ${item.id}; recorded via ILDS review surface. Agents own the fix.)`,
      labels: ['visual-fail'],
    });
  }
  return { ok: true };
}

function json(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(path.join(DIR, 'index.html'), 'utf8'));
      return;
    }
    if (req.method === 'GET' && req.url === '/api/state') {
      const [prs, queue] = await Promise.all([fetchPendingPrs(), Promise.resolve(readQueue())]);
      json(res, 200, {
        reviewer: reviewer.login,
        readOnly: reviewer.readOnly,
        readOnlyReason: reviewer.reason,
        playgroundUrl: PLAYGROUND_URL,
        prs,
        queue: queue.map((q) => ({
          ...q,
          playgroundUrl: `${PLAYGROUND_URL}/?panel=${q.component}`,
        })),
      });
      return;
    }
    if (req.method === 'POST' && req.url === '/api/verdict') {
      json(res, 200, await submitVerdict(await readBody(req)));
      return;
    }
    if (req.method === 'POST' && req.url === '/api/queue-verdict') {
      json(res, 200, await submitQueueVerdict(await readBody(req)));
      return;
    }
    json(res, 404, { error: 'not found' });
  } catch (err) {
    json(res, err.status === 401 || err.status === 403 ? 403 : 500, { error: err.message });
  }
});

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  await verifyIdentity();
  server.listen(PORT, () => {
    console.log(`ILDS review surface: http://localhost:${PORT}`);
    console.log(`Playground expected at: ${PLAYGROUND_URL} (flutter run -d web-server --web-port 8080 in ilds_component_playground_app/)`);
  });
}
