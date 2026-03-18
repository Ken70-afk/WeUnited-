// @ts-check
import { test, expect } from '@playwright/test';

/*
 * =========================================================================
 * QA LESSON #1: The Anatomy of a Test
 * =========================================================================
 * In Playwright, tests always live inside a `test()` block.
 * We pass in an object containing the `page`. The `page` is exactly what 
 * it sounds like—it's your automated browser window.
 * 
 * We use the `async/await` keywords because the browser needs time to 
 * load, render, click, and process things before our code can continue.
 */

test('homepage loads and shows the correct title', async ({ page }) => {
  /*
   * QA Concept: Navigation
   * `page.goto()` tells the browser where to go. 
   * In `playwright.config.js`, we set the `baseURL` to 'http://localhost:5173'.
   * So `page.goto('/')` actually goes to 'http://localhost:5173/'.
   */
  await page.goto('/');

  /*
   * QA Concept: Assertions
   * Assertions are HOW we test things. We use `expect()`.
   * Here, we EXPECT the browser tab's title to match "WeUnited".
   * If it doesn't match, the test will automatically fail and stop.
   */
  await expect(page).toHaveTitle(/WeUnited/);
});

/*
 * =========================================================================
 * QA LESSON #2: Locators
 * =========================================================================
 */
test('homepage visually displays the brand logo text', async ({ page }) => {
  await page.goto('/');

  /*
   * QA Concept: Locators
   * Locators tell the script HOW to find an element on the screen.
   * We can use CSS classes like `.logo` to grab specific elements.
   * The `first()` method ensures we just pick the primary one if there are multiples.
   */
  const logoLink = page.locator('.logo').first();

  /*
   * We expect this logo link to simply be visible on the screen.
   */
  await expect(logoLink).toBeVisible();
});
