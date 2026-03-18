// @ts-check
import { test, expect } from '@playwright/test';

/*
 * =========================================================================
 * QA LESSON #3: Multi-step workflows and Forms
 * =========================================================================
 * This test simulates a full user workflow: Logging directly into the Admin Portal.
 */
test('admin can log in and reach the dashboard', async ({ page }) => {
  // Step 1: Navigate to the exact URL
  await page.goto('/admin/login');

  /*
   * QA Concept: Implicit Automatic Waiting
   * In old tools like Selenium, you often had to write `sleep(2000)` to wait for 
   * inputs to appear on screen. 
   * Playwright is smart: it automatically waits for the element to appear and 
   * become actionable before it tries to fill it. 
   */
  
  // Step 2: Fill out the form
  // We locate inputs using CSS selectors, or `page.getByPlaceholder()`.
  // Using placeholders or labels is much more resilient than using complicated CSS.
  await page.getByPlaceholder('admin@weunited.com').fill('admin@weunited.com');
  await page.getByPlaceholder('••••••••').fill('admin123');

  // Step 3: Action - Click the login button
  await page.getByRole('button', { name: 'Authorize Access' }).click();

  /*
   * QA Concept: Verifying State Changes
   * After clicking login, the app should react. We need to verify that 
   * the reaction was successful. We can test this in a few ways:
   */
  
  // Assertion A: The URL should have changed to the secure admin route
  await expect(page).toHaveURL(/.*\/admin/);

  // Assertion B: A specific element on the new page should be visible.
  // We check that the navigation sidebar header "WeUnited Admin" is present.
  const dashboardHeader = page.getByRole('heading', { name: 'WeUnited Admin' });
  await expect(dashboardHeader).toBeVisible();
});

/*
 * =========================================================================
 * QA LESSON #4: Negative Testing
 * =========================================================================
 * It is equally important to test that the app FAILS safely when given bad data.
 */
test('admin login fails with wrong password and shows error message', async ({ page }) => {
  await page.goto('/admin/login');

  // We input intentionally BAD credentials
  await page.getByPlaceholder('admin@weunited.com').fill('admin@weunited.com');
  await page.getByPlaceholder('••••••••').fill('wrongpassword');

  await page.getByRole('button', { name: 'Authorize Access' }).click();

  // Assertion: The URL should NOT have changed (we should still be on /login)
  await expect(page).toHaveURL(/.*\/admin\/login/);

  // Assertion: The app should display an error message exactly saying:
  // "Invalid administrator credentials."
  const errorMessage = page.getByText('Invalid administrator credentials.');
  await expect(errorMessage).toBeVisible();
});
