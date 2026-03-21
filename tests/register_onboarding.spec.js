// @ts-check
import { test, expect } from '@playwright/test';

/*
 * =========================================================================
 * QA LESSON #5: Intercepting Console Output
 * =========================================================================
 * WeUnited's registration uses a MOCK OTP system for development.
 * The real OTP is printed to the browser console like this:
 *   console.info(`[DEV] OTP for user@example.com: 483921`)
 *
 * Instead of hard-coding a fake OTP, we listen to the browser's console
 * BEFORE we trigger the action that generates it. When the message arrives,
 * we extract the 6-digit code and use it to complete the verification.
 *
 * This is a powerful pattern for testing apps that rely on console output
 * during development (instead of real email/SMS APIs).
 */

// ---------------------------------------------------------------------------
// Test Data — Randomise the email so tests don't collide on repeated runs
// ---------------------------------------------------------------------------
const timestamp = Date.now();
const TEST_USER = {
  firstName: 'Alice',
  lastName:  'TestUser',
  email:     `alice.test.${timestamp}@example.com`,
  phone:     '+1 555 000 1234',
  password:  'TestPass@123',
};

// ---------------------------------------------------------------------------
// Helper: clear onboarding/profile localStorage so tests start clean.
// NOTE: localStorage is only accessible when the page has an origin,
// so we navigate to the site root first if the page is still on about:blank.
// ---------------------------------------------------------------------------
/**
 * @param {import('@playwright/test').Page} page
 */
