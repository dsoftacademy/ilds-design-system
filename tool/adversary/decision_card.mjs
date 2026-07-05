/**
 * Plain-language decision cards for human fix-or-acknowledge calls.
 * @see docs/adversary/PREEXISTING_DEBT_POLICY.md
 */

/**
 * @param {{ file?: string; anchor?: string; introduced?: boolean }} finding
 */
function humanWhere(finding) {
  const place = finding.anchor
    ? `${finding.file}, \`${finding.anchor}()\``
    : finding.file ?? 'unknown file';
  return place;
}

/**
 * @param {{ id: string; file?: string; anchor?: string; introduced?: boolean; evidence?: string; summary?: string }} finding
 */
function cardBody(finding) {
  const where = humanWhere(finding);
  const newOrExisting = finding.introduced
    ? 'You introduced this in this PR.'
    : 'Was already in the code before this PR.';

  switch (finding.id) {
    case 'F-001':
      return {
        what: finding.anchor?.includes('inner')
          ? 'A size value is worked out with spacing or border tokens (or math between them) instead of a proper size token.'
          : 'A font or label size is calculated from spacing or border tokens instead of typography tokens.',
        where,
        why: 'It is a hidden magic number. If either token changes, the size silently shifts — the same shortcut as the badge bug.',
        newOrExisting,
      };
    case 'F-002':
      return {
        what: 'Text is styled without setting the design-system font, so it inherits whatever font the host app uses.',
        where,
        why: 'Labels can render in the wrong typeface outside the playground — Mulish will not apply.',
        newOrExisting,
      };
    case 'F-008':
      return {
        what: 'A value happens to match the design in pixels but comes from the wrong token family.',
        where,
        why: 'It looks correct today but breaks if spacing or border tokens change independently of typography.',
        newOrExisting,
      };
    default:
      return {
        what: finding.summary ?? 'The adversary found a catalog issue in this file.',
        where,
        why: finding.evidence?.slice(0, 200) ?? 'See evidence in the findings table below.',
        newOrExisting,
      };
  }
}

/**
 * @param {Array<object>} blockingFindings — unacknowledged blocking findings only
 */
export function formatDecisionCards(blockingFindings) {
  if (blockingFindings.length === 0) return '';

  const lines = [
    '## ⚠️ Adversary blocked this PR — needs your call',
    '',
    'Each finding below needs **Fix now** (address in this PR) or **Acknowledge** (human-only — log to `docs/adversary/DEBT_LEDGER.md` via `tool/adversary/acknowledge_debt.mjs`; bot may never acknowledge).',
    '',
  ];

  blockingFindings.forEach((finding, index) => {
    const body = cardBody(finding);
    const ackEligible = !finding.introduced ? 'Acknowledge eligible (pre-existing debt)' : 'Fix now recommended (you introduced this)';

    lines.push(
      `### Finding ${index + 1} — ${finding.id} (${finding.severity})`,
      '',
      `**WHAT:** ${body.what}`,
      `**WHERE:** ${body.where}`,
      `**WHY IT MATTERS:** ${body.why}`,
      `**NEW OR PRE-EXISTING:** ${body.newOrExisting}`,
      `**CATALOG:** ${finding.id}, ${finding.severity}`,
      '',
      '**YOUR CALL:**',
      '- [ ] **Fix now** — builder addresses it in this PR; adversary re-runs clean',
      `- [ ] **Acknowledge** — ${ackEligible}; append to \`docs/adversary/DEBT_LEDGER.md\` (human only)`,
      '',
    );
  });

  return lines.join('\n');
}

/**
 * @param {Array<object>} acknowledgedFindings
 */
export function formatAcknowledgedSection(acknowledgedFindings) {
  if (acknowledgedFindings.length === 0) return '';

  const lines = [
    '### Acknowledged debt (this PR proceeds)',
    '',
    'These findings are tracked on `docs/adversary/DEBT_LEDGER.md`. The adversary will keep reporting them until fixed.',
    '',
    '| ID | File | Anchor |',
    '|----|------|--------|',
  ];

  for (const f of acknowledgedFindings) {
    lines.push(`| ${f.id} | ${f.file ?? '—'} | ${f.anchor || '—'} |`);
  }

  return lines.join('\n');
}
