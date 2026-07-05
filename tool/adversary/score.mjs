/**
 * Aggregate findings into verdict, report markdown, and scoreboard update.
 */

import { formatDecisionCards, formatAcknowledgedSection } from './decision_card.mjs';

/**
 * @typedef {{ id: string; severity: string; summary: string; evidence: string; source: 'machine' | 'judge'; introduced?: boolean; acknowledged?: boolean; file?: string; anchor?: string }} Finding
 */

const BLOCK_SEVERITIES = new Set(['critical', 'high']);

/**
 * @param {Finding[]} findings — only unacknowledged findings should block
 */
export function scoreFindings(findings) {
  const blocking = findings.filter(
    (f) => BLOCK_SEVERITIES.has(f.severity) && !f.acknowledged,
  );
  const verdict = blocking.length > 0 ? 'block' : 'pass';
  const adversaryPoints = blocking.length > 0 ? 1 : 0;
  const builderPoints = adversaryPoints === 0 ? 1 : 0;

  return {
    verdict,
    findings,
    blockingFindings: blocking,
    acknowledgedFindings: findings.filter((f) => f.acknowledged),
    score: { builder: builderPoints, adversary: adversaryPoints },
  };
}

function formatFindingsTable(findings) {
  if (findings.length === 0) {
    return '_No catalog hits._';
  }
  const lines = [
    '| ID | Severity | Source | Summary |',
    '|----|----------|--------|---------|',
  ];
  for (const f of findings) {
    const ack = f.acknowledged ? ' _(acknowledged)_' : '';
    lines.push(
      `| ${f.id} | ${f.severity} | ${f.source} | ${f.summary.replace(/\|/g, '\\|')}${ack} |`,
    );
  }
  lines.push('');
  lines.push('<details><summary>Evidence</summary>', '');
  for (const f of findings) {
    const scope =
      f.introduced === false ? ' _(pre-existing)_' : f.introduced ? ' _(introduced)_' : '';
    lines.push(`**${f.id} (${f.source})${scope}:** ${f.evidence}`, '');
  }
  lines.push('</details>');
  return lines.join('\n');
}

/**
 * @param {{ verdict: string; findings: Finding[]; blockingFindings?: Finding[]; acknowledgedFindings?: Finding[]; score: { builder: number; adversary: number }; judgeResult?: object; judgeMeta?: object }} result
 * @param {{ prNumber?: string; headSha?: string; repo?: string }} meta
 */
export function formatReportMarkdown(result, meta = {}) {
  const blocking =
    result.blockingFindings ??
    result.findings.filter((f) => BLOCK_SEVERITIES.has(f.severity) && !f.acknowledged);
  const acknowledged =
    result.acknowledgedFindings ?? result.findings.filter((f) => f.acknowledged);

  const lines = [
    '## Adversary review report',
    '',
    meta.repo && meta.prNumber
      ? `**Repo:** ${meta.repo} · **PR:** #${meta.prNumber}${meta.headSha ? ` · **SHA:** \`${meta.headSha.slice(0, 7)}\`` : ''}`
      : '',
    '',
    `**Combined verdict:** \`${result.verdict.toUpperCase()}\`${acknowledged.length > 0 ? ' _(open findings acknowledged on ledger)_' : ''}`,
    `**Score:** builder ${result.score.builder} — adversary ${result.score.adversary}`,
    '',
  ].filter(Boolean);

  if (result.verdict === 'block' && blocking.length > 0) {
    lines.push(formatDecisionCards(blocking), '');
  }

  if (acknowledged.length > 0) {
    lines.push(formatAcknowledgedSection(acknowledged), '');
  }

  lines.push('### All findings (machine + Opus judge)', '', formatFindingsTable(result.findings));

  if (result.judgeResult) {
    lines.push(
      '',
      '### Opus judge only',
      '',
      `**Model:** \`${result.judgeMeta?.model ?? 'claude-opus-4-8'}\``,
      result.judgeMeta?.skipped
        ? `_Judge skipped: ${result.judgeMeta.reason ?? 'unknown'}_`
        : `**Judge verdict:** \`${result.judgeResult.verdict.toUpperCase()}\``,
    );
    if (!result.judgeMeta?.skipped) {
      lines.push('', formatFindingsTable(result.judgeResult.findings));
      if (result.judgeMeta?.usage) {
        const u = result.judgeMeta.usage;
        lines.push(
          '',
          `_Tokens: in ${u.input_tokens} · out ${u.output_tokens} · cache read ${u.cache_read_input_tokens} · cache write ${u.cache_creation_input_tokens}_`,
        );
      }
    }
  }

  lines.push('', '---', '_Seeded from `docs/adversary/FAILURE_CATALOG.md` · append-only ratchet_');
  return lines.join('\n');
}

/**
 * @param {string} reportPath
 * @param {{ prNumber: string; verdict: string; builder: number; adversary: number; notes?: string }} entry
 */
export function appendScoreboardRow(reportPath, entry) {
  return `| ${new Date().toISOString().slice(0, 10)} | #${entry.prNumber} | adversary-review | ${entry.builder} | ${entry.adversary} | ${entry.verdict} | ${entry.notes ?? '—'} |`;
}
