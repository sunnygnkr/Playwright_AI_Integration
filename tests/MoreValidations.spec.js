const {test} = require('@playwright/test');
const {expect} = require('@playwright/test');

test('First test', async ({page})=> 
{
  await page.goto('https://rahulshettyacademy.com/AutomationPractice/');
//   await page.goto('https://www.google.com/');
//   await page.goBack();
//   await page.goForward();
//   console.log(await page.title());
//   console.log(await page.url());
//   await expect(page).toHaveTitle('Google');
//   await expect(page).toHaveURL('https://www.google.com/');
  await expect(page.locator('#displayed-text')).toBeVisible();
  await page.locator("#hide-textbox").click();
  await expect(page.locator('#displayed-text')).toBeHidden();
})

test.only('Pop ups', async ({page})=> 
{
  await page.goto('https://rahulshettyacademy.com/AutomationPractice/');
  page.on('dialog', popup => popup.accept());
  await page.locator("#confirmbtn").click();
})