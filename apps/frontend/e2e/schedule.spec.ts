import { test, expect } from "@playwright/test";

/**
 * E2E tests for the Schedule page
 * These tests verify calendar navigation and view switching
 */

test.describe("Schedule Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/schedule");
  });

  test("should display the schedule heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /agenda|schedule/i }),
    ).toBeVisible();
  });

  test("should display view toggle buttons", async ({ page }) => {
    // Check for day/week/month view buttons
    await expect(page.getByRole("button", { name: /dia|day/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /semana|week/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /mês|month/i }),
    ).toBeVisible();
  });

  test("should switch to day view", async ({ page }) => {
    await page.getByRole("button", { name: /dia|day/i }).click();

    // Day view should be active (has active styling)
    await expect(page.getByRole("button", { name: /dia|day/i })).toHaveClass(
      /primary|active/,
    );
  });

  test("should switch to month view", async ({ page }) => {
    await page.getByRole("button", { name: /mês|month/i }).click();

    // Month view should be active
    await expect(page.getByRole("button", { name: /mês|month/i })).toHaveClass(
      /primary|active/,
    );
  });

  test("should display today button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /hoje|today/i }),
    ).toBeVisible();
  });

  test("should navigate to previous period", async ({ page }) => {
    // Click previous navigation button
    const prevButton = page
      .getByRole("button", { name: /anterior|previous/i })
      .or(page.locator('button:has(svg path[d*="M15 19l-7-7 7-7"])'));

    await expect(prevButton.first()).toBeVisible();
    await prevButton.first().click();

    // Page should still be on schedule
    await expect(page).toHaveURL(/schedule/);
  });

  test("should navigate to next period", async ({ page }) => {
    // Click next navigation button
    const nextButton = page
      .getByRole("button", { name: /próximo|next/i })
      .or(page.locator('button:has(svg path[d*="M9 5l7 7-7 7"])'));

    await expect(nextButton.first()).toBeVisible();
    await nextButton.first().click();

    // Page should still be on schedule
    await expect(page).toHaveURL(/schedule/);
  });

  test("should return to today when clicking today button", async ({
    page,
  }) => {
    // First navigate to a different period
    const prevButton = page
      .locator('[aria-label="Anterior"]')
      .or(page.locator('button:has(svg path[d*="M15"])').first());

    if (await prevButton.first().isVisible()) {
      await prevButton.first().click();
    }

    // Click today button
    await page.getByRole("button", { name: /hoje|today/i }).click();

    // Page should still be on schedule
    await expect(page).toHaveURL(/schedule/);
  });
});

test.describe("Schedule Appointments", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/schedule");
  });

  test("should display appointment cards when data is loaded", async ({
    page,
  }) => {
    // Wait for any loading to complete
    await page.waitForLoadState("networkidle");

    // Should show either appointments or empty state message
    const hasAppointments = await page
      .locator('[class*="appointment"], [class*="card"]')
      .first()
      .isVisible();
    const hasEmptyState = await page
      .getByText(/nenhum|no appointments|empty/i)
      .isVisible();

    // One of these should be true
    expect(hasAppointments || hasEmptyState).toBe(true);
  });
});
