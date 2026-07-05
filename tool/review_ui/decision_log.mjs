/**
 * Append-only decision log + historical seed for ILDS UI Review Portal.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const LOG_PATH = path.join(DIR, 'decision_log.json');
const QUEUE_PATH = path.join(DIR, 'queue.json');

const HISTORICAL = [
  {
    serial: 1,
    at: '2026-07-05T18:47:57.558Z',
    label: 'Selection Button — typography after #42',
    verdict: 'pass',
    state: 'passed',
    reviewer: 'dsoftacademy',
    kind: 'queue',
    ref: 'postmerge-42-selection-button',
  },
  {
    serial: 2,
    at: '2026-07-05T18:50:00.000Z',
    label: 'PR #44 — feat(phase7): visual review surface MVP — the human review interface',
    verdict: 'pass',
    state: 'approved — merged',
    reviewer: 'dsoftacademy',
    kind: 'pr',
    ref: '44',
  },
];

function readAll() {
  try {
    const data = JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeAll(entries) {
  fs.writeFileSync(LOG_PATH, JSON.stringify(entries, null, 2) + '\n');
}

/** Backfill log from queue + known portal history when empty. Idempotent. */
export function seedDecisionLogIfEmpty() {
  if (readAll().length > 0) return readAll();
  const entries = [...HISTORICAL];
  try {
    const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
    for (const q of queue) {
      if (q.status === 'pending') continue;
      const exists = entries.some((e) => e.ref === q.id);
      if (exists) continue;
      entries.push({
        serial: entries.length + 1,
        at: q.verdictAt ?? q.createdAt,
        label: q.title,
        verdict: q.status === 'passed' ? 'pass' : 'fail',
        state: q.status,
        reviewer: q.reviewer ?? 'dsoftacademy',
        kind: 'queue',
        ref: q.id,
      });
    }
  } catch {
    /* no queue */
  }
  entries.sort((a, b) => b.serial - a.serial);
  writeAll(entries);
  return entries;
}

/**
 * @param {object} entry
 */
export function appendDecision(entry) {
  seedDecisionLogIfEmpty();
  const entries = readAll();
  const serial = entries.length > 0 ? Math.max(...entries.map((e) => e.serial)) + 1 : 1;
  const row = {
    serial,
    at: new Date().toISOString(),
    ...entry,
  };
  entries.unshift(row);
  writeAll(entries);
  return row;
}

export function listDecisions() {
  return seedDecisionLogIfEmpty();
}
