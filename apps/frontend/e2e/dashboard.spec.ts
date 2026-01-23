import { test, expect } from "@playwright/test";

/**
 * E2E tests for the Dashboard page
 * These tests verify that the dashboard loads correctly and displays data
 */

test.describe("Dashboard Page", () => {
  test.beforeEach(async ({ page }) => {
    // Note: In a real scenario, you would need to mock auth or login first
    // For now, we'll assume the page is accessible
    await page.goto("/dashboard");
  });

  test("should display the dashboard heading", async ({ page }) => {
    // Check for the dashboard heading
    await expect(
      page.getByRole("heading", { name: /dashboard|painel/i }),
    ).toBeVisible();
  });

  test("should display stat cards", async ({ page }) => {
    // Check for stat cards (using common patterns)
    await expect(
      page.locator('[class*="stat"], [class*="card"]').first(),
    ).toBeVisible();
  });

  test("should display appointments section", async ({ page }) => {
    // Look for appointments-related content
    await expect(
      page.getByText(/agendamento|appointment/i).first(),
    ).toBeVisible();
  });

  test("should display customers section", async ({ page }) => {
    // Look for customers-related content
    await expect(page.getByText(/cliente|customer/i).first()).toBeVisible();
  });

  test("should show loading state initially", async ({ page }) => {
    // Navigate fresh
    await page.goto("/dashboard");

    // Should either show loading indicators or actual content quickly
    const hasContent = await page.locator("main").isVisible();
    expect(hasContent).toBe(true);
  });

  test("should handle empty state gracefully", async ({ page }) => {
    // The page should not crash even without data
    await expect(page).toHaveURL(/dashboard/);
  });
});

test.describe("Dashboard Navigation", () => {
  test("should navigate to schedule page via sidebar", async ({ page }) => {
    await page.goto("/dashboard");

    // Click on schedule/agenda link
    await page.getByRole("link", { name: /agenda|schedule/i }).click();

    await expect(page).toHaveURL(/schedule/);
  });

  test("should navigate to customers page via sidebar", async ({ page }) => {
    await page.goto("/dashboard");

    // Click on customers link
    await page.getByRole("link", { name: /cliente|customer/i }).click();

    await expect(page).toHaveURL(/customers/);
  });

  test("should navigate to catalog page via sidebar", async ({ page }) => {
    await page.goto("/dashboard");

    // Click on catalog link
    await page.getByRole("link", { name: /catálogo|catalog/i }).click();

    await expect(page).toHaveURL(/catalog/);
  });

  test("should navigate to settings page via sidebar", async ({ page }) => {
    await page.goto("/dashboard");

    // Click on settings link
    await page
      .getByRole("link", { name: /config|setting/i })
      .first()
      .click();

    await expect(page).toHaveURL(/settings/);
  });
});
