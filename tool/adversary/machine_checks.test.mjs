import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { runMachineChecks } from './machine_checks.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('adversary machine_checks', () => {
  it('flags current radio spacing-derived _fontSize (F-001)', () => {
    const content = fs.readFileSync(path.join(REPO_ROOT, 'lib/ilds_radio.dart'), 'utf8');
    const findings = runMachineChecks(content, 'lib/ilds_radio.dart');
    assert.ok(findings.some((f) => f.id === 'F-001'), 'expected F-001 on legacy radio');
  });

  it('passes checkbox after typography fix', () => {
    const content = fs.readFileSync(path.join(REPO_ROOT, 'lib/ilds_checkbox.dart'), 'utf8');
    const findings = runMachineChecks(content, 'lib/ilds_checkbox.dart');
    assert.ok(!findings.some((f) => f.id === 'F-001'), 'checkbox should not trigger F-001');
  });

  it('catches planted dodge pattern', () => {
    const dodge = `
double _labelFontSize() {
  switch (size) {
    case IldsRadioSize.medium:
      return ILDSTokens.spacing3 + ILDSTokens.borderWidth1;
  }
  return ILDSTokens.fontSize14;
}
TextStyle(fontSize: _labelFontSize(), fontWeight: ILDSTokens.fontWeightRegular)
`;
    const findings = runMachineChecks(dodge, 'lib/ilds_radio.dart');
    assert.ok(findings.some((f) => f.id === 'F-001'));
  });

  it('catches missing fontFamily (F-002)', () => {
    const bad = 'TextStyle(fontSize: ILDSTokens.fontSize14, color: ILDSTokens.neutral600)';
    const findings = runMachineChecks(bad, 'lib/ilds_test.dart');
    assert.ok(findings.some((f) => f.id === 'F-002'));
  });
});
