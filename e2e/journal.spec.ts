import { test, expect } from '@playwright/test';

test.describe('Journal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to Journal tab
    await page.getByRole('tab', { name: /journal/i }).click();
  });

  test('should display journal entry form', async ({ page }) => {
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('should create a journal entry', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    const testEntry = 'This is a test journal entry from E2E test';

    // Type in the journal entry
    await textarea.fill(testEntry);

    // Find and click save button
    const saveButton = page.locator('button:has-text(/save|add/i)').first();
    await saveButton.click();

    // Wait for the entry to be saved
    await page.waitForTimeout(500);

    // Verify the entry appears in the list
    await expect(page.locator(`text=${testEntry}`)).toBeVisible();
  });

  test('should display existing journal entries', async ({ page }) => {
    // The journal list should be visible
    await expect(page.locator('text=/journal|entries/i')).toBeVisible();
  });

  test('should filter journal entries by date range', async ({ page }) => {
    // Look for date range selector
    const dateRangeButton = page.locator('button:has-text(/date|filter|range/i)').first();
    if (await dateRangeButton.isVisible()) {
      await dateRangeButton.click();
      // Verify date picker or range selector appears
      await expect(page.locator('text=/week|month|year/i')).toBeVisible();
    }
  });
});
