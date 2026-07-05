#!/usr/bin/env node
/**
 * ILDS UI Review Portal — the admin's single interface for all human reviews.
 *
 * Sign in at /login with a fine-grained GitHub token (profiles in ~/.ilds/review-ui/).
 * Run:  node tool/review_ui/server.mjs  |  npm run review:ui
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { githubRequest, submitPullRequestReview, findChromaticDetailsUrl } from '../lib/slack_pr.mjs';
import { classifyFiles } from '../lib/review_router_classify.mjs';
import { ILDS_BOT_LOGIN, isBotReviewer } from '../lib/pr_authorship.mjs';
import {
  COOKIE_NAME,
  createSession,
  destroySession,
  getSession,
  listProfilesPublic,
  restorePersistedSession,
  setSessionCookie,
  switchProfile,
  upsertProfile,
} from './session.mjs';
import { appendDecision, listDecisions, seedDecisionLogIfEmpty } from './decision_log.mjs';
import {
  buildPlatformPreviews,
  componentSlugFromFiles,
  platformsFromFiles,
} from './platforms.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const QUEUE_PATH = path.join(DIR, 'queue.json');
const PORT = Number(process.env.ILDS_REVIEW_UI_PORT || 4400);
const REPO = process.env.GITHUB_REPOSITORY || 'dsoftacademy/ilds-design-system';
const [OWNER, NAME] = REPO.split('/');
const FLUTTER_URL = process.env.ILDS_PLAYGROUND_URL || 'http://localhost:8080';
const STORYBOOK_URL = process.env.ILDS_STORYBOOK_URL || 'http://localhost:6006';

export { componentSlugFromFiles as panelSlugForFiles };

/**
 * @param {string} token
 */
export async function verifyTokenIdentity(token) {
  const user = await githubRequest(token, 'GET', '/user');
  if (isBotReviewer(user.login)) {
    return {
      token,
      login: user.login,
      readOnly: true,
      reason: 'bot token detected — verdicts disabled; use your own token',
    };
  }
  return { token, login: user.login, readOnly: false, reason: null };
}

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

async function serviceHealth(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1500);
    const r = await fetch(url, { signal: ctrl.signal, method: 'HEAD' });
    clearTimeout(t);
    return r.ok || r.status === 405;
  } catch {
    return false;
  }
}

