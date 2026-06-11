# ILDS Design System — Complete Project Report & Action Plan
**For: Gemini / LM Studio (gemma-4-27b-a4b)**
**Date:** April 5, 2026
**Project:** ICICI Lombard Design System (ILDS) — Automation Pipeline
**Repo:** `dsoftacademy/ilds-design-system` (GitHub, main branch)

---

## HOW TO USE THIS DOCUMENT

You are a coding and automation assistant. This document contains:
1. Full context of the ILDS project
2. What has already been completed (do not redo these)
3. Pending tasks with step-by-step instructions
4. All credentials, IDs, and file paths needed
5. Troubleshooting for known issues

When the user says "next step" or asks for help, refer to the PENDING TASKS section in priority order. Guide them step by step. If they hit an error, look in the TROUBLESHOOTING section first.

---

## 1. PROJECT OVERVIEW

### What Is ILDS?
The ILDS (ICICI Lombard Design System) is a Flutter-based component library (a package, NOT an app — no `main.dart`). It is used by other apps at ICICI Lombard. Components live in `lib/`.

### Primary Goal
Build a **fully automated pipeline** so that when a designer updates tokens in Figma, the change flows automatically to:
- `tokens/tokens.json` in GitHub (W3C DTCG format)
- All Flutter components (via `ILDSTokens.*` constants)
- Supernova (design system documentation platform)
- Slack `#design-system-updates` channel

### Single Source of Truth Architecture (CONFIRMED)
```
FIGMA VARIABLES
      │
      │ n8n polls/detects Figma publish event
      ▼
n8n: Extract via Figma Variables API
      │  GET /v1/files/{fileId}/variables/local
      │  Convert → W3C DTCG JSON format
      ▼
GitHub: Commit tokens/tokens.json to main
      │
      ├──► GitHub Webhook → n8n → Slack #design-system-updates
      │
      └──► GitHub Action: sync-supernova.yml
                │
                ▼
           Supernova CLI syncs tokens
```

**Key Principle:** Figma is the only input. No plugins. No dual sources. No conflicts.

---

## 2. TECH STACK

| Tool | Purpose |
|------|---------|
| Flutter (Dart) | Component library (package, not app) |
| Figma | Design source of truth (Variables API) |
| n8n | Automation (extract Figma → push GitHub → notify Slack) |
| GitHub Actions | CI/CD (triggers Supernova sync on token change) |
| Supernova CLI | Design system documentation sync |
| Slack | Team notifications |

---

## 3. KEY CREDENTIALS & IDs (DO NOT CHANGE)

```
Figma File ID:         PCUj412f0Z1zZLLxQUX22e
Figma PAT:             figd_REDACTED_ROTATE_AND_STORE_IN_ENV
Figma API Base URL:    https://api.figma.com/v1

GitHub Repo:           dsoftacademy/ilds-design-system
GitHub Branch:         main
GitHub Secret Name:    SUPERNOVA_API_KEY  (already set ✅)

Supernova Workspace:   718203
Supernova Design System ID: 771068
Supernova Version:     817254
Supernova Draft:       810361

Slack Channel:         #design-system-updates
Slack Channel ID:      C0AN3J0DKJN

n8n Workflow IDs:
  - Figma Library Version Monitor:   q6TjuM7fUilBJUtA
  - GitHub Push Notifier to Slack:   P82tigHMhMfUl25s
  - NEW (to build): Figma Variables → GitHub Tokens
```

---

## 4. FILE STRUCTURE

```
ilds-design-system/
├── lib/
│   ├── design_system/
│   │   └── ilds_tokens.dart          ← Token constants (single source for Dart)
│   ├── ilds_button.dart              ← Button component
│   ├── ilds_chip.dart                ← Chip component
│   ├── ilds_text_field.dart          ← Text field component
│   └── ilds_toast.dart               ← Toast/snackbar component
├── tokens/
│   └── tokens.json                   ← W3C DTCG format design tokens
├── .github/
│   └── workflows/
│       └── sync-supernova.yml        ← Auto-syncs tokens to Supernova on push
├── supernova.settings.json           ← Supernova CLI config
├── N8N_FIGMA_TOKENS_WORKFLOW.md      ← Guide to build n8n workflow
└── N8N_FIX_CURSOR_MESSAGE.md         ← Guide to fix Slack message
```

