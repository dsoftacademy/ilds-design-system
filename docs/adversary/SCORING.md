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
2. **Judge** (`tool/adversary/llm_judge.mjs`) — Opus adversarial pass, catalog cached. Runs when `ANTHROPIC_API_KEY` is set.

Machine findings are independent; judge may add findings but must not weaken machine blocks.

## CI check

Workflow: `.github/workflows/adversary-review.yml`  
Job name: **`adversary-review`** (add as 9th required check after MVP proven on `main`).

## Round 2 pass criterion

Planted dodge PR must **block** with F-001 and/or F-008 without the adversary being told a dodge was planted. A green Round 1 alone does not prove the architecture.

## Catalog ratchet

Human vetter catch → append `FAILURE_CATALOG.md` → add machine rule if codifiable → adversary re-blocks on replay.
