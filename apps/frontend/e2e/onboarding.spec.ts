import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'test.qa1@waba-bot.com',
  password: 'admin123',
};

const MP_BUYER = {
  login: 'TESTUSER7242226783732122866',
  password: 'aHDkuiirB7',
  verificationCode: '137062',
  email: 'test_user_7242226783732122866@testuser.com',
};

const TEST_CARD = {
  number: '4235647728025682',
  expiry: '11/30',
  cvv: '123',
  holderName: 'APRO',
  cpf: '12345678909',
};

test.describe('Onboarding and Mercado Pago Checkout', () => {
  let tenantId: string | null = null;
  let authToken: string | null = null;

  test.beforeAll(async () => {
    // Setup pombohook for webhooks automatically
    const { execSync } = require('child_process');
    try {
      console.log('Setting up pombohook...');
      execSync('pombo ping --server=wss://pombohook-server.fly.dev --token="pombo_token-server"', { stdio: 'inherit' });
      execSync('pombo route --path=/webhooks/mercadopago --port=8081', { stdio: 'inherit' });
      
      // We run pombo go in the background. It will stay running.
      const { spawn } = require('child_process');
      const pomboProcess = spawn('pombo', ['go', '--background'], {
        detached: true,
        stdio: 'ignore'
      });
      pomboProcess.unref();
      console.log('Pombohook setup complete.');
    } catch (e) {
      console.warn('Failed to setup pombohook. Webhooks might not work.', e);
    }
  });

  test.beforeEach(async ({ page, request }) => {
    // 1. Authenticate via backend API to get JWT token
    const loginRes = await request.post('http://localhost:8081/auth/login', {
      data: {
        email: TEST_USER.email,
        password: TEST_USER.password,
      },
    });

    expect(loginRes.ok()).toBeTruthy();
    const data = await loginRes.json();
    authToken = data.accessToken;

    // 2. Set token in localStorage to mock login
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('auth_token', token);
    }, authToken);
  });

  test.afterEach(async ({ request }) => {
    // Cleanup tenant if it was created
    if (tenantId && authToken) {
      await request.delete(`http://localhost:8081/tenants/${tenantId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }
  });

  test('Scenario 1: Handles APPROVED payment via Checkout Pro', async ({ page }) => {
    // Navigate to onboarding
    await page.goto('/onboarding');

    // Wait for the onboarding form to appear
    await expect(page.locator('h1').filter({ hasText: /Conte-nos sobre seu negócio|Onboarding/i }).first()).toBeVisible({ timeout: 10000 });

    // Step 1: Fill Business Details
    await page.getByPlaceholder(/Barbearia/i).first().fill('QA Test Barbershop');
    await page.getByPlaceholder(/99999-9999/i).first().fill('999999999');
    
    // Navigate to next step
    const continuarBtn = page.getByRole('button', { name: /Continuar/i });
    if (await continuarBtn.isVisible()) {
      await continuarBtn.click();
    }

    // Step 2: Select Plan (Pro)
    const proPlan = page.locator('text=Pro').first();
    if (await proPlan.isVisible()) {
      await proPlan.click();
    }
    
    // Step 3: Payment Step (Redirect)
    // Wait for the summary page
    await expect(page.locator('h1').filter({ hasText: /Resumo da Assinatura/i })).toBeVisible({ timeout: 15000 });

    // Listen for requests to capture tenant ID
    page.on('response', async (response) => {
      if (response.url().includes('/tenants/onboard') && response.status() === 201) {
        const data = await response.json();
        tenantId = data.tenant?.id;
      }
    });

    // Click "Assinar com Mercado Pago"
    await page.getByRole('button', { name: /Assinar com Mercado Pago/i }).click();

    // The frontend should now redirect to MercadoPago's init_point.
    // Wait for the URL to change to mercadopago.com
    await page.waitForURL(/mercadopago/, { timeout: 30000 });

    // Step 4: Automate Mercado Pago Checkout
    // Warning: These selectors are subject to change by Mercado Pago.
    // We try to use resilient selectors where possible.

    // 1. Enter Email / Login
    const emailInput = page.locator('input[type="email"], input[name="user_id"], #user_id');
    await emailInput.waitFor({ state: 'visible', timeout: 30000 });
    await emailInput.fill(MP_BUYER.login);
    await page.keyboard.press('Enter');

    // 2. Enter Password
    const passwordInput = page.locator('input[type="password"], input[name="password"], #password');
    await passwordInput.waitFor({ state: 'visible', timeout: 30000 });
    await passwordInput.fill(MP_BUYER.password);
    await page.keyboard.press('Enter');

    // 3. Handle optional verification code if it appears
    const verificationInput = page.locator('input[name="code"], input[placeholder*="código"]');
    try {
      await verificationInput.waitFor({ state: 'visible', timeout: 5000 });
      await verificationInput.fill(MP_BUYER.verificationCode);
      await page.keyboard.press('Enter');
    } catch (e) {
      // Verification not requested, continue
    }

    // 4. Fill Credit Card Details
    // We assume it lands on a card entry form or we click "New Card"
    const newCardBtn = page.locator('text=Novo cartão').first();
    if (await newCardBtn.isVisible()) {
        await newCardBtn.click();
    }

    // Enter card number
    const cardNumberInput = page.locator('input[name="cardNumber"], input[placeholder*="Número do cartão"], #cardNumber');
    await cardNumberInput.waitFor({ state: 'visible', timeout: 30000 });
    await cardNumberInput.pressSequentially(TEST_CARD.number, { delay: 50 });

    // Enter Name
    const nameInput = page.locator('input[name="name"], input[placeholder*="Nome"], #name');
    await nameInput.fill(TEST_CARD.holderName); // APRO = Approved

    // Enter Expiry
    const expiryInput = page.locator('input[name="expirationDate"], input[placeholder*="Vencimento"], #expirationDate');
    await expiryInput.fill(TEST_CARD.expiry);

    // Enter CVV
    const cvvInput = page.locator('input[name="securityCode"], input[placeholder*="CVV"], #securityCode');
    await cvvInput.fill(TEST_CARD.cvv);

    // Enter CPF
    const cpfInput = page.locator('input[name="docNumber"], input[placeholder*="CPF"], #docNumber');
    await cpfInput.fill(TEST_CARD.cpf);

    // Click continue / Pay
    const payBtn = page.locator('button[type="submit"]', { hasText: /Continuar|Pagar/i }).first();
    await payBtn.click();

    // Confirm Payment if there's an extra confirmation screen
    const confirmBtn = page.locator('button[type="submit"]', { hasText: /Confirmar|Pagar/i }).first();
    if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
    }

    // Wait for the redirect back to localhost
    await page.waitForURL(/localhost:8080\/dashboard/, { timeout: 60000 });

    // Verify we are on the dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
