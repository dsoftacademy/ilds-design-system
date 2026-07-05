import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { describe, it, beforeEach, afterEach } from 'node:test';
import { fileURLToPath } from 'node:url';
import { extractSection, panelSlugForFiles } from './server.mjs';
import { parseCookies, createSession, getSession, destroySession, COOKIE_NAME } from './session.mjs';
import { appendDecision, listDecisions } from './decision_log.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));

describe('review_ui server helpers', () => {
  it('extractSection pulls Visual Objective body', () => {
    const body = '## Visual Objective\nCheck the radio.\n\n## Other\nignore';
    assert.equal(extractSection(body, 'Visual Objective'), 'Check the radio.');
  });

  it('extractSection returns null when heading missing', () => {
    assert.equal(extractSection('no headings', 'Visual Objective'), null);
  });

  it('panelSlugForFiles maps lib dart files', () => {
    assert.equal(panelSlugForFiles(['lib/ilds_selection_button.dart']), 'selection_button');
    assert.equal(panelSlugForFiles(['docs/foo.md']), null);
  });
});

describe('review_ui session', () => {
  const sessionFile = path.join(os.homedir(), '.ilds', 'review-ui', 'session.json');
  let backup = null;

  beforeEach(() => {
    try {
      backup = fs.readFileSync(sessionFile, 'utf8');
    } catch {
      backup = null;
    }
  });

  afterEach(() => {
    if (backup) fs.writeFileSync(sessionFile, backup);
    else {
      try {
        fs.unlinkSync(sessionFile);
      } catch {
        /* no file */
      }
    }
  });

  it('parseCookies reads cookie header', () => {
    assert.equal(parseCookies({ headers: { cookie: `${COOKIE_NAME}=abc123; foo=bar` } })[COOKIE_NAME], 'abc123');
  });

  it('createSession and getSession round-trip', () => {
    const sid = createSession({
      token: 'test-token',
      login: 'testuser',
      readOnly: false,
      reason: null,
    });
    const req = { headers: { cookie: `${COOKIE_NAME}=${sid}` } };
    const session = getSession(req);
    assert.equal(session.login, 'testuser');
    assert.equal(session.token, 'test-token');
  });

  it('destroySession clears cookie', () => {
    const sid = createSession({ token: 't', login: 'u', readOnly: false });
    const req = { headers: { cookie: `${COOKIE_NAME}=${sid}` } };
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; } };
    destroySession(req, res);
    assert.equal(getSession(req), null);
    assert.match(res.headers['Set-Cookie'], /Max-Age=0/);
  });
});

describe('review_ui decision_log', () => {
  const logPath = path.join(DIR, 'decision_log.json');
  let backup = null;

  beforeEach(() => {
    try {
      backup = fs.readFileSync(logPath, 'utf8');
    } catch {
      backup = null;
    }
    fs.writeFileSync(logPath, '[]\n');
  });

  afterEach(() => {
    if (backup) fs.writeFileSync(logPath, backup);
    else fs.unlinkSync(logPath);
  });

  it('appendDecision assigns serial numbers', () => {
    const a = appendDecision({ label: 'First', verdict: 'pass', state: 'approved', reviewer: 'u' });
    const b = appendDecision({ label: 'Second', verdict: 'fail', state: 'failed', reviewer: 'u' });
    assert.equal(a.serial, 1);
    assert.equal(b.serial, 2);
    const list = listDecisions();
    assert.equal(list.length, 2);
    assert.equal(list[0].label, 'Second');
  });
});
