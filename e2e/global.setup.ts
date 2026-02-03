import { execSync } from 'node:child_process';

import { test as setup } from '@playwright/test';

/**
 * Global setup that runs before all tests.
 *
 * This seeds the test database with necessary data.
 * Uses Convex CLI to run internal mutations.
 */

setup('seed test data', async () => {
  await Promise.resolve(); // satisfy require-await (setup uses sync execSync)
  console.log('🌱 Seeding test database...');

  try {
    // First, ensure drivers are seeded (they're reference data)
    execSync('npx convex run seed:seedDrivers', {
      stdio: 'inherit',
      env: {
        ...process.env,
        // Use test deployment if configured
        CONVEX_DEPLOYMENT: process.env.CONVEX_TEST_DEPLOYMENT,
      },
    });

    // Clean up any existing test data
    execSync(`npx convex run testing:cleanupTestData '{"keepDrivers": true}'`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        CONVEX_DEPLOYMENT: process.env.CONVEX_TEST_DEPLOYMENT,
      },
    });

    // Seed the test scenario
    // You can change this to different scenarios based on what you're testing
    const scenario = process.env.TEST_SCENARIO || 'upcoming_race';
    execSync(
      `npx convex run testing:seedTestScenario '{"scenario": "${scenario}"}'`,
      {
        stdio: 'inherit',
        env: {
          ...process.env,
          CONVEX_DEPLOYMENT: process.env.CONVEX_TEST_DEPLOYMENT,
        },
      },
    );

    console.log('✅ Test database seeded successfully');
  } catch (error) {
    console.error('❌ Failed to seed test database:', error);
    throw error;
  }
});
