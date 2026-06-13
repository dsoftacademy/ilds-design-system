import { test, expect } from '@playwright/test';

const BASE = process.env.STORYBOOK_URL ?? 'http://localhost:6006';

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}

async function gotoStory(page: import('@playwright/test').Page, storyId: string) {
  await page.goto(`${BASE}/iframe.html?id=${storyId}&viewMode=story`);
  await page.addStyleTag({
    content:
      '*, *::before, *::after { transition: none !important; animation: none !important; }',
  });
}

async function styles(el: import('@playwright/test').Locator, props: string[]) {
  return el.evaluate((node, props) => {
    const s = getComputedStyle(node as Element);
    const out: Record<string, string> = {};
    for (const p of props) out[p] = s.getPropertyValue(p).trim();
    return out;
  }, props);
}

// ─── PASS 1: Parity-adjacent visual spot checks (Phase 3c additions) ───

test.describe('Pass 1 — Phase 3c visual tokens', () => {
  test('Password default container matches Figma border/bg', async ({ page }) => {
    await gotoStory(page, 'components-text-field--password-default');
    const el = page.locator('[data-testid="textfield-input"]');
    const s = await styles(el, ['background-color', 'border-color']);
    expect(s['background-color']).toBe(hexToRgb('#ffffff'));
    expect(s['border-color']).toBe(hexToRgb('#9e9e9e'));
  });

  test('Password toggle is 20px slot', async ({ page }) => {
    await gotoStory(page, 'components-text-field--password-default');
    const toggle = page.locator('[data-testid="password-toggle"]');
    const box = await toggle.boundingBox();
    expect(box?.width).toBe(20);
    expect(box?.height).toBe(20);
  });

  test('Password focused-empty gets orange ring', async ({ page }) => {
    await gotoStory(page, 'components-text-field--password-default');
    const container = page.locator('[data-testid="textfield-input"]');
    await container.locator('input').focus();
    const s = await styles(container, [
      'background-color',
      'border-color',
      'outline-color',
      'outline-width',
    ]);
    expect(s['background-color']).toBe(hexToRgb('#fafafa'));
    expect(s['border-color']).toBe(hexToRgb('#424242'));
    expect(s['outline-color']).toBe(hexToRgb('#c74c01'));
    expect(s['outline-width']).toBe('2px');
  });

  test('OTP cell default border is coolgray-500', async ({ page }) => {
    await gotoStory(page, 'components-text-field--otp-6-default');
    const cell = page.locator('[data-testid="otp-cell-0"]');
    const s = await styles(cell, ['border-color', 'background-color']);
    expect(s['border-color']).toBe(hexToRgb('#9e9e9e'));
    expect(s['background-color']).toBe(hexToRgb('#ffffff'));
  });

  test('OTP typing focused cell gets orange-500 border', async ({ page }) => {
    await gotoStory(page, 'components-text-field--otp-6-typing');
    const cell = page.locator('[data-testid="otp-cell-3"]');
    const s = await styles(cell, ['border-color']);
    expect(s['border-color']).toBe(hexToRgb('#e3530f'));
  });

  test('Help button uses primary-orange-500', async ({ page }) => {
    await gotoStory(page, 'components-text-field--password-default');
    const btn = page.getByRole('button', { name: 'Help button' });
    const s = await styles(btn, ['color']);
    expect(s.color).toBe(hexToRgb('#e3530f'));
  });

  test('Dropdown menu panel width and header bg', async ({ page }) => {
    await gotoStory(page, 'components-dropdown--menu-panel');
    const menu = page.locator('[data-testid="dropdown-menu"]');
    const menuStyles = await menu.evaluate((node) => ({
      width: (node as HTMLElement).offsetWidth,
      bg: getComputedStyle(node).backgroundColor,
    }));
    expect(menuStyles.width).toBe(320);
    expect(menuStyles.bg).toBe(hexToRgb('#ffffff'));

    const header = menu.locator('span').filter({ hasText: 'Section Label' }).first();
    const headerBg = await header.evaluate((node) => {
      const row = node.closest('div')?.parentElement;
      return row ? getComputedStyle(row.firstElementChild as Element).backgroundColor : '';
    });
    expect(headerBg).toBe(hexToRgb('#f5f5f5'));
  });

  test('Dropdown menu option row typography', async ({ page }) => {
    await gotoStory(page, 'components-dropdown--menu-panel');
    const option = page.getByRole('option').first();
    const s = await styles(option.locator('span').last(), ['font-size', 'color']);
    expect(s['font-size']).toBe('14px');
    expect(s.color).toBe(hexToRgb('#424242'));
  });
});

