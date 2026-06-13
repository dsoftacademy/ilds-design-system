import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.STORYBOOK_URL ?? 'http://localhost:6006';

type StoryEntry = { id: string; type: string; title: string; name: string };

const indexPath = path.resolve(__dirname, '../storybook-static/index.json');
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8')) as {
  entries: Record<string, StoryEntry>;
};

// One representative story per component is enough for structural a11y;
// but we sweep every story to catch state-specific issues (disabled, error, etc.).
const stories = Object.values(index.entries).filter(
  (e) => e.type === 'story' && !e.id.endsWith('--playground'),
);

for (const story of stories) {
  test(`a11y — ${story.title} / ${story.name} [${story.id}]`, async ({ page }) => {
    await page.goto(`${BASE}/iframe.html?id=${story.id}&viewMode=story`);
    await page.locator('#storybook-root').waitFor({ state: 'attached' });
    await page.waitForTimeout(150);

    const results = await new AxeBuilder({ page })
      .include('#storybook-root')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // color-contrast is governed by the ILDS brand palette (Figma = source of truth):
      // the primary orange (#e3530f) and de-emphasized grays are intentional design
      // tokens that do not all meet AA as normal text. Tracked for designer review in
      // docs/a11y/CONTRAST_EXCEPTIONS.md rather than overridden in code.
      .disableRules(['color-contrast'])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );

    if (serious.length) {
      const summary = serious
        .map(
          (v) =>
            `  [${v.impact}] ${v.id}: ${v.help}\n    nodes: ${v.nodes
              .map((n) => n.target.join(' '))
              .join(' | ')}`,
        )
        .join('\n');
      throw new Error(`${serious.length} serious/critical a11y violation(s):\n${summary}`);
    }
    expect(serious.length).toBe(0);
  });
}
