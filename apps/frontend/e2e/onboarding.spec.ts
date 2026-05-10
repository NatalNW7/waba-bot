import { test, expect } from '@playwright/test';

// Utilizando um usuário de teste que foi inserido manualmente e verificado no banco
const TEST_USER = {
  email: 'test.qa1@waba-bot.com',
  password: 'admin123',
};

test.describe('Onboarding and Mercado Pago Checkout', () => {
  test.beforeEach(async ({ page, request }) => {
    // 1. Authenticate via backend API to get JWT token
    const loginRes = await request.post('http://localhost:8081/auth/login', {
      data: {
        email: TEST_USER.email,
        password: TEST_USER.password,
      },
    });

    expect(loginRes.ok()).toBeTruthy();
    const { accessToken } = await loginRes.json();

    // 2. Set token in localStorage to mock login
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('auth_token', token);
    }, accessToken);
  });

  test('Scenario 1: Handles REJECTED payment then APPROVED payment', async ({ page }) => {
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
    
    // Step 3: Payment Step (Mercado Pago Brick)
    // Wait for the payment form to be visible
    await expect(page.locator('h1').filter({ hasText: /Pagamento da Assinatura/i })).toBeVisible({ timeout: 15000 });

    // Wait for any MP iframe to load first
    await expect(page.locator('iframe').first()).toBeVisible({ timeout: 15000 });

    // Mercado Pago Brick uses multiple iframes.
    // Based on DOM snapshot, indices are 0 (number), 2 (expiry), 4 (cvv)
    const fillMPField = async (idx: number, placeholder: string | RegExp, value: string) => {
        const frame = page.frameLocator('iframe').nth(idx);
        await frame.getByPlaceholder(placeholder).fill(value);
    };

    // --- REJECTED PAYMENT PATH (OTHE) ---
    // Preencher os dados do cartão (REJECTED)
    // Use pressSequentially to trigger listeners/masks
    const cardNumberInput = page.frameLocator('iframe').nth(0).getByPlaceholder(/1234/i);
    await cardNumberInput.click();
    await cardNumberInput.pressSequentially('4235647728025682', { delay: 50 });
    
    const expiryInput = page.frameLocator('iframe').nth(2).getByPlaceholder(/mm\/aa/i);
    await expiryInput.pressSequentially('11/30', { delay: 50 });
    
    const cvvInput = page.frameLocator('iframe').nth(4).getByPlaceholder(/123/i);
    await cvvInput.pressSequentially('123', { delay: 50 });

    // Name and Document are regular inputs
    const nameInput = page.getByPlaceholder(/Maria Santos Pereira/i);
    await nameInput.fill('OTHE');
    
    const docInput = page.getByPlaceholder(/999.999.999-99/i);
    await docInput.pressSequentially('12345678909', { delay: 50 });

    // Click Pay with force
    await page.getByRole('button', { name: /^Pagar$/i }).click({ force: true });

    // Expect to see the custom error message we added in the backend
    const errorToast = page.locator('text=Falha ao processar pagamento junto ao Mercado Pago');
    await expect(errorToast).toBeVisible({ timeout: 15000 });
    
    // Ensure we are STILL on the onboarding page
    expect(page.url()).toContain('/onboarding');


    // --- APPROVED PAYMENT PATH (APRO) ---
    // Fill the APPROVED card
    // We may need to clear the inputs first
    const cardNumberApprovedInput = page.frameLocator('iframe').nth(0).getByPlaceholder(/1234/i);
    await cardNumberApprovedInput.click();
    await cardNumberApprovedInput.clear();
    await cardNumberApprovedInput.pressSequentially('5031433215406351', { delay: 50 });
    
    await page.getByPlaceholder(/Maria Santos Pereira/i).fill('APRO');

    // Click Pay again
    await page.getByRole('button', { name: /^Pagar$/i }).click({ force: true });

    // Expect to be redirected to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 });
    
    // Verify the subscription is active on the dashboard or settings if needed
    // The redirect alone is sufficient proof that the onboarding completed.
  });
});
