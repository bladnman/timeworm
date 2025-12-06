import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('app loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');

    // Wait for the app to load
    await expect(page.locator('body')).toBeVisible();

    // Should not show loading state after app loads
    await expect(page.getByText('Loading TimeWorm...')).not.toBeVisible({ timeout: 5000 });

    // No console errors
    expect(errors).toHaveLength(0);
  });

  test('shows content after loading', async ({ page }) => {
    await page.goto('/');

    // Wait for content to appear (at least one event card)
    await expect(page.locator('[class*="content"], [class*="card"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('can switch between views', async ({ page }) => {
    await page.goto('/');

    // Wait for app to load
    await expect(page.getByText('Loading TimeWorm...')).not.toBeVisible({ timeout: 5000 });

    // Find view switcher buttons (they use "List View" and "Track View")
    const listViewButton = page.getByRole('button', { name: 'List View' });
    const trackViewButton = page.getByRole('button', { name: 'Track View' });

    // Both buttons should exist
    await expect(listViewButton).toBeVisible();
    await expect(trackViewButton).toBeVisible();

    // Click Track View to switch to horizontal view
    await trackViewButton.click();

    // Should see horizontal view elements (zoom slider)
    await expect(page.getByText(/zoom level/i)).toBeVisible({ timeout: 3000 });

    // Switch back to List View
    await listViewButton.click();

    // Zoom slider should no longer be visible (list view doesn't have it)
    await expect(page.getByText(/zoom level/i)).not.toBeVisible({ timeout: 3000 });
  });
});
