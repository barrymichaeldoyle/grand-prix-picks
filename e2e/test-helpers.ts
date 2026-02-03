import { ConvexHttpClient } from 'convex/browser';

/**
 * Test helpers for Playwright e2e tests.
 *
 * These helpers interact with Convex to seed data and clean up after tests.
 * They use internal mutations which require the CONVEX_DEPLOY_KEY.
 */

// Get Convex URL from environment
function getConvexUrl(): string {
  const url = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
  if (!url) {
    throw new Error(
      'VITE_CONVEX_URL or CONVEX_URL must be set for e2e tests. ' +
        'Make sure you have a .env.test file or set the environment variable.',
    );
  }
  return url;
}

// Create Convex HTTP client for test helpers
export function createTestClient(): ConvexHttpClient {
  return new ConvexHttpClient(getConvexUrl());
}

/**
 * Seed a test scenario.
 *
 * Available scenarios:
 * - 'upcoming_race': Race in 7 days, predictions open
 * - 'locked_race': Race starting soon, predictions locked
 * - 'finished_race': Race complete with results
 * - 'full_season': Multiple races in various states
 */
export async function seedTestScenario(
  client: ConvexHttpClient,
  scenario: 'upcoming_race' | 'locked_race' | 'finished_race' | 'full_season',
) {
  // Note: To call internal mutations, you need to use the Convex CLI or
  // a special admin endpoint. For tests, we'll use the dashboard API.
  //
  // In practice, you may want to:
  // 1. Create a wrapper HTTP action that calls the internal mutation
  // 2. Use the Convex CLI: npx convex run testing:seedTestScenario '{"scenario": "upcoming_race"}'
  // 3. Set up a test-only HTTP endpoint

  console.log(`Seeding test scenario: ${scenario}`);

  // This is a placeholder - see the actual implementation options below
  return { scenario };
}

/**
 * Clean up test data after tests.
 */
export async function cleanupTestData(client: ConvexHttpClient) {
  console.log('Cleaning up test data...');
  // Same note as above - internal mutations need special handling
}

/**
 * Test user credentials for Clerk test mode.
 *
 * To use Clerk's testing features:
 * 1. Enable "Test mode" in Clerk Dashboard > Settings
 * 2. Create test users in the Clerk Dashboard
 * 3. Use the test user credentials here
 *
 * See: https://clerk.com/docs/testing/overview
 */
export const TEST_USERS = {
  regular: {
    email: 'testuser@example.com',
    // In Clerk test mode, you can set a simple password
    password: 'test-password-123',
    clerkUserId: 'test_user_e2e',
  },
  admin: {
    email: 'testadmin@example.com',
    password: 'test-admin-password-123',
    clerkUserId: 'test_admin_e2e',
  },
} as const;

/**
 * Sign in a test user via Clerk.
 *
 * This helper navigates to the sign-in page and authenticates.
 * Requires Clerk test mode to be enabled.
 */
export async function signInTestUser(
  page: import('@playwright/test').Page,
  user: keyof typeof TEST_USERS = 'regular',
) {
  const { email, password } = TEST_USERS[user];

  // Navigate to sign-in
  await page.goto('/sign-in');

  // Fill in Clerk sign-in form
  // Note: Exact selectors depend on your Clerk configuration
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: /continue/i }).click();

  // Enter password (if using email/password strategy)
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /continue|sign in/i }).click();

  // Wait for redirect after successful sign-in
  await page.waitForURL('/');
}

/**
 * Sign out the current user.
 */
export async function signOutUser(page: import('@playwright/test').Page) {
  // Click user menu and sign out
  // Note: Adjust selectors based on your UI
  await page.getByTestId('user-menu').click();
  await page.getByRole('button', { name: /sign out/i }).click();

  await page.waitForURL('/');
}
