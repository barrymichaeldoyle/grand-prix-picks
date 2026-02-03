import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
  test('displays the app title and hero section', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/Grand Prix Picks/i);

    // Check hero heading
    await expect(
      page.getByRole('heading', { name: 'Grand Prix Picks' }),
    ).toBeVisible();

    // Check tagline
    await expect(page.getByText(/Predict the top 5 finishers/i)).toBeVisible();
  });

  test('shows "View Races" call to action', async ({ page }) => {
    await page.goto('/');

    const viewRacesButton = page.getByRole('link', { name: /View Races/i });
    await expect(viewRacesButton).toBeVisible();

    // Click and verify navigation
    await viewRacesButton.click();
    await expect(page).toHaveURL(/\/races/);
  });

  test('displays "Next Race" section', async ({ page }) => {
    await page.goto('/');

    // Should show next race heading
    await expect(page.getByText('Next Race')).toBeVisible();

    // Should show either a race card or "No upcoming races" message
    const hasRaceCard = await page
      .getByText(/Grand Prix/i)
      .first()
      .isVisible();
    const hasNoRaces = await page
      .getByText('No upcoming races scheduled')
      .isVisible();

    expect(hasRaceCard || hasNoRaces).toBeTruthy();
  });

  test('displays "How It Works" section', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: 'How It Works' }),
    ).toBeVisible();

    // Check the three steps
    await expect(page.getByText('Pick Your Top 5')).toBeVisible();
    await expect(page.getByText('Earn Points')).toBeVisible();
    await expect(page.getByText('Climb the Leaderboard')).toBeVisible();
  });

  test('navigation links work', async ({ page }) => {
    await page.goto('/');

    // Check races link in nav
    await page.getByRole('link', { name: 'Races' }).click();
    await expect(page).toHaveURL(/\/races/);

    // Go back and check leaderboard
    await page.goto('/');
    await page.getByRole('link', { name: 'Leaderboard' }).click();
    await expect(page).toHaveURL(/\/leaderboard/);

    // Check my picks
    await page.goto('/');
    await page.getByRole('link', { name: 'My Picks' }).click();
    await expect(page).toHaveURL(/\/my-predictions/);
  });

  test('header shows app branding', async ({ page }) => {
    await page.goto('/');

    // Header should have the app name/logo link
    const homeLink = page
      .getByRole('link', { name: /Grand Prix Picks/i })
      .first();
    await expect(homeLink).toBeVisible();
  });

  test('theme toggle works', async ({ page }) => {
    await page.goto('/');

    // Find theme toggle button
    const themeToggle = page.getByRole('button', {
      name: /switch to (dark|light) mode/i,
    });
    await expect(themeToggle).toBeVisible();

    // Click to toggle
    await themeToggle.click();

    // Verify the html element has the theme class changed
    const htmlElement = page.locator('html');
    const hasDarkClass = await htmlElement.evaluate((el) =>
      el.classList.contains('dark'),
    );

    // Toggle back
    await themeToggle.click();
    const stillHasDarkClass = await htmlElement.evaluate((el) =>
      el.classList.contains('dark'),
    );

    // Theme should have toggled
    expect(hasDarkClass !== stillHasDarkClass).toBeTruthy();
  });
});
