/**
 * Which gate applies to a PR — component fidelity vs control-plane integrity.
 *
 * Branch protection requires the `adversary-review` check on every merge, but the
 * checks are different by path (see docs/adversary/SCORING.md § CI routing):
 * - Component paths → Opus + machine catalog (F-001…)
 * - Control-plane paths → L1–L8 integrity tests (`npm run test:integrity`)
 * - Safe T0-only paths → job reports success (Chromatic skip pattern)
 */

import { isControlPlane } from '../lib/review_router_classify.mjs';

/** Component/token fidelity — FAILURE_CATALOG scope. */
export const COMPONENT_ADVERSARY_PREFIXES = ['lib/', 'web/src/', 'tokens/'];
export const COMPONENT_ADVERSARY_PATH_PREFIXES = ['tool/adversary/', 'docs/adversary/'];

/**
 * @param {string} filename
 */
export function isComponentAdversaryPath(filename) {
  return (
    COMPONENT_ADVERSARY_PREFIXES.some((p) => filename.startsWith(p)) ||
    COMPONENT_ADVERSARY_PATH_PREFIXES.some((p) => filename.startsWith(p))
  );
}

/**
 * @param {Array<{ filename?: string }>} prFiles
 */
export function prTouchesComponentAdversary(prFiles) {
  return prFiles.some((f) => isComponentAdversaryPath(f.filename ?? ''));
}

/**
 * @param {Array<{ filename?: string }>} prFiles
 */
export function prTouchesControlPlane(prFiles) {
  return prFiles.some((f) => isControlPlane(f.filename ?? ''));
}

/**
 * @param {Array<{ filename?: string }>} prFiles
 * @returns {'component' | 'control-plane' | 'both' | 'skip'}
 */
export function routePrGate(prFiles) {
  const component = prTouchesComponentAdversary(prFiles);
  const controlPlane = prTouchesControlPlane(prFiles);
  if (component && controlPlane) return 'both';
  if (component) return 'component';
  if (controlPlane) return 'control-plane';
  return 'skip';
}

/**
 * @param {Array<{ filename?: string }>} prFiles
 * @param {{ prNumber?: string; headSha?: string; repo?: string }} meta
 */
export function controlPlaneGateReportMarkdown(prFiles, meta, { passed, output }) {
  const changed = prFiles.map((f) => f.filename).filter(Boolean);
  const lines = [
    '## Adversary review — control-plane integrity gate',
    '',
    meta.repo && meta.prNumber
      ? `**Repo:** ${meta.repo} · **PR:** #${meta.prNumber}${meta.headSha ? ` · **SHA:** \`${meta.headSha.slice(0, 7)}\`` : ''}`
      : '',
    '',
    `**Verdict:** \`${passed ? 'PASS' : 'BLOCK'}\``,
    '',
    'This PR touches **control-plane** paths only (no `lib/` / `web/src/` / `tokens/`).',
    'Component fidelity catalog (F-001…) does not apply here.',
    '',
    'Instead, **`npm run test:integrity`** ran — red-team tests for L1–L8 / L12 from `docs/CONTROL_PLANE_INTEGRITY.md`.',
    '',
    passed ? '_All integrity tests passed._' : '_Integrity tests failed — see workflow log._',
    '',
    output ? `<details><summary>Test output</summary>\n\n\`\`\`\n${output.trim()}\n\`\`\`\n</details>` : '',
    changed.length > 0 ? `<details><summary>Control-plane files (${changed.length})</summary>\n\n${changed.map((f) => `- \`${f}\``).join('\n')}\n</details>` : '',
    '',
    '---',
    '_Human Code Owner approval still required for T1 control-plane._',
  ].filter(Boolean);
  return lines.join('\n');
}

/**
 * @param {{ prNumber?: string; headSha?: string; repo?: string }} meta
 */
export function safeContentSkipReportMarkdown(meta) {
  return [
    '## Adversary review report',
    '',
    meta.repo && meta.prNumber
      ? `**Repo:** ${meta.repo} · **PR:** #${meta.prNumber}${meta.headSha ? ` · **SHA:** \`${meta.headSha.slice(0, 7)}\`` : ''}`
      : '',
    '',
    '**Verdict:** `PASS` _(safe T0 content — fidelity gate not applicable)_',
    '',
    'No component, token, or control-plane paths in this PR. Same pattern as Chromatic skip on docs-only changes.',
    '',
    '---',
    '_Seeded from `docs/adversary/FAILURE_CATALOG.md` · append-only ratchet_',
  ]
    .filter(Boolean)
    .join('\n');
}
