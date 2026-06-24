## What changed

<!-- Component / token / variant / state — be specific. Link related issue if any. -->

- **Type:** <!-- component | token | variant | state | infrastructure -->
- **Scope:**

## Platforms affected

<!-- Check all that apply and note what changed on each. -->

- [ ] React (Storybook / `web/src/`)
- [ ] Flutter (`lib/`, golden tests)
- [ ] iOS (`ios/`)
- [ ] Android (`android/`)

## Visual diff

<!-- Required for any UI change. -->

- **Chromatic (React):** <!-- build URL from PR checks → Chromatic Visual Regression -->
- **Flutter goldens:** <!-- updated on Linux? list `test/golden/` files if yes; N/A if no Flutter UI change -->

## Figma reference(s)

<!-- Node ID(s) or Figma URL — Figma wins for fidelity decisions. -->

- **Figma node(s):**

## Checklist

- [ ] `npm run verify:parity` green (64/64)
- [ ] `npm run verify:tokens` green (124 tokens)
- [ ] `flutter analyze lib/` clean (if Flutter touched)
- [ ] Flutter goldens updated on **Linux** only (if Flutter UI changed)
- [ ] No hardcoded colors/spacing/typography outside `ILDSTokens` / design tokens
- [ ] Token pipeline internals **not** modified (`style-dictionary.config.mjs`, `tool/generate_ilds_tokens.dart`, `build-tokens.yml`) unless this PR is explicitly a token-pipeline change

## Human sign-off

<!-- Phase 5: merge only after DS owner approval. Do not self-merge. -->

- [ ] DS owner reviewed and approved
