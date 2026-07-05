/**
 * Append-only decision log for the review UI.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const LOG_PATH = path.join(DIR, 'decision_log.json');

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

/**
 * @param {object} entry
 */
export function appendDecision(entry) {
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
  return readAll();
}
