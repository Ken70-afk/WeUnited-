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

test('Mega Flow: Complete journey from Registration to Profile Editing', async ({ page }) => {
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
    await page.getByLabel('First Name').fill('Mega');
    await page.getByLabel('Last Name').fill('User');
    await page.getByLabel('Email Address').fill(`mega.user.${Date.now()}@example.com`);
    await page.getByLabel('Password').fill('MegaPass@123');
    await page.getByRole('button', { name: /Continue & Verify/i }).click();

    await expect(page.getByRole('heading', { name: 'Verify your email' })).toBeVisible();
    await page.waitForTimeout(500);
    expect(capturedOTP).toMatch(/^\d{6}$/);

    await page.getByLabel('Enter 6-digit OTP').fill(capturedOTP);
    await page.getByRole('button', { name: /Verify & Create Account/i }).click();
    await expect(page).toHaveURL(/.*\/onboarding/);
  });

  // 3. Onboarding
  await test.step('Phase 2: Onboarding Wizard', async () => {
    // Step 1: Basic
    await page.locator('input[name="gender"][value="Female"]').check();
    await page.locator('input[name="dob"]').fill('1992-05-20');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 2: Professional
    await page.locator('select[name="education"]').selectOption('Masters');
    await page.locator('select[name="profession"]').selectOption('Law/Legal');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 3: Preferences
    await page.getByRole('button', { name: /Finding Matches/i }).click();

    // Step 4: Photos
    await page.getByRole('button', { name: 'Finish Setup' }).click();

    // Step 5: Pricing
    await page.getByRole('button', { name: /Skip for now/i }).click();
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  // 4. Browse Matches
  await test.step('Phase 3: Browse Matches', async () => {
    // Navigate via the footer link or direct goto
    await page.goto('/profiles');

    // Debug: capture screenshot if it doesn't show up
    try {
      await expect(page.locator('h1')).toContainText('Your Matches');
    } catch (e) {
      await page.screenshot({ path: 'tests/onboarding_failure.png', fullPage: true });
      throw e;
    }


    // Test filters
    await page.locator('input[name="minAge"]').first().fill('18');
    await page.locator('input[name="religion"]').first().fill('Hindu');

    // Wait for the mock filter logic to reflect (it's immediate in React)
    const resultsCount = page.locator('.profiles-count');
    await expect(resultsCount).toContainText(/Profiles Found/);

    // Try connecting to a profile
    const connectBtn = page.locator('.btn-connect').first();
    await expect(connectBtn).toBeVisible();
    await connectBtn.click();
    await expect(connectBtn).toContainText('Request Sent', { timeout: 10000 });
  });

  // 5. Edit Profile
  await test.step('Phase 4: Edit Profile (All Sections)', async () => {
    await page.goto('/profile');
    await expect(page.locator('.profile-page')).toBeVisible();

    // Section 1: Primary Information (Open by default, but let's be sure)
    const primarySection = page.locator('.accordion-item').filter({ hasText: 'Primary Information' });
    const classAttr = await primarySection.getAttribute('class') || '';
    if (!classAttr.includes('expanded')) {
      await page.getByText('Primary Information').click();
    }
    await primarySection.getByRole('button', { name: 'Edit' }).click();
    await page.locator('input[name="middleName"]').fill('Super');
    await page.locator('input[name="bioTags"]').fill('Testing, Automation, Quality');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Quality')).toBeVisible();

    // Section 2: Account Verification (Skip upload but check presence)
    await page.getByText('Account Verification').click();
    await expect(page.getByText('Identity Verification')).toBeVisible();

    // Section 3: Religious Information
    await page.getByText('Religious Information').click();
    const religionSection = page.locator('.accordion-item').filter({ hasText: 'Religious Information' });
    await religionSection.getByRole('button', { name: 'Edit' }).click();
    await page.locator('input[name="community"]').fill('Malayali');
    await page.locator('input[name="religion"]').fill('Hindu');
    await page.locator('input[name="caste"]').fill('Nair');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Malayali').first()).toBeVisible();
    await expect(page.getByText('Hindu').first()).toBeVisible();
    await expect(page.getByText('Nair').first()).toBeVisible();

    // Section 4: Education & Profession
    await page.getByText('Education & Profession').click();
    const eduSection = page.locator('.accordion-item').filter({ hasText: 'Education & Profession' });
    await eduSection.getByRole('button', { name: 'Edit' }).click();
    await page.locator('select[name="income"]').selectOption('100k-200k');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('100k-200k').first()).toBeVisible();

    // Section 5: Location Information
    await page.getByText('Location Information').click();
    const locSection = page.locator('.accordion-item').filter({ hasText: 'Location Information' });
    await locSection.getByRole('button', { name: 'Edit' }).click();
    await page.locator('input[name="location"]').fill('San Francisco, CA');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('San Francisco, CA').first()).toBeVisible();

    // Section 6: Contact Information
    await page.getByText('Contact Information').click();
    const contactSection = page.locator('.accordion-item').filter({ hasText: 'Contact Information' });
    await contactSection.getByRole('button', { name: 'Edit' }).click();
    await page.locator('input[name="phone"]').fill('+1 999 000 8888');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('+1 999 000 8888').first()).toBeVisible();

    // Section 7: Family Information
    await page.getByText('Family Information').click();
    const familySection = page.locator('.accordion-item').filter({ hasText: 'Family Information' });
    await familySection.getByRole('button', { name: 'Edit' }).click();
    await page.locator('textarea[name="familyInfo"]').fill('Loving family of 4.');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Loving family of 4.').first()).toBeVisible();

    // Section 8: Hobbies & Interests
    await page.getByText('Hobbies & Interests').click();
    const hobbiesSection = page.locator('.accordion-item').filter({ hasText: 'Hobbies & Interests' });
    await hobbiesSection.getByRole('button', { name: 'Edit' }).click();
    await page.locator('input[name="hobbies"]').fill('Coding, Debugging, Deployment');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Debugging').first()).toBeVisible();
  });
});
