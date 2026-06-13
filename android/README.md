# ILDS Android — Jetpack Compose Component Library

Android library module for native Compose components, consuming generated tokens from `tokens/tokens.json`.

## Structure

```
android/
  settings.gradle.kts
  ilds-design-system/
    build.gradle.kts
    src/main/kotlin/com/icicilombard/ilds/
      tokens/IldsTokens.kt        ← generated (npm run build:tokens)
      components/IldsButton.kt    ← Phase 4b Milestone 1
```

## Requirements

- Android SDK 24+ (minSdk), compileSdk 35
- JDK 17
- Gradle 8.7+

## Integration

Include as a composite build or publish as an AAR. In `settings.gradle.kts`:

```kotlin
includeBuild("../ilds-design-system/android")
```

## Usage

```kotlin
import com.icicilombard.ilds.components.IldsButton
import com.icicilombard.ilds.components.IldsButtonType

IldsButton(label = "Continue", onClick = { })
IldsButton(label = "Delete", onClick = { }, type = IldsButtonType.Secondary, appearance = IldsButtonAppearance.Destructive)
IldsIconButton(onClick = { }, semanticLabel = "Favorite", icon = { Icon(...) })
```

## Commands

```bash
cd android && ./gradlew :ilds-design-system:compileDebugKotlin   # requires Gradle wrapper
npm run verify:phase4b                                           # structural QA (from repo root)
```

## Token regeneration

Tokens are regenerated into the module by `npm run build:tokens` alongside `dist/IldsTokens.kt`.

## Bootstrap Gradle wrapper (first time)

```bash
cd android
gradle wrapper --gradle-version 8.11.1
```
