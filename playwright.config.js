import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const config = defineConfig({
  testDir: './features',
  fullyParallel: false,
  forbidOnly: process.env.CI !== undefined,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://example.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: parseInt(process.env.ACTION_TIMEOUT || '15000'),
    navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT || '30000'),
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        headless: process.env.HEADED !== 'true',
        slowMo: parseInt(process.env.SLOWMO || '0'),
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        headless: process.env.HEADED !== 'true',
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        headless: process.env.HEADED !== 'true',
      },
    },
  ],

  webServer: undefined,
});

export default config;
