import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('vertical view renders correctly', async ({ page }) => {
    await page.goto('/');

    // Wait for content to load
    await expect(page.locator('[class*="content"]').first()).toBeVisible({ timeout: 5000 });

    // Take screenshot of vertical view
    await expect(page).toHaveScreenshot('vertical-view.png', {
      maxDiffPixels: 100,
      fullPage: false,
    });
  });

  test('horizontal view renders correctly', async ({ page }) => {
    await page.goto('/');

    // Wait for app to load
    await expect(page.getByText('Loading TimeWorm...')).not.toBeVisible({ timeout: 5000 });

    // Switch to horizontal (Track View)
    await page.getByRole('button', { name: 'Track View' }).click();

    // Wait for horizontal view
    await expect(page.getByText(/zoom level/i)).toBeVisible({ timeout: 3000 });

    // Take screenshot
    await expect(page).toHaveScreenshot('horizontal-view.png', {
      maxDiffPixels: 100,
      fullPage: false,
    });
  });

  test('detail overlay renders correctly', async ({ page }) => {
    await page.goto('/');

    // Wait for content
    await expect(page.locator('[class*="content"]').first()).toBeVisible({ timeout: 5000 });

    // Click first event
    await page.locator('[class*="content"]').first().click();

    // Wait for overlay to open
    const overlay = page.locator('[class*="overlay"][class*="open"], [class*="Overlay"][class*="open"]');
    await expect(overlay).toBeVisible({ timeout: 3000 });

    // Take screenshot
    await expect(page).toHaveScreenshot('detail-overlay.png', {
      maxDiffPixels: 100,
      fullPage: false,
    });
  });
});
