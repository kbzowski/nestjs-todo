import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  globalSetup: './global-setup.ts',
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html'], ['list']],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'npm run start:dev',
      cwd: '../server',
      url: 'http://localhost:3000/api',
      reuseExistingServer: false,
      timeout: 120 * 1000,
      env: {
        PORT: '3000',
        DATABASE_URL: 'file:./prisma/test.db',
        JWT_SECRET: 'test-secret-for-e2e-testing',
        JWT_ACCESS_EXPIRATION: '1h',
        CORS_ORIGIN: 'http://localhost:5173',
      },
    },
    {
      command: 'npm run dev',
      cwd: '../ui',
      url: 'http://localhost:5173',
      reuseExistingServer: false,
      timeout: 120 * 1000,
    },
  ],
});
