import { defineConfig, devices } from '@playwright/test';

// The full microservices stack (12 services + MongoDB) isn't something a
// frontend test run can assume is up, so these are UI-level smoke tests —
// they mock the backend at the network layer (see e2e/fixtures.ts) rather
// than requiring a live API. That means they verify the frontend renders
// and behaves correctly against known-shaped responses, not that the real
// backend integration works end-to-end (only a live run against a running
// stack can prove that).
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
        },
      },
    },
  ],
});
