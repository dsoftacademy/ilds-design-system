# Phase 6/7 — Agent-Org Architecture

**Date:** 2026-07-02
**Author:** Claude (with Pratishek)
**Status:** Target architecture. Built only AFTER the MVP (`CURSOR_PHASE6_AGENT_MVP.md`) proves the proposer→adversary→vetter loop.
**Design stance:** defined at full capability, as if unconstrained. Costs are itemized per piece so the price of "everything" is visible — cost annotates the design, it does not shrink it.
**Cursor:** review and flag/revert any tangent from the objective. This is a plan, not a mandate to build ahead of the MVP.

## Objective

Collapse a full design-system team — product designer, four platform developers, QC, and doc/comms — into an orchestrated set of agents, with **one human as the vetting authority**. Not humanless: human judgment stays at a single, well-instrumented gate. The agents do the labor — faster, more researched, cross-platform-consistent; the human decides.

## The org chart

```
                    ┌──────────── Human Vetter (Pratishek) ────────────┐
                    │  single merge authority · visual judgment gate    │
                    └───────────────────────▲──────────────────────────┘
                                            │  decision packet (below)
        ┌────────────────────────── LEAD / ORCHESTRATOR ──────────────────────────┐
        │ decompose requirement · route to specialists · enforce cross-platform    │
        │ parity · assemble PR + decision packet · run the adversary · escalate     │
        └──┬──────────┬───────────┬────────────┬─────────────┬───────────┬─────────┘
           ▼          ▼           ▼            ▼             ▼           ▼
        SPEC       DESIGN      BUILDERS ×4    ADVERSARY     RELEASE    (Phase 7)
     research +  Figma write   Flutter/React  scoring       Supernova/  Intake
     spec + a11y  (branch)     iOS/Android    opponent      Storybook/  agent
                                              (CI, growing) Slack/Figma
```

### Role definitions
| Agent | Replaces | Does | Must NOT |
|-------|----------|------|----------|
| **Lead / Orchestrator** | DS lead / PM | Decompose the request, route work, enforce parity across platforms, assemble the PR + decision packet, invoke the adversary, escalate conflicts to the human | Merge; override the adversary |
| **Spec** | Product designer / researcher | Research the requirement, check existing patterns for conflict/duplication, produce a component spec (states, tokens, a11y/WCAG, Figma node refs) | Invent scope beyond the request |
| **Design** | Figma designer | Create/update the Figma component + variables via the write-capable MCP, **on a Figma branch** | Write to Figma master |
| **Builders ×4** | Platform devs | Implement the spec per platform (Flutter/React/iOS/Android), tokens-only, no hardcoded values | Cross into another platform's build |
| **Adversary** | QC / QA | Score points against the builders: hunt gamed/wrong output using the growing failure catalog; block on any confirmed finding | Share builder model/context; weaken a check to pass |
| **Release** | Tech writer / comms | On merge, update Supernova, Storybook, Figma Code Connect, Slack `#design-system-updates` | Act before human approval |
| **Intake (Phase 7)** | Design assistant | Receive gap/requirement requests from products, hand to Lead | Approve its own requests |

## Core principle: proposer ≠ critic

The builders' reward is "make it work." The adversary's *only* reward is "catch the dodge." They are different models, prompts, and contexts, so they don't share blind spots — the single architectural fact that prevents shipping confident, gamed, wrong components. Same-brain self-grading is banned. Disagreement escalates to the human. (Full rationale + the failure catalog live in the MVP doc.)

## The Adversary as a growing scoring opponent

Per Pratishek's directive, the adversary is a game-theoretic opponent, not a linter:
- **Scores** each builder PR (findings × severity). Builder "wins" a clean PR; adversary "wins" a caught dodge. Track the running scoreboard in `docs/adversary/SCOREBOARD.md` — it makes the loop legible and shows whether builders are improving or the adversary is finding new classes.
- **Learns and grows:** every human-caught miss becomes a new catalog entry. The catalog is append-only; the adversary is monotonically harder to fool over time. This compounding is the moat — quality that ratchets up and never regresses, seeded by *this project's* real scar tissue.
- **Independent + adversarial-prompted** (see MVP).

## The human's decision packet (design the gate for 60 seconds)

