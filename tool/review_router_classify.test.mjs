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

  it('T0 for test and tooling paths', () => {
    assert.equal(classifyFiles(['test/foo_test.dart']).tier, 'T0');
    assert.equal(classifyFiles(['tool/propose_change.mjs']).tier, 'T0');
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

  it('T1 when safe and protected paths mix', () => {
    const result = classifyFiles(['docs/foo.md', 'lib/ilds_radio.dart']);
    assert.equal(result.tier, 'T1');
    assert.equal(result.reason, 'protected-content');
  });

  it('T1 for ambiguous paths', () => {
    const result = classifyFiles(['package.json']);
    assert.equal(result.tier, 'T1');
    assert.equal(result.reason, 'ambiguous-path');
  });
});