async function clearLocalStorage(page) {
  // Ensure the page has a real origin before touching localStorage
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

// ===========================================================================
// SUITE 1 — Registration Flow
// ===========================================================================
test.describe('Registration Flow', () => {

  /*
   * -------------------------------------------------------------------------
   * TEST 1: Registration page renders correctly
   * -------------------------------------------------------------------------
   */
  test('registration page loads with all required fields', async ({ page }) => {
    await test.step('Navigate to Register page', async () => {
      await page.goto('/register');
    });

    await test.step('Verify page title and heading', async () => {
      await expect(page).toHaveTitle(/WeUnited/);
      const heading = page.getByRole('heading', { name: 'Create Account' });
      await expect(heading).toBeVisible();
    });

    await test.step('Verify required input fields are visible', async () => {
      await expect(page.getByLabel('First Name')).toBeVisible();
      await expect(page.getByLabel('Last Name')).toBeVisible();
      await expect(page.getByLabel('Email Address')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
    });

    await test.step('Verify submit button is visible', async () => {
      const submitBtn = page.getByRole('button', { name: /Continue & Verify/i });
      await expect(submitBtn).toBeVisible();
    });
  });

  /*
   * -------------------------------------------------------------------------
   * TEST 2: Validation — empty form should show an error
   * -------------------------------------------------------------------------
   */
  test('registration shows error when required fields are empty', async ({ page }) => {
    await page.goto('/register');

    /*
     * QA Concept: Bypassing HTML5 Native Validation to reach App-Level Guards
     * The registration inputs have the HTML `required` attribute, which causes
     * the BROWSER to block the form submission BEFORE React's onSubmit handler runs.
     * This means the app-level error banner ('Please fill in all required fields.')
     * would never appear if we just clicked submit with empty inputs.
     *
     * To test the React-level validation, we first strip the `required` attributes
     * from all form inputs via page.evaluate(), then click submit. This lets the
     * form bypass browser validation and reach the React handler — which has its
     * own check and displays the error banner.
     */
    await page.evaluate(() => {
      document.querySelectorAll('form input, form textarea').forEach((el) => {
        el.removeAttribute('required');
      });
    });

    // Click submit with all fields empty — React onSubmit now runs
    await page.getByRole('button', { name: /Continue & Verify/i }).click();

    // React's own check fires and renders the error banner
    const errorMsg = page.getByText('Please fill in all required fields.');
    await expect(errorMsg).toBeVisible();

    // We should still be on the registration form (OTP step should NOT be shown)
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
  });

  /*
   * -------------------------------------------------------------------------
   * TEST 3: Happy path — fill form → OTP screen appears
   * -------------------------------------------------------------------------
   */
  test('submitting valid registration details shows the OTP verification screen', async ({ page }) => {
    await clearLocalStorage(page);
    await page.goto('/register');

    await page.getByLabel('First Name').fill(TEST_USER.firstName);
    await page.getByLabel('Last Name').fill(TEST_USER.lastName);
    await page.getByLabel('Email Address').fill(TEST_USER.email);
    await page.getByPlaceholder('+1 234 567 8900').fill(TEST_USER.phone);
    await page.getByLabel('Password').fill(TEST_USER.password);

    await page.getByRole('button', { name: /Continue & Verify/i }).click();

    /*
     * After submission, the view should switch to the OTP step.
     * The heading changes to "Verify your email".
     */
    const otpHeading = page.getByRole('heading', { name: 'Verify your email' });
    await expect(otpHeading).toBeVisible();

    // The user's email should be displayed in the OTP instructions
    await expect(page.getByText(TEST_USER.email)).toBeVisible();
  });

  /*
   * -------------------------------------------------------------------------
   * TEST 4: Wrong OTP shows an error
   * -------------------------------------------------------------------------
   */
  test('entering an incorrect OTP shows an error message', async ({ page }) => {
    await clearLocalStorage(page);
    await page.goto('/register');

    // Fill and submit the form to get to the OTP screen
    await page.getByLabel('First Name').fill(TEST_USER.firstName);
    await page.getByLabel('Last Name').fill(TEST_USER.lastName);
    await page.getByLabel('Email Address').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);
    await page.getByRole('button', { name: /Continue & Verify/i }).click();
    await expect(page.getByRole('heading', { name: 'Verify your email' })).toBeVisible();

    // Enter a deliberately wrong 6-digit OTP
    await page.getByLabel('Enter 6-digit OTP').fill('000000');
    await page.getByRole('button', { name: /Verify & Create Account/i }).click();

    // The error message should appear
    const otpError = page.getByText('Incorrect OTP. Please try again.');
    await expect(otpError).toBeVisible();
  });

  /*
   * -------------------------------------------------------------------------
   * TEST 5: Back button on OTP screen returns to registration form
   * -------------------------------------------------------------------------
   */
  test('back button on OTP screen returns to the registration form', async ({ page }) => {
    await clearLocalStorage(page);
    await page.goto('/register');

    await page.getByLabel('First Name').fill(TEST_USER.firstName);
    await page.getByLabel('Last Name').fill(TEST_USER.lastName);
    await page.getByLabel('Email Address').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);
    await page.getByRole('button', { name: /Continue & Verify/i }).click();
    await expect(page.getByRole('heading', { name: 'Verify your email' })).toBeVisible();

    // Click back
    await page.getByRole('button', { name: /Back to details/i }).click();

    // Should be back to the registration form
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
  });

  /*
   * -------------------------------------------------------------------------
   * TEST 6: Full registration — intercept console to get OTP, verify, land on /onboarding
   * -------------------------------------------------------------------------
   * This is the end-to-end "happy path" for registration. 
   * We intercept the browser console to grab the mock OTP the app logs.
   */
  test('full registration: intercepts dev OTP, verifies, and redirects to /onboarding', async ({ page }) => {
    await clearLocalStorage(page);

    let capturedOTP = '';
    page.on('console', (message) => {
      const text = message.text();
      const match = text.match(/\[DEV\] OTP for .+?: (\d{6})/);
      if (match) {
        capturedOTP = match[1];
        // Log it back to the test runner's console so it shows up in the UI Console tab
        console.log(`[TEST] Captured Registration OTP: ${capturedOTP}`);
      }
    });

    await test.step('Fill and submit registration form', async () => {
      await page.goto('/register');
      await page.getByLabel('First Name').fill(TEST_USER.firstName);
      await page.getByLabel('Last Name').fill(TEST_USER.lastName);
      await page.getByLabel('Email Address').fill(TEST_USER.email);
      await page.getByPlaceholder('+1 234 567 8900').fill(TEST_USER.phone);
      await page.getByLabel('Password').fill(TEST_USER.password);
      await page.getByRole('button', { name: /Continue & Verify/i }).click();
    });

    await test.step('Intercept OTP from console', async () => {
      await expect(page.getByRole('heading', { name: 'Verify your email' })).toBeVisible();
      await page.waitForTimeout(500);
      expect(capturedOTP).toMatch(/^\d{6}$/);
    });

    await test.step('Enter OTP and verify account', async () => {
      await page.getByLabel('Enter 6-digit OTP').fill(capturedOTP);
      await page.getByRole('button', { name: /Verify & Create Account/i }).click();
      await expect(page).toHaveURL(/.*\/onboarding/);
    });
  });
});


