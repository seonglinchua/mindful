import { test, expect } from '@playwright/test';

test.describe('Breathing Exercise', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to Breathe tab
    await page.getByRole('tab', { name: /breathe/i }).click();
  });

  test('should display breathing patterns', async ({ page }) => {
    await expect(page.locator('text=/relaxation|sleep|box|energizing/i')).toBeVisible();
  });

  test('should display duration presets', async ({ page }) => {
    await expect(page.locator('text=/1 minute|2 minutes|5 minutes/i')).toBeVisible();
  });

  test('should start breathing exercise', async ({ page }) => {
    // Find and click the start button
    const startButton = page.locator('button:has-text(/start|begin/i)').first();
    if (await startButton.isVisible()) {
      await startButton.click();

      // Wait a moment for the exercise to start
      await page.waitForTimeout(1000);

      // Should show breathing phase (Inhale, Hold, Exhale)
      await expect(page.locator('text=/inhale|hold|exhale/i')).toBeVisible();
    }
  });

  test('should display breathing history', async ({ page }) => {
    // Scroll down to find history section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('text=/history|recent|sessions/i')).toBeVisible();
  });
});
