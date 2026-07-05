# Adversary — pre-existing debt policy

**Decision (Pratishek, 2026-07-05):** the adversary reviews the **whole touched file**, not just the diff. If it finds a real issue — even one that existed before this PR — it **blocks** and **flags it to the human in plain language** for a fix-or-acknowledge decision.

**Why whole-file, not diff-only:** the Round 1 result proved it. The adversary caught `lib/ilds_radio.dart` `_innerSize()` = `spacing5 / borderWidth2` — a real dodge sitting on `main`, untouched by the PR. Diff-only scope would have missed it. Whole-file scope is what makes the adversary find real bugs; keep it.

## What the adversary must produce on a BLOCK

For every finding, a **plain-language decision card** — no jargon, written for a human who isn't reading the code:

```
⚠️ Adversary blocked this PR — needs your call

WHAT: <one sentence, plain English, what's wrong>
WHERE: <file + the thing, e.g. "radio button's inner dot size">
WHY IT MATTERS: <one sentence — the risk in real terms>
NEW OR PRE-EXISTING: <"you introduced this" | "was already in the code before this PR">
CATALOG: <F-0xx + severity>

YOUR CALL:
  [ ] Fix now   — the builder fixes it in this PR
  [ ] Acknowledge — leave it for now; logged as tracked debt, PR proceeds
```

Example (the real radio finding, in plain language):
> **WHAT:** The radio button's inner dot size is worked out with an odd math trick — dividing a spacing value by a border thickness — instead of a proper size value.
> **WHERE:** `lib/ilds_radio.dart`, the medium radio dot.
> **WHY IT MATTERS:** It's a hidden magic number. If either token changes, the dot silently resizes. It's the same shortcut as the badge bug we already fixed.
> **NEW OR PRE-EXISTING:** Was already in the code before this PR.
> **CATALOG:** F-001, critical.

## The human decision, mechanically

- **Fix now:** builder addresses it in the same PR; adversary re-runs; must go clean.
- **Acknowledge:** the human records the acknowledgement (a maintainer-only label or a signed line in `docs/adversary/DEBT_LEDGER.md`). Only a human acknowledgement (never the bot) lets a PR proceed with an open finding. The debt is now tracked and shows on the ledger until fixed.

## Guardrails
- The **bot may never acknowledge** a finding — acknowledgement is a human-only control-plane action.
- Acknowledging does **not** delete the finding — it moves it to the ledger; the adversary keeps reporting it on future PRs that touch the file until fixed.
- Introduced (new) findings should default to **Fix now** — only pre-existing debt is normally acknowledge-eligible.
- This behavior lives in `tool/adversary/` (control-plane) — changes route to the human.