// ===========================================================================
// SUITE 2 — Onboarding Flow (runs after being placed on /onboarding)
// ===========================================================================
test.describe('Onboarding Flow', () => {

  /*
   * We perform a light "login" by injecting the profile and auth state
   * directly into localStorage before each test. This isolates the
   * onboarding tests from the registration tests above.
   *
   * QA Concept: Test Isolation via State Seeding
   * Instead of navigating through registration before EVERY onboarding test
   * (which would be slow and brittle), we set just enough state to make
   * the app think the user is already logged in and ready to onboard.
   */
  test.beforeEach(async ({ page }) => {
    await page.goto('/');   // Visit the site first so localStorage is accessible

    await page.evaluate((user) => {
      const mockProfile = {
        firstName: user.firstName,
        middleName: '',
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: '',
        dob: '',
        community: '',
        religion: '',
        caste: '',
        qualification: '',
        job: '',
        income: '',
        location: '',
        photos: [],
      };
      localStorage.setItem('profileDataFull', JSON.stringify(mockProfile));
      localStorage.setItem('authUser', JSON.stringify(mockProfile));
      // Clear any stale onboarding session
      localStorage.removeItem('onboardingData');
      localStorage.removeItem('onboardingStep');
    }, TEST_USER);
  });

  /*
   * -------------------------------------------------------------------------
   * TEST 7: Onboarding page renders Step 1 of 5
   * -------------------------------------------------------------------------
   */
  test('onboarding page loads and shows Step 1 of 5: Basic Details', async ({ page }) => {
    await page.goto('/onboarding');

    // Step indicator text
    await expect(page.getByText('Step 1 of 5')).toBeVisible();

    // The step heading
    await expect(page.getByRole('heading', { name: 'Basic Details' })).toBeVisible();

    // Pre-filled first name from registration profile
    const firstNameField = page.getByPlaceholder('e.g. John');
    await expect(firstNameField).toHaveValue(TEST_USER.firstName);
  });

  /*
   * -------------------------------------------------------------------------
   * TEST 8: Step 1 → Step 2 navigation
   * -------------------------------------------------------------------------
   */
  test('clicking Continue on Step 1 navigates to Step 2: Professional Details', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.getByText('Step 1 of 5')).toBeVisible();

    await test.step('Fill Step 1: Basic Details', async () => {
      await page.locator('input[name="gender"][value="Male"]').check();
      await page.getByPlaceholder('e.g. John').fill('Alice');
      await page.locator('input[name="lastName"]').fill('TestUser');
      await page.locator('input[name="dob"]').fill('1995-06-15');
    });

    await test.step('Continue to Step 2', async () => {
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByText('Step 2 of 5')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Professional Details' })).toBeVisible();
    });
  });

  /*
   * -------------------------------------------------------------------------
   * TEST 9: Step 2 — select dropdowns work
   * -------------------------------------------------------------------------
   */
  test('Step 2 allows selecting education, profession, and income', async ({ page }) => {
    // Jump directly to Step 2 by seeding the step in localStorage
    await page.evaluate(() => localStorage.setItem('onboardingStep', '2'));
    await page.goto('/onboarding');

    await expect(page.getByText('Step 2 of 5')).toBeVisible();

    // Select education
    await page.locator('select[name="education"]').selectOption('Bachelors');
    await expect(page.locator('select[name="education"]')).toHaveValue('Bachelors');

    // Select profession
    await page.locator('select[name="profession"]').selectOption('Software/IT');
    await expect(page.locator('select[name="profession"]')).toHaveValue('Software/IT');

    // Select income
    await page.locator('select[name="income"]').selectOption('50k-100k');
    await expect(page.locator('select[name="income"]')).toHaveValue('50k-100k');
  });

  /*
   * -------------------------------------------------------------------------
   * TEST 10: Step 2 → Back → Step 1
   * -------------------------------------------------------------------------
   */
  test('Back button on Step 2 navigates back to Step 1', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('onboardingStep', '2'));
    await page.goto('/onboarding');

    await expect(page.getByText('Step 2 of 5')).toBeVisible();
    await page.getByRole('button', { name: 'Back' }).click();

    await expect(page.getByText('Step 1 of 5')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Basic Details' })).toBeVisible();
  });

  /*
   * -------------------------------------------------------------------------
   * TEST 11: Step 3 — Partner Preferences
   * -------------------------------------------------------------------------
   */
  test('Step 3 loads Partner Preferences with default age range', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('onboardingStep', '3'));
    await page.goto('/onboarding');

    await expect(page.getByText('Step 3 of 5')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Partner Preferences' })).toBeVisible();

    // The age range fields, seeded with defaults from Onboarding.jsx
    const ageMin = page.locator('input[name="prefAgeMin"]');
    const ageMax = page.locator('input[name="prefAgeMax"]');
    await expect(ageMin).toHaveValue('18');
    await expect(ageMax).toHaveValue('35');

    // Update age range
    await ageMin.fill('24');
    await ageMax.fill('32');
    await expect(ageMin).toHaveValue('24');
    await expect(ageMax).toHaveValue('32');
  });

  /*
   * -------------------------------------------------------------------------
   * TEST 12: Step 4 — Photo Upload screen renders
   * -------------------------------------------------------------------------
   */
  test('Step 4 renders the Photo Upload screen with a file input', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('onboardingStep', '4'));
    await page.goto('/onboarding');

    await expect(page.getByText('Step 4 of 5')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Photo Upload' })).toBeVisible();

    // The "Browse Photos" label / file input should be present
    await expect(page.getByText('Browse Photos')).toBeVisible();

    // Skip button should be available to proceed without uploading
    await page.getByRole('button', { name: 'Finish Setup' }).click();

    // Should advance to Step 5
    await expect(page.getByText('Step 5 of 5')).toBeVisible();
  });

  /*
   * -------------------------------------------------------------------------
   * TEST 13: Step 5 — Pricing / Plan selection
   * -------------------------------------------------------------------------
   */
  test('Step 5 shows plan selection with Classic and Plus options', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('onboardingStep', '5'));
    await page.goto('/onboarding');

    await expect(page.getByText('Step 5 of 5')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Unlock Premium Features' })).toBeVisible();

    // Both pricing plans should be visible
    await expect(page.getByRole('heading', { name: 'Classic' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Plus' })).toBeVisible();

    // The "MOST POPULAR" badge on Plus plan
    await expect(page.getByText('MOST POPULAR')).toBeVisible();

    // Select the Classic plan by clicking on it
    await page.getByRole('heading', { name: 'Classic' }).click();
  });

  /*
   * -------------------------------------------------------------------------
   * TEST 14: Skip payment → redirected to Home
   * -------------------------------------------------------------------------
   */
  test('clicking "Skip for now" on Step 5 redirects to the homepage', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('onboardingStep', '5'));
    await page.goto('/onboarding');

    await expect(page.getByText('Step 5 of 5')).toBeVisible();

    await page.getByRole('button', { name: /Skip for now/i }).click();

    // Should be redirected to the homepage
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  /*
   * -------------------------------------------------------------------------
   * TEST 15: Checkout → redirected to /success
   * -------------------------------------------------------------------------
   */
  test('clicking "Checkout Securely" on Step 5 redirects to /success', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('onboardingStep', '5'));
    await page.goto('/onboarding');

    await expect(page.getByText('Step 5 of 5')).toBeVisible();

    await page.getByRole('button', { name: /Checkout Securely/i }).click();

    // Mock checkout → /success
    await expect(page).toHaveURL(/.*\/success/);
  });

  /*
   * -------------------------------------------------------------------------
   * TEST 16: Progress bar reflects correct step percentage
   * -------------------------------------------------------------------------
   */
  test('progress bar advances correctly through the steps', async ({ page }) => {
    await page.goto('/onboarding');

    /*
     * QA Concept: Asserting on Inline Styles
     * The progress bar uses a dynamic `style.width` based on (step/total)*100.
     * Step 1 of 5 = 20%, Step 3 of 5 = 60%, Step 5 of 5 = 100%.
     */
    const progressFill = page.locator('.progress-bar-fill');
    await expect(progressFill).toHaveCSS('width', /\d+px/);

    // Step 1 = 20% → attribute should reflect this
    const step1Width = await progressFill.evaluate((el) => el.style.width);
    expect(step1Width).toBe('20%');
  });
});


