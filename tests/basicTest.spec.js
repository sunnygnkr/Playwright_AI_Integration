const {test} = require('@playwright/test');
const {expect} = require('@playwright/test');

test('First test', async ({browser})=> 
{
// Test code goes here

  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://www.google.com/');
  console.log(await page.title());
})

test('Without browser context', async ({page})=> 
{
  await page.goto('https://playwright.dev/');
  console.log(await page.title());
  await expect(page).toHaveTitle(/Fast and reliable/i);
})