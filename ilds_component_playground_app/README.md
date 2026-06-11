# ILDS Standalone Playground App

This is a separate Flutter app folder that can be moved out as its own project later.

## Why this is repo-linked in real time

`pubspec.yaml` uses:

```yaml
ilds_design_system:
  path: ../
```

So this app always reads component code directly from the parent ILDS repo `lib/`.

## Run now

1. Open terminal:
   - `cd "/Users/pb09/ILDS Automation/ilds-design-system/ilds_component_playground_app"`
2. Install dependencies:
   - `/Users/pb09/flutter/bin/flutter pub get`
3. Launch app:
   - `/Users/pb09/flutter/bin/flutter run`

## Use it

- Left navigation lists each component panel.
- Click a panel to test interactions (hover/press/toggle/state).
- Keep app running and edit components in parent repo (`../lib/ilds_*.dart`).
- Save + hot reload (`r`) to see updates immediately.

## Move as separate app later

If you move this folder elsewhere, update `pubspec.yaml` dependency from:

```yaml
path: ../
```

to either:
- a new relative path to your ILDS package, or
- a Git dependency pointing to the ILDS repo.
# ilds_component_playground_app

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Learn Flutter](https://docs.flutter.dev/get-started/learn-flutter)
- [Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Flutter learning resources](https://docs.flutter.dev/reference/learning-resources)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
