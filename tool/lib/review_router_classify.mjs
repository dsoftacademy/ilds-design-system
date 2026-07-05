/**
 * Phase 5f — path classifier for selective review router.
 * Bias: any ambiguity → T1 (needs-human).
 *
 * tool/ is NOT blanket-safe. Only explicit operational scripts in
 * SAFE_TOOL_ALLOWLIST are T0. Router, PR automation, Slack review, and
 * agent-org tooling are control plane — the guardrail must not rewrite itself.
 */

/** @typedef {'T0' | 'T1'} ReviewTier */

/** @typedef {{ tier: ReviewTier; reason: string; triggerFile: string | null }} ClassifyResult */

export const CONTROL_PLANE_PATTERNS = [
  /^\.github\//,
  /^agents\//,
  /^tool\/adversary\//,
  /^tool\/agent-org\//,
  /^tool\/review_router/,
  /^tool\/lib\/review_router/,
  /^tool\/lib\/slack_pr/,
  /^tool\/propose_change/,
  /^tool\/notify_pr_slack/,
  /^tool\/slack_interactivity/,
  /^tool\/run_5d2/,
  /^docs\/adversary\/FAILURE_CATALOG\.md$/,
  /^docs\/adversary\/DEBT_LEDGER\.md$/,
  /^docs\/adversary\/PREEXISTING_DEBT_POLICY\.md$/,
  /^CURSOR_.*ROUTER.*\.md$/i,
  /^docs\/PHASE5F_ROUTER_SETTINGS\.md$/,
];

/** Operational tool scripts only — not merge/PR/review governance. */
export const SAFE_TOOL_ALLOWLIST = new Set([
  'tool/generate_ilds_tokens.dart',
  'tool/sync_figma_tokens.mjs',
  'tool/verify_cross_platform_parity.mjs',
  'tool/verify_phase4b.mjs',
  'tool/verify_token_exports.mjs',
]);

export const PROTECTED_CONTENT_PATTERNS = [
  /^lib\//,
  /^web\/src\//,
  /^tokens\//,
  /^dist\//,
];

/**
 * @param {string} file
 */
export function isControlPlane(file) {
  return CONTROL_PLANE_PATTERNS.some((pattern) => pattern.test(file));
}

/**
 * @param {string} file
 */
export function isProtectedContent(file) {
  return PROTECTED_CONTENT_PATTERNS.some((pattern) => pattern.test(file));
}

/**
 * @param {string} file
 */
export function isSafeToolFile(file) {
  return SAFE_TOOL_ALLOWLIST.has(file);
}

/**
 * Safe T0 content paths (control plane and protected paths excluded first).
 * @param {string} file
 */
export function isSafeContent(file) {
  if (isControlPlane(file) || isProtectedContent(file)) return false;
  if (/^docs\//.test(file)) return true;
  if (/^test\//.test(file)) return true;
  if (isSafeToolFile(file)) return true;
  if (/^[^/]+\.md$/i.test(file)) return true;
  return false;
}

/**
 * @param {string[]} files
 * @returns {ClassifyResult}
 */
export function classifyFiles(files) {
  const unique = [...new Set(files.filter(Boolean))];

  if (unique.length === 0) {
    return { tier: 'T1', reason: 'no-files', triggerFile: null };
  }

  for (const file of unique) {
    if (isControlPlane(file)) {
      return { tier: 'T1', reason: 'control-plane', triggerFile: file };
    }
  }

  for (const file of unique) {
    if (isProtectedContent(file)) {
      return { tier: 'T1', reason: 'protected-content', triggerFile: file };
    }
  }

  for (const file of unique) {
    if (!isSafeContent(file)) {
      return { tier: 'T1', reason: 'ambiguous-path', triggerFile: file };
    }
  }

  return { tier: 'T0', reason: 'safe-content', triggerFile: null };
}
