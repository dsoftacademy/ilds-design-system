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