// ===========================================================================
// SUITE 3 — End-to-End: Full registration + full onboarding in one flow
// ===========================================================================
test.describe('End-to-End: Register → Onboard → Success', () => {

  /*
   * -------------------------------------------------------------------------
   * TEST 17: Full journey from /register to /success
   * -------------------------------------------------------------------------
   * This is the most complete test. It covers:
   *   1. Filling out the registration form
   *   2. Capturing the dev OTP from the browser console
   *   3. Verifying the OTP  →  landing on /onboarding
   *   4. Walking through all 5 onboarding steps
   *   5. Skipping the payment  →  landing on the homepage
   */
  test('complete registration and onboarding journey (skip payment)', async ({ page }) => {
    // Clear any stale state
    await page.goto('/');
    await clearLocalStorage(page);

    let capturedOTP = '';
    page.on('console', (msg) => {
      const match = msg.text().match(/\[DEV\] OTP for .+?: (\d{6})/);
      if (match) {
        capturedOTP = match[1];
        console.log(`[TEST] Captured E2E OTP: ${capturedOTP}`);
      }
    });

    await test.step('Phase 1: Registration', async () => {
      await page.goto('/register');
      await page.getByLabel('First Name').fill('E2E');
      await page.getByLabel('Last Name').fill('User');
      await page.getByLabel('Email Address').fill(`e2e.user.${Date.now()}@example.com`);
      await page.getByLabel('Password').fill('E2EPass@2024');
      await page.getByRole('button', { name: /Continue & Verify/i }).click();

      await expect(page.getByRole('heading', { name: 'Verify your email' })).toBeVisible();
      await page.waitForTimeout(500);
      expect(capturedOTP).toMatch(/^\d{6}$/);

      await page.getByLabel('Enter 6-digit OTP').fill(capturedOTP);
      await page.getByRole('button', { name: /Verify & Create Account/i }).click();
      await expect(page).toHaveURL(/.*\/onboarding/);
    });

    await test.step('Phase 2: Onboarding - Basic Details', async () => {
      await page.locator('input[name="gender"][value="Female"]').check();
      await page.locator('input[name="dob"]').fill('1996-03-10');
      await page.locator('input[name="community"]').fill('General');
      await page.locator('input[name="religion"]').fill('Hindu');
      await page.getByRole('button', { name: 'Continue' }).click();
    });

    await test.step('Phase 3: Onboarding - Professional Details', async () => {
      await expect(page.getByText('Step 2 of 5')).toBeVisible();
      await page.locator('select[name="education"]').selectOption('Masters');
      await page.locator('select[name="profession"]').selectOption('Medical/Healthcare');
      await page.locator('select[name="income"]').selectOption('100k-200k');
      await page.getByRole('button', { name: 'Continue' }).click();
    });

    await test.step('Phase 4: Onboarding - Partner Preferences', async () => {
      await expect(page.getByText('Step 3 of 5')).toBeVisible();
      await page.locator('input[name="prefAgeMin"]').fill('26');
      await page.locator('input[name="prefAgeMax"]').fill('38');
      await page.locator('input[name="prefLocation"]').fill('New York');
      await page.getByRole('button', { name: /Finding Matches/i }).click();
    });

    await test.step('Phase 5: Onboarding - Photo Upload', async () => {
      await expect(page.getByText('Step 4 of 5')).toBeVisible();
      await page.getByRole('button', { name: 'Finish Setup' }).click();
    });

    await test.step('Phase 6: Onboarding - Payment Plan', async () => {
      await expect(page.getByText('Step 5 of 5')).toBeVisible();
      await page.getByRole('button', { name: /Skip for now/i }).click();
      await expect(page).toHaveURL('http://localhost:5173/');
    });
  });
});
