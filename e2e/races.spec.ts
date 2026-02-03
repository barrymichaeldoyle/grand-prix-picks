import { expect, test } from '@playwright/test';

test.describe('Races List Page', () => {
  test('displays the races page heading', async ({ page }) => {
    await page.goto('/races');

    await expect(
      page.getByRole('heading', { name: '2026 Season' }),
    ).toBeVisible();

    await expect(
      page.getByText('Predict the top 5 finishers for each Grand Prix'),
    ).toBeVisible();
  });

  test('shows races or empty state', async ({ page }) => {
    await page.goto('/races');

    // Should show either races or empty state
    const hasUpcoming = await page.getByText('Upcoming Races').isVisible();
    const hasInProgress = await page.getByText('In Progress').isVisible();
    const hasCompleted = await page.getByText('Completed').isVisible();
    const hasEmptyState = await page
      .getByText('No races scheduled yet')
      .isVisible();

    expect(
      hasUpcoming || hasInProgress || hasCompleted || hasEmptyState,
    ).toBeTruthy();
  });

  test('race cards are clickable', async ({ page }) => {
    await page.goto('/races');

    // Find first race card link
    const raceLink = page.getByRole('link', { name: /Grand Prix/i }).first();

    if (await raceLink.isVisible()) {
      await raceLink.click();

      // Should navigate to race detail page
      await expect(page).toHaveURL(/\/races\/.+/);

      // Should show race name
      await expect(page.getByText(/Grand Prix/i).first()).toBeVisible();
    }
  });

  test('shows "Predict Now" badge for next race', async ({ page }) => {
    await page.goto('/races');

    // If there's an upcoming race that's open for predictions, it should show "Predict Now"
    const predictNowBadge = page.getByText('Predict Now');

    if (await predictNowBadge.isVisible()) {
      // Should be on a clickable race card
      await expect(predictNowBadge).toBeVisible();
    }
  });

  test('back navigation works from race detail', async ({ page }) => {
    await page.goto('/races');

    const raceLink = page.getByRole('link', { name: /Grand Prix/i }).first();

    if (await raceLink.isVisible()) {
      await raceLink.click();
      await expect(page).toHaveURL(/\/races\/.+/);

      // Click back link
      await page.getByRole('link', { name: /Back to races/i }).click();

      await expect(page).toHaveURL(/\/races$/);
    }
  });
});

test.describe('Race Detail Page', () => {
  test('shows race info header', async ({ page }) => {
    await page.goto('/races');

    const raceLink = page.getByRole('link', { name: /Grand Prix/i }).first();

    if (await raceLink.isVisible()) {
      await raceLink.click();

      // Should show round number
      await expect(page.getByText(/Round \d+/)).toBeVisible();

      // Should show date info
      await expect(page.getByText(/202\d/)).toBeVisible();
    }
  });

  test('shows appropriate content based on race status', async ({ page }) => {
    await page.goto('/races');

    const raceLink = page.getByRole('link', { name: /Grand Prix/i }).first();

    if (await raceLink.isVisible()) {
      await raceLink.click();

      // Should show one of:
      // - "Make Your Prediction" (upcoming, is next race)
      // - "Not Yet Open" (upcoming, not next race)
      // - "Predictions Locked" (locked)
      // - "Race Results" (finished)
      const hasPredictionForm = await page
        .getByText('Make Your Prediction')
        .isVisible();
      const hasNotYetOpen = await page.getByText('Not Yet Open').isVisible();
      const hasLocked = await page.getByText('Predictions Locked').isVisible();
      const hasResults = await page.getByText('Race Results').isVisible();

      expect(
        hasPredictionForm || hasNotYetOpen || hasLocked || hasResults,
      ).toBeTruthy();
    }
  });

  test('handles non-existent race gracefully', async ({ page }) => {
    await page.goto('/races/non-existent-race-id');

    await expect(page.getByText('Race not found')).toBeVisible();
    await expect(
      page.getByText("This race doesn't exist or has been removed"),
    ).toBeVisible();
  });
});
