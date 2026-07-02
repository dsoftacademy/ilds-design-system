/**
 * Aggregate findings into verdict, report markdown, and scoreboard update.
 */

/**
 * @typedef {{ id: string; severity: string; summary: string; evidence: string; source: 'machine' | 'judge' }} Finding
 */

const BLOCK_SEVERITIES = new Set(['critical', 'high']);

/**
 * @param {Finding[]} findings
 */
export function scoreFindings(findings) {
  const blocking = findings.filter((f) => BLOCK_SEVERITIES.has(f.severity));
  const verdict = blocking.length > 0 ? 'block' : 'pass';
  const adversaryPoints = blocking.length > 0 ? 1 : 0;
  const builderPoints = adversaryPoints === 0 ? 1 : 0;

  return {
    verdict,
    findings,
    score: { builder: builderPoints, adversary: adversaryPoints },
  };
}

/**
 * @param {{ verdict: string; findings: Finding[]; score: { builder: number; adversary: number } }} result
 * @param {{ prNumber?: string; headSha?: string; repo?: string }} meta
 */
export function formatReportMarkdown(result, meta = {}) {
  const lines = [
    '## Adversary review report',
    '',
    meta.repo && meta.prNumber
      ? `**Repo:** ${meta.repo} · **PR:** #${meta.prNumber}${meta.headSha ? ` · **SHA:** \`${meta.headSha.slice(0, 7)}\`` : ''}`
      : '',
    '',
    `**Verdict:** \`${result.verdict.toUpperCase()}\``,
    `**Score:** builder ${result.score.builder} — adversary ${result.score.adversary}`,
    '',
  ].filter(Boolean);

  if (result.findings.length === 0) {
    lines.push('_No catalog hits. Machine + judge found nothing._');
  } else {
    lines.push('| ID | Severity | Source | Summary |');
    lines.push('|----|----------|--------|---------|');
    for (const f of result.findings) {
      lines.push(`| ${f.id} | ${f.severity} | ${f.source} | ${f.summary.replace(/\|/g, '\\|')} |`);
    }
    lines.push('');
    lines.push('<details><summary>Evidence</summary>', '');
    for (const f of result.findings) {
      lines.push(`**${f.id}:** ${f.evidence}`, '');
    }
    lines.push('</details>');
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
