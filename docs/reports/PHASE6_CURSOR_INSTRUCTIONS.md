# Phase 6 Cursor Instructions
**Date:** 2026-06-14  
**Scope:** Phase 6a — Playwright E2E in CI · Phase 6b — Figma → token sync automation  
**Execute in order:** 6a first, gate on full pass, then 6b.

---

## Pre-read: What already exists

Before touching anything, understand the current state:

| File | Status | Notes |
|------|--------|-------|
| `.github/workflows/web-tests.yml` | ✅ EXISTS | Triggers on `web/**`, `dist/**`, `tokens/**` |
| `web/playwright.config.ts` | ✅ EXISTS | Uses `http-server storybook-static -p 6006 -s`, `reuseExistingServer: true` |
| `web/package.json` → `test:parity` | ✅ EXISTS | `playwright test` |
| `web/package.json` → `build-storybook` | ✅ EXISTS | `storybook build` |
| `@playwright/test` | ✅ INSTALLED | `web/package.json` devDeps |
| `http-server` | ✅ INSTALLED | `web/package.json` devDeps |
| `@axe-core/playwright` | ✅ INSTALLED | `web/package.json` devDeps |
| `web/tests/parity.spec.ts` | ✅ EXISTS | Reads all 19 `web/specs/*.spec.json` files |
| `web/tests/a11y.spec.ts` | ✅ EXISTS | Runs axe WCAG2a/2aa on every Storybook story |
| `web/tests/phase3-qa.spec.ts` | ✅ EXISTS — **HAS A BUG** | See critical section below |
| `.github/workflows/build-tokens.yml` | ✅ EXISTS | Handles `tokens/tokens.json` → `dist/*` (downstream only) |
| `tool/sync_figma_tokens.mjs` | ❌ MISSING | Upstream: Figma → `tokens/tokens.json` |
| `.github/workflows/figma-token-sync.yml` | ❌ MISSING | Schedules the upstream sync |

Do NOT rewrite what already exists. Fix the bug, then verify.

---

## Phase 6a: Playwright E2E tests in CI

### CRITICAL: Fix the contradictory test first

**File:** `web/tests/phase3-qa.spec.ts`  
**Location:** In the `Pass 4 — Phase 3b regression` describe block, test titled `Dropdown focused uses bg/border not orange ring`

This test was written before WCAG Option C was approved (2026-06-14). It now asserts the **opposite** of the current implementation. It will cause CI to fail.

**Find this block in `web/tests/phase3-qa.spec.ts`:**

```typescript
test('Dropdown focused uses bg/border not orange ring', async ({ page }) => {
    await gotoStory(page, 'components-dropdown--empty-default');
    const trigger = page.locator('[data-testid="dropdown-trigger"]');
    await trigger.focus();
    const s = await styles(trigger, [
      'background-color',
      'border-color',
      'outline-color',
    ]);
    expect(s['background-color']).toBe(hexToRgb('#fafafa'));
    expect(s['border-color']).toBe(hexToRgb('#424242'));
    // Figma-verified: no orange focus ring on dropdown trigger (see a11y flag doc)
    expect(s['outline-color']).not.toBe(hexToRgb('#c74c01'));
  });
```

**Replace the entire test with this:**

```typescript
test('Dropdown focused: keyboard ring is orange-600 (WCAG 2.4.7 Option C)', async ({ page }) => {
    await gotoStory(page, 'components-dropdown--empty-default');
    const trigger = page.locator('[data-testid="dropdown-trigger"]');
    await trigger.focus();
    const s = await styles(trigger, [
      'background-color',
      'border-color',
      'outline-color',
      'outline-width',
      'outline-offset',
    ]);
    expect(s['background-color']).toBe(hexToRgb('#fafafa'));
    expect(s['border-color']).toBe(hexToRgb('#424242'));
    // WCAG 2.4.7 Option C approved 2026-06-14 by Pratishek.
    // focus-visible: adds 2px orange-600 outline on keyboard focus only.
    // See docs/a11y/DROPDOWN_FOCUS_RING_FLAG.md for decision record.
    expect(s['outline-color']).toBe(hexToRgb('#c74c01'));
    expect(s['outline-width']).toBe('2px');
    expect(s['outline-offset']).toBe('2px');
  });
```

