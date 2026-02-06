import { expect, test } from '@playwright/test';

import { signInTestUser } from './test-helpers';

/**
 * Prediction flow tests.
 *
 * These tests verify the core prediction functionality.
 * Requires the 'upcoming_race' test scenario to be seeded.
 */
test.describe('Predictions', () => {
  test.describe('Unauthenticated user', () => {
    test('can view races list', async ({ page }) => {
      await page.goto('/races');

      // Should see race list with upcoming races section
      await expect(page.getByText('Upcoming Races')).toBeVisible();
    });

    test('sees sign-in prompt on race detail page', async ({ page }) => {
      // Navigate to races and click the first one
      await page.goto('/races');

      // Click on a race card to go to detail
      await page
        .getByRole('link', { name: /Grand Prix/i })
        .first()
        .click();

      // Should see sign-in prompt
      await expect(
        page.getByText('Sign in to make your prediction'),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    });
  });

  test.describe('Authenticated user', () => {
    test.beforeEach(async ({ page }) => {
      await signInTestUser(page, 'regular');
    });

    test('can view driver selection grid', async ({ page }) => {
      await page.goto('/races');

      // Click on an upcoming race that's open for predictions
      // Look for "Predict Now" badge which indicates predictions are open
      const predictableRace = page
        .getByRole('link', { name: /Predict Now/i })
        .first();

      if (await predictableRace.isVisible()) {
        await predictableRace.click();

        // Should see driver selection grid
        await expect(page.getByTestId('driver-selection')).toBeVisible();

        // Should see some F1 drivers
        await expect(page.getByTestId('driver-VER')).toBeVisible();
        await expect(page.getByTestId('driver-NOR')).toBeVisible();
      }
    });

    test('can select 5 drivers', async ({ page }) => {
      await page.goto('/races');

      // Find and click a predictable race
      const predictableRace = page
        .getByRole('link', { name: /Predict Now/i })
        .first();

      if (await predictableRace.isVisible()) {
        await predictableRace.click();

        // Wait for driver selection to load
        await expect(page.getByTestId('driver-selection')).toBeVisible();

        // Select 5 drivers
        const drivers = ['VER', 'NOR', 'LEC', 'HAM', 'RUS'];

        for (const code of drivers) {
          await page.getByTestId(`driver-${code}`).click();
        }

        // Should show 5 picked drivers
        await expect(page.getByTestId('picked-driver-1')).toBeVisible();
        await expect(page.getByTestId('picked-driver-5')).toBeVisible();

        // Submit button should be enabled
        await expect(page.getByTestId('submit-prediction')).toBeEnabled();
      }
    });

    test('cannot select more than 5 drivers', async ({ page }) => {
      await page.goto('/races');

      const predictableRace = page
        .getByRole('link', { name: /Predict Now/i })
        .first();

      if (await predictableRace.isVisible()) {
        await predictableRace.click();

        await expect(page.getByTestId('driver-selection')).toBeVisible();

        // Select 5 drivers
        const drivers = ['VER', 'NOR', 'LEC', 'HAM', 'RUS'];
        for (const code of drivers) {
          await page.getByTestId(`driver-${code}`).click();
        }

        // Try to click another driver - should be disabled
        const sixthDriver = page.getByTestId('driver-PIA');
        await expect(sixthDriver).toBeDisabled();
      }
    });

    test('can remove a selected driver', async ({ page }) => {
      await page.goto('/races');

      const predictableRace = page
        .getByRole('link', { name: /Predict Now/i })
        .first();

      if (await predictableRace.isVisible()) {
        await predictableRace.click();

        await expect(page.getByTestId('driver-selection')).toBeVisible();

        // Select 3 drivers
        await page.getByTestId('driver-VER').click();
        await page.getByTestId('driver-NOR').click();
        await page.getByTestId('driver-LEC').click();

        // Should have 3 picked
        await expect(page.getByTestId('picked-driver-3')).toBeVisible();

        // Remove the second one
        await page.getByTestId('remove-pick-2').click();

        // Should now have 2 picked, and NOR should be back in selection
        await expect(page.getByTestId('picked-driver-2')).toBeVisible();
        await expect(page.getByTestId('picked-driver-3')).not.toBeVisible();
        await expect(page.getByTestId('driver-NOR')).toBeVisible();
      }
    });

    test('can submit prediction successfully', async ({ page }) => {
      await page.goto('/races');

      const predictableRace = page
        .getByRole('link', { name: /Predict Now/i })
        .first();

      if (await predictableRace.isVisible()) {
        await predictableRace.click();

        await expect(page.getByTestId('driver-selection')).toBeVisible();

        // Select 5 drivers
        const drivers = ['VER', 'NOR', 'LEC', 'HAM', 'RUS'];
        for (const code of drivers) {
          await page.getByTestId(`driver-${code}`).click();
        }

        // Submit
        await page.getByTestId('submit-prediction').click();

        // Should see success state - button changes to "Saved"
        await expect(page.getByTestId('submit-prediction')).toContainText(
          'Saved',
        );
      }
    });

    test('can update existing prediction', async ({ page }) => {
      await page.goto('/races');

      const predictableRace = page
        .getByRole('link', { name: /Predict Now/i })
        .first();

      if (await predictableRace.isVisible()) {
        await predictableRace.click();

        await expect(page.getByTestId('driver-selection')).toBeVisible();

        // First submission
        const drivers1 = ['VER', 'NOR', 'LEC', 'HAM', 'RUS'];
        for (const code of drivers1) {
          await page.getByTestId(`driver-${code}`).click();
        }
        await page.getByTestId('submit-prediction').click();
        await expect(page.getByTestId('submit-prediction')).toContainText(
          'Saved',
        );

        // Remove one and add another
        await page.getByTestId('remove-pick-5').click();
        await page.getByTestId('driver-PIA').click();

        // Submit should now say "Update Prediction"
        await expect(page.getByTestId('submit-prediction')).toContainText(
          'Update Prediction',
        );

        // Submit the update
        await page.getByTestId('submit-prediction').click();

        // Should be saved
        await expect(page.getByTestId('submit-prediction')).toContainText(
          'Saved',
        );
      }
    });
  });
});

test.describe('My Predictions page', () => {
  test('shows sign-in required when not authenticated', async ({ page }) => {
    await page.goto('/my-predictions');

    await expect(page.getByText('Sign In Required')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('shows prediction history when authenticated', async ({ page }) => {
    await signInTestUser(page, 'regular');
    await page.goto('/my-predictions');

    // Should show the my predictions page header
    await expect(
      page.getByRole('heading', { name: 'My Predictions' }),
    ).toBeVisible();

    // Will show either predictions or empty state
    const hasPredictions = await page.getByText('Total Points').isVisible();
    const hasEmptyState = await page
      .getByText('No predictions yet')
      .isVisible();

    expect(hasPredictions || hasEmptyState).toBeTruthy();
  });
});
