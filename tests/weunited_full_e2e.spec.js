// @ts-check
import { test, expect } from '@playwright/test';

/**
 * @param {import('@playwright/test').Page} page
 */
async function clearLocalStorage(page) {
  const url = page.url();
  if (!url || url === 'about:blank') {
    await page.goto('/');
  }
  await page.evaluate(() => {
    localStorage.removeItem('profileDataFull');
    localStorage.removeItem('onboardingData');
    localStorage.removeItem('onboardingStep');
    localStorage.removeItem('authUser');
  });
}

const TEST_USER = {
  firstName: 'Alice',
  lastName:  'TestUser',
  email:     `alice.test.${Date.now()}@example.com`,
  phone:     '+1 555 000 1234',
  password:  'TestPass@123',
};

// ===========================================================================
// PUBLIC SITE - Landing and Branding
// ===========================================================================
test.describe('Public Site', () => {
  test('homepage loads and shows the correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/WeUnited/);
  });

  test('homepage visually displays the brand logo text', async ({ page }) => {
    await page.goto('/');
    const logoLink = page.locator('.logo').first();
    await expect(logoLink).toBeVisible();
  });
});

// ===========================================================================
// ADMIN PORTAL - Authentication and Dashboard
// ===========================================================================
test.describe('Admin Portal', () => {
  test('admin can log in and reach the dashboard', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByPlaceholder('admin@weunited.com').fill('admin@weunited.com');
    await page.getByPlaceholder('••••••••').fill('admin123');
    await page.getByRole('button', { name: 'Authorize Access' }).click();
    await expect(page).toHaveURL(/.*\/admin/);
    await expect(page.getByRole('heading', { name: 'WeUnited Admin' })).toBeVisible();
  });

  test('admin login fails with wrong password', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByPlaceholder('admin@weunited.com').fill('admin@weunited.com');
    await page.getByPlaceholder('••••••••').fill('wrongpassword');
    await page.getByRole('button', { name: 'Authorize Access' }).click();
    await expect(page).toHaveURL(/.*\/admin\/login/);
    await expect(page.getByText('Invalid administrator credentials.')).toBeVisible();
  });
});

