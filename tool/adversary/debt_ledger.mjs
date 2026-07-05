/**
 * Human-only debt acknowledgements — lets a PR proceed with tracked open findings.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const LEDGER_REL_PATH = 'docs/adversary/DEBT_LEDGER.md';

/** Bot actors that may never acknowledge debt. */
const BOT_ACTORS = new Set([
  'uniquedesignpratishek-maker',
  'github-actions[bot]',
  'dependabot[bot]',
]);

/**
 * @param {{ id: string; file?: string; anchor?: string }} finding
 */
export function findingFingerprint(finding) {
  return `${finding.id}|${finding.file ?? ''}|${finding.anchor ?? ''}`.toLowerCase();
}

/**
 * @param {string} [repoRoot]
 * @returns {Array<{ id: string; file: string; anchor: string; acknowledgedBy: string; pr: string; date: string; note: string }>}
 */
export function loadDebtLedger(repoRoot = REPO_ROOT) {
  const ledgerPath = path.join(repoRoot, LEDGER_REL_PATH);
  if (!fs.existsSync(ledgerPath)) return [];

  const lines = fs.readFileSync(ledgerPath, 'utf8').split('\n');
  const entries = [];

  for (const line of lines) {
    if (!line.startsWith('| F-')) continue;
    const cols = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cols.length < 6 || cols[0] === 'ID') continue;

    entries.push({
      id: cols[0],
      file: cols[1],
      anchor: cols[2],
      acknowledgedBy: cols[3],
      pr: cols[4],
      date: cols[5],
      note: cols[6] ?? '',
    });
  }

  return entries;
}

/**
 * @param {{ id: string; file?: string; anchor?: string; evidence?: string; summary?: string }} finding
 * @param {ReturnType<typeof loadDebtLedger>} ledger
 */
export function isAcknowledged(finding, ledger) {
  if (!finding.file) return false;

  return ledger.some((entry) => {
    if (entry.id !== finding.id || entry.file !== finding.file) return false;
    if (!entry.anchor || entry.anchor === '—' || entry.anchor === '*') return true;
    if (!finding.anchor) {
      const hay = `${finding.evidence ?? ''} ${finding.summary ?? ''}`.toLowerCase();
      return hay.includes(entry.anchor.toLowerCase());
    }
    const a = finding.anchor.toLowerCase();
    const e = entry.anchor.toLowerCase();
    return a.includes(e) || e.includes(a);
  });
}

/**
 * @param {Array<object>} findings
 * @param {ReturnType<typeof loadDebtLedger>} ledger
 */
export function applyAcknowledgements(findings, ledger) {
  return findings.map((f) => ({
    ...f,
    acknowledged: isAcknowledged(f, ledger),
  }));
}

/**
 * @param {object} opts
 */
export function assertHumanAcknowledger(opts) {
  const actor = process.env.GITHUB_ACTOR ?? '';
  if (actor && BOT_ACTORS.has(actor)) {
    throw new Error(`Bot actor "${actor}" may not acknowledge debt — human only.`);
  }
  if (!opts.signer?.trim()) {
    throw new Error('--signer is required (human maintainer name).');
  }
  if (/bot/i.test(opts.signer) && !/@[^@]+\.[^@]+/.test(opts.signer)) {
    throw new Error('Signer must be a human maintainer, not a bot.');
  }
}

/**
 * @param {object} entry
 * @param {string} [repoRoot]
 */
export function appendLedgerRow(entry, repoRoot = REPO_ROOT) {
  assertHumanAcknowledger({ signer: entry.acknowledgedBy });

  const ledgerPath = path.join(repoRoot, LEDGER_REL_PATH);
  const row = `| ${entry.id} | ${entry.file} | ${entry.anchor || '—'} | ${entry.acknowledgedBy} | ${entry.pr} | ${entry.date} | ${entry.note || '—'} |`;

  let content = fs.readFileSync(ledgerPath, 'utf8');
  if (content.includes(row)) return content;

  if (!content.endsWith('\n')) content += '\n';
  content += `${row}\n`;
  fs.writeFileSync(ledgerPath, content);
  return content;
}
