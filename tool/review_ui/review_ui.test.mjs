import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it, beforeEach, afterEach } from 'node:test';
import { fileURLToPath } from 'node:url';
import { extractSection } from './server.mjs';
import { panelSlugForFiles } from './platforms.mjs';
import {
  buildPlatformPreviews,
  componentSlugFromFiles,
  platformsFromFiles,
} from './platforms.mjs';
import {
  parseCookies,
  createSession,
  getSession,
  destroySession,
  listProfilesPublic,
  switchProfile,
  COOKIE_NAME,
} from './session.mjs';
import { appendDecision, listDecisions, seedDecisionLogIfEmpty } from './decision_log.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const PROFILES_FILE = path.join(os.homedir(), '.ilds', 'review-ui', 'profiles.json');

function ensureDir() {
  fs.mkdirSync(path.dirname(PROFILES_FILE), { recursive: true, mode: 0o700 });
}

describe('review_ui server helpers', () => {
  it('extractSection pulls Visual Objective body', () => {
    const body = '## Visual Objective\nCheck the radio.\n\n## Other\nignore';
    assert.equal(extractSection(body, 'Visual Objective'), 'Check the radio.');
  });

  it('extractSection returns null when heading missing', () => {
    assert.equal(extractSection('no headings', 'Visual Objective'), null);
  });
});

describe('review_ui platforms', () => {
  it('componentSlugFromFiles maps dart, web, ios, android paths', () => {
    assert.equal(componentSlugFromFiles(['lib/ilds_selection_button.dart']), 'selection_button');
    assert.equal(
      componentSlugFromFiles(['web/src/components/SelectionButton/SelectionButton.tsx']),
      'selection_button',
    );
    assert.equal(
      componentSlugFromFiles(['ios/Sources/ILDSDesignSystem/IldsRadio.swift']),
      'radio',
    );
    assert.equal(
      componentSlugFromFiles(['android/ilds-design-system/src/main/kotlin/com/icicilombard/ilds/components/IldsChip.kt']),
      'chip',
    );
  });

  it('platformsFromFiles detects all four stacks', () => {
    const p = platformsFromFiles([
      'lib/ilds_button.dart',
      'web/src/components/Button/Button.tsx',
      'ios/Sources/ILDSDesignSystem/IldsButton.swift',
      'android/ilds-design-system/src/main/kotlin/com/icicilombard/ilds/components/IldsButton.kt',
    ]);
    assert.deepEqual([...p].sort(), ['android', 'flutter', 'ios', 'react']);
  });

  it('buildPlatformPreviews returns react flutter ios android entries', () => {
    const previews = buildPlatformPreviews({
      slug: 'button',
      platforms: new Set(['react', 'flutter']),
      storybookUrl: 'http://localhost:6006',
      flutterUrl: 'http://localhost:8080',
      chromaticUrl: 'https://chromatic.example',
    });
    assert.equal(previews.length, 2);
    assert.match(previews[0].embedUrl, /6006/);
    assert.match(previews[1].embedUrl, /8080/);
  });

  it('panelSlugForFiles alias works', () => {
    assert.equal(panelSlugForFiles(['lib/ilds_radio.dart']), 'radio');
  });
});

describe('review_ui session profiles', () => {
  let backup = null;

  beforeEach(() => {
    try {
      backup = fs.readFileSync(PROFILES_FILE, 'utf8');
    } catch {
      backup = null;
    }
    ensureDir();
    fs.writeFileSync(PROFILES_FILE, JSON.stringify({ activeLogin: null, profiles: {} }, null, 2) + '\n', {
      mode: 0o600,
    });
  });

  afterEach(() => {
    if (backup) fs.writeFileSync(PROFILES_FILE, backup);
    else {
      try {
        fs.unlinkSync(PROFILES_FILE);
      } catch {
        /* no file */
      }
    }
  });

  it('parseCookies reads cookie header', () => {
    assert.equal(parseCookies({ headers: { cookie: `${COOKIE_NAME}=abc123; foo=bar` } })[COOKIE_NAME], 'abc123');
  });

  it('createSession, list profiles, and getSession round-trip', () => {
    const sid = createSession({
      token: 'test-token',
      login: 'testuser',
      readOnly: false,
      reason: null,
    });
    const req = { headers: { cookie: `${COOKIE_NAME}=${sid}` } };
    const session = getSession(req);
    assert.equal(session.login, 'testuser');
    assert.equal(listProfilesPublic().length, 1);
  });

  it('switchProfile changes active login', () => {
    createSession({ token: 't1', login: 'user1', readOnly: false });
    createSession({ token: 't2', login: 'user2', readOnly: false });
    const req = { headers: { cookie: `${COOKIE_NAME}=abc` } };
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; } };
    switchProfile(req, res, 'user1');
    assert.equal(getSession(req).login, 'user1');
  });

  it('destroySession removes profile', () => {
    const sid = createSession({ token: 't', login: 'u', readOnly: false });
    const req = { headers: { cookie: `${COOKIE_NAME}=${sid}` } };
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; } };
    destroySession(req, res);
    assert.equal(getSession(req), null);
    assert.equal(listProfilesPublic().length, 0);
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

  it('seedDecisionLogIfEmpty backfills historical entries', () => {
    const entries = seedDecisionLogIfEmpty();
    assert.ok(entries.length >= 2);
    assert.ok(entries.some((e) => e.ref === '44'));
    assert.ok(entries.some((e) => e.ref === 'postmerge-42-selection-button'));
  });

  it('seedDecisionLogIfEmpty is idempotent', () => {
    const a = seedDecisionLogIfEmpty();
    const b = seedDecisionLogIfEmpty();
    assert.equal(a.length, b.length);
  });

  it('appendDecision assigns serial numbers', () => {
    seedDecisionLogIfEmpty();
    const before = listDecisions().length;
    appendDecision({ label: 'New', verdict: 'pass', state: 'approved', reviewer: 'u' });
    const list = listDecisions();
    assert.equal(list.length, before + 1);
    assert.equal(list[0].label, 'New');
  });
});
