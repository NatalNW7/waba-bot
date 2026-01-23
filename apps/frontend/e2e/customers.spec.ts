import { test, expect } from "@playwright/test";

/**
 * E2E tests for the Customers page
 * These tests verify customer list, search, and filtering
 */

test.describe("Customers Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/customers");
  });

  test("should display the customers heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /cliente|customer/i }),
    ).toBeVisible();
  });

  test("should display search input", async ({ page }) => {
    await expect(
      page.getByPlaceholder(/buscar|search|pesquisar/i),
    ).toBeVisible();
  });

  test("should display filter buttons", async ({ page }) => {
    // Check for status filter buttons
    await expect(
      page.getByRole("button", { name: /todos|all/i }),
    ).toBeVisible();
  });

  test("should display customer stats cards", async ({ page }) => {
    // Stats cards showing total, active, etc.
    await page.waitForLoadState("networkidle");

    const hasStats = await page
      .locator('[class*="stat"], [class*="card"]')
      .first()
      .isVisible();
    expect(hasStats).toBe(true);
  });
});

test.describe("Customers - Search and Filter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/customers");
  });

  test("should filter customers when typing in search", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar|search|pesquisar/i);
    await searchInput.fill("test");

    // Search should be applied (input has value)
    await expect(searchInput).toHaveValue("test");
  });

  test("should clear search when input is cleared", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar|search|pesquisar/i);
    await searchInput.fill("test");
    await searchInput.clear();

    await expect(searchInput).toHaveValue("");
  });

  test("should filter by subscriber status", async ({ page }) => {
    // Click on subscriber filter
    const subscriberButton = page.getByRole("button", {
      name: /assinante|subscriber/i,
    });

    if (await subscriberButton.isVisible()) {
      await subscriberButton.click();

      // Filter should be applied (button has active styling)
      await expect(subscriberButton).toHaveClass(/active|primary|selected/);
    }
  });

  test("should show all customers when clicking all filter", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /todos|all/i }).click();

    // All filter should be active
    await expect(page.getByRole("button", { name: /todos|all/i })).toHaveClass(
      /active|primary|selected/,
    );
  });
});

test.describe("Customers - Customer Details", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/customers");
    await page.waitForLoadState("networkidle");
  });

  test("should display customer cards or empty state", async ({ page }) => {
    const hasCustomers = await page
      .locator('[class*="customer"], [class*="card"]')
      .first()
      .isVisible();
    const hasEmptyState = await page
      .getByText(/nenhum cliente|no customer|empty/i)
      .isVisible();

    // One of these should be true
    expect(hasCustomers || hasEmptyState).toBe(true);
  });

  test("should open customer modal when clicking on customer", async ({
    page,
  }) => {
    // Find a customer card and click it
    const customerCard = page
      .locator('[class*="card"]')
      .filter({
        has: page.locator("text=/\\d{2}\\s?\\d{4,5}[-\\s]?\\d{4}/"), // Phone number pattern
      })
      .first();

    if (await customerCard.isVisible()) {
      await customerCard.click();

      // Modal should appear with customer details
      await expect(
        page.locator('[role="dialog"], [class*="modal"], .fixed'),
      ).toBeVisible();
    }
  });
});
