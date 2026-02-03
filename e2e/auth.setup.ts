import path from 'node:path';

import { expect, test as setup } from '@playwright/test';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

/**
 * Authentication setup for Playwright tests.
 *
 * This setup file handles Clerk authentication for e2e tests.
 *
 * ## Setup Options:
 *
 * ### Option 1: Clerk Test Mode (Recommended)
 * 1. Enable test mode in Clerk Dashboard > Settings
 * 2. Create test users in the dashboard
 * 3. Set CLERK_TEST_EMAIL and CLERK_TEST_PASSWORD in .env.test
 *
 * ### Option 2: Manual Session Storage
 * 1. Run: npx playwright test --project=setup --headed
 * 2. Manually sign in when the browser opens
 * 3. The session will be saved for subsequent tests
 *
 * ### Option 3: Skip Authentication
 * For tests that don't require auth, skip this setup project.
 */

setup('authenticate', async ({ page }) => {
  const testEmail = process.env.CLERK_TEST_EMAIL;
  const testPassword = process.env.CLERK_TEST_PASSWORD;

  if (!testEmail || !testPassword) {
    console.log('⚠️  CLERK_TEST_EMAIL or CLERK_TEST_PASSWORD not set');
    console.log('   Skipping authentication setup.');
    console.log('   Set these in .env.test to enable authenticated tests.');
    console.log('');
    console.log('   For manual auth:');
    console.log('   1. Run: pnpm test:e2e:headed');
    console.log('   2. Sign in manually when prompted');
    console.log('   3. Auth state will be saved for future runs');
    return;
  }

  // Navigate to the app
  await page.goto('/');

  // Click sign in button in header
  const signInButton = page.getByRole('button', { name: /sign in/i });

  if (await signInButton.isVisible()) {
    await signInButton.click();

    // Wait for Clerk modal to appear
    await page.waitForSelector('[data-clerk-component]', { timeout: 10000 });

    // Fill in email
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByRole('button', { name: /continue/i }).click();

    // Wait for password field
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });

    // Fill in password
    await page.getByLabel(/password/i).fill(testPassword);
    await page.getByRole('button', { name: /continue|sign in/i }).click();

    // Wait for successful sign in (Clerk UserButton appears)
    await expect(
      page.locator('[data-clerk-component="UserButton"]'),
    ).toBeVisible({
      timeout: 15000,
    });

    console.log('✅ Authentication successful');
  } else {
    console.log('ℹ️  Already signed in or sign-in button not found');
  }

  // Save auth state
  await page.context().storageState({ path: authFile });
});