---

## 5. TOKEN ARCHITECTURE (CRITICAL — READ CAREFULLY)

### Rule: NEVER hardcode values in components

Every color, spacing, font weight, and border radius in Flutter components must reference `ILDSTokens.*`. Example:

```dart
// ✅ CORRECT
color: ILDSTokens.orange500
borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd)
fontWeight: ILDSTokens.fontWeightBold

// ❌ WRONG — DO NOT DO THIS
color: Color(0xFFE8440C)
borderRadius: BorderRadius.circular(8.0)
fontWeight: FontWeight.w700
```

If a value is not in `ilds_tokens.dart`, ADD it there first, then reference it.

### Token Mapping (tokens.json hex → ILDSTokens constant)

| Hex | Token | Flutter Constant |
|-----|-------|-----------------|
| #E8440C | color.orange.500 | `ILDSTokens.orange500` |
| #F5B399 | color.orange.200 | `ILDSTokens.orange200` |
| #B93409 | color.orange.600 | `ILDSTokens.orange600` |
| #8A2807 | color.orange.700 | `ILDSTokens.orange700` |
| #FFFFFF | color.neutral.0  | `ILDSTokens.neutral0` |
| #FAFAFA | color.neutral.50 | `ILDSTokens.neutral50` |
| #F4F4F4 | color.neutral.100| `ILDSTokens.neutral100` |
| #E0E0E0 | color.neutral.200| `ILDSTokens.neutral200` |
| #ADADAD | color.neutral.300| `ILDSTokens.neutral300` |
| #6B6B6B | color.neutral.400| `ILDSTokens.neutral400` |
| #3D3D3D | color.neutral.500| `ILDSTokens.neutral500` |
| #111111 | color.neutral.900| `ILDSTokens.neutral900` |
| #DC2626 | color.red.600    | `ILDSTokens.red600` |
| #16A34A | color.green.600  | `ILDSTokens.green600` |
| #F59E0B | color.amber.500  | `ILDSTokens.amber500` |
| #2563EB | color.blue.500   | `ILDSTokens.blue500` |

---

## 6. COMPLETED TASKS ✅

### 6.1 ilds_tokens.dart — Expanded Token Palette

**File:** `lib/design_system/ilds_tokens.dart`
**Status:** Complete ✅

Contains: Orange (50–700), Neutral (0–900), Blue (50–700), Green (50–700), Red (50–700), Amber (50–700), Border Radius (xs–full), Spacing (1–24), Border Width (1–4), Font Weights (regular/medium/bold).

Also contains `ILDSTheme.data()` for Flutter app configuration (seedColor, fontFamily: Mulish).

### 6.2 ilds_button.dart — Fully Token-Referenced

**File:** `lib/ilds_button.dart`
**Status:** Complete ✅

Key properties:
- `IldsButtonType`: primary, secondary, tertiary
- `IldsButtonSize`: large, medium, small
- `IldsButtonAppearance`: normal, destructive
- Supports: isDisabled, isLoading, leading/trailing icons
- All colors from `ILDSTokens.*` (no hardcoded hex)
- Destructive uses `ILDSTokens.red600` (NOT `#E00903`)

### 6.3 ilds_chip.dart — Fully Token-Referenced

**File:** `lib/ilds_chip.dart`
**Status:** Complete ✅

Key properties:
- `IldsChipSize`: large (36px), medium (28px)
- `isSelected`: orange500 border/label, 8% orange bg
- `enabled: false`: neutral300 for all color states
- Shape: `borderRadiusFull` (pill)

### 6.4 ilds_text_field.dart — Fully Token-Referenced

**File:** `lib/ilds_text_field.dart`
**Status:** Complete ✅