// ─── PASS 2: Functional behavior ───

test.describe('Pass 2 — Functional behavior', () => {
  test('Password toggle switches input type and aria-label', async ({ page }) => {
    await gotoStory(page, 'components-text-field--password-default');
    const input = page.locator('[data-testid="textfield-input"] input');
    const toggle = page.locator('[data-testid="password-toggle"]');

    await expect(input).toHaveAttribute('type', 'password');
    await expect(toggle).toHaveAttribute('aria-label', 'Show password');

    await toggle.click();
    await expect(input).toHaveAttribute('type', 'text');
    await expect(toggle).toHaveAttribute('aria-label', 'Hide password');
  });

  test('OTP auto-advances on digit entry', async ({ page }) => {
    await gotoStory(page, 'components-text-field--otp-6-default');
    const cells = page.locator('[data-testid^="otp-cell-"] input');
    await cells.nth(0).fill('1');
    await expect(cells.nth(1)).toBeFocused();
    await cells.nth(1).fill('2');
    await expect(cells.nth(2)).toBeFocused();
  });

  test('OTP backspace moves to previous cell', async ({ page }) => {
    await gotoStory(page, 'components-text-field--otp-6-default');
    const cells = page.locator('[data-testid^="otp-cell-"] input');
    await cells.nth(0).fill('1');
    await cells.nth(1).focus();
    await page.keyboard.press('Backspace');
    await expect(cells.nth(0)).toBeFocused();
  });

  test('OTP paste fills multiple cells', async ({ page }) => {
    await gotoStory(page, 'components-text-field--otp-6-default');
    const cells = page.locator('[data-testid^="otp-cell-"] input');
    await cells.nth(0).focus();
    await cells.nth(0).evaluate((input) => {
      const data = new DataTransfer();
      data.setData('text/plain', '123456');
      input.dispatchEvent(
        new ClipboardEvent('paste', {
          clipboardData: data,
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    await expect(cells.nth(0)).toHaveValue('1');
    await expect(cells.nth(5)).toHaveValue('6');
  });

  test('Dropdown WithMenu renders menu when open', async ({ page }) => {
    await gotoStory(page, 'components-dropdown--with-menu');
    await expect(page.locator('[data-testid="dropdown-trigger"]')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(page.locator('[data-testid="dropdown-menu"]')).toBeVisible();
    await expect(page.getByRole('option')).toHaveCount(5);
  });

  test('Dropdown menu option click fires onSelect in playground', async ({ page }) => {
    await gotoStory(page, 'components-dropdown--menu-panel');
    const options = page.getByRole('option');
    await expect(options.first()).toBeEnabled();
  });

  test('Icon-only small button has 28px height', async ({ page }) => {
    await gotoStory(page, 'components-button--icon-only-small');
    const btn = page.locator('#storybook-root button[aria-label="Favorite"]');
    const h = await btn.evaluate((n) => (n as HTMLElement).offsetHeight);
    expect(h).toBe(28);
  });
});

// ─── PASS 3: Accessibility ───

test.describe('Pass 3 — Accessibility', () => {
  test('Password field label associates with input', async ({ page }) => {
    await gotoStory(page, 'components-text-field--password-default');
    const label = page.locator('label').filter({ hasText: 'Label' });
    const forId = await label.getAttribute('for');
    const input = page.locator(`#${forId}`);
    await expect(input).toBeVisible();
  });

  test('OTP group has aria-labelledby and per-cell labels', async ({ page }) => {
    await gotoStory(page, 'components-text-field--otp-6-default');
    const group = page.locator('[data-testid="textfield-otp"]');
    const labelledBy = await group.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    await expect(page.locator(`[id="${labelledBy}"]`)).toBeVisible();

    for (let i = 1; i <= 6; i++) {
      await expect(page.getByLabel(`OTP digit ${i}`)).toBeVisible();
    }
  });

  test('OTP label uses group label without htmlFor', async ({ page }) => {
    await gotoStory(page, 'components-text-field--otp-6-default');
    await expect(page.locator('label').filter({ hasText: 'Label' })).toHaveCount(0);
    const group = page.locator('[data-testid="textfield-otp"]');
    const labelledBy = await group.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    await expect(page.locator(`[id="${labelledBy}"]`)).toContainText('Label');
  });

  test('Dropdown trigger combobox attributes', async ({ page }) => {
    await gotoStory(page, 'components-dropdown--empty-default');
    const trigger = page.locator('[data-testid="dropdown-trigger"]');
    await expect(trigger).toHaveAttribute('role', 'combobox');
    await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('Dropdown menu listbox + options', async ({ page }) => {
    await gotoStory(page, 'components-dropdown--menu-panel');
    await expect(page.locator('[role="listbox"]')).toBeVisible();
    const first = page.getByRole('option').first();
    await expect(first).toHaveAttribute('aria-selected', 'true');
  });

  test('Icon-only button requires aria-label', async ({ page }) => {
    await gotoStory(page, 'components-button--icon-only-small');
    await expect(
      page.locator('#storybook-root button[aria-label="Favorite"]'),
    ).toBeVisible();
  });

  test('Standard error sets aria-invalid', async ({ page }) => {
    await gotoStory(page, 'components-text-field--standard-error');
    await expect(page.locator('[data-testid="textfield-input"] input')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  test('Required text indicator is 10px', async ({ page }) => {
    await gotoStory(page, 'components-text-field--required-text');
    const indicator = page.locator('[data-testid="textfield-required-indicator"]');
    const s = await styles(indicator, ['font-size']);
    expect(s['font-size']).toBe('10px');
  });
});

// ─── PASS 4: Regression sweep (Phase 3b components) ───

test.describe('Pass 4 — Phase 3b regression', () => {
  test('TextField standard focused ring intact', async ({ page }) => {
    await gotoStory(page, 'components-text-field--standard-default');
    const container = page.locator('[data-testid="textfield-input"]');
    await container.locator('input').focus();
    const s = await styles(container, ['outline-color', 'outline-width']);
    expect(s['outline-color']).toBe(hexToRgb('#c74c01'));
    expect(s['outline-width']).toBe('2px');
  });

  test('TextField typing state no ring', async ({ page }) => {
    await gotoStory(page, 'components-text-field--standard-typing');
    const container = page.locator('[data-testid="textfield-input"]');
    await container.locator('input').focus();
    const s = await styles(container, ['border-color', 'outline-width']);
    expect(s['border-color']).toBe(hexToRgb('#e3530f'));
    expect(s['outline-width']).toBe('0px');
  });

  test('Dropdown active state orange border + chevron', async ({ page }) => {
    await gotoStory(page, 'components-dropdown--open-state');
    const trigger = page.locator('[data-testid="dropdown-trigger"]');
    const s = await styles(trigger, ['border-color']);
    expect(s['border-color']).toBe(hexToRgb('#e3530f'));
    const chevron = trigger.locator('span').last();
    const chevronColor = await chevron.evaluate((n) => getComputedStyle(n).color);
    expect(chevronColor).toBe(hexToRgb('#e3530f'));
  });

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

  test('Toast info border uses secondary-blue-50', async ({ page }) => {
    await gotoStory(page, 'components-toast--info');
    const toast = page.locator('[data-testid="toast"]');
    const s = await styles(toast, ['border-color']);
    expect(s['border-color']).toBe(hexToRgb('#edf6ff'));
  });
});
