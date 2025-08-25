import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    // Navigate to the base URL to ensure we are on the correct origin
    await page.goto(baseURL || '/');
    // Clear localStorage in the context of the application's origin
    await page.evaluate(() => localStorage.clear());
    // Now navigate to the settings page for the test
    await page.goto('/settings');
  });

  test('should load with default settings and allow theme switching', async ({ page }) => {
    // 1. Wait for theme attribute to be set, then verify default theme (light)
    await page.waitForFunction(() => {
      return document.documentElement.hasAttribute('data-theme');
    }, { timeout: 10000 });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // 2. Click the theme switch
    await page.locator('#theme-switch').click();

    // 3. Assert that the theme attribute changes to dark
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // 4. Reload the page
    await page.reload();

    // 5. Assert that the dark theme persists after reload
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('should load with default settings and allow density switching', async ({ page }) => {
    // 1. Wait for density attribute to be set, then verify default density (comfortable)
    await page.waitForFunction(() => {
      return document.documentElement.hasAttribute('data-density');
    }, { timeout: 10000 });
    await expect(page.locator('html')).toHaveAttribute('data-density', 'comfortable');

    // 2. Click the density switch
    await page.locator('#density-switch').click();

    // 3. Assert that the density attribute changes to compact
    await expect(page.locator('html')).toHaveAttribute('data-density', 'compact');

    // 4. Reload the page
    await page.reload();

    // 5. Assert that the compact density persists after reload
    await expect(page.locator('html')).toHaveAttribute('data-density', 'compact');
  });
});