Key properties:
- `IldsTextFieldKind`: standard, password, otpX6, otpX4
- Error state: `red600` border + helper text
- Success state: `green600` border + helper text
- Focus ring: `orange500`, `borderWidth2`
- Disabled: `neutral100` fill, `neutral300` border

### 6.5 ilds_toast.dart — Fully Token-Referenced

**File:** `lib/ilds_toast.dart`
**Status:** Complete ✅

Key properties:
- `IldsToastVariant`: info (orange500), success (green600), warning (amber500), error (red600)
- Static `IldsToast.show()` method for easy invocation
- White surface, elevation 4, `borderRadiusMd`

### 6.6 tokens/tokens.json — W3C DTCG Format

**File:** `tokens/tokens.json`
**Status:** Complete ✅
**Format:** W3C Design Tokens Community Group (DTCG) v0.6.0

Structure:
```json
{
  "color": {
    "orange": { "500": { "$type": "color", "$value": "#E8440C" } },
    "neutral": { ... },
    "blue": { ... },
    "green": { ... },
    "red": { ... },
    "amber": { ... }
  },
  "spacing": { "1": { "$type": "spacing", "$value": "4" } },
  "borderRadius": { "md": { "$type": "borderRadius", "$value": "8" } },
  "borderWidth": { "1": { "$type": "borderWidth", "$value": "1" } },
  "opacity": { ... },
  "motion": { ... }
}
```

### 6.7 GitHub Action: sync-supernova.yml

**File:** `.github/workflows/sync-supernova.yml`
**Status:** Complete — committed to repo ✅

Triggers when `tokens/tokens.json` is pushed to main. Runs `supernova sync-tokens` with:
- `SUPERNOVA_API_KEY` from GitHub secrets
- `designSystemId: 771068`
- Config from `supernova.settings.json`

```yaml
name: Supernova Auto-Sync Tokens
on:
  push:
    branches: [main]
    paths: ['tokens/tokens.json']
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm install -g @supernovaio/cli
      - run: |
          supernova sync-tokens \
            --apiKey "${{ secrets.SUPERNOVA_API_KEY }}" \
            --designSystemId "771068" \
            --tokenFilePath "./tokens/tokens.json" \
            --configFilePath "./supernova.settings.json"
```

### 6.8 supernova.settings.json

**File:** `supernova.settings.json`
**Status:** Complete — committed to repo ✅

```json
{
  "mapping": [{ "tokensTheme": "global", "supernovaTheme": null }],
  "settings": { "dryRun": false, "verbose": true, "precision": 3, "mergeWithExistingTokens": true }
}
```

### 6.9 n8n Workflows (Existing)

**"GitHub Push Notifier to Slack" (P82tigHMhMfUl25s):** ✅ Working
- Trigger: GitHub webhook on push to main
- Posts to `#design-system-updates` with commit info

**"Figma Library Version Monitor" (q6TjuM7fUilBJUtA):** ✅ Active
- Polls Figma for library publish events

---

## 7. PENDING TASKS — EXECUTE IN ORDER

### TASK 1 (PRIORITY: HIGH) — Build n8n Figma Variables → GitHub Workflow

**Why this matters:** This is the last missing piece. Without this, the pipeline is not automated. Token changes in Figma do NOT automatically reach GitHub or Supernova.

**Steps to build in n8n UI:**

#### Step 1: Create New Workflow
- Go to n8n → click **+ New Workflow**
- Name: `Figma Variables to GitHub Tokens`

