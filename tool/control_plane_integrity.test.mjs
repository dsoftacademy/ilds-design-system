/**
 * Red-team tests for control-plane gate — docs/CONTROL_PLANE_INTEGRITY.md
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { classifyFiles } from './lib/review_router_classify.mjs';
import { isApproverAllowed } from './lib/slack_pr.mjs';
import {
  assertPrAuthorAllowsHumanApproval,
  assertAuthenticatedBotLogin,
  validateCodeownersCatchAll,
  validateCodeownersNoBot,
  mergeGateSatisfied,
  ILDS_BOT_LOGIN,
  HUMAN_AUTHOR_LOGINS,
  BOT_REVIEWER_LOGINS,
  FORBIDDEN_BOT_PAT_SCOPES,
} from './lib/pr_authorship.mjs';
import {
  autoMergePlanForTier,
  hasHumanApproval,
} from './review_router.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CODEOWNERS_PATH = path.join(REPO_ROOT, '.github/CODEOWNERS');

describe('L1/L2 — no human approval → cannot merge (T1)', () => {
  it('bot-only approval does not satisfy T1 merge gate', () => {
    const botOnly = [{ state: 'APPROVED', user: { login: ILDS_BOT_LOGIN } }];
    assert.equal(mergeGateSatisfied('T1', botOnly), false);
    assert.equal(hasHumanApproval(botOnly), false);
  });

  it('zero reviews does not satisfy T1 merge gate', () => {
    assert.equal(mergeGateSatisfied('T1', []), false);
  });

  it('human approval satisfies T1 merge gate', () => {
    const human = [{ state: 'APPROVED', user: { login: 'dsoftacademy' } }];
    assert.equal(mergeGateSatisfied('T1', human), true);
    assert.equal(hasHumanApproval(human), true);
  });
});

describe('L3 — PR authorship', () => {
  it('rejects human-authored agent PRs', () => {
    for (const human of HUMAN_AUTHOR_LOGINS) {
      assert.throws(
        () => assertPrAuthorAllowsHumanApproval(human),
        /human.*must be authored by/,
      );
    }
  });

  it('allows bot-authored PRs', () => {
    assert.doesNotThrow(() => assertPrAuthorAllowsHumanApproval(ILDS_BOT_LOGIN));
    assert.doesNotThrow(() => assertPrAuthorAllowsHumanApproval('github-actions[bot]'));
  });

  it('rejects human token for agent PR creation', () => {
    assert.throws(
      () => assertAuthenticatedBotLogin('dsoftacademy'),
      /requires bot token/,
    );
  });
});

describe('L4 — bot approval never satisfies Code Owner gate on T1', () => {
  it('T1 auto-merge plan never includes bot approval', () => {
    assert.equal(autoMergePlanForTier('T1').botApproves, false);
  });

  it('bot logins excluded from hasHumanApproval', () => {
    for (const bot of BOT_REVIEWER_LOGINS) {
      assert.equal(
        hasHumanApproval([{ state: 'APPROVED', user: { login: bot } }]),
        false,
      );
    }
  });

  it('CODEOWNERS does not list the bot as an owner', () => {
    const text = fs.readFileSync(CODEOWNERS_PATH, 'utf8');
    assert.doesNotThrow(() => validateCodeownersNoBot(text));
  });
});

describe('L5 — CODEOWNERS catch-all + default-deny classifier', () => {
  it('CODEOWNERS ends with * @dsoftacademy catch-all', () => {
    const text = fs.readFileSync(CODEOWNERS_PATH, 'utf8');
    assert.doesNotThrow(() => validateCodeownersCatchAll(text));
  });

  it('unlisted tool path is T1 (default deny)', () => {
    const result = classifyFiles(['tool/new_unknown_script.mjs']);
    assert.equal(result.tier, 'T1');
  });
});

describe('L6/L7 — control-plane paths require T1 review', () => {
  it('workflow edits are control-plane', () => {
    assert.equal(
      classifyFiles(['.github/workflows/adversary-review.yml']).reason,
      'control-plane',
    );
  });

  it('CODEOWNERS edits are control-plane', () => {
    assert.equal(classifyFiles(['.github/CODEOWNERS']).reason, 'control-plane');
  });

  it('classifier self-modification is control-plane', () => {
    assert.equal(
      classifyFiles(['tool/lib/review_router_classify.mjs']).tier,
      'T1',
    );
    assert.equal(classifyFiles(['tool/review_router.mjs']).tier, 'T1');
  });

  it('CONTROL_PLANE_INTEGRITY doc is control-plane', () => {
    assert.equal(
      classifyFiles(['docs/CONTROL_PLANE_INTEGRITY.md']).reason,
      'control-plane',
    );
  });
});

describe('L8 — bot token scope guard (documented)', () => {
  it('forbidden admin scopes are enumerated for org audit', () => {
    assert.ok(FORBIDDEN_BOT_PAT_SCOPES.includes('admin:org'));
    assert.ok(FORBIDDEN_BOT_PAT_SCOPES.length >= 2);
  });
});

describe('L12 — Slack approval authorization', () => {
  it('non-allowlisted Slack user cannot approve when allowlist is set', () => {
    const prev = process.env.SLACK_APPROVER_USER_IDS;
    process.env.SLACK_APPROVER_USER_IDS = 'U_REAL_OWNER';
    try {
      assert.equal(isApproverAllowed('U_RANDOM'), false);
      assert.equal(isApproverAllowed('U_REAL_OWNER'), true);
    } finally {
      if (prev === undefined) delete process.env.SLACK_APPROVER_USER_IDS;
      else process.env.SLACK_APPROVER_USER_IDS = prev;
    }
  });
});
