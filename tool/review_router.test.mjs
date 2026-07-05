import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  autoMergePlanForTier,
  tierFromLabels,
  hasHumanApproval,
  LABEL_AUTO,
  LABEL_HUMAN,
  BOT_REVIEWER_LOGINS,
} from './review_router.mjs';

describe('autoMergePlanForTier', () => {
  it('T0: bot approves and enables auto-merge', () => {
    assert.deepEqual(autoMergePlanForTier('T0'), {
      botApproves: true,
      enableAutoMerge: true,
    });
  });

  it('T1: enables auto-merge but bot never approves', () => {
    assert.deepEqual(autoMergePlanForTier('T1'), {
      botApproves: false,
      enableAutoMerge: true,
    });
  });
});

describe('tierFromLabels', () => {
  it('needs-human label resolves to T1', () => {
    assert.equal(tierFromLabels([LABEL_HUMAN]), 'T1');
  });

  it('auto-merge label resolves to T0', () => {
    assert.equal(tierFromLabels([LABEL_AUTO]), 'T0');
  });

  it('needs-human takes precedence when both present', () => {
    assert.equal(tierFromLabels([LABEL_AUTO, LABEL_HUMAN]), 'T1');
  });
});

describe('T1 human approval gate', () => {
  it('T1 PR with no human approval stays unmerged (bot approval does not count)', () => {
    const botOnly = [
      { state: 'APPROVED', user: { login: 'uniquedesignpratishek-maker' } },
    ];
    assert.equal(hasHumanApproval(botOnly), false);
    assert.equal(autoMergePlanForTier('T1').botApproves, false);
  });

  it('T1 PR with human approval satisfies the gate', () => {
    const withHuman = [
      { state: 'APPROVED', user: { login: 'dsoftacademy' } },
    ];
    assert.equal(hasHumanApproval(withHuman), true);
  });

  it('ignores non-approving reviews', () => {
    const commented = [
      { state: 'COMMENTED', user: { login: 'dsoftacademy' } },
    ];
    assert.equal(hasHumanApproval(commented), false);
  });

  it('bot logins are excluded from human approval', () => {
    for (const bot of BOT_REVIEWER_LOGINS) {
      assert.equal(
        hasHumanApproval([{ state: 'APPROVED', user: { login: bot } }]),
        false,
        `${bot} must not count as human approval`,
      );
    }
  });
});
