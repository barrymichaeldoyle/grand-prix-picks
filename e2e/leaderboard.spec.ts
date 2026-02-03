import { expect, test } from '@playwright/test';

/**
 * Leaderboard tests.
 *
 * These tests verify the leaderboard functionality.
 * Works best with the 'finished_race' or 'full_season' scenario.
 */
test.describe('Leaderboard', () => {
  test('displays leaderboard page', async ({ page }) => {
    await page.goto('/leaderboard');

    // Should show leaderboard heading
    await expect(
      page.getByRole('heading', { name: 'Leaderboard' }),
    ).toBeVisible();

    // Should show season subtitle
    await expect(page.getByText('2026 Season Standings')).toBeVisible();
  });

  test('shows empty state or rankings', async ({ page }) => {
    await page.goto('/leaderboard');

    // Should show either empty state or leaderboard entries
    const hasEmptyState = await page
      .getByTestId('leaderboard-empty')
      .isVisible();
    const hasEntries =
      (await page.getByTestId('leaderboard-entry').count()) > 0;
    const hasPodium = await page.getByText('1st').isVisible();

    // One of these should be true
    expect(hasEmptyState || hasEntries || hasPodium).toBeTruthy();
  });

  test('empty state shows helpful message', async ({ page }) => {
    await page.goto('/leaderboard');

    const emptyState = page.getByTestId('leaderboard-empty');

    if (await emptyState.isVisible()) {
      await expect(page.getByText('No scores yet')).toBeVisible();
      await expect(
        page.getByText(
          'The leaderboard will populate once race results are published',
        ),
      ).toBeVisible();
    }
  });

  test('podium shows top 3 when enough entries exist', async ({ page }) => {
    await page.goto('/leaderboard');

    // If there are at least 3 entries, podium should be visible
    const firstPlace = page.getByText('1st');
    const secondPlace = page.getByText('2nd');
    const thirdPlace = page.getByText('3rd');

    if (await firstPlace.isVisible()) {
      await expect(secondPlace).toBeVisible();
      await expect(thirdPlace).toBeVisible();
    }
  });

  test('table rows show position, name, and points', async ({ page }) => {
    await page.goto('/leaderboard');

    const entries = page.getByTestId('leaderboard-entry');
    const count = await entries.count();

    if (count > 0) {
      const firstEntry = entries.first();

      // Each entry should have position, username, and points
      await expect(firstEntry.getByTestId('position')).toBeVisible();
      await expect(firstEntry.getByTestId('username')).toBeVisible();
      await expect(firstEntry.getByTestId('points')).toBeVisible();
    }
  });
});
