# ILDS Design System

ICICI Lombard Design System repository with:

- Flutter component library (`lib/`)
- Token source (`tokens/tokens.json`)
- Figma Code Connect mappings (`*.figma.ts`)
- Supernova sync automation (`.github/workflows/sync-supernova.yml`)
- Figma plugin (`ilds-plugin/`)

## Project layout

- `lib/` — Dart components and token class (`design_system/ilds_tokens.dart`)
- `tokens/` — DTCG token JSON consumed by automation
- `.github/workflows/` — CI/CD sync workflows
- `ilds-plugin/` — Figma token sync plugin source
- `example/` — in-repo playground app
- `ilds_component_playground_app/` — standalone-ready interactive playground app
- `docs/` — process docs index and future structured documentation

## Common commands

- Flutter checks:
  - `/Users/pb09/flutter/bin/flutter analyze lib/`
- Code Connect publish:
  - `npm run code-connect:publish`
- Standalone playground app:
  - `cd ilds_component_playground_app`
  - `/Users/pb09/flutter/bin/flutter pub get`
  - `/Users/pb09/flutter/bin/flutter run -d chrome`

## Real-time component testing

Use `ilds_component_playground_app/` for interactive state testing.
It uses a path dependency to this repo, so edits in `lib/` appear with hot reload.