async function fetchPendingPrs(token) {
  const prs = await githubRequest(
    token,
    'GET',
    `/repos/${OWNER}/${NAME}/pulls?state=open&per_page=50`,
  );
  const cards = [];
  for (const pr of prs) {
    if (pr.draft) continue;
    if (pr.user?.login !== ILDS_BOT_LOGIN) continue;

    const files = await githubRequest(
      token,
      'GET',
      `/repos/${OWNER}/${NAME}/pulls/${pr.number}/files?per_page=100`,
    );
    const fileNames = files.map((f) => f.filename);
    const classification = classifyFiles(fileNames);
    const type = classification.reason === 'control-plane' ? 'control-plane' : 'content';
    const slug = componentSlugFromFiles(fileNames);
    const platforms = platformsFromFiles(fileNames);

    const checkRuns = await githubRequest(
      token,
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
      token,
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
    const chromaticUrl = await findChromaticDetailsUrl(token, OWNER, NAME, pr.head.sha).catch(
      () => null,
    );

    cards.push({
      number: pr.number,
      title: pr.title,
      type,
      component: slug,
      platforms: [...platforms],
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
      platformPreviews:
        type === 'content' && slug
          ? buildPlatformPreviews({
              slug,
              platforms,
              storybookUrl: STORYBOOK_URL,
              flutterUrl: FLUTTER_URL,
              chromaticUrl,
            })
          : [],
    });
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

function reviewerFromSession(session) {
  return { login: session.login, readOnly: session.readOnly, reason: session.reason };
}

async function submitVerdict(session, { number, verdict, note }) {
  const reviewer = reviewerFromSession(session);
  if (reviewer.readOnly) throw new Error(`read-only: ${reviewer.reason}`);
  if (!['pass', 'fail'].includes(verdict)) throw new Error('verdict must be pass|fail');
  if (verdict === 'fail' && !note) throw new Error('a fail needs a plain-language note');

  const prs = await fetchPendingPrs(session.token);
  const pr = prs.find((p) => p.number === number);
  const label = pr ? `PR #${number} — ${pr.title}` : `PR #${number}`;

  const event = verdict === 'pass' ? 'APPROVE' : 'REQUEST_CHANGES';
  const body =
    verdict === 'pass'
      ? `Visual review: PASS (via ILDS UI Review Portal, reviewer ${reviewer.login})`
      : `VISUAL_FAIL: ${note}\n\n(Recorded via ILDS UI Review Portal — agents own the fix.)`;
  await submitPullRequestReview(session.token, OWNER, NAME, number, { event, body });

  appendDecision({
    label,
    verdict: verdict === 'pass' ? 'pass' : 'fail',
    state: verdict === 'pass' ? 'approved' : 'changes requested',
    reviewer: reviewer.login,
    kind: 'pr',
    ref: String(number),
  });

  return { ok: true };
}

async function submitQueueVerdict(session, { id, verdict, note }) {
  const reviewer = reviewerFromSession(session);
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

  appendDecision({
    label: item.title,
    verdict: verdict === 'pass' ? 'pass' : 'fail',
    state: item.status,
    reviewer: reviewer.login,
    kind: 'queue',
    ref: id,
  });

  if (verdict === 'fail') {
    await githubRequest(session.token, 'POST', `/repos/${OWNER}/${NAME}/issues`, {
      title: `VISUAL_FAIL: ${item.component} — ${item.title}`,
      body: `${note}\n\nObjective that failed:\n\n${item.objective}\n\n(Post-merge visual check ${item.id}; recorded via ILDS UI Review Portal. Agents own the fix.)`,
      labels: ['visual-fail'],
    });
  }
  return { ok: true };
}

function enrichQueueItem(q) {
  const slug = q.component;
  const platforms = new Set(['react', 'flutter', 'ios', 'android']);
  return {
    ...q,
    component: slug,
    platforms: [...platforms],
    platformPreviews: slug
      ? buildPlatformPreviews({
          slug,
          platforms,
          storybookUrl: STORYBOOK_URL,
          flutterUrl: FLUTTER_URL,
          chromaticUrl: null,
        })
      : [],
  };
}

function json(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function redirect(res, location, code = 302) {
  res.writeHead(code, { Location: location });
  res.end();
}

function staticFile(res, file, contentType) {
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(fs.readFileSync(path.join(DIR, file), 'utf8'));
}

async function readBody(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

function requireSession(req, res) {
  const session = getSession(req);
  if (!session) {
    json(res, 401, { error: 'not signed in' });
    return null;
  }
  return session;
}

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`).pathname;

  try {
    if (req.method === 'GET' && pathname === '/styles.css') {
      staticFile(res, 'common.css', 'text/css; charset=utf-8');
      return;
    }
    if (req.method === 'GET' && pathname === '/portal.js') {
      staticFile(res, 'portal.js', 'text/javascript; charset=utf-8');
      return;
    }
    if (req.method === 'GET' && pathname === '/login') {
      if (getSession(req) && !new URL(req.url, 'http://x').searchParams.get('add')) {
        redirect(res, '/');
        return;
      }
      staticFile(res, 'login.html', 'text/html; charset=utf-8');
      return;
    }
    if (req.method === 'GET' && pathname === '/') {
      if (!getSession(req)) {
        redirect(res, '/login');
        return;
      }
      staticFile(res, 'index.html', 'text/html; charset=utf-8');
      return;
    }
    if (req.method === 'GET' && pathname === '/log') {
      if (!getSession(req)) {
        redirect(res, '/login');
        return;
      }
      staticFile(res, 'log.html', 'text/html; charset=utf-8');
      return;
    }
    if (req.method === 'POST' && pathname === '/api/login') {
      const { token } = await readBody(req);
      if (!token?.trim()) {
        json(res, 400, { error: 'GitHub token is required' });
        return;
      }
      try {
        const identity = await verifyTokenIdentity(token.trim());
        const sid = createSession(identity);
        setSessionCookie(res, sid);
        json(res, 200, { ok: true, login: identity.login, readOnly: identity.readOnly });
      } catch (err) {
        json(res, 401, { error: err.message || 'Invalid token' });
      }
      return;
    }
    if (req.method === 'POST' && pathname === '/api/logout') {
      destroySession(req, res);
      json(res, 200, { ok: true });
      return;
    }
    if (req.method === 'GET' && pathname === '/api/profiles') {
      const session = requireSession(req, res);
      if (!session) return;
      json(res, 200, {
        active: session.login,
        profiles: listProfilesPublic(),
      });
      return;
    }
    if (req.method === 'POST' && pathname === '/api/switch-profile') {
      const session = requireSession(req, res);
      if (!session) return;
      const { login } = await readBody(req);
      try {
        switchProfile(req, res, login);
        json(res, 200, { ok: true, login });
      } catch (err) {
        json(res, 400, { error: err.message });
      }
      return;
    }
    if (req.method === 'GET' && pathname === '/api/me') {
      const session = getSession(req);
      if (!session) {
        json(res, 401, { error: 'not signed in' });
        return;
      }
      json(res, 200, { login: session.login, readOnly: session.readOnly });
      return;
    }
    if (req.method === 'GET' && pathname === '/api/log') {
      const session = requireSession(req, res);
      if (!session) return;
      json(res, 200, { reviewer: session.login, entries: listDecisions() });
      return;
    }
    if (req.method === 'GET' && pathname === '/api/state') {
      const session = requireSession(req, res);
      if (!session) return;
      const reviewer = reviewerFromSession(session);
      const [prs, queue, flutterUp, storybookUp] = await Promise.all([
        fetchPendingPrs(session.token),
        Promise.resolve(readQueue()),
        serviceHealth(FLUTTER_URL),
        serviceHealth(STORYBOOK_URL),
      ]);
      json(res, 200, {
        reviewer: reviewer.login,
        readOnly: reviewer.readOnly,
        readOnlyReason: reviewer.reason,
        flutterUrl: FLUTTER_URL,
        storybookUrl: STORYBOOK_URL,
        services: { flutter: flutterUp, storybook: storybookUp },
        prs,
        queue: queue.map(enrichQueueItem),
      });
      return;
    }
    if (req.method === 'POST' && pathname === '/api/verdict') {
      const session = requireSession(req, res);
      if (!session) return;
      json(res, 200, await submitVerdict(session, await readBody(req)));
      return;
    }
    if (req.method === 'POST' && pathname === '/api/queue-verdict') {
      const session = requireSession(req, res);
      if (!session) return;
      json(res, 200, await submitQueueVerdict(session, await readBody(req)));
      return;
    }
    json(res, 404, { error: 'not found' });
  } catch (err) {
    json(res, err.status === 401 || err.status === 403 ? 403 : 500, { error: err.message });
  }
});

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  seedDecisionLogIfEmpty();
  const restoredSid = restorePersistedSession();
  server.listen(PORT, () => {
    console.log(`ILDS UI Review Portal: http://localhost:${PORT}`);
    console.log(`Sign in: http://localhost:${PORT}/login`);
    if (restoredSid) {
      const profiles = listProfilesPublic();
      console.log(`Restored profile(s): ${profiles.map((p) => p.login).join(', ') || 'unknown'}`);
    }
    console.log(`Flutter preview: ${FLUTTER_URL}`);
    console.log(`Storybook preview: ${STORYBOOK_URL}`);
  });
}
