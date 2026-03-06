import { test, expect } from '@playwright/test';

test('verify blog upload visibility via search', async ({ page }) => {
  await page.goto('http://localhost:5173/blogs');

  // Wait for the Insights header
  const insightsTitle = page.getByText("The Insights", { exact: false });
  await expect(insightsTitle).toBeVisible({ timeout: 20000 });

  // Find the search input
  const searchInput = page.getByPlaceholder("Search articles...");
  await expect(searchInput).toBeVisible();

  // Search for the first blog
  await searchInput.fill("Biometric Frontier");
  await expect(page.locator('h3:has-text("The Biometric Frontier: Why Executive Performance Starts with Sleep")').first()).toBeVisible({ timeout: 15000 });

  // Search for the second blog
  await searchInput.fill("3D Motion Tracking");
  await expect(page.locator('h3:has-text("3D Motion Tracking: The Science of Injury Prevention")').first()).toBeVisible({ timeout: 15000 });

  // Search for the third blog
  await searchInput.fill("Wearable Wisdom");
  await expect(page.locator('h3:has-text("Wearable Wisdom: How AI is Redefining Daily Health")').first()).toBeVisible({ timeout: 15000 });
});