**Why:** Option C (`focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-orange-600`) was added to `Dropdown.tsx` in commit `1f36b96`. The old assertion `not.toBe(hexToRgb('#c74c01'))` is now incorrect. The `trigger.focus()` call in Playwright/Chromium triggers `:focus-visible` on `<button>` elements — this is confirmed behavior in Chromium 100+.

---

### Step 1: Rebuild Storybook

The `a11y.spec.ts` reads `web/storybook-static/index.json` at test startup. This file must reflect the latest components — including the Dropdown Option C changes. Rebuild before running tests.

```bash
cd web
npm run build-storybook
```

Expected output: `storybook build` completes, `web/storybook-static/` is refreshed.  
**Do not skip this step.** If `storybook-static/index.json` is stale, `a11y.spec.ts` will test outdated component renders.

---

### Step 2: Run the full Playwright suite locally

```bash
cd web
npx playwright test --reporter=list
```

You will see three test files run:
- `tests/parity.spec.ts` — one test per variant across all 19 `web/specs/*.spec.json` files
- `tests/a11y.spec.ts` — one test per Storybook story (reads `storybook-static/index.json`)
- `tests/phase3-qa.spec.ts` — behavioral and visual tests for Phase 3 components

**Expected outcome:** All tests pass. If any fail, investigate before proceeding.

---

### Step 3: Diagnose and fix any remaining failures

For each failure, determine the category:

**Category A: `parity.spec.ts` — variant not matching computed CSS**  
The test reads a `web/specs/*.spec.json` file and checks `getComputedStyle()` on the element. Possible causes:
- Token value changed but spec.json `expect` block was not updated → update `expect` to match current Figma-verified value
- Storybook story ID changed → find the correct `storyId` in `storybook-static/index.json` (search for the component name)
- `interaction: 'focus'` test not triggering `focus-visible:` → this would only happen if the element is not a button/input; check `canFocusSelf` logic in `parity.spec.ts`

**Category B: `a11y.spec.ts` — axe violation (serious or critical)**  
The test runs axe with `['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']` tags and `color-contrast` disabled. If a serious/critical violation fires:
- Read the violation message to identify the rule (e.g., `aria-required-children`, `label`)
- Fix the component HTML in the relevant `web/src/components/` file
- `color-contrast` is exempted — do NOT add other exemptions without checking with Pratishek

**Category C: `phase3-qa.spec.ts` — story ID not found**  
If a story URL returns 404, check `storybook-static/index.json` for the exact story ID and update the test.

**Category D: `phase3-qa.spec.ts` — wrong computed value**  
If a non-dropdown test fails, read the failure output carefully. If the Figma token value is correct but the component CSS is wrong, fix the component. If the Figma value changed, update both the component and the test expectation.

---

### Step 4: Add convenience script to root `package.json`

The root `package.json` has `"build:storybook"` as a proxy script. Add `"test:web"` alongside it.

**Read root `package.json` first.** Find the `scripts` block. Add this line:

```json
"test:web": "npm run build-storybook --prefix web && npm run test:parity --prefix web"
```

This builds Storybook then runs Playwright in one command. Useful for local pre-commit checks.

---

### Step 5: Verify `web-tests.yml` trigger paths cover all spec files

Read `.github/workflows/web-tests.yml`. Confirm the `paths:` block includes:
- `web/**` — covers `web/specs/*.spec.json`, `web/src/**`, `web/tests/**`
- `dist/**` — covers token output changes affecting component CSS
- `tokens/**` — covers token source changes

If all three are present, no change needed. Do NOT broaden the paths further without reason.

---

### Step 6: Commit Phase 6a

Only commit if all Playwright tests pass locally.

```bash
git add web/tests/phase3-qa.spec.ts package.json
git commit -m "test(e2e): fix Phase 3b dropdown focus assertion for WCAG Option C

phase3-qa.spec.ts previously asserted no orange ring on Dropdown focus.
Option C was approved 2026-06-14 and implemented in 1f36b96. Test now
asserts outline-color: #c74c01, outline-width: 2px, outline-offset: 2px.
Also adds test:web convenience script to root package.json."
git push origin main
```

### Phase 6a verification gate

Before pushing, confirm all three pass:

```bash
cd web
npx playwright test --reporter=line 2>&1 | tail -5
```

