const { test, expect } = require('@playwright/test');
const { smartClick } = require('../healing/smart-actions');
 
test('Healing a broken selector', async ({ page }) => {
  await page.goto('https://rahulshettyacademy.com/AutomationPractice/');
 
  await expect(page.locator('#displayed-text')).toBeVisible();
 
  // BROKEN ON PURPOSE: real id is "#hide-textbox". We are passing a wrong one.
  await smartClick(
    page,
    '#hide-textbox-OLD',
    'the Hide control that hides the displayed text box'
  );
 
  await expect(page.locator('#displayed-text')).toBeHidden();
});
