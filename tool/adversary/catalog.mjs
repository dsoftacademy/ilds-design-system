/**
 * Load failure catalog entries from docs/adversary/FAILURE_CATALOG.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CATALOG_PATH = path.join(REPO_ROOT, 'docs/adversary/FAILURE_CATALOG.md');

/**
 * @returns {Array<{ id: string; failureMode: string; severity: string; detection: string }>}
 */
export function loadCatalog() {
  const markdown = fs.readFileSync(CATALOG_PATH, 'utf8');
  const entries = [];

  for (const line of markdown.split('\n')) {
    if (!line.startsWith('| F-')) continue;
    const cols = line.split('|').map((c) => c.trim()).filter(Boolean);
    if (cols.length < 5 || cols[0] === 'ID') continue;
    const severity = cols[4].replace(/\*\*/g, '').trim().toLowerCase();
    entries.push({
      id: cols[0],
      failureMode: cols[1],
      detection: cols[3],
      severity,
    });
  }

  return entries;
}

export function catalogForPrompt() {
  return fs.readFileSync(CATALOG_PATH, 'utf8');
}

export function catalogCacheKey() {
  return `ilds-failure-catalog-v1`;
}
