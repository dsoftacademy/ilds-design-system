# ILDS — Handoff for a fresh chat (updated 2026-07-06)

Paste the companion prompt into the new chat; it points here. Read this top-to-bottom first.

**Also read:** `docs/CURSOR_AGENT_RULES.md` (Cursor git/PR rules — mandatory for builders).

---

## 0. THE HUMAN'S ROLE — read this before anything else

**Pratishek is a VISUAL TESTER ONLY.**
- He uses the **ILDS UI Review Portal** (`npm run review:ui` → http://localhost:4400): rendered component (React / Flutter / iOS / Android tabs) + **defined objective** → **Pass / Fail**. That is the **only** human gate for component work.
- He does **NOT**: read code, read diffs, read adversary findings, touch git, click Merge in GitHub, or approve PRs as a merge chore. **Do not ask him to.**
- Slack is **notify-only** (link to portal). No Slack Approve buttons (removed 2026-07-06).
- **Agents own everything else:** adversary auto-fixes code findings; **bot** opens PRs and merges after the human's visual Pass (components) or after T0 auto-merge (safe docs/tooling).

**THE REVIEW PORTAL EXISTS** (#44 + #45 merged to `main`). `docs/REVIEW_UI.md` + `tool/review_ui/`.

**Control-plane (guardrails):** Human is **not** the default merge driver. Agents ship guardrails via **bot-authored PRs**; prefer T0 paths where possible. Do **not** loop the human on "Authorize control-plane PR" unless he explicitly opts in. (#35 lesson: gate stays on; human interface stays visual.)

**Never** treat the human as a code reviewer.

---

## 1. What this project is

- **ILDS** = ICICI Lombard multi-platform design system: **Flutter** (primary), **React**, **iOS SwiftUI**, **Android Compose**. Figma = source of truth.
- Repo: **`dsoftacademy/ilds-design-system`**. `main`-only, everything via PRs.
- Local: `/Users/pb09/ILDS Automation/ilds-design-system`
- Roles: **Cursor = builder**, **Claude = adversary/orchestrator/docs**, **Pratishek = visual vetter only**.

---

## 2. Where we are (2026-07-06)

- **Phases 0–5:** done (tokens, parity, router T0/T1, auto-merge, adversary in CI).
- **Control-plane gate:** closed + red-team proven (`docs/CONTROL_PLANE_INTEGRITY.md`). L8 PAT audited. L12 Slack approve **retired** (portal replaces it).
- **Phase 6 MVP:** proven (adversary caught planted + real radio dodge).
- **Phase 7 — ILDS UI Review Portal:** **on `main`** (#44 MVP, #45 login/multi-platform/log/Slack-notify-only).
- **Merged component work:** #41 radio recalibrate, #42 selection-button typography (visual check passed in portal).
- **In progress:** typography debt — **`ilds_tag.dart`**, **`ilds_text_link.dart`** still on legacy spacing-derived font whitelist.

---

## 3. Operating model (current)

| Path | Flow | Human? |
|------|------|--------|
| **Component (T1)** | Bot PR → adversary green → Visual Objective → portal preview → **Pass/Fail** → bot merges | Visual only |
| **Safe docs (T0)** | Bot PR → checks green → bot auto-merges | No |
| **Control-plane (T1)** | Bot PR → Impact Summary → agents merge path; **do not default to human Authorize** | No (unless he asks) |

Portal polls GitHub every 20s; browser notifications when new items need eyes.

---

## 4. Control-plane gate (do NOT break)

See `docs/CONTROL_PLANE_INTEGRITY.md`. Invariant: no protected/control-plane PR to `main` without real human approval the bot can't forge.

- Bot **`uniquedesignpratishek-maker`** authors all agent PRs (L3). **Never `gh pr create` as `dsoftacademy`** — use `gh workflow run bot-open-pr.yml` (see `docs/CURSOR_AGENT_RULES.md`).
- Human Pass in portal submits GitHub approval **as the human's token** (never bot).
- Branch protection: 1 approval + CODEOWNERS + required checks + dismiss stale + no bypass.

---

## 5. Open PRs

**None** as of 2026-07-06. Next bot PRs should be typography debt (tag, text_link).

---

## 6. Immediate next work (agent-owned)

1. **Typography debt:** `ilds_tag.dart`, `ilds_text_link.dart` — bot PR, Visual Objective, portal Pass/Fail.
2. **Never regress:** human-as-PR-author, Slack approve, "please authorize #N" in chat.
3. Later: agent-org multi-platform builders, Figma write-back (gated).

---

## 7–9. Unchanged

See prior handoff for models/costs, failure catalog, key docs, recurring lessons (verify from repo, adversary catches dodges, human ≠ code reviewer), and Pratishek's working style (short, tool-first, no filler, he does **no git**).
