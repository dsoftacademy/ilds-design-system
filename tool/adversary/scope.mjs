/**
 * Files adversary reviews (component/token fidelity).
 * Control-plane-only PRs are out of scope — workflow still reports PASS so required checks clear.
 */

export const ADVERSARY_SCOPE_PREFIXES = ['lib/', 'web/src/', 'tokens/'];
export const ADVERSARY_SCOPE_PATH_PREFIXES = ['tool/adversary/', 'docs/adversary/'];

/**
 * @param {Array<{ filename?: string }>} prFiles
 */
export function isInAdversaryScope(prFiles) {
  return prFiles.some((f) => {
    const name = f.filename ?? '';
    return (
      ADVERSARY_SCOPE_PREFIXES.some((p) => name.startsWith(p)) ||
      ADVERSARY_SCOPE_PATH_PREFIXES.some((p) => name.startsWith(p))
    );
  });
}

/**
 * @param {Array<{ filename?: string }>} prFiles
 */
export function outOfScopeReportMarkdown(prFiles, meta = {}) {
  const changed = prFiles.map((f) => f.filename).filter(Boolean);
  const lines = [
    '## Adversary review report',
    '',
    meta.repo && meta.prNumber
      ? `**Repo:** ${meta.repo} · **PR:** #${meta.prNumber}${meta.headSha ? ` · **SHA:** \`${meta.headSha.slice(0, 7)}\`` : ''}`
      : '',
    '',
    '**Combined verdict:** `PASS` _(out of scope)_',
    '**Score:** builder 1 — adversary 0',
    '',
    'This PR does not touch component or token paths (`lib/`, `web/src/`, `tokens/`, `tool/adversary/`, `docs/adversary/`). Adversary fidelity review is N/A — control-plane / tooling only.',
    '',
    changed.length > 0 ? `<details><summary>Changed files (${changed.length})</summary>\n\n${changed.map((f) => `- \`${f}\``).join('\n')}\n</details>` : '',
    '',
    '---',
    '_Seeded from `docs/adversary/FAILURE_CATALOG.md` · append-only ratchet_',
  ].filter(Boolean);
  return lines.join('\n');
}
