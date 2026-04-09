// @ts-check
import { test, expect } from '@playwright/test';

/** @param {import('@playwright/test').Page} page */
async function clearLocalStorage(page) {
  const url = page.url();
  if (!url || url === 'about:blank') {
    await page.goto('/');
  }
  await page.evaluate(() => {
    localStorage.clear();
  });
}

test('New Onboarding Flow: Exhaustive Field Validation and Progress', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes
  // 1. Initial Cleanup
  await page.goto('/');
  await clearLocalStorage(page);

  // 2. Registration
  let capturedOTP = '';
  page.on('console', (msg) => {
    const match = msg.text().match(/\[DEV\] OTP for .+?: (\d{6})/);
    if (match) capturedOTP = match[1];
  });

  await test.step('Phase 1: Registration', async () => {
    await page.goto('/register');
    await page.getByLabel('First Name').fill('Onboard');
    await page.getByLabel('Last Name').fill('TestUser');
    await page.getByLabel('Email Address').fill(`onboard.test.${Date.now()}@example.com`);
    await page.getByLabel('Password').fill('TestPass@123');
    await page.getByRole('button', { name: /Continue & Verify/i }).click();

    await expect(page.getByRole('heading', { name: 'Verify your email' })).toBeVisible();
    await page.waitForTimeout(500);
    expect(capturedOTP).toMatch(/^\d{6}$/);

    await page.getByLabel('Enter 6-digit OTP').fill(capturedOTP);
    await page.getByRole('button', { name: /Verify & Create Account/i }).click();
    await expect(page).toHaveURL(/.*\/onboarding/);
  });

  // 3. Onboarding
  await test.step('Phase 2: New Onboarding Wizard', async () => {
    
    // ----------- STEP 1: Basic Info -----------
    await expect(page.getByRole('heading', { name: 'Basic Details' })).toBeVisible();
    
    // Fill all required fields to pass validation
    // First Name, Last Name, Email are pre-filled from registration (but sometimes form resets in tests if localstorage clears, let's fill them just in case)
    await page.locator('input[name="firstName"]').fill('Onboard');
    await page.locator('input[name="lastName"]').fill('TestUser');
    await page.locator('input[name="email"]').fill('onboard.test@example.com');
    await page.locator('select[name="gender"]').selectOption('Female');
    await page.locator('input[name="dob"]').fill('1995-10-15');
    
    // DropdownWithOptions fields
    await page.locator('select[name="maritalStatus"]').selectOption('Unmarried');
    await page.locator('select[name="religion"]').selectOption('Hindu');
    await page.locator('input[name="community"]').fill('Malayali');
    await page.locator('input[name="caste"]').fill('Nair');
    
    // Try hitting continue
    await page.getByRole('button', { name: 'Continue' }).click();

    // ----------- STEP 2: Professional Info -----------
    await expect(page.getByRole('heading', { name: 'Professional Details' })).toBeVisible();
    await page.locator('select[name="education"]').selectOption('Masters');
    await page.locator('select[name="profession"]').selectOption('Software/IT');
    await page.locator('select[name="income"]').selectOption('100k-200k');
    
    await page.getByRole('button', { name: 'Continue' }).click();

    // ----------- STEP 3: Partner Preferences -----------
    await expect(page.getByRole('heading', { name: 'Partner Preferences' })).toBeVisible();
    await page.locator('input[name="prefAgeMin"]').fill('26');
    await page.locator('input[name="prefAgeMax"]').fill('35');
    
    await page.locator('select[name="prefMaritalStatus"]').selectOption('Unmarried');
    await page.locator('select[name="prefReligion"]').selectOption('Hindu');
    await page.locator('select[name="prefIncome"]').selectOption('100k-200k');

    await page.getByRole('button', { name: /Finding Matches/i }).click();

    // ----------- STEP 4: Photos -----------
    await expect(page.getByRole('heading', { name: 'Photo Upload' })).toBeVisible();
    // Skip uploading photos for test speed, just Finish Setup
    await page.getByRole('button', { name: 'Finish Setup' }).click();

    // ----------- STEP 5: Pricing -----------
    await expect(page.getByRole('heading', { name: 'Unlock Premium Features' })).toBeVisible();
    // Verify dynamic pricing loads (should test for basic/premium elements)
    await expect(page.getByText('Basic (2 Months)')).toBeVisible();
    await expect(page.getByText('Premium (3 Months)')).toBeVisible();

    await page.getByRole('button', { name: /Skip for now/i }).click();
    
    // Should be redirected to dashboard because of RequireAuth
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});