#### Step 2: Add Webhook Trigger Node
- Add node: **Webhook**
- HTTP Method: `POST`
- Path: `figma-tokens-sync`
- Response Mode: `On Received`
- Save the webhook URL (you'll need it to test)

#### Step 3: Add HTTP Request Node (Call Figma API)
- Add node: **HTTP Request** (connect after Webhook)
- Method: `GET`
- URL: `https://api.figma.com/v1/files/PCUj412f0Z1zZLLxQUX22e/variables/local`
- Send Headers: ON
- Add header:
  - Name: `X-Figma-Token`
  - Value: `figd_REDACTED_ROTATE_AND_STORE_IN_ENV`
- Response Format: `JSON`

#### Step 4: Add Code Node (Transform to DTCG Format)
- Add node: **Code** (connect after HTTP Request)
- Mode: `Run Once for All Items`
- Language: `JavaScript`
- Paste this exact code:

```javascript
// Transform Figma Variables API response to W3C DTCG tokens.json
const figmaData = $input.first().json;
const meta = figmaData.meta || {};
const variables = Object.values(meta.variables || {});
const variableCollections = Object.values(meta.variableCollections || {});

// Build collection map (id → name)
const collectionMap = {};
variableCollections.forEach(col => {
  collectionMap[col.id] = col.name;
});

// DTCG token structure
const tokens = {
  color: {},
  spacing: {},
  borderRadius: {},
  fontWeight: {}
};

variables.forEach(variable => {
  if (!variable.resolvedType) return;
  const name = variable.name; // e.g. "orange/500" or "neutral/100"

  // Get the value from the default mode
  const modeId = Object.keys(variable.valuesByMode || {})[0];
  const value = modeId ? variable.valuesByMode[modeId] : null;
  if (value === null || value === undefined) return;

  if (variable.resolvedType === 'COLOR' && typeof value === 'object' && 'r' in value) {
    // Convert 0–1 RGB to hex
    const r = Math.round(value.r * 255).toString(16).padStart(2, '0');
    const g = Math.round(value.g * 255).toString(16).padStart(2, '0');
    const b = Math.round(value.b * 255).toString(16).padStart(2, '0');
    const hex = ('#' + r + g + b).toUpperCase();

    // Normalize name: "orange/500" → nested under color.orange.500
    const parts = name.split('/');
    const group = parts[0].toLowerCase();
    const key = parts.slice(1).join('/') || name;

    if (!tokens.color[group]) tokens.color[group] = {};
    tokens.color[group][key] = { '$type': 'color', '$value': hex };
  }

  if (variable.resolvedType === 'FLOAT' && typeof value === 'number') {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('spacing') || nameLower.includes('space')) {
      const key = name.replace(/[^a-zA-Z0-9]/g, '');
      tokens.spacing[key] = { '$type': 'spacing', '$value': String(value) };
    } else if (nameLower.includes('radius')) {
      const key = name.replace(/[^a-zA-Z0-9]/g, '');
      tokens.borderRadius[key] = { '$type': 'borderRadius', '$value': String(value) };
    }
  }
});

// Remove empty sections
Object.keys(tokens).forEach(k => {
  if (Object.keys(tokens[k]).length === 0) delete tokens[k];
});

const tokensJson = JSON.stringify(tokens, null, 2);

return [{
  json: {
    tokensJson: tokensJson,
    timestamp: new Date().toISOString(),
    tokenCount: variables.length
  }
}];
```

#### Step 5: Add GitHub File Get (Fetch Current SHA)
The GitHub file edit API requires the current file's SHA. First get it:
- Add node: **HTTP Request** (connect after Code)
- Name: `Get Current File SHA`
- Method: `GET`
- URL: `https://api.github.com/repos/dsoftacademy/ilds-design-system/contents/tokens/tokens.json`
- Authentication: `Generic Credential Type` → `HTTP Header Auth`
- Credential: Add new, name `GitHub PAT`
  - Name: `Authorization`
  - Value: `token YOUR_GITHUB_PAT_HERE` ← You need to add your GitHub PAT

#### Step 6: Add HTTP Request Node (Push to GitHub)
- Add node: **HTTP Request** (connect after Get SHA)
- Name: `Push tokens.json to GitHub`
- Method: `PUT`
- URL: `https://api.github.com/repos/dsoftacademy/ilds-design-system/contents/tokens/tokens.json`
- Authentication: Same `GitHub PAT` credential
- Send Body: ON
- Body Content Type: `JSON`
- Specify Body: `JSON`
- JSON Body (click expression mode `fx`):
```json
{
  "message": "ci: sync Figma Variables to tokens.json [n8n]",
  "content": "={{ Buffer.from($node['Transform to DTCG'].json.tokensJson).toString('base64') }}",
  "sha": "={{ $json.sha }}",
  "branch": "main",
  "committer": {
    "name": "n8n Bot",
    "email": "bot@dsoft.academy"
  }
}
```

> **Note:** The GitHub Contents API requires file content to be base64-encoded, and the current file's SHA for updates.

#### Step 7: Add Slack Notification Node
- Add node: **Slack** (connect after Push to GitHub)
- Resource: `Message`
- Operation: `Post`
- Channel: `C0AN3J0DKJN`
- Text (expression mode):
```
🎨 Figma Variables synced to GitHub

• {{ $node['Transform to DTCG'].json.tokenCount }} tokens extracted from Figma
• File: `tokens/tokens.json` updated
• Format: W3C DTCG
• Supernova sync triggered automatically via GitHub Action
• Time: {{ $node['Transform to DTCG'].json.timestamp }}
```

#### Step 8: Connect All Nodes
```
Webhook → HTTP Request (Figma) → Code (Transform) → Get SHA → Push to GitHub → Slack
```

#### Step 9: Activate and Test
1. Click **Active** toggle to turn ON
2. Test with a manual webhook call:
   ```bash
   curl -X POST "YOUR_WEBHOOK_URL" \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```
3. Watch the execution in n8n
4. Check GitHub for the new commit
5. Check GitHub Actions tab — `Supernova Auto-Sync Tokens` should trigger

---

### TASK 2 (PRIORITY: MEDIUM) — Fix "Made-with: Cursor" Slack Message

**Why this matters:** Cursor appends `\n\nMade-with: Cursor` to commit messages. The Slack notification shows the full multi-line message, which looks messy.

**Steps:**
1. Open n8n
2. Find workflow `P82tigHMhMfUl25s` ("GitHub Push Notifier to Slack")
3. Open the **Send Slack Notification** node
4. Find the text field that contains: `$json.body.head_commit.message`
5. Replace it with: `$json.body.head_commit.message.split('\n')[0]`
6. Save

**Before:** `Refactor token architecture\n\nMade-with: Cursor`
**After:** `Refactor token architecture`

---

### TASK 3 (PRIORITY: HIGH) — Verify GitHub Action Runs Successfully

**Trigger:** After Task 1 completes and n8n pushes a new `tokens.json` commit, the GitHub Action should trigger.

**How to verify:**
1. Go to `https://github.com/dsoftacademy/ilds-design-system/actions`
2. Look for `Supernova Auto-Sync Tokens` run
3. Click it → expand each step
4. Expected output:
   ```
   ✅ Checkout repo
   ✅ Set up Node.js
   ✅ Install Supernova CLI
   ✅ Sync tokens to Supernova
   ✅ Tokens synced to Supernova design system 771068
   ```

**If it fails:** See Troubleshooting section below.

---

### TASK 4 (PRIORITY: MEDIUM) — Verify Supernova Shows Color Tokens

1. Go to Supernova design system `771068`
2. Navigate to Tokens section
3. Should see: orange, neutral, blue, green, red, amber color scales
4. If still showing 0: The `supernova.settings.json` mapping may need adjustment (see Troubleshooting)

---

### TASK 5 (PRIORITY: LOW) — Complete Supernova Component Documentation

**TextField page:** Exists but empty/unpublished — needs component documentation
**Chip page:** Doesn't exist yet — needs to be created

Steps:
1. In Supernova, navigate to the design system
2. Open TextField page → add component documentation
3. Create new page for Chip component
4. Add: Overview, props, variants, usage examples, do/don'ts

---

## 8. GITHUB ACTIONS — SUPERNOVA SYNC DETAIL

The `sync-supernova.yml` action reads `supernova.settings.json`:

```json
{
  "mapping": [{ "tokensTheme": "global", "supernovaTheme": null }],
  "settings": {
    "dryRun": false,
    "verbose": true,
    "precision": 3,
    "mergeWithExistingTokens": true
  }
}
```

**`tokensTheme: "global"`** means the top-level keys in `tokens.json` (like `color`, `spacing`) are treated as a single global theme. If Supernova expects a different structure, the mapping may need updating.

---

## 9. COMPLETE CODE REFERENCE

### ilds_tokens.dart (Full Content)

```dart
// lib/design_system/ilds_tokens.dart
import 'package:flutter/material.dart';

class ILDSTokens {
  // ── Orange ────────────────────────────────────────────────────────────────
  static const Color orange50  = Color(0xFFFDF0EB);
  static const Color orange100 = Color(0xFFFAD9CC);
  static const Color orange200 = Color(0xFFF5B399); // Disabled primary bg
  static const Color orange300 = Color(0xFFF08D66);
  static const Color orange400 = Color(0xFFEB6733);
  static const Color orange500 = Color(0xFFE8440C); // Primary brand
  static const Color orange600 = Color(0xFFB93409); // Hover
  static const Color orange700 = Color(0xFF8A2807); // Pressed / active

  // ── Neutral ───────────────────────────────────────────────────────────────
  static const Color neutral0   = Color(0xFFFFFFFF);
  static const Color neutral50  = Color(0xFFFAFAFA);
  static const Color neutral100 = Color(0xFFF4F4F4);
  static const Color neutral200 = Color(0xFFE0E0E0); // Default border
  static const Color neutral300 = Color(0xFFADADAD); // Disabled text
  static const Color neutral400 = Color(0xFF6B6B6B); // Secondary text
  static const Color neutral500 = Color(0xFF3D3D3D); // Secondary body
  static const Color neutral600 = Color(0xFF2A2A2A);
  static const Color neutral900 = Color(0xFF111111); // Primary body
  static const Color white      = Color(0xFFFFFFFF);

  // ── Blue ──────────────────────────────────────────────────────────────────
  static const Color blue50  = Color(0xFFEFF6FF);
  static const Color blue100 = Color(0xFFDBEAFE);
  static const Color blue300 = Color(0xFF93C5FD);
  static const Color blue500 = Color(0xFF2563EB);
  static const Color blue600 = Color(0xFF1D4ED8);
  static const Color blue700 = Color(0xFF1E40AF);

  // ── Green ─────────────────────────────────────────────────────────────────
  static const Color green50  = Color(0xFFDCFCE7);
  static const Color green100 = Color(0xFFBBF7D0);
  static const Color green300 = Color(0xFF86EFAC);
  static const Color green500 = Color(0xFF22C55E);
  static const Color green600 = Color(0xFF16A34A); // Success
  static const Color green700 = Color(0xFF15803D);

  // ── Red ───────────────────────────────────────────────────────────────────
  static const Color red50  = Color(0xFFFEE2E2);
  static const Color red100 = Color(0xFFFECACA);
  static const Color red300 = Color(0xFFFCA5A5);
  static const Color red500 = Color(0xFFEF4444);
  static const Color red600 = Color(0xFFDC2626); // Error / destructive
  static const Color red700 = Color(0xFFB91C1C);

  // ── Amber ─────────────────────────────────────────────────────────────────
  static const Color amber50  = Color(0xFFFEF9C3);
  static const Color amber100 = Color(0xFFFEF08A);
  static const Color amber300 = Color(0xFFFCD34D);
  static const Color amber500 = Color(0xFFF59E0B); // Warning
  static const Color amber600 = Color(0xFFD97706);
  static const Color amber700 = Color(0xFFB45309);

  // ── Border Radius ─────────────────────────────────────────────────────────
  static const double borderRadiusXs   = 2.0;
  static const double borderRadiusSm   = 4.0;
  static const double borderRadiusMd   = 8.0;
  static const double borderRadiusLg   = 12.0;
  static const double borderRadiusXl   = 16.0;
  static const double borderRadius2xl  = 24.0;
  static const double borderRadiusFull = 9999.0;

  // ── Spacing ───────────────────────────────────────────────────────────────
  static const double spacing1  = 4.0;
  static const double spacing2  = 8.0;
  static const double spacing3  = 12.0;
  static const double spacing4  = 16.0;
  static const double spacing5  = 20.0;
  static const double spacing6  = 24.0;
  static const double spacing8  = 32.0;
  static const double spacing10 = 40.0;
  static const double spacing12 = 48.0;
  static const double spacing16 = 64.0;

  // ── Border Width ──────────────────────────────────────────────────────────
  static const double borderWidth1 = 1.0;
  static const double borderWidth2 = 2.0; // Focus ring
  static const double borderWidth4 = 4.0;

  // ── Font Weights ──────────────────────────────────────────────────────────
  static const FontWeight fontWeightRegular = FontWeight.w400;
  static const FontWeight fontWeightMedium  = FontWeight.w500;
  static const FontWeight fontWeightBold    = FontWeight.w700;
}

class ILDSTheme {
  static ThemeData data() {
    return ThemeData(
      useMaterial3: true,
      fontFamily: 'Mulish',
      colorScheme: ColorScheme.fromSeed(
        seedColor: ILDSTokens.orange500,
        primary: ILDSTokens.orange500,
        surface: ILDSTokens.white,
      ),
      textTheme: const TextTheme(
        bodyLarge: TextStyle(fontFamily: 'Mulish', fontWeight: ILDSTokens.fontWeightRegular),
        titleLarge: TextStyle(fontFamily: 'Mulish', fontWeight: ILDSTokens.fontWeightBold),
      ),
    );
  }
}
```

---

## 10. TROUBLESHOOTING GUIDE

### Issue: Figma API Returns 403 or 401
**Cause:** PAT expired or invalid
**Fix:** Generate new Figma PAT at https://www.figma.com/developers/api#authentication, update in n8n HTTP Request node

### Issue: Figma Variables API Returns Empty `variables: {}`
**Cause:** The file doesn't have Variables defined (only Styles). Variables are different from Styles in Figma.
**Fix:** In Figma, check Edit → Variables panel. If empty, publish local variables first from Figma's Variables modal.

### Issue: GitHub API Returns 422 Unprocessable Entity
**Cause:** Wrong `sha` value in PUT request — the SHA must match the current version of the file
**Fix:** Make sure the "Get Current File SHA" node runs before the "Push to GitHub" node and the `sha` field is correctly referenced: `={{ $json.sha }}`

### Issue: GitHub API Returns 401 Unauthorized
**Cause:** GitHub PAT missing or incorrect
**Fix:** The PAT needs `repo` scope (full control). Create at: https://github.com/settings/tokens → Generate new token (classic) → check `repo`

### Issue: GitHub Action Doesn't Trigger After Commit
**Cause:** The commit path doesn't match the workflow trigger path
**Fix:** Verify the pushed file path is exactly `tokens/tokens.json` (not `tokens\\tokens.json`). The workflow trigger is `paths: ['tokens/tokens.json']`.

### Issue: GitHub Action Fails — `supernova: command not found`
**Cause:** npm install step failed
**Fix:** Check the action log. The `npm install -g @supernovaio/cli` step should complete before the sync step.

### Issue: GitHub Action Fails — Authentication Error
**Cause:** `SUPERNOVA_API_KEY` secret missing or expired
**Fix:** Go to repo Settings → Secrets → Actions → Verify `SUPERNOVA_API_KEY` exists. Re-generate from Supernova → Settings → API Keys if needed.

### Issue: Supernova Shows 0 Tokens After Action Runs
**Cause 1:** W3C DTCG format not recognized by Supernova CLI
**Fix:** Check `supernova.settings.json`. The Supernova CLI may expect a flat Tokens Studio format. Try changing `tokensTheme` to match the actual root key structure of `tokens.json`.

**Cause 2:** File path mismatch
**Fix:** Verify the action uses `--tokenFilePath "./tokens/tokens.json"` and the file exists at that exact path.

### Issue: n8n Code Node Returns Error "Cannot read property of undefined"
**Cause:** Figma API response structure differs — `meta.variables` may be at a different path
**Fix:** Add a debug step first. In n8n, between the HTTP Request and Code nodes, add a Set node to `console.log` the response structure. Check the actual path of variables in the response.

### Issue: Slack Notification Shows "Made-with: Cursor"
**Cause:** Cursor IDE appends footer to commit messages
**Fix:** In "GitHub Push Notifier to Slack" workflow (P82tigHMhMfUl25s), find the Slack text field and change:
- FROM: `$json.body.head_commit.message`
- TO: `$json.body.head_commit.message.split('\n')[0]`

### Issue: Base64 Encoding Error in GitHub API Call
**Cause:** `Buffer` may not be available in n8n's Code node
**Fix:** Use JavaScript's `btoa()` instead:
```javascript
content: btoa(unescape(encodeURIComponent(tokensJson)))
```
Or use this in the HTTP Request body expression:
```
={{ Buffer.from($node['Code'].json.tokensJson, 'utf8').toString('base64') }}
```

---

## 11. END-TO-END TEST CHECKLIST

When you think the pipeline is ready, run this checklist to verify full automation:

- [ ] 1. Manually trigger the n8n webhook: `POST /webhook/figma-tokens-sync`
- [ ] 2. n8n execution completes without errors
- [ ] 3. GitHub shows new commit: "ci: sync Figma Variables to tokens.json [n8n]"
- [ ] 4. GitHub Actions tab shows `Supernova Auto-Sync Tokens` triggered
- [ ] 5. GitHub Action completes successfully (all steps green)
- [ ] 6. Supernova shows updated color tokens (orange, neutral, blue, etc.)
- [ ] 7. Slack `#design-system-updates` shows notification from new commit
- [ ] 8. Slack message shows clean commit message (no "Made-with: Cursor" if that fix is done)

---

## 12. FUTURE ROADMAP (After Pipeline Is Complete)

1. **Bidirectional sync:** If a developer updates `ilds_tokens.dart`, write a script that reads the Dart file and updates `tokens.json` as well.

2. **Component documentation in Supernova:** Complete TextField, Chip, and future components (Card, Modal, Bottom Sheet, Navigation) in Supernova.

3. **Figma webhook integration:** Instead of polling, set up a Figma webhook to push events to n8n when a library is published — faster and more efficient.

4. **New components:** The ILDS component library needs additional components:
   - `ilds_card.dart`
   - `ilds_modal.dart`
   - `ilds_bottom_sheet.dart`
   - `ilds_navigation_bar.dart`
   - `ilds_badge.dart`

5. **Flutter widget tests:** Each component needs widget tests that verify token references are correct.

---

## 13. CURRENT STATUS SUMMARY

| Task | Status |
|------|--------|
| ilds_tokens.dart — full palette | ✅ Done |
| ilds_button.dart — token-referenced | ✅ Done |
| ilds_chip.dart — token-referenced | ✅ Done |
| ilds_text_field.dart — token-referenced | ✅ Done |
| ilds_toast.dart — token-referenced | ✅ Done |
| tokens/tokens.json — W3C DTCG format | ✅ Done |
| .github/workflows/sync-supernova.yml | ✅ Done |
| supernova.settings.json | ✅ Done |
| SUPERNOVA_API_KEY GitHub secret | ✅ Done |
| n8n: GitHub Push → Slack | ✅ Working |
| n8n: Figma Library Monitor | ✅ Active |
| **n8n: Figma Variables → GitHub** | ⏳ **Needs building (TASK 1)** |
| Slack message "Cursor" fix | ⏳ Needs 1-line edit (TASK 2) |
| Supernova token verification | ⏳ After Task 1 (TASK 3) |
| Supernova component docs (TextField) | ⏳ Later (TASK 5) |
| Supernova component docs (Chip) | ⏳ Later (TASK 5) |

**Overall pipeline completion: ~75%**
**Blocker: n8n workflow for Figma Variables → GitHub (TASK 1)**

---

*Report generated: April 5, 2026 | Version: 1.0*
*Repository: dsoftacademy/ilds-design-system*
