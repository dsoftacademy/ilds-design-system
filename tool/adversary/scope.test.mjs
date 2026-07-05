/**
 * PR gate routing — component vs control-plane vs safe T0 skip.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  routePrGate,
  prTouchesComponentAdversary,
  prTouchesControlPlane,
} from './scope.mjs';

describe('pr gate routing', () => {
  it('control-plane-only PR (#39 shape) → control-plane gate, not skip', () => {
    const files = [
      { filename: '.github/CODEOWNERS' },
      { filename: 'tool/lib/pr_authorship.mjs' },
      { filename: 'docs/CONTROL_PLANE_INTEGRITY.md' },
    ];
    assert.equal(prTouchesComponentAdversary(files), false);
    assert.equal(prTouchesControlPlane(files), true);
    assert.equal(routePrGate(files), 'control-plane');
  });

  it('lib/ PR → component adversary', () => {
    const files = [{ filename: 'lib/ilds_radio.dart' }];
    assert.equal(routePrGate(files), 'component');
  });

  it('mixed lib + control-plane → both gates', () => {
    const files = [
      { filename: 'lib/ilds_radio.dart' },
      { filename: 'tool/review_router.mjs' },
    ];
    assert.equal(routePrGate(files), 'both');
  });

  it('docs-only safe T0 → skip', () => {
    const files = [{ filename: 'docs/PHASE5_POST_MERGE.md' }];
    assert.equal(routePrGate(files), 'skip');
  });
});
