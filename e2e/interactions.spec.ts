import { test, expect } from '@playwright/test';

test.describe('User Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to fully load
    await expect(page.getByText('Loading TimeWorm...')).not.toBeVisible({ timeout: 5000 });
  });

  test('clicking an event opens the detail overlay', async ({ page }) => {
    // Click on the first event card in vertical view
    const firstEvent = page.locator('[class*="content"]').first();
    await firstEvent.click();

    // Detail overlay should appear with open class
    const overlay = page.locator('[class*="overlay"][class*="open"], [class*="Overlay"][class*="open"]');
    await expect(overlay).toBeVisible({ timeout: 3000 });
  });

  test('clicking close button closes the detail overlay', async ({ page }) => {
    // Open an event
    const firstEvent = page.locator('[class*="content"]').first();
    await firstEvent.click();

    // Wait for overlay to open
    const overlay = page.locator('[class*="overlay"][class*="open"], [class*="Overlay"][class*="open"]');
    await expect(overlay).toBeVisible({ timeout: 3000 });

    // Click close button
    const closeButton = page.getByRole('button', { name: 'Close' });
    await closeButton.click();

    // Overlay should no longer have 'open' class
    await expect(overlay).not.toBeVisible({ timeout: 3000 });
  });

  test('horizontal view zoom slider changes the view', async ({ page }) => {
    // Switch to horizontal view
    await page.getByRole('button', { name: 'Track View' }).click();

    // Wait for horizontal view to load
    await expect(page.getByText(/zoom level/i)).toBeVisible({ timeout: 3000 });

    // Get the zoom label text before changing
    const zoomLabel = page.getByText(/zoom level/i);
    const initialText = await zoomLabel.textContent();

    // Zoom in by changing the slider to max value
    const slider = page.locator('input[type="range"]');
    await slider.fill('500');

    // Wait for rerender
    await page.waitForTimeout(100);

    // Zoom label should now show different value
    const newText = await zoomLabel.textContent();
    expect(newText).not.toBe(initialText);
    expect(newText).toContain('500');
  });
});
