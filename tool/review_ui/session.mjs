/**
 * Multi-profile session store for ILDS UI Review Portal (~/.ilds/review-ui/, mode 0600).
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const COOKIE_NAME = 'ilds_review_sid';
const SESSION_DIR = path.join(os.homedir(), '.ilds', 'review-ui');
const PROFILES_FILE = path.join(SESSION_DIR, 'profiles.json');
const MAX_AGE_SEC = 7 * 24 * 60 * 60;

/** @type {Map<string, string>} sid -> activeLogin */
const sidToLogin = new Map();

function ensureDir() {
  fs.mkdirSync(SESSION_DIR, { recursive: true, mode: 0o700 });
}

function readProfilesFile() {
  try {
    const raw = JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf8'));
    return {
      activeLogin: raw.activeLogin ?? null,
      profiles: raw.profiles && typeof raw.profiles === 'object' ? raw.profiles : {},
    };
  } catch {
    return { activeLogin: null, profiles: {} };
  }
}

function writeProfilesFile(data) {
  ensureDir();
  fs.writeFileSync(PROFILES_FILE, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
}

/** Migrate legacy session.json → profiles.json */
function migrateLegacySession() {
  const legacy = path.join(SESSION_DIR, 'session.json');
  try {
    const raw = JSON.parse(fs.readFileSync(legacy, 'utf8'));
    if (!raw?.token || !raw?.login) return;
    const store = readProfilesFile();
    store.profiles[raw.login] = {
      token: raw.token,
      readOnly: raw.readOnly ?? false,
      reason: raw.reason ?? null,
      addedAt: raw.savedAt ?? new Date().toISOString(),
    };
    store.activeLogin = raw.login;
    writeProfilesFile(store);
    if (raw.sid) sidToLogin.set(raw.sid, raw.login);
    fs.unlinkSync(legacy);
  } catch {
    /* no legacy file */
  }
}

export function parseCookies(req) {
  const raw = req.headers.cookie ?? '';
  const out = {};
  for (const part of raw.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k) out[k] = decodeURIComponent(rest.join('='));
  }
  return out;
}

export function newSessionId() {
  return crypto.randomBytes(24).toString('hex');
}

export function setSessionCookie(res, sessionId) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SEC}`,
  );
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0`);
}

export function listProfilesPublic() {
  migrateLegacySession();
  const store = readProfilesFile();
  return Object.entries(store.profiles).map(([login, p]) => ({
    login,
    readOnly: p.readOnly,
    reason: p.reason,
    addedAt: p.addedAt,
  }));
}

export function getActiveLogin(req) {
  const sid = parseCookies(req)[COOKIE_NAME];
  if (!sid) return null;
  if (sidToLogin.has(sid)) return sidToLogin.get(sid);
  migrateLegacySession();
  const store = readProfilesFile();
  return store.activeLogin;
}

export function getSession(req) {
  const login = getActiveLogin(req);
  if (!login) return null;
  const store = readProfilesFile();
  const profile = store.profiles[login];
  if (!profile?.token) return null;
  return {
    login,
    token: profile.token,
    readOnly: profile.readOnly,
    reason: profile.reason,
  };
}

export function upsertProfile({ token, login, readOnly, reason }) {
  migrateLegacySession();
  const store = readProfilesFile();
  store.profiles[login] = {
    token,
    readOnly,
    reason: reason ?? null,
    addedAt: store.profiles[login]?.addedAt ?? new Date().toISOString(),
  };
  store.activeLogin = login;
  writeProfilesFile(store);
  return login;
}

export function createSession(identity) {
  const login = upsertProfile(identity);
  const sid = newSessionId();
  sidToLogin.set(sid, login);
  return sid;
}

export function switchProfile(req, res, login) {
  const store = readProfilesFile();
  if (!store.profiles[login]) {
    throw new Error(`Unknown profile: ${login}`);
  }
  store.activeLogin = login;
  writeProfilesFile(store);
  const sid = parseCookies(req)[COOKIE_NAME] || newSessionId();
  sidToLogin.set(sid, login);
  setSessionCookie(res, sid);
  return login;
}

export function destroySession(req, res) {
  const sid = parseCookies(req)[COOKIE_NAME];
  const login = sid ? sidToLogin.get(sid) : getActiveLogin(req);
  if (sid) sidToLogin.delete(sid);
  if (login) {
    const store = readProfilesFile();
    delete store.profiles[login];
    if (store.activeLogin === login) {
      const remaining = Object.keys(store.profiles);
      store.activeLogin = remaining[0] ?? null;
    }
    writeProfilesFile(store);
  }
  clearSessionCookie(res);
}

export function restorePersistedSession() {
  migrateLegacySession();
  const store = readProfilesFile();
  if (!store.activeLogin || !store.profiles[store.activeLogin]) return null;
  const sid = newSessionId();
  sidToLogin.set(sid, store.activeLogin);
  return sid;
}
