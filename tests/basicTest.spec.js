const {test} = require('@playwright/test');
const {expect} = require('@playwright/test');

test('First test', async ({browser})=> 
{
// Test code goes here
  const context = await browser.newContext();
  const page = await context.newPage();
  const username = page.locator('#username');
  const signin = page.locator('#signInBtn');
  const cardTitles = page.locator('.card-body a');
  await page.goto('https://rahulshettyacademy.com/loginpagePractise/');
  console.log("Page title is: "+ await page.title());
  await username.type('rahulshetty');
  await page.locator('[type="password"]').type('Learning@830$3mK2');
  await signin.click();
  console.log(await page.locator("[style*='block']").textContent());
  await expect(page.locator("[style*='block']")).toContainText('Incorrect username');
  await username.fill('');
  await username.type('rahulshettyacademy');
  await signin.click();
  await page.waitForSelector('.card-body a');
  const allTitles = await cardTitles.allTextContents();
  console.log(allTitles);
  
})

test.only('Dropdowns and Radio buttons', async ({browser})=> 
{
const context = await browser.newContext();
  const page = await context.newPage();
  const username = page.locator('#username');
  const signin = page.locator('#signInBtn');
  await page.goto('https://rahulshettyacademy.com/loginpagePractise/');
  const dropdwon = page.locator("select.form-control");
  await dropdwon.selectOption('consult');
  await page.locator('.radiotextsty').nth(1).click();
  await page.locator('#okayBtn').click();
  await page.pause();
})


// test('Without browser context', async ({page})=> 
// {
//   await page.goto('https://playwright.dev/');
//   console.log(await page.title());
//   await expect(page).toHaveTitle(/Fast and reliable/i);
// })