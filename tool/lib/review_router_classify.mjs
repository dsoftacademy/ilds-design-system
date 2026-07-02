/**
 * Phase 5f — path classifier for selective review router.
 * Bias: any ambiguity → T1 (needs-human).
 */

/** @typedef {'T0' | 'T1'} ReviewTier */

/** @typedef {{ tier: ReviewTier; reason: string; triggerFile: string | null }} ClassifyResult */

export const CONTROL_PLANE_PATTERNS = [
  /^\.github\//,
  /^agents\//,
  /^tool\/adversary\//,
  /^docs\/adversary\/FAILURE_CATALOG\.md$/,
  /^CURSOR_.*ROUTER.*\.md$/i,
  /^docs\/PHASE5F_/,
];

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
 * Safe T0 content paths (control plane and protected paths excluded first).
 * @param {string} file
 */
export function isSafeContent(file) {
  if (isControlPlane(file) || isProtectedContent(file)) return false;
  if (/^docs\//.test(file)) return true;
  if (/^test\//.test(file)) return true;
  if (/^tool\//.test(file)) return true;
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
