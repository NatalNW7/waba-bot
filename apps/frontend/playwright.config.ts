import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E test configuration for the frontend app
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use */
  reporter: [["html", { open: "never" }]],
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: "http://localhost:8080",
    /* Collect trace when retrying the failed test */
    trace: "on-first-retry",
    /* Screenshot on failure */
    screenshot: "only-on-failure",
  },
  /* Configure projects for major browsers */
  projects: [
    // Setup: authenticate MP buyer
    // When auth file exists, this returns immediately.
    // To renew expired cookies run:
    //   FORCE_MP_AUTH=true pnpm exec playwright test --project=mp-auth --headed
    {
      name: "mp-auth",
      testMatch: "e2e/mp-auth.setup.ts",
    },
    // Main tests: reuse MP buyer session
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/mp-buyer.json",
      },
      dependencies: ["mp-auth"],
    },
    /* Uncomment to test on Firefox and Safari */
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },
    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },
  ],
  /* Run your local dev server before starting the tests */
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:8080",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
