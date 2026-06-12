import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPECS_DIR = path.resolve(__dirname, '../specs');
const BASE = process.env.STORYBOOK_URL ?? 'http://localhost:6006';

type Variant = {
  name: string;
  storyId: string;
  storyArgs?: Record<string, string>;
  figmaNodeId: string;
  interaction: null | 'hover' | 'active' | 'focus';
  verified: boolean;
  expect: Record<string, string | number>;
};
type Spec = {
  component: string;
  selector: string;
  shared?: Record<string, string>;
  variants: Variant[];
};

function hexToRgb(hex: string): string {
  if (hex === 'transparent') return 'rgba(0, 0, 0, 0)';
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}
const isColorProp = (p: string) => /color$/.test(p);

const storyUrl = (v: Variant) => {
  let u = `${BASE}/iframe.html?id=${v.storyId}&viewMode=story`;
  if (v.storyArgs) {
    u +=
      '&args=' +
      Object.entries(v.storyArgs)
        .map(([k, val]) => `${k}:${val}`)
        .join(';');
  }
  return u;
};

for (const file of fs.readdirSync(SPECS_DIR).filter((f) => f.endsWith('.spec.json'))) {
  const spec: Spec = JSON.parse(fs.readFileSync(path.join(SPECS_DIR, file), 'utf8'));

  for (const variant of spec.variants) {
    const t = variant.verified ? test : test.fixme;
    t(`${spec.component} parity — ${variant.name} [figma ${variant.figmaNodeId}]`, async ({
      page,
    }) => {
      await page.goto(storyUrl(variant));
      await page.addStyleTag({
        content:
          '*, *::before, *::after { transition: none !important; animation: none !important; }',
      });
      const el = page.locator(spec.selector).first();
      await el.waitFor({ state: 'visible' });

      if (variant.interaction === 'hover') await el.hover();
      if (variant.interaction === 'focus') await page.keyboard.press('Tab');
      if (variant.interaction === 'active') {
        const box = (await el.boundingBox())!;
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
      }

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
        if (prop === 'offsetHeight') {
          expect(actual.offsetHeight, prop).toBe(want);
          continue;
        }
        const wantStr = String(want);
        const got = String(actual[prop]).trim();
        if (isColorProp(prop) && wantStr.startsWith('#')) {
          expect(got, prop).toBe(hexToRgb(wantStr));
        } else if (isColorProp(prop) && wantStr === 'transparent') {
          expect(got, prop).toBe(hexToRgb('transparent'));
        } else if (prop === 'font-family') {
          expect(got, prop).toContain(wantStr);
        } else {
          expect(got, prop).toBe(wantStr);
        }
      }

      if (variant.interaction === 'active') await page.mouse.up();
    });
  }
}
