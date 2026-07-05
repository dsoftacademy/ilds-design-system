#!/usr/bin/env node
/**
 * Human-only: append a debt acknowledgement to docs/adversary/DEBT_LEDGER.md
 *
 *   node tool/adversary/acknowledge_debt.mjs \
 *     --id F-001 --file lib/ilds_radio.dart --anchor _innerSize \
 *     --pr 31 --signer "Pratishek"
 */

import { parseArgs } from 'node:util';
import { appendLedgerRow } from './debt_ledger.mjs';

const { values: args } = parseArgs({
  options: {
    id: { type: 'string' },
    file: { type: 'string' },
    anchor: { type: 'string', default: '—' },
    pr: { type: 'string' },
    signer: { type: 'string' },
    note: { type: 'string', default: '—' },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (args.help) {
  console.log(`Usage:
  node tool/adversary/acknowledge_debt.mjs \\
    --id F-001 --file lib/ilds_radio.dart --anchor _innerSize \\
    --pr 31 --signer "Pratishek" [--note "reason"]

Human maintainer only. The bot may never run this.`);
  process.exit(0);
}

for (const key of ['id', 'file', 'pr', 'signer']) {
  if (!args[key]) {
    console.error(`Missing required --${key}`);
    process.exit(1);
  }
}

try {
  appendLedgerRow({
    id: args.id,
    file: args.file,
    anchor: args.anchor,
    acknowledgedBy: args.signer,
    pr: args.pr.startsWith('#') ? args.pr : `#${args.pr}`,
    date: new Date().toISOString().slice(0, 10),
    note: args.note,
  });
  console.log(`Acknowledged ${args.id} on ${args.file} → docs/adversary/DEBT_LEDGER.md`);
} catch (err) {
  console.error(err.message ?? err);
  process.exit(1);
}
