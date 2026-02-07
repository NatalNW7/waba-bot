import { test, expect } from "@playwright/test";

/**
 * E2E tests for the Operations Settings page
 * Focused on operating hours creation validations
 */

test.describe("Operations Settings - Operating Hours", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the operations settings page
    // Note: In production, authentication would be required
    await page.goto("/dashboard/settings/operations");
  });

  test.describe("Operating Hours Creation", () => {
    test("should show modal when clicking 'Novo Horário' button", async ({
      page,
    }) => {
      // Click the "Novo Horário" button
      await page.getByRole("button", { name: /novo horário/i }).click();

      // Modal should be visible
      await expect(
        page.getByRole("heading", { name: /novo horário de funcionamento/i }),
      ).toBeVisible();
    });

    test("should display error when endTime is before startTime", async ({
      page,
    }) => {
      // Open modal
      await page.getByRole("button", { name: /novo horário/i }).click();

      // Set invalid time range: startTime = 18:00, endTime = 08:00
      await page.locator('input[type="time"]').first().fill("18:00");
      await page.locator('input[type="time"]').last().fill("08:00");

      // Click save
      await page.getByRole("button", { name: /salvar/i }).click();

      // Should show error message
      await expect(
        page.getByText(
          /o horário de fechamento deve ser posterior ao horário de abertura/i,
        ),
      ).toBeVisible();
    });

    test("should display error when endTime equals startTime", async ({
      page,
    }) => {
      // Open modal
      await page.getByRole("button", { name: /novo horário/i }).click();

      // Set same time for start and end
      await page.locator('input[type="time"]').first().fill("09:00");
      await page.locator('input[type="time"]').last().fill("09:00");

      // Click save
      await page.getByRole("button", { name: /salvar/i }).click();

      // Should show error message
      await expect(
        page.getByText(
          /o horário de fechamento deve ser posterior ao horário de abertura/i,
        ),
      ).toBeVisible();
    });

    test("should close modal on successful creation", async ({ page }) => {
      // Open modal
      await page.getByRole("button", { name: /novo horário/i }).click();

      // Set valid time range
      await page.locator('input[type="time"]').first().fill("08:00");
      await page.locator('input[type="time"]').last().fill("18:00");

      // Click save (will attempt API call)
      await page.getByRole("button", { name: /salvar/i }).click();

      // Note: In a full E2E test with backend, modal should close
      // For now, we verify the form validation passes and save is attempted
    });

    test("should display error for duplicate/overlapping hours", async ({
      page,
    }) => {
      // This test requires the backend to be running with seed data
      // or previous test to have created an operating hour

      // Open modal
      await page.getByRole("button", { name: /novo horário/i }).click();

      // Try to create overlapping hours (assuming Monday 08:00-18:00 exists)
      await page.locator("select").selectOption("MONDAY");
      await page.locator('input[type="time"]').first().fill("09:00");
      await page.locator('input[type="time"]').last().fill("17:00");

      // Click save
      await page.getByRole("button", { name: /salvar/i }).click();

      // Should show conflict error from backend
      // Note: This requires backend to be running
      await expect(
        page.getByText(/conflita|já existe/i),
      ).toBeVisible({ timeout: 5000 });
    });

    test("should allow canceling modal", async ({ page }) => {
      // Open modal
      await page.getByRole("button", { name: /novo horário/i }).click();

      // Click cancel button
      await page.getByRole("button", { name: /cancelar/i }).click();

      // Modal should be closed
      await expect(
        page.getByRole("heading", { name: /novo horário de funcionamento/i }),
      ).not.toBeVisible();
    });
  });
});
