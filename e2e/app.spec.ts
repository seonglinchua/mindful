import { test, expect } from '@playwright/test';

test.describe('Mindful App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Mindful/);
  });

  test('should display main navigation tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /mood/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /breathe/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /journal/i })).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    // Click on Breathe tab
    await page.getByRole('tab', { name: /breathe/i }).click();
    await expect(page.locator('text=breathing')).toBeVisible();

    // Click on Journal tab
    await page.getByRole('tab', { name: /journal/i }).click();
    await expect(page.locator('text=journal')).toBeVisible();
  });

  test('should have theme toggle', async ({ page }) => {
    const themeToggle = page.locator('[role="switch"]');
    await expect(themeToggle).toBeVisible();
  });
});
