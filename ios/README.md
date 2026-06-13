# ILDS iOS — SwiftUI Component Library

Swift Package Manager library for native iOS components, consuming generated tokens from `tokens/tokens.json`.

## Structure

```
ios/
  Package.swift
  Sources/
    ILDSTokens/ILDSTokens.swift     ← generated (npm run build:tokens)
    ILDSDesignSystem/
      IldsButton.swift              ← Phase 4b Milestone 1
```

## Requirements

- iOS 16+ / macOS 13+
- Xcode 15+ / Swift 5.9+

## Integration

Add as a local package dependency in Xcode, or in `Package.swift`:

```swift
.package(path: "../ilds-design-system/ios")
```

```swift
.product(name: "ILDSDesignSystem", package: "ILDSDesignSystem")
```

## Usage

```swift
import ILDSDesignSystem

IldsButton("Continue", action: { /* ... */ })
IldsButton("Delete", action: { }, type: .secondary, appearance: .destructive)
IldsButton(icon: Image(systemName: "heart.fill"), semanticLabel: "Favorite", action: { })
```

## Commands

```bash
cd ios && swift build          # compile check
npm run verify:phase4b         # full Phase 4b QA (from repo root)
```

## Token regeneration

Tokens are regenerated into `ios/Sources/ILDSTokens/` by `npm run build:tokens` alongside `dist/ILDSTokens.swift`.