Every escalation to the vetter arrives as one packet: code diff · before/after rendered visual (all platforms) · adversary report + score · confidence · "look hardest at X" · Figma-vs-code delta. Target metric for the whole system: **human-seconds-per-change at a fixed catch-rate.** Drive that down. Autonomy is a means; a fast, high-catch human gate is the end.

## Autonomy ratchet (governance as a dial, not a switch)

Trust is earned per task-*class*, advanced by track record:
- **L0 — full review:** new components, novel changes. Human reviews everything, always.
- **L1 — light review:** task-classes with N consecutive clean vets (e.g. typography debt repoints). Human reviews the adversary report + visual only.
- **L2 — spot review:** high-volume, low-risk, long clean streak. Human samples a fraction; adversary + rubric gate the rest.
- Any adversary block, or any human catch, **demotes** the class a level. Trust falls faster than it rises.

## Bi-directional Figma (the loop that was manual through Phase 3c)

The write-capable Figma MCP lets the Design agent reconcile Figma to code (or code to Figma). **Guardrail:** all Figma writes go to a **Figma branch** with their own human approval before merge to master — an agent editing the source-of-truth canvas is a loaded gun. Ends the manual "Pratishek edits Figma every round" step, gated.

## Cost model — as if everything is possible, itemized

Design at full power; here is what full power costs so the price is visible. Rates (per M tokens, verified 2026-07-02): **Haiku 4.5** $1/$5 · **Sonnet 4.6** $3/$15 · **Opus 4.8** $5/$25. Prompt-cache hit = 10% of input (cache the catalog). Batch API = 50% off (async).

| Role | Model | ~calls / change | ~cost / change |
|------|-------|-----------------|----------------|
| Lead / Orchestrator | Opus 4.8 | 2–5 | ~$0.50–1.00 |
| Spec | Opus 4.8 | 1–2 | ~$0.40 |
| Design (Figma write) | Opus 4.8 + MCP | 1–3 | ~$0.75 |
| Builder ×4 | Sonnet 4.6 | 1–3 each | ~$0.70 total |
| **Adversary** | **Opus 4.8** (never cheaper — it's the safety net) | 1–2 | **~$0.15–0.30** |
| Release | Haiku 4.5 | 1 | ~$0.02 |

**Totals:** typography repoint (Lead + 1 Builder + Adversary) **~$1–2**. New component, 4 platforms + Figma **~$3–15** with iteration. A DS team-day is hundreds–thousands of dollars — cost is not the constraint; quality is. The adversary at ~$0.15/run is the cheapest insurance in the system; run it always.

- **Scale the org to the task:** a 3-line typography repoint = Lead + 1 Builder + Adversary (~5 calls). A new component across 4 platforms + Figma = the full chart (~20–30 calls). Never run the symphony for a triangle.
- Managed Agents are metered separately (since 15 Jun 2026). Budget per-change; put a ceiling per class; the adversary is the one role you never cheap out on.
- The compounding win: every human catch that becomes a catalog rule is a cost *saved* forever — the adversary catches it free thereafter.

## Sequencing (each stage gated by the prior)

1. **MVP** — proposer → automated adversary → vetter, on radio (known answer) + planted dodge. *(separate doc)*
2. **Single-platform org** — Lead + Flutter Builder + Adversary + Release, burn down the 3 remaining debt components (tag, text_link, selection_button) as real graded tasks.
3. **Multi-platform** — add React/iOS/Android builders; Lead enforces parity; prove on one shared change.
4. **Spec + Design agents** — full new-component build, Figma write-back on a branch.
5. **Autonomy ratchet live** — L1/L2 for proven classes.
6. **Phase 7 Intake** — products file requirements; org fulfils them end to end.

## Risks / open questions (flag before building past MVP)
- Adversary omniscience is a myth — novel breakage still needs the human; the ratchet must never reach "no human."
- Multi-agent cost can balloon; the per-class ceiling must be real.
- Figma write-back can corrupt the source of truth; branch + approval is mandatory, non-negotiable.
- Two LLMs (builder + adversary) *can* still share a blind spot on a genuinely novel class — the human is the backstop, permanently.

## Cursor review checklist
Read this + the MVP doc. Confirm: (a) nothing here contradicts the current repo/pipeline; (b) the MVP is genuinely the smallest proof of the principle; (c) no stage is scoped to run before its gate. Flag tangents in a PR comment; revert anything that drifts.
