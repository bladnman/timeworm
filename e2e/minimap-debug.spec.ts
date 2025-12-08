import { test } from '@playwright/test';

test('horizontal view minimap screenshot', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(2000);

  // Click on "Sport or Spectacle?" timeline (the one you were testing)
  await page.getByText('Sport or Spectacle?').click();
  await page.waitForTimeout(3000);

  // Use arrow keys to scroll right to the 1910-1930 area
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(500);

  // Take screenshot
  await page.screenshot({ path: 'test-results/sport-timeline.png', fullPage: true });

  console.log('Screenshot saved');
});
