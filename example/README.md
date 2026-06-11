# ILDS Real-Time Component Playground

This app is linked to the local repo source using a path dependency:

- `ilds_design_system` is loaded from `../` in `example/pubspec.yaml`

That means when you update component files in the repo (`lib/ilds_*.dart`), the playground uses those updates directly.

## Open and use (step-by-step)

1. Open terminal at repo root:
   - `cd "/Users/pb09/ILDS Automation/ilds-design-system"`
2. Get dependencies for the example app:
   - `cd example`
   - `/Users/pb09/flutter/bin/flutter pub get`
3. Start the playground:
   - `/Users/pb09/flutter/bin/flutter run`
4. Use the left navigation rail to open each component panel:
   - Radio, Checkbox, Switch, Text Area, Tab, Pagination, Selection Button, Badge, Tag, Accordion, Text Link, Search.

## Real-time update workflow

1. Keep the example app running.
2. Edit any component in repo root `lib/` (for example `lib/ilds_tag.dart`).
3. Save file and press `r` in terminal (or use IDE Hot Reload).
4. The updated component is reflected immediately in the playground UI.

If you changed constructor/API shape and hot reload is not enough, press `R` for hot restart.

## Showing new components when interface opens

The interface is a static component registry in `example/lib/main.dart` (`sections` + `_buildSelectedPanel`).
To include a newly created component:

1. Import it at top of `main.dart`.
2. Add its name to `sections`.
3. Add a switch case in `_buildSelectedPanel`.

On next run/open, it appears in the left navigation automatically.
