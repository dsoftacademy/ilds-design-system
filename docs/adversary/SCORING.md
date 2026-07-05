# Adversary scoring

**Purpose:** how the adversary scores PRs in Phase 6 MVP.

## Roles

| Outcome | Builder score | Adversary score |
|---------|---------------|-----------------|
| Clean PR (no confirmed catalog hits) | 1 | 0 |
| Any confirmed **critical** or **high** finding | 0 | 1 |

Running tally: `docs/adversary/SCOREBOARD.md`.

## Layers

1. **Machine** (`tool/adversary/machine_checks.mjs`) — deterministic scans for F-001, F-002, F-003, F-008 on changed `lib/**/*.dart`. Always runs in CI.
2. **Judge** (`tool/adversary/llm_judge.mjs`) — Opus 4.8 adversarial pass; stable prefix (system + catalog) cached via single `cache_control` block. Runs when `ANTHROPIC_API_KEY` is set; required in CI (`ILDS_ADVERSARY_REQUIRE_JUDGE=true`).

Machine findings are independent; judge may add findings but must not weaken machine blocks.

## Pre-existing debt (fix-or-acknowledge)

On **BLOCK**, the report includes plain-language **decision cards** per finding (`docs/adversary/PREEXISTING_DEBT_POLICY.md`). Whole touched files are in scope — not diff-only.

- **Fix now:** address in the same PR; adversary re-runs clean.
- **Acknowledge:** human-only via `node tool/adversary/acknowledge_debt.mjs` → appends to `docs/adversary/DEBT_LEDGER.md`. Acknowledged findings no longer block that PR; the adversary keeps reporting them until fixed. **The bot may never acknowledge.**

## CI check

Workflow: `.github/workflows/adversary-review.yml`  
Job name: **`adversary-review`** (add as 9th required check after MVP proven on `main`).

**Routing** (`tool/adversary/pr_gate.mjs`) — one required check name, different gates by path:

| PR touches | Gate | What runs |
|------------|------|-----------|
| `lib/`, `web/src/`, `tokens/`, `tool/adversary/`, `docs/adversary/` | Component fidelity | Machine checks + Opus judge (`run_review.mjs`) |
| Control-plane paths — no component paths | Control-plane integrity | `npm run test:integrity` (L1–L8 / L12) |
| Both component and control-plane paths | Both gates | Adversary review **and** integrity tests |
| Safe T0 content only (docs, allowlisted tool scripts) | Skip | Job succeeds with explicit N/A report (same pattern as Chromatic skip) |

Control-plane PRs are **not** rubber-stamped: they must pass integrity tests. Human Code Owner review remains required for T1.

## Round 2 pass criterion

Planted dodge PR must **block** with F-001 and/or F-008 without the adversary being told a dodge was planted. A green Round 1 alone does not prove the architecture.

## Catalog ratchet

Human vetter catch → append `FAILURE_CATALOG.md` → add machine rule if codifiable → adversary re-blocks on replay.
