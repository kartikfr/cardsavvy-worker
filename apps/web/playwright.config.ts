import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] }, // Mobile First philosophy
        },
        {
            name: 'Desktop Chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    /*
  webServer: {
    command: 'pnpm --filter web dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
  */
});
