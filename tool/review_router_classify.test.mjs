import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { classifyFiles } from './lib/review_router_classify.mjs';

describe('review_router_classify', () => {
  it('T0 for docs-only changes', () => {
    assert.deepEqual(classifyFiles(['docs/PHASE5_COMPLETE.md']), {
      tier: 'T0',
      reason: 'safe-content',
      triggerFile: null,
    });
  });

  it('T0 for test paths and allowlisted tool scripts', () => {
    assert.equal(classifyFiles(['test/foo_test.dart']).tier, 'T0');
    assert.equal(classifyFiles(['tool/verify_token_exports.mjs']).tier, 'T0');
    assert.equal(classifyFiles(['tool/verify_cross_platform_parity.mjs']).tier, 'T0');
  });

  it('T1 for lib changes', () => {
    const result = classifyFiles(['lib/ilds_radio.dart']);
    assert.equal(result.tier, 'T1');
    assert.equal(result.reason, 'protected-content');
  });

  it('T1 for control-plane paths', () => {
    assert.equal(classifyFiles(['.github/workflows/review-router.yml']).reason, 'control-plane');
    assert.equal(classifyFiles(['docs/adversary/FAILURE_CATALOG.md']).reason, 'control-plane');
    assert.equal(classifyFiles(['docs/PHASE5F_ROUTER_SETTINGS.md']).reason, 'control-plane');
    assert.equal(classifyFiles(['docs/PHASE5F_T0_PROOF.md']).tier, 'T0');
  });

  it('T1 for router self-modification (classifier and runner)', () => {
    const classifier = classifyFiles(['tool/lib/review_router_classify.mjs']);
    assert.equal(classifier.tier, 'T1');
    assert.equal(classifier.reason, 'control-plane');

    const runner = classifyFiles(['tool/review_router.mjs']);
    assert.equal(runner.tier, 'T1');
    assert.equal(runner.reason, 'control-plane');

    const routerTest = classifyFiles(['tool/review_router_classify.test.mjs']);
    assert.equal(routerTest.tier, 'T1');
    assert.equal(routerTest.reason, 'control-plane');
  });

  it('T1 for PR/Slack governance tooling (not allowlisted)', () => {
    assert.equal(classifyFiles(['tool/propose_change.mjs']).reason, 'control-plane');
    assert.equal(classifyFiles(['tool/lib/slack_pr.mjs']).reason, 'control-plane');
    assert.equal(classifyFiles(['tool/notify_pr_slack.mjs']).reason, 'control-plane');
  });

  it('T1 for unlisted tool paths (default deny)', () => {
    const result = classifyFiles(['tool/some_new_governance_script.mjs']);
    assert.equal(result.tier, 'T1');
    assert.equal(result.reason, 'ambiguous-path');
  });

  it('T1 when safe and protected paths mix', () => {
    const result = classifyFiles(['docs/foo.md', 'lib/ilds_radio.dart']);
    assert.equal(result.tier, 'T1');
    assert.equal(result.reason, 'protected-content');
  });

  it('T1 when docs and router code mix', () => {
    const result = classifyFiles(['docs/foo.md', 'tool/lib/review_router_classify.mjs']);
    assert.equal(result.tier, 'T1');
    assert.equal(result.reason, 'control-plane');
  });

  it('T1 for ambiguous paths', () => {
    const result = classifyFiles(['package.json']);
    assert.equal(result.tier, 'T1');
    assert.equal(result.reason, 'ambiguous-path');
  });
});
