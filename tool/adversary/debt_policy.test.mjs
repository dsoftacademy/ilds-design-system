import test from 'node:test';
import assert from 'node:assert/strict';
import {
  enrichFindingsWithScope,
  extractAnchor,
  isIntroducedInDiff,
} from './diff_scope.mjs';
import { applyAcknowledgements, loadDebtLedger, isAcknowledged } from './debt_ledger.mjs';

test('extractAnchor finds _innerSize from judge evidence', () => {
  const anchor = extractAnchor({
    evidence: 'lib/ilds_radio.dart _innerSize() medium case returns spacing5 / borderWidth2',
  });
  assert.equal(anchor, '_innerSize');
});

test('pre-existing finding when patch does not touch anchor', () => {
  const finding = {
    id: 'F-001',
    evidence: 'lib/ilds_radio.dart _innerSize() medium case',
    file: 'lib/ilds_radio.dart',
    anchor: '_innerSize',
  };
  const prFiles = [
    {
      filename: 'lib/ilds_radio.dart',
      status: 'modified',
      patch: `@@ -60,7 +60,7 @@
-  double _fontSize() {
+  double _labelFontSize() {
       case IldsRadioSize.small:
-        return ILDSTokens.spacing3;
+        return ILDSTokens.fontSize12;
`,
    },
  ];
  assert.equal(isIntroducedInDiff(finding, prFiles), false);
});

test('introduced finding when patch modifies anchor method', () => {
  const finding = {
    id: 'F-001',
    evidence: 'lib/ilds_radio.dart _labelFontSize()',
    file: 'lib/ilds_radio.dart',
    anchor: '_labelFontSize',
  };
  const prFiles = [
    {
      filename: 'lib/ilds_radio.dart',
      status: 'modified',
      patch: `@@ -60,7 +60,7 @@
-  double _fontSize() {
+  double _labelFontSize() {
`,
    },
  ];
  assert.equal(isIntroducedInDiff(finding, prFiles), true);
});

test('acknowledged finding excluded from blocking score path', () => {
  const findings = enrichFindingsWithScope(
    [
      {
        id: 'F-001',
        severity: 'critical',
        summary: 'test',
        evidence: 'lib/ilds_radio.dart _innerSize()',
        source: 'judge',
      },
    ],
    [
      {
        filename: 'lib/ilds_radio.dart',
        status: 'modified',
        patch: '+  double _labelFontSize()',
      },
    ],
  );

  const ledger = [
    {
      id: 'F-001',
      file: 'lib/ilds_radio.dart',
      anchor: '_innerSize',
      acknowledgedBy: 'Pratishek',
      pr: '#31',
      date: '2026-07-05',
      note: '—',
    },
  ];

  const withAck = applyAcknowledgements(findings, ledger);
  assert.equal(isAcknowledged(withAck[0], ledger), true);
  assert.equal(withAck[0].introduced, false);
});

test('loadDebtLedger parses empty template', () => {
  const entries = loadDebtLedger(new URL('../..', import.meta.url).pathname);
  assert.ok(Array.isArray(entries));
});
