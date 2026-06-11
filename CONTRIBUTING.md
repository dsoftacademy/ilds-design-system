# Contributing to ILDS Design System

## Repository standards

- Keep component source in `lib/ilds_*.dart`.
- Keep design token source in `tokens/tokens.json`.
- Keep Code Connect mappings in root `*.figma.ts` files.
- Keep automation configuration in `.github/workflows/` and `supernova.settings.json`.
- Do not commit local secrets (`.env`) or local worktree folders.

## Development flow

1. Create/update component in `lib/`.
2. Run targeted checks:
   - `/Users/pb09/flutter/bin/flutter analyze lib/<file>.dart`
3. Run broader checks when touching multiple files:
   - `/Users/pb09/flutter/bin/flutter analyze lib/`
4. Update corresponding `*.figma.ts` mapping when component API or Figma properties change.
5. Publish mappings:
   - `npm run code-connect:publish`

## Playground apps

- `example/`: in-repo demo app.
- `ilds_component_playground_app/`: standalone-ready app folder.

Both use path dependency to this package, so changes in `lib/` are visible via hot reload.

## Commit hygiene

- Commit only related files.
- Avoid committing generated local artifacts (except intentionally versioned lockfiles).
- Use clear messages:
  - `feat:` new component/feature
  - `fix:` bugfix
  - `chore:` maintenance
