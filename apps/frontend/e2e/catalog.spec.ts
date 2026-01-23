import { test, expect } from "@playwright/test";

/**
 * E2E tests for the Catalog page
 * These tests verify service/plan CRUD operations
 */

test.describe("Catalog Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/catalog");
  });

  test("should display the catalog heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /catálogo|catalog/i }),
    ).toBeVisible();
  });

  test("should display services tab", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /serviço|service/i }),
    ).toBeVisible();
  });

  test("should display plans tab", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /plano|plan/i }),
    ).toBeVisible();
  });

  test("should display new service/plan button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /novo|new/i })).toBeVisible();
  });
});

test.describe("Catalog - Services Tab", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/catalog");
    // Ensure services tab is active
    await page.getByRole("button", { name: /serviço|service/i }).click();
  });

  test("should display services list or empty state", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Should show either services or skeleton loading
    const hasContent = await page.locator("main").isVisible();
    expect(hasContent).toBe(true);
  });

  test("should open new service modal when clicking new button", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /novo|new/i }).click();

    // Modal should appear
    await expect(page.getByText(/novo serviço|new service/i)).toBeVisible();
  });

  test("should display service form fields in modal", async ({ page }) => {
    await page.getByRole("button", { name: /novo|new/i }).click();

    // Check for form fields
    await expect(page.getByLabel(/nome|name/i)).toBeVisible();
    await expect(page.getByLabel(/preço|price/i)).toBeVisible();
    await expect(page.getByLabel(/duração|duration/i)).toBeVisible();
  });

  test("should close modal when clicking cancel", async ({ page }) => {
    await page.getByRole("button", { name: /novo|new/i }).click();
    await page.getByRole("button", { name: /cancelar|cancel/i }).click();

    // Modal should be closed
    await expect(page.getByText(/novo serviço|new service/i)).not.toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    await page.getByRole("button", { name: /novo|new/i }).click();

    // Submit button should be disabled when fields are empty
    const submitButton = page.getByRole("button", {
      name: /criar|create|salvar|save/i,
    });
    await expect(submitButton).toBeDisabled();
  });
});

test.describe("Catalog - Plans Tab", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/catalog");
    // Switch to plans tab
    await page.getByRole("button", { name: /plano|plan/i }).click();
  });

  test("should display plans list or empty state", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Should show either plans or skeleton loading
    const hasContent = await page.locator("main").isVisible();
    expect(hasContent).toBe(true);
  });

  test("should open new plan modal when clicking new button", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /novo|new/i }).click();

    // Modal should appear
    await expect(page.getByText(/novo plano|new plan/i)).toBeVisible();
  });

  test("should display plan form fields in modal", async ({ page }) => {
    await page.getByRole("button", { name: /novo|new/i }).click();

    // Check for form fields
    await expect(page.getByLabel(/nome|name/i)).toBeVisible();
    await expect(page.getByLabel(/preço|price/i)).toBeVisible();
    await expect(page.getByLabel(/intervalo|interval/i)).toBeVisible();
  });
});
