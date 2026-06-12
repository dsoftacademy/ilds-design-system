# ILDS T2 — Figma Parity Testing Harness (Brief for Cursor)

**Date:** 2026-06-12
**Author:** Claude (advisor) — specs extracted live from Figma file `PCUj412f0Z1zZLLxQUX22e`, Button set `13472:2804`
**Goal:** Automate the manual Figma↔Storybook audit. Every PR asserts computed styles in the rendered Storybook against committed spec JSON derived from Figma. Deterministic, headless, no browser-extension dependencies.

---

## 0. Gate order (do not reorder)

1. **Land the Button fix round first.** As of today, `web/src/components/Button/Button.tsx` on `main` is unchanged — all 9 audit defects live, while QA stories asserting the fixed behavior ARE pushed. Main is internally inconsistent. Fix list (Figma truth):
   - Pressed: `active:bg-primary-orange-600` (NOT 700). Destructive pressed: verify node, presumed `error-red-700`.
   - Hover: `hover:bg-primary-orange-400` (primary normal). Pull hover nodes for secondary/tertiary/destructive — do not invent.
   - Disabled primary: `bg-neutral-coolgray-400 text-white-000` (NOT orange-200).
   - Disabled secondary/tertiary: coolgray-**400** text/border (coolgray-500 appears nowhere in the Button set).
   - Focus: 2px outline `primary-orange-600`, offset 1px (not 500/offset-2).
   - Gap large: 8px (not `gap-sp-2`). Verify medium/small gaps from Figma.
   - Tertiary: no horizontal padding.
   - Heights: enforce 48/36/28 via `min-h` (large currently computes ~44px with `min-h-0`).
   - **White:** theme has no `--color-white`. Either add alias `--color-white: #ffffff` to the Style Dictionary theme output, or use `*-white-000` classes. Decide once, apply everywhere. NOTE: repo token says `#fffffe`, Figma variable `Global/white-000` says `#ffffff` — resolve this token drift at the source (tokens.json) first.
   - Skeleton state: implement or formally defer (story exists on main either way — don't ship a story for an unimplemented state).
2. Claude source-verifies the fixed Button from GitHub.
3. Build the harness below (against Button only).
4. Batch-build components 2–18 with Button as reference pattern. Each new component ships with its own `<component>.spec.json`.

---

## 1. Repo layout

```
web/
  specs/
    button.spec.json          ← committed, Figma-derived (draft provided alongside this brief)
    parity-spec.schema.json   ← JSON schema for validation
  tests/
    parity.spec.ts            ← generic runner, reads ALL specs/*.spec.json
  playwright.config.ts
```

One generic runner. Adding a component to parity testing = adding one spec file. No new test code per component.

## 2. Spec format

See `button.spec.json`. Key fields:

- `selector` — root element to measure inside `#storybook-root`.
- `variants[]` — each maps a Figma node to a Storybook story:
  - `storyId` — Storybook story ID; `storyArgs` (optional) appended as `&args=type:secondary;size:large` for playground-driven variants. Prefer dedicated stories over args where stable.
  - `figmaNodeId` — traceability back to the design source.
  - `interaction` — `null` | `hover` | `active` | `focus`. The runner performs the real interaction (mouse hover, mouse down-hold, keyboard Tab) before measuring. This is why Playwright and not jsdom.
  - `expect` — CSS property → expected value. Colors as hex (runner normalizes to rgb). `offsetHeight` asserted as integer px.
  - `verified` — `false` means the value is presumed, not pulled from Figma. **CI treats unverified variants as warnings, not failures, until verified.** Burn down all TODOs.

## 3. Runner — `web/tests/parity.spec.ts`

```ts
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const SPECS_DIR = path.resolve(__dirname, '../specs');
const BASE = process.env.STORYBOOK_URL ?? 'http://localhost:6006';

type Variant = {
  name: string; storyId: string; storyArgs?: Record<string, string>;
  figmaNodeId: string; interaction: null | 'hover' | 'active' | 'focus';
  verified: boolean; expect: Record<string, string | number>;
};
type Spec = { component: string; selector: string; shared?: Record<string, string>; variants: Variant[] };

function hexToRgb(hex: string): string {
  if (hex === 'transparent') return 'rgba(0, 0, 0, 0)';
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}
const isColorProp = (p: string) => /color$/.test(p);

const storyUrl = (v: Variant) => {
  let u = `${BASE}/iframe.html?id=${v.storyId}&viewMode=story`;
  if (v.storyArgs) u += '&args=' + Object.entries(v.storyArgs).map(([k, val]) => `${k}:${val}`).join(';');
  return u;
};

for (const file of fs.readdirSync(SPECS_DIR).filter((f) => f.endsWith('.spec.json'))) {
  const spec: Spec = JSON.parse(fs.readFileSync(path.join(SPECS_DIR, file), 'utf8'));

  for (const variant of spec.variants) {
    const t = variant.verified ? test : test.fixme; // unverified = tracked, not blocking
    t(`${spec.component} parity — ${variant.name} [figma ${variant.figmaNodeId}]`, async ({ page }) => {
      await page.goto(storyUrl(variant));
      const el = page.locator(spec.selector).first();
      await el.waitFor({ state: 'visible' });

      if (variant.interaction === 'hover') await el.hover();
      if (variant.interaction === 'focus') await page.keyboard.press('Tab');
      if (variant.interaction === 'active') {
        const box = (await el.boundingBox())!;
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
      }
      await page.waitForTimeout(50); // let transition-colors settle? NO — see note below.

      const expectations = { ...(spec.shared ?? {}), ...variant.expect };
      const props = Object.keys(expectations).filter((p) => p !== 'offsetHeight');

      const actual = await el.evaluate((node, props) => {
        const s = getComputedStyle(node as Element);
        const out: Record<string, string | number> = {};
        for (const p of props) out[p] = s.getPropertyValue(p);
        out.offsetHeight = (node as HTMLElement).offsetHeight;
        return out;
      }, props);

      for (const [prop, want] of Object.entries(expectations)) {
        if (prop === 'offsetHeight') { expect(actual.offsetHeight, prop).toBe(want); continue; }
        const wantStr = String(want);
        const got = String(actual[prop]).trim();
        if (isColorProp(prop) && wantStr.startsWith('#')) expect(got, prop).toBe(hexToRgb(wantStr));
        else if (prop === 'font-family') expect(got, prop).toContain(wantStr);
        else expect(got, prop).toBe(wantStr);
      }

      if (variant.interaction === 'active') await page.mouse.up();
    });
  }
}
```

**Transition caveat:** the component uses `transition-colors`. Computed style mid-transition returns interpolated values. Disable transitions globally in the test run — add to the runner before measuring:

```ts
await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
```

Put that line immediately after `page.goto`, then remove the `waitForTimeout`.

**Focus caveat:** `keyboard.press('Tab')` focuses the first focusable element. Stories used for focus assertions must render exactly one button. The `focus-check` QA story already exists — point the spec at it once verified.

## 4. Playwright config — `web/playwright.config.ts`

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 15_000,
  use: { headless: true, viewport: { width: 1200, height: 800 } },
  webServer: {
    command: 'npx http-server storybook-static -p 6006 -s',
    port: 6006,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
```

CI flow: `npm run build-storybook` (static build, no dev server flakiness) → Playwright serves `storybook-static` → tests run. Locally, `reuseExistingServer` lets it piggyback on a running `npm run storybook` if port 6006 is live — note dev vs static can differ; CI static build is the source of truth.

## 5. CI — `.github/workflows/web-tests.yml`

```yaml
name: Web Component Tests
on:
  pull_request:
    paths: ['web/**', 'dist/**', 'tokens/**']
  push:
    branches: [main]
    paths: ['web/**', 'dist/**', 'tokens/**']

jobs:
  parity:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm, cache-dependency-path: web/package-lock.json }
      - run: npm ci
        working-directory: web
      - run: npx playwright install --with-deps chromium
        working-directory: web
      - run: npm run build-storybook
        working-directory: web
      - run: npx playwright test
        working-directory: web
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report, path: web/playwright-report }
```

Triggering on `dist/**` and `tokens/**` matters: a Figma token change that breaks a component fails here, closing the loop from design change to component regression.

## 6. T1 (build same day, one hour)

- **Dead-utility lint:** with `--color-*: initial`, unknown classes (e.g. `bg-white`, `text-red-500`) silently emit nothing. Script: extract all class candidates from `web/src/**`, run a Tailwind probe build, fail on any candidate that produced no CSS rule. This single check would have caught 4 of today's 9 defects.
- **Vitest + Testing Library:** disabled blocks onClick; loading hides leading/trailing and shows spinner; `aria-busy` set.
- Wire both into the same workflow as separate jobs.

## 7. Spec refresh process (the future "agent" seam)

Specs are generated from Figma node design context (`get_design_context` per variant node, `disableCodeConnect: true`). Manual today; later a scheduled Cowork task pulls the nodes, regenerates spec JSON, and opens a PR when Figma changes — human reviews the diff (intentional redesign vs accident), CI re-verifies components against the new spec. Judgment at the edges, determinism in the middle.

## 8. Definition of done (T2)

- [ ] Button fix round on `main`; Claude source-verify passed
- [ ] `parity.spec.ts` + config + workflow merged
- [ ] `button.spec.json` committed; all 5 TODO variants verified against Figma and flipped to `verified: true`
- [ ] White token drift (`#fffffe` vs `#ffffff`) resolved in `tokens.json`
- [ ] CI green on a no-op PR; CI **red** demonstrated on a deliberate wrong-color commit (prove the harness actually catches)
- [ ] Every subsequent component PR ships `<component>.spec.json` — enforced by review checklist
