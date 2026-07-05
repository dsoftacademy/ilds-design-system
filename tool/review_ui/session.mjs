/**
 * Local single-user session for the review UI (token stored ~/.ilds/review-ui/, mode 0600).
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const COOKIE_NAME = 'ilds_review_sid';
const SESSION_DIR = path.join(os.homedir(), '.ilds', 'review-ui');
const SESSION_FILE = path.join(SESSION_DIR, 'session.json');
const MAX_AGE_SEC = 7 * 24 * 60 * 60;

/** @type {Map<string, { token: string; login: string; readOnly: boolean; reason?: string }>} */
const sessions = new Map();

function ensureDir() {
  fs.mkdirSync(SESSION_DIR, { recursive: true, mode: 0o700 });
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

export function getSession(req) {
  const sid = parseCookies(req)[COOKIE_NAME];
  if (!sid) return null;
  const cached = sessions.get(sid);
  if (cached) return cached;
  try {
    const raw = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
    if (raw?.sid === sid && raw?.token) {
      const data = {
        token: raw.token,
        login: raw.login,
        readOnly: raw.readOnly,
        reason: raw.reason,
      };
      sessions.set(sid, data);
      return data;
    }
  } catch {
    /* no persisted session */
  }
  return null;
}

export function createSession({ token, login, readOnly, reason }) {
  const sid = newSessionId();
  const data = { token, login, readOnly, reason: reason ?? null };
  sessions.set(sid, data);
  ensureDir();
  fs.writeFileSync(
    SESSION_FILE,
    JSON.stringify({ sid, ...data, savedAt: new Date().toISOString() }, null, 2) + '\n',
    { mode: 0o600 },
  );
  return sid;
}

export function destroySession(req, res) {
  const sid = parseCookies(req)[COOKIE_NAME];
  if (sid) sessions.delete(sid);
  try {
    fs.unlinkSync(SESSION_FILE);
  } catch {
    /* no file */
  }
  clearSessionCookie(res);
}

/** Restore session after server restart (same machine, same user). */
export function restorePersistedSession() {
  try {
    const raw = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
    if (!raw?.sid || !raw?.token) return null;
    sessions.set(raw.sid, {
      token: raw.token,
      login: raw.login,
      readOnly: raw.readOnly,
      reason: raw.reason,
    });
    return raw.sid;
  } catch {
    return null;
  }
}
