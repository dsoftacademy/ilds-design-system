/**
 * Control-plane PR authorship invariant (L3/L4).
 * Agent and CI PRs must be authored by the bot so the human can approve.
 *
 * @see docs/CONTROL_PLANE_INTEGRITY.md
 */

export const ILDS_BOT_LOGIN = 'uniquedesignpratishek-maker';

/** Human logins that must never author agent/CI PRs (cannot self-approve). */
export const HUMAN_AUTHOR_LOGINS = new Set(['dsoftacademy']);

/** Bot/service accounts whose approvals never satisfy Code Owner review (L4). */
export const BOT_REVIEWER_LOGINS = new Set([
  ILDS_BOT_LOGIN,
  'github-actions[bot]',
  'dependabot[bot]',
]);

/**
 * @param {string | undefined} login
 */
export function isHumanAuthor(login) {
  return login != null && HUMAN_AUTHOR_LOGINS.has(login);
}

/**
 * @param {string | undefined} login
 */
export function isBotReviewer(login) {
  if (!login) return false;
  const normalized = login.toLowerCase();
  return [...BOT_REVIEWER_LOGINS].some((b) => b.toLowerCase() === normalized);
}

/**
 * @param {string | undefined} authorLogin
 */
export function assertPrAuthorAllowsHumanApproval(authorLogin) {
  if (isHumanAuthor(authorLogin)) {
    throw new Error(
      `PR author "${authorLogin}" is human — agent/CI PRs must be authored by ${ILDS_BOT_LOGIN} so the human can approve (L3).`,
    );
  }
}

/**
 * @param {string} login
 */
export function assertAuthenticatedBotLogin(login) {
  if (login !== ILDS_BOT_LOGIN) {
    throw new Error(
      `Agent PR creation requires bot token (${ILDS_BOT_LOGIN}), got "${login}". Set ILDS_AUTO_MERGE_TOKEN.`,
    );
  }
}

/**
 * @param {string} codeownersText
 */
export function validateCodeownersNoBot(codeownersText) {
  for (const line of codeownersText.split('\n')) {
    if (/^\s*#/.test(line) || !line.trim()) continue;
    if (/@uniquedesignpratishek-maker/i.test(line)) {
      throw new Error('Bot must not appear in CODEOWNERS (L4).');
    }
  }
}

/**
 * @param {string} codeownersText
 */
export function validateCodeownersCatchAll(codeownersText) {
  const lastRule = codeownersText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .at(-1);
  if (!lastRule || !/^\*\s+@dsoftacademy/.test(lastRule)) {
    throw new Error('CODEOWNERS must end with catch-all: * @dsoftacademy (L5).');
  }
}

/**
 * @param {Function} githubRequestFn
 * @param {string} token
 */
export async function fetchAuthenticatedLogin(token, githubRequestFn) {
  const user = await githubRequestFn(token, 'GET', '/user');
  return user.login;
}

/**
 * Resolve token for agent/CI PR creation — prefer bot PAT.
 *
 * @param {{ githubRequestFn: Function; allowDryRun?: boolean; requireBotInCi?: boolean }}
 */
export async function resolveAgentPrToken({
  githubRequestFn,
  allowDryRun = false,
  requireBotInCi = true,
}) {
  const botToken = process.env.ILDS_AUTO_MERGE_TOKEN;
  if (botToken) {
    return { token: botToken, source: 'ILDS_AUTO_MERGE_TOKEN' };
  }

  if (requireBotInCi && process.env.GITHUB_ACTIONS === 'true') {
    throw new Error(
      'CI PR creation requires ILDS_AUTO_MERGE_TOKEN (bot authorship — L3). GITHUB_TOKEN is not sufficient.',
    );
  }

  const fallback = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!fallback) {
    return { token: null, source: null };
  }

  if (allowDryRun) {
    return { token: fallback, source: 'dry-run' };
  }

  const login = await fetchAuthenticatedLogin(fallback, githubRequestFn);
  assertAuthenticatedBotLogin(login);
  return { token: fallback, source: 'GITHUB_TOKEN' };
}

/**
 * Whether GitHub should allow merge (red-team simulation — L1/L2/L4).
 *
 * @param {'T0' | 'T1'} tier
 * @param {Array<{ state?: string; user?: { login?: string } }>} reviews
 */
export function mergeGateSatisfied(tier, reviews) {
  if (tier === 'T0') return true;
  return reviews.some(
    (r) => r.state === 'APPROVED' && r.user?.login && !isBotReviewer(r.user.login),
  );
}

/**
 * PAT scopes the bot must never hold (L8 — enforced at org level; asserted in tests).
 */
export const FORBIDDEN_BOT_PAT_SCOPES = ['admin:repo_hook', 'admin:org', 'delete_repo'];
