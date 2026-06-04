import { test as setup } from '@playwright/test';
import { existsSync } from 'fs';

// Direct login URL used by Mercado Pago's checkout flow
const MP_LOGIN_URL =
  'https://www.mercadolivre.com/jms/mlb/lgz/login?platform_id=MP&go=https%3A%2F%2Fwww.mercadopago.com.br%2F&loginType=explicit';

const MP_AUTH_FILE = 'playwright/.auth/mp-buyer.json';

const MP_BUYER = {
  login: 'TESTUSER7242226783732122866',
  password: 'aHDkuiirB7',
};

/** Dismiss any cookie consent banner if present */
async function dismissCookieBanner(page: import('@playwright/test').Page) {
  try {
    const acceptBtn = page.getByRole('button', { name: /Aceitar cookies/i });
    await acceptBtn.waitFor({ state: 'visible', timeout: 4000 });
    await acceptBtn.click();
    console.log('[MP Auth] Cookie banner dismissed.');
  } catch {
    // No banner, continue
  }
}

setup('authenticate MP buyer', async ({ page }) => {
  const forceReAuth = process.env['FORCE_MP_AUTH'] === 'true';

  // If auth file exists and we are not forcing re-auth, trust it and skip login.
  // Re-run with FORCE_MP_AUTH=true to renew:
  //   FORCE_MP_AUTH=true pnpm exec playwright test --project=mp-auth --headed
  if (existsSync(MP_AUTH_FILE) && !forceReAuth) {
    console.log('[MP Auth] ✅ Auth file found. Reusing existing session.');
    return;
  }

  if (forceReAuth) {
    console.log('[MP Auth] FORCE_MP_AUTH=true — forcing re-authentication...');
  }

  // Navigate directly to the MP/ML login page
  console.log('[MP Auth] Navigating to Mercado Pago login page...');
  await page.goto(MP_LOGIN_URL);
  await dismissCookieBanner(page);

  // Fill login (email / username)
  const emailInput = page
    .locator('input[name="user_id"], input[type="email"], input[type="text"]')
    .first();

  await emailInput.waitFor({ state: 'visible', timeout: 20000 });
  await emailInput.fill(MP_BUYER.login);

  const continueBtn = page.getByRole('button', { name: /Continuar/i });
  if (await continueBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await continueBtn.click();
  } else {
    await page.keyboard.press('Enter');
  }

  // Handle "Escolha um método de verificação" screen (choose Senha)
  const senhaMethodBtn = page.getByRole('button', { name: /Senha/i }).first();
  try {
    await senhaMethodBtn.waitFor({ state: 'visible', timeout: 6000 });
    await senhaMethodBtn.click({ force: true, delay: 100 });
  } catch {
    // No verification method screen, direct password prompt
  }

  // Enter password
  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.waitFor({ state: 'visible', timeout: 30000 });
  await passwordInput.fill(MP_BUYER.password);
  await page.keyboard.press('Enter');

  // Wait for successful redirect to MP homepage (logged in)
  await page.waitForURL(/mercadopago\.com\.br/, { timeout: 30000 });
  // Extra wait for all session cookies to be set
  await page.waitForTimeout(3000);

  // Save the authenticated state
  await page.context().storageState({ path: MP_AUTH_FILE });
  console.log(`[MP Auth] ✅ Session saved to ${MP_AUTH_FILE}`);
});

