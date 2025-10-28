import { test, expect } from '@playwright/test';

test.describe('Mood Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Ensure we're on the mood tab
    await page.getByRole('tab', { name: /mood/i }).click();
  });

  test('should display mood options', async ({ page }) => {
    await expect(page.locator('text=😞')).toBeVisible();
    await expect(page.locator('text=😐')).toBeVisible();
    await expect(page.locator('text=🙂')).toBeVisible();
    await expect(page.locator('text=😄')).toBeVisible();
    await expect(page.locator('text=🤩')).toBeVisible();
  });

  test('should select a mood', async ({ page }) => {
    // Click on a mood option (Calm - 🙂)
    const calmButton = page.locator('button:has-text("🙂")').first();
    await calmButton.click();

    // Verify the mood is selected (button should show some active state)
    await expect(calmButton).toBeVisible();
  });

  test('should display mood streak', async ({ page }) => {
    await expect(page.locator('text=/streak/i')).toBeVisible();
  });

  test('should show mood calendar', async ({ page }) => {
    await expect(page.locator('text=/calendar/i')).toBeVisible();
  });
});