Expected last line: `X passed (Xs)` with zero failures. Zero is the bar. Do not push with any failure.

---

## Phase 6b: Figma → Token sync automation

### Architecture

The current pipeline has two halves:

```
Figma Variables → [GAP — manual] → tokens/tokens.json → build-tokens.yml → dist/* committed to main
```

`build-tokens.yml` already handles the right half automatically. Phase 6b closes the left half.

The new full pipeline after Phase 6b:

```
Figma publishes variables
  → figma-token-sync.yml (scheduled daily + manual dispatch)
    → tool/sync_figma_tokens.mjs
      → fetches Figma Variables REST API
      → transforms to W3C DTCG format
      → writes tokens/tokens.json
      → if changed: commits to branch + opens PR to main
  → Pratishek reviews and merges PR
  → build-tokens.yml triggers automatically
    → rebuilds all dist/* outputs
    → commits back to main [skip ci]
```

**Why PR instead of direct commit:** `tokens/tokens.json` is the source of truth for all 4 platforms. An unreviewed change can silently break Swift, Kotlin, Dart, and CSS simultaneously. A PR gives a human review gate before dist/* gets regenerated.

---

### Step 1: Understand the tokens.json structure before writing the script

Read `tokens/tokens.json` in full. Key facts:
- Top-level keys: `global`, `$metadata`
- `global` contains: `color`, `spacing`, `borderRadius`, `typography`
- `color` contains groups like `primary-orange`, `error-red`, `neutral-coolgray`, etc.
- Leaf format: `{ "$type": "color", "$value": "#UPPERCASE_HEX" }` — hex is uppercase
- `spacing` leaf: `{ "$type": "spacing", "$value": "4" }` — unitless number as string
- `typography` is nested: `{ "font-family": { "primary": { "$type": "fontFamily", "$value": "Mulish" } } }`
- `$metadata`: `{ "tokenSetOrder": ["global"] }` — static, not from Figma

The Figma Variables REST API returns variables with `/`-separated names. The collection name is the root key. Variable name `color/primary-orange/50` in collection `global` maps to path `global → color → primary-orange → 50`.

---

### Step 2: Write the debug/inspect script

Before writing the full transformation, Cursor must write a lightweight debug script that prints the raw Figma API response shape. This confirms the collection names and variable naming convention match the tokens.json structure.

**Create `tool/debug_figma_vars.mjs`:**

```javascript
#!/usr/bin/env node
/**
 * One-off debug script — dumps raw Figma Variables API response shape.
 * Run: FIGMA_ACCESS_TOKEN=<token> node tool/debug_figma_vars.mjs
 * Output shows collection names and a sample of variable names.
 * Delete this file after verifying the shape.
 */
import { writeFileSync } from 'node:fs';

const FILE_KEY = 'PCUj412f0Z1zZLLxQUX22e';
const TOKEN = process.env.FIGMA_ACCESS_TOKEN;

if (!TOKEN) {
  console.error('Set FIGMA_ACCESS_TOKEN env var first.');
  process.exit(1);
}

const res = await fetch(
  `https://api.figma.com/v1/files/${FILE_KEY}/variables/local`,
  { headers: { 'X-Figma-Token': TOKEN } }
);

