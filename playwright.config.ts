import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for e2e tests.
 *
 * ## Running tests:
 *   pnpm test:e2e          # Run all tests
 *   pnpm test:e2e:ui       # Interactive UI mode
 *   pnpm test:e2e:headed   # Watch tests in browser
 *   pnpm test:e2e:debug    # Debug mode
 *
 * ## Environment setup:
 *   1. Copy .env.test.example to .env.test
 *   2. Set your test Convex deployment URL
 *   3. Set Clerk test credentials (optional, for auth tests)
 *
 * ## Test scenarios:
 *   Set TEST_SCENARIO env var to control data seeding:
 *   - upcoming_race: Race in future, predictions open
 *   - locked_race: Race starting soon, predictions locked
 *   - finished_race: Race complete with results
 *   - full_season: Multiple races in various states
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 30000,

  // Global test settings
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  // Test projects
  projects: [
    // Database setup - seeds test data
    {
      name: 'db-setup',
      testMatch: /global\.setup\.ts/,
    },

    // Auth setup - handles Clerk authentication
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
      dependencies: ['db-setup'],
    },

    // Main test projects
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use saved auth state for authenticated tests
        storageState: './playwright/.auth/user.json',
      },
      dependencies: ['auth-setup'],
    },

    // Unauthenticated tests (no auth state)
    {
      name: 'chromium-unauth',
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: ['db-setup'],
      testMatch: /.*\.unauth\.spec\.ts/,
    },

    // Additional browsers (optional, comment out if not needed)
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: './playwright/.auth/user.json',
      },
      dependencies: ['auth-setup'],
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: './playwright/.auth/user.json',
      },
      dependencies: ['auth-setup'],
    },

    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: './playwright/.auth/user.json',
      },
      dependencies: ['auth-setup'],
    },

    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        storageState: './playwright/.auth/user.json',
      },
      dependencies: ['auth-setup'],
    },
  ],

  // Run local dev server before tests
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
