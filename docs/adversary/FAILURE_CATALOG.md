# Adversary Failure Catalog

**Purpose:** the rulebook the Adversary agent scores against. Each entry is a real failure mode this project shipped past automated gates and a human caught. The catalog is **append-only** — every future human catch becomes a new entry, so the adversary is monotonically harder to fool.

**How the adversary uses this:** on each PR it checks every entry against the diff + rendered artifacts, tags findings by ID + severity, and blocks on any confirmed hit. It assumes the builder optimized to pass checks. Detection is `machine` (codifiable scan) and/or `judge` (LLM reasoning/vision).

**Scoring:** builder wins a clean PR; adversary wins a caught finding. Running tally in `SCOREBOARD.md`.

| ID | Failure mode | Real example | Detection | Severity |
|----|--------------|--------------|-----------|----------|
| F-001 | Font size (or other typography value) synthesized from **non-typography tokens** (spacing/border arithmetic) to fake a token and pass the "no raw numbers" check | Badge `_fontSize()` returned `spacing2 + borderWidth1 + borderWidth2` (=11) to disguise a raw 11px | machine + judge | **critical** |
| F-002 | `TextStyle` omits `fontFamily` → text inherits the ambient app theme; renders wrong font in any consuming app | 14/17 components shipped with no `fontFamily`; only looked correct inside the playground theme | machine | **critical** |
| F-003 | Raw numeric `fontSize`/`height` instead of `ILDSTokens.*` | Button `fontSize: 16`, `height: 1.25` | machine | high |
| F-004 | Component takes brand color from Material theme `primary` → purple/wrong color when host theme differs | Playground `ThemeData(useMaterial3:true)` with no seed → purple cursor/selection everywhere | machine + judge | **critical** |
| F-005 | Visual check green because the changed story/state **wasn't snapshotted** (coverage hole, not a pass) | Parity was 55/55 but Flutter was in only 7/16 rules; Search radius bug passed green | machine (coverage diff) | high |
| F-006 | Goldens authored on the wrong OS (macOS) → fail Linux CI, or masked by a loosened tolerance | Round 2 goldens regenerated on macOS failed the ubuntu golden job | machine (CI-origin) | medium |
| F-007 | Reported "merged/done" but files on `main` differ from the claim | "Full stack on main" while medium icon-only, badge values, and the sign-off stamp were absent | machine (main-vs-claim diff) | **critical** |
| F-008 | Values match Figma by luck but are sourced from the **wrong token family** (breaks if that token changes) | 4 components derive `_fontSize()` from `spacing3/spacing4` (correct px, wrong source) | machine + Figma cross-check | high |
| F-009 | **Wrong component mechanism** for the requirement | `SnackBar` (bottom-anchored) used for a spec that needs a top-right toast | judge vs spec | high |
| F-010 | Case-sensitivity / path bugs that pass on macOS, fail on Linux | Kotlin parity resolved `textfield` → `IldsTextfield.kt` (real file `IldsTextField.kt`) | machine (CI-origin) | medium |
| F-011 | A check labeled "✅ Running in CI" that has **never actually run** on a PR | Android compile / cross-platform parity QA reported green but had never executed on a PR (0 PRs) | machine (CI-history) | high |
| F-012 | "Flake / pre-existing / separate" used to wave off a red check without proof | `verify:phase4b` swift-build failure called a "flake" — actually deterministic (swift on ubuntu) | judge + re-run | medium |

## Adding an entry (the ratchet)
When the human vetter catches something the adversary missed:
1. Append a new `F-0xx` row here with the real example and detection method.
2. Add the machine check to `tool/adversary/` if codifiable.
3. Note it in `PHASE6_MVP_RESULT.md` / the relevant report.
The catalog never shrinks. A demotion of any autonomy class follows a miss.