if (!res.ok) {
  console.error(`HTTP ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const body = await res.json();
const { variableCollections, variables } = body.meta;

console.log('\n=== COLLECTIONS ===');
for (const c of Object.values(variableCollections)) {
  console.log(`  id=${c.id} name="${c.name}" defaultMode=${c.defaultModeId} varCount=${c.variableIds.length}`);
}

console.log('\n=== VARIABLE SAMPLE (first 10) ===');
const sample = Object.values(variables).slice(0, 10);
for (const v of sample) {
  const col = variableCollections[v.variableCollectionId];
  const val = v.valuesByMode[col.defaultModeId];
  console.log(`  [${col.name}] ${v.name} (${v.resolvedType}) = ${JSON.stringify(val)}`);
}

writeFileSync('tool/figma_api_sample.json', JSON.stringify(body, null, 2));
console.log('\nFull response written to tool/figma_api_sample.json');
```

**Run it:**

```bash
FIGMA_ACCESS_TOKEN=$(grep FIGMA_ACCESS_TOKEN .env | cut -d= -f2) node tool/debug_figma_vars.mjs
```

**Verify the output before continuing.** Specifically confirm:
1. At least one collection is named exactly `global`
2. Variable names use `/` as separator (e.g., `color/primary-orange/50`)
3. Color values are `{ r: float, g: float, b: float, a: float }` format (0–1 range)
4. Spacing values are floats (e.g., `2`, `4`, `8`)
5. Any aliases appear as `{ type: "VARIABLE_ALIAS", id: "VariableID:..." }`

**If the collection name is NOT `global` or variable names use a different separator**, stop and tell Pratishek. The transformation script must be adjusted before proceeding.

**Do NOT commit `figma_api_sample.json`** — it contains raw design data. It is already in `.gitignore` (verify; if not, add `tool/figma_api_sample.json` to `.gitignore`).

---

### Step 3: Write `tool/sync_figma_tokens.mjs`

Only write this after Step 2 confirms the API shape matches expectations.

**Create `tool/sync_figma_tokens.mjs`:**

```javascript
#!/usr/bin/env node
/**
 * Syncs Figma Variables → tokens/tokens.json (W3C DTCG format).
 *
 * Usage:
 *   FIGMA_ACCESS_TOKEN=<token> node tool/sync_figma_tokens.mjs
 *
 * The token must have file_content:read scope.
 * Get one at figma.com → Settings → Security → Personal access tokens.
 *
 * Output:
 *   tokens/tokens.json is rewritten if Figma variables differ from current file.
 *   Exits 0 with no write if already up to date.
 *   Exits 1 on any error.
 *
 * This script does NOT run build:tokens. The CI workflow does that separately
 * after merging the PR that this script's output generates.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = path.resolve(__dirname, '../tokens/tokens.json');
const FILE_KEY = 'PCUj412f0Z1zZLLxQUX22e';

// ─── Auth ──────────────────────────────────────────────────────────────────

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
if (!FIGMA_ACCESS_TOKEN) {
  console.error('ERROR: FIGMA_ACCESS_TOKEN is not set.');
  console.error('  export FIGMA_ACCESS_TOKEN=<your personal access token>');
  console.error('  Or add it to .env and run: source .env');
  process.exit(1);
}

// ─── Fetch ─────────────────────────────────────────────────────────────────

console.log(`Fetching variables from Figma file ${FILE_KEY}…`);
const res = await fetch(
  `https://api.figma.com/v1/files/${FILE_KEY}/variables/local`,
  { headers: { 'X-Figma-Token': FIGMA_ACCESS_TOKEN } }
);

if (!res.ok) {
  const body = await res.text();
  console.error(`Figma API error ${res.status}: ${body}`);
  process.exit(1);
}

const { meta } = await res.json();
const { variables, variableCollections } = meta;

// ─── Alias resolution ──────────────────────────────────────────────────────

// Build a map of variableId → variable object for alias resolution.
const varById = Object.fromEntries(
  Object.values(variables).map((v) => [v.id, v])
);

/**
 * Resolves a variable value, following VARIABLE_ALIAS chains.
 * Throws if a chain is circular or references a missing variable.
 */
function resolveValue(value, seen = new Set()) {
  if (value?.type !== 'VARIABLE_ALIAS') return value;

  if (seen.has(value.id)) {
    throw new Error(`Circular alias detected: ${value.id}`);
  }
  seen.add(value.id);

  const ref = varById[value.id];
  if (!ref) {
    throw new Error(`Unresolved alias: ${value.id}`);
  }

  const collection = variableCollections[ref.variableCollectionId];
  if (!collection) {
    throw new Error(`Collection not found for variable ${value.id}`);
  }

  return resolveValue(ref.valuesByMode[collection.defaultModeId], seen);
}

// ─── Color conversion ──────────────────────────────────────────────────────

/**
 * Converts a Figma COLOR value {r, g, b, a} (each 0–1) to uppercase hex.
 * Alpha is ignored — ILDS tokens are all opaque.
 * Example: {r: 1, g: 0.949, b: 0.929, a: 1} → '#FFF2ED'
 */
function figmaColorToHex({ r, g, b }) {
  const toHexByte = (c) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();
  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
}

// ─── Type mapping ──────────────────────────────────────────────────────────

/**
 * Maps Figma resolvedType → W3C DTCG $type string.
 * FLOAT → 'number' for spacing/dimension values.
 * FLOAT in a typography context (font-size, line-height, font-weight) stays 'number'.
 * STRING for font-family → 'fontFamily'.
 */
function dtcgType(resolvedType, variableName) {
  if (resolvedType === 'COLOR') return 'color';
  if (resolvedType === 'STRING') {
    if (variableName.includes('font-family')) return 'fontFamily';
    return 'string';
  }
  if (resolvedType === 'FLOAT') {
    if (variableName.includes('spacing') || variableName.includes('borderRadius')) {
      return 'spacing';
    }
    if (variableName.includes('font-size')) return 'dimension';
    if (variableName.includes('font-weight')) return 'fontWeight';
    if (variableName.includes('line-height')) return 'dimension';
    return 'number';
  }
  if (resolvedType === 'BOOLEAN') return 'boolean';
  return resolvedType.toLowerCase();
}

// ─── Nested object builder ──────────────────────────────────────────────────

/**
 * Sets a value at a nested path in an object, creating intermediate objects.
 * setNested(obj, ['color', 'primary-orange', '50'], { ... })
 */
function setNested(obj, path, value) {
  const [head, ...tail] = path;
  if (tail.length === 0) {
    obj[head] = value;
    return;
  }
  if (obj[head] === undefined) obj[head] = {};
  setNested(obj[head], tail, value);
}

// ─── Transform ─────────────────────────────────────────────────────────────

const output = {};

// Process each collection in the order Figma returns them.
for (const collection of Object.values(variableCollections)) {
  const { name: collectionName, defaultModeId, variableIds } = collection;

  for (const varId of variableIds) {
    const variable = variables[varId];
    if (!variable) continue;

    const rawValue = variable.valuesByMode[defaultModeId];
    let resolvedRaw;

    try {
      resolvedRaw = resolveValue(rawValue);
    } catch (err) {
      console.warn(`  WARN: Skipping ${variable.name} — ${err.message}`);
      continue;
    }

    // Determine $value based on resolved type.
    let $value;
    if (variable.resolvedType === 'COLOR') {
      $value = figmaColorToHex(resolvedRaw);
    } else if (variable.resolvedType === 'FLOAT') {
      // Spacing and dimension tokens store value as string (unitless number).
      // Typography (font-weight) stores as plain number.
      const num = resolvedRaw;
      const name = variable.name;
      if (
        name.includes('spacing') ||
        name.includes('borderRadius') ||
        name.includes('font-size') ||
        name.includes('line-height')
      ) {
        $value = String(num);
      } else {
        $value = num;
      }
    } else {
      $value = resolvedRaw;
    }

    const $type = dtcgType(variable.resolvedType, variable.name);

    // Path: collection name is root, then variable name split by '/'.
    // e.g. collection="global", name="color/primary-orange/50"
    //   → path = ['global', 'color', 'primary-orange', '50']
    const path = [collectionName, ...variable.name.split('/')];
    setNested(output, path, { $type, $value });
  }
}

// Append $metadata — this is static, not from Figma.
// tokenSetOrder lists all collections that Style Dictionary should process.
const collectionNames = Object.values(variableCollections).map((c) => c.name);
output.$metadata = { tokenSetOrder: collectionNames };

// ─── Write ─────────────────────────────────────────────────────────────────

const existing = readFileSync(TOKENS_PATH, 'utf8');
const newContent = JSON.stringify(output, null, 2) + '\n';

if (existing === newContent) {
  console.log('✅ tokens/tokens.json is already in sync with Figma. No changes.');
  process.exit(0);
}

writeFileSync(TOKENS_PATH, newContent);
console.log('✅ tokens/tokens.json updated from Figma.');

// Print a summary of what changed.
const oldKeys = Object.keys(JSON.parse(existing).global?.color ?? {}).length;
const newKeys = Object.keys(output.global?.color ?? {}).length;
console.log(`   Color groups: ${oldKeys} → ${newKeys}`);
```

---

### Step 4: Add `sync:tokens` to root `package.json`

Read root `package.json`. In the `scripts` block, add:

```json
"sync:tokens": "node tool/sync_figma_tokens.mjs"
```

Place it directly after `"build:tokens"` for logical grouping.

---

### Step 5: Test the sync script locally

Before writing the CI workflow, verify the script produces correct output.

```bash
# Load the token from .env
export FIGMA_ACCESS_TOKEN=$(grep FIGMA_ACCESS_TOKEN .env | cut -d= -f2)

# Run the sync
node tool/sync_figma_tokens.mjs
```

**Expected output:**
```
Fetching variables from Figma file PCUj412f0Z1zZLLxQUX22e…
✅ tokens/tokens.json is already in sync with Figma. No changes.
```

If the file IS in sync, the script exits cleanly. If it differs, it writes the new file and shows a summary.

**After running, verify:**

```bash
# Confirm tokens.json is still valid JSON
node -e "JSON.parse(require('fs').readFileSync('tokens/tokens.json','utf8')); console.log('valid JSON')"

# Confirm Style Dictionary still builds cleanly
npm run build:tokens

# Confirm parity still passes
npm run verify:tokens
```

If any of these fail, the transformation script has a bug. Debug before proceeding.  
**Do NOT commit if `npm run build:tokens` or `npm run verify:tokens` fail.**

---

### Step 6: Write `.github/workflows/figma-token-sync.yml`

**Create `.github/workflows/figma-token-sync.yml`:**

```yaml
name: Sync Figma Tokens

# Fetches Figma Variables for the ILDS file and opens a PR if tokens/tokens.json
# has changed. The PR triggers build-tokens.yml automatically on merge, which
# rebuilds all platform dist/* outputs (CSS, Swift, Kotlin, Dart).
#
# Secrets required (GitHub → Settings → Secrets → Actions):
#   FIGMA_ACCESS_TOKEN — Figma Personal Access Token with file_content:read scope.
#   GITHUB_TOKEN       — automatically available in all Actions workflows.

on:
  schedule:
    # 09:00 UTC Monday–Friday. Adjust if Figma publishes at a different time.
    - cron: '0 9 * * 1-5'
  workflow_dispatch:
    # Also triggerable manually from the Actions tab (no inputs required).

permissions:
  contents: write
  pull-requests: write

jobs:
  sync:
    name: Fetch Figma Variables and open PR if changed
    runs-on: ubuntu-latest

    steps:
      - name: Checkout main
        uses: actions/checkout@v4
        with:
          # Full history required so git log works correctly.
          fetch-depth: 0

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Fetch Figma Variables and update tokens.json
        env:
          FIGMA_ACCESS_TOKEN: ${{ secrets.FIGMA_ACCESS_TOKEN }}
        run: node tool/sync_figma_tokens.mjs

      - name: Check for changes
        id: diff
        run: |
          if git diff --quiet tokens/tokens.json; then
            echo "changed=false" >> "$GITHUB_OUTPUT"
          else
            echo "changed=true" >> "$GITHUB_OUTPUT"
          fi

      - name: Create PR branch if tokens changed
        if: steps.diff.outputs.changed == 'true'
        run: |
          BRANCH="token-sync/auto-$(date +%Y%m%d-%H%M)"
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git checkout -b "$BRANCH"
          git add tokens/tokens.json
          git commit -m "chore(tokens): sync Figma Variables → tokens.json [$(date +%Y-%m-%d)]

Automated sync from Figma file PCUj412f0Z1zZLLxQUX22e.
Merging this PR will trigger build-tokens.yml to regenerate
all platform outputs (CSS, Swift, Kotlin, Dart)."
          git push origin "$BRANCH"
          echo "BRANCH=$BRANCH" >> "$GITHUB_ENV"

      - name: Open pull request
        if: steps.diff.outputs.changed == 'true'
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh pr create \
            --base main \
            --head "$BRANCH" \
            --title "chore(tokens): sync Figma Variables [$(date +%Y-%m-%d)]" \
            --body "## Automated token sync

Figma Variables have changed since the last sync.

**Review checklist before merging:**
- [ ] Diff looks like intentional design token updates (not noise)
- [ ] No color group has been removed unexpectedly
- [ ] Spacing or typography values look correct

**After merging:** \`build-tokens.yml\` runs automatically and regenerates all platform outputs (CSS, Swift, Kotlin, Dart).

> This PR was opened automatically by \`figma-token-sync.yml\`."

      - name: No changes
        if: steps.diff.outputs.changed == 'false'
        run: echo "tokens/tokens.json is already in sync with Figma. No PR needed."
```

---

### Step 7: Add GitHub secret

This step is **Pratishek's action**, not Cursor's. Cursor must document it clearly.

**Add a note in the commit message and/or a new section in `.env.example`:**

Add to `.env.example` (read the current file first, then append):

```
# Figma → token sync (CI). Also add as GitHub secret:
#   GitHub → Settings → Secrets and variables → Actions → New repository secret
#   Name: FIGMA_ACCESS_TOKEN
#   Value: <same personal access token as above>
```

The sync workflow will silently fail with `process.exit(1)` if the secret is missing. There is no fallback.

---

### Step 8: Add `tool/figma_api_sample.json` to `.gitignore`

Read `.gitignore`. If `tool/figma_api_sample.json` is not already listed, add:

```
# Figma API debug output — contains raw design data, not for repo
tool/figma_api_sample.json
```

---

### Step 9: Commit Phase 6b

```bash
git add \
  tool/sync_figma_tokens.mjs \
  .github/workflows/figma-token-sync.yml \
  package.json \
  .env.example \
  .gitignore

git commit -m "feat(tokens): automate Figma → tokens.json upstream sync (Phase 6b)

tool/sync_figma_tokens.mjs: fetches Figma Variables REST API,
transforms RGBA+aliases to W3C DTCG, writes tokens/tokens.json.
figma-token-sync.yml: runs daily 09:00 UTC weekdays + manual dispatch.
Changed tokens open a PR to main (not a direct push) for human review.
Merging the PR triggers build-tokens.yml → all dist/* regenerated.

Secret required: FIGMA_ACCESS_TOKEN in GitHub repository secrets."

git push origin main
```

---

### Phase 6b verification gate

Before pushing, confirm:

```bash
# 1. Script is valid JS
node --check tool/sync_figma_tokens.mjs
echo "Syntax OK"

# 2. Dry-run with real token (should report in sync or write cleanly)
export FIGMA_ACCESS_TOKEN=$(grep FIGMA_ACCESS_TOKEN .env | cut -d= -f2)
node tool/sync_figma_tokens.mjs

# 3. tokens.json still valid + Style Dictionary still builds
node -e "JSON.parse(require('fs').readFileSync('tokens/tokens.json','utf8')); console.log('JSON valid')"
npm run build:tokens
npm run verify:tokens
npm run verify:parity

# 4. Workflow YAML is valid
npx js-yaml .github/workflows/figma-token-sync.yml > /dev/null && echo "YAML valid"
```

All four must pass. Zero failures.

---

## Ordering summary

```
Phase 6a:
  1. Fix phase3-qa.spec.ts dropdown test             ← DO THIS FIRST
  2. npm run build-storybook (in web/)
  3. npx playwright test --reporter=list (in web/)
  4. Fix any failures
  5. Add test:web to root package.json
  6. git commit + push
  7. Confirm CI green on GitHub

Phase 6b (only after 6a CI is green):
  1. Write tool/debug_figma_vars.mjs
  2. Run it with FIGMA_ACCESS_TOKEN to see API shape
  3. Confirm collection names + variable name format match expectations
  4. Write tool/sync_figma_tokens.mjs
  5. Add sync:tokens to root package.json
  6. Test locally: node tool/sync_figma_tokens.mjs → must exit 0
  7. npm run build:tokens + verify:tokens + verify:parity → all pass
  8. Write .github/workflows/figma-token-sync.yml
  9. Update .env.example + .gitignore
  10. git commit + push
  11. Tell Pratishek to add FIGMA_ACCESS_TOKEN as GitHub Actions secret
  12. Trigger workflow manually from GitHub Actions tab to confirm first run
```

## Manual actions required from Pratishek (not Cursor)

1. **GitHub secret:** Add `FIGMA_ACCESS_TOKEN` in GitHub → Settings → Secrets and variables → Actions → New repository secret. Use the same Personal Access Token as in `.env`.
2. **First workflow run:** After Cursor pushes, go to GitHub Actions → `Sync Figma Tokens` → Run workflow → confirm it exits cleanly.
3. **Delete debug file:** After verifying the API shape in Step 6b-2, delete `tool/debug_figma_vars.mjs` (it was a one-off tool, not for commit).