// ===========================================================================
// USER JOURNEY - Registration and Onboarding
// ===========================================================================
test.describe('User Journey Flow', () => {
  
  test.describe('Registration', () => {
    test('registration page renders correctly', async ({ page }) => {
      await page.goto('/register');
      await expect(page.getByLabel('First Name')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    });

    test('error shown when required fields are empty', async ({ page }) => {
      await page.goto('/register');
      await page.evaluate(() => {
        document.querySelectorAll('form input, form textarea').forEach((el) => {
          el.removeAttribute('required');
        });
      });
      await page.getByRole('button', { name: /Continue & Verify/i }).click();
      await expect(page.getByText('Please fill in all required fields.')).toBeVisible();
    });

    test('wrong OTP shows error', async ({ page }) => {
      await clearLocalStorage(page);
      await page.goto('/register');
      await page.getByLabel('First Name').fill(TEST_USER.firstName);
      await page.getByLabel('Last Name').fill(TEST_USER.lastName);
      await page.getByLabel('Email Address').fill(TEST_USER.email);
      await page.getByLabel('Password').fill(TEST_USER.password);
      await page.getByRole('button', { name: /Continue & Verify/i }).click();
      await page.getByLabel('Enter 6-digit OTP').fill('000000');
      await page.getByRole('button', { name: /Verify & Create Account/i }).click();
      await expect(page.getByText('Incorrect OTP. Please try again.')).toBeVisible();
    });
  });

  test.describe('Onboarding Wizard', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.evaluate((user) => {
        const mockProfile = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          photos: [],
        };
        localStorage.setItem('profileDataFull', JSON.stringify(mockProfile));
        localStorage.setItem('authUser', JSON.stringify(mockProfile));
        localStorage.removeItem('onboardingData');
        localStorage.removeItem('onboardingStep');
      }, TEST_USER);
    });

    test('Step 1: Basic Details rendering', async ({ page }) => {
      await page.goto('/onboarding');
      await expect(page.getByText('Step 1 of 5')).toBeVisible();
      await expect(page.getByPlaceholder('e.g. John')).toHaveValue(TEST_USER.firstName);
    });

    test('Step 2: Professional Details dropdowns', async ({ page }) => {
      await page.evaluate(() => localStorage.setItem('onboardingStep', '2'));
      await page.goto('/onboarding');
      await page.locator('select[name="education"]').selectOption('Bachelors');
      await page.locator('select[name="profession"]').selectOption('Software/IT');
      await expect(page.locator('select[name="education"]')).toHaveValue('Bachelors');
    });

    test('Step 3: Partner Preferences age range', async ({ page }) => {
      await page.evaluate(() => localStorage.setItem('onboardingStep', '3'));
      await page.goto('/onboarding');
      const ageMin = page.locator('input[name="prefAgeMin"]');
      await ageMin.fill('24');
      await expect(ageMin).toHaveValue('24');
    });

    test('Step 5: Plan selection and checkout', async ({ page }) => {
      await page.evaluate(() => localStorage.setItem('onboardingStep', '5'));
      await page.goto('/onboarding');
      await expect(page.getByRole('heading', { name: 'Classic' })).toBeVisible();
      await page.getByRole('button', { name: /Checkout Securely/i }).click();
      await expect(page).toHaveURL(/.*\/success/);
    });

    test('progress bar reflects step percentage', async ({ page }) => {
      await page.goto('/onboarding');
      const progressFill = page.locator('.progress-bar-fill');
      const step1Width = await progressFill.evaluate((el) => el.style.width);
      expect(step1Width).toBe('20%');
    });
  });

  // ---------------------------------------------------------------------------
  // FULL END-TO-END JOURNEY
  // ---------------------------------------------------------------------------
  test('Complete End-to-End User Flow: Registration to Homepage', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);

    let capturedOTP = '';
    page.on('console', (msg) => {
      const match = msg.text().match(/\[DEV\] OTP for .+?: (\d{6})/);
      if (match) capturedOTP = match[1];
    });

    await test.step('Registration and OTP Verification', async () => {
      await page.goto('/register');
      await page.getByLabel('First Name').fill('E2E');
      await page.getByLabel('Last Name').fill('User');
      await page.getByLabel('Email Address').fill(`e2e.${Date.now()}@example.com`);
      await page.getByLabel('Password').fill('E2EPass@123');
      await page.getByRole('button', { name: /Continue & Verify/i }).click();
      
      await expect(page.getByRole('heading', { name: 'Verify your email' })).toBeVisible();
      await page.waitForTimeout(500);
      expect(capturedOTP).toMatch(/^\d{6}$/);

      await page.getByLabel('Enter 6-digit OTP').fill(capturedOTP);
      await page.getByRole('button', { name: /Verify & Create Account/i }).click();
      await expect(page).toHaveURL(/.*\/onboarding/);
    });

    await test.step('Onboarding: Details and Preferences', async () => {
      // Step 1
      await page.locator('input[name="gender"][value="Male"]').check();
      await page.locator('input[name="dob"]').fill('1995-01-01');
      await page.getByRole('button', { name: 'Continue' }).click();
      
      // Step 2
      await page.locator('select[name="education"]').selectOption('Masters');
      await page.getByRole('button', { name: 'Continue' }).click();
      
      // Step 3
      await page.getByRole('button', { name: /Finding Matches/i }).click();
      
      // Step 4
      await page.getByRole('button', { name: 'Finish Setup' }).click();
      
      // Step 5
      await page.getByRole('button', { name: /Skip for now/i }).click();
      await expect(page).toHaveURL('http://localhost:5173/');
    });
  });
});
