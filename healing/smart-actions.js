// healing/smart-actions.js triggers the healer. 
// Use these instead of raw page.locator(...).click()/.fill().
// FAST_TIMEOUT is short on purpose so a broken locator fails fast and leaves time for the heal.

const { heal } = require('./ai-locator');

const FAST_TIMEOUT = 3000;

async function smartClick(page, selector, description) {
  try {
    await page.locator(selector).click({ timeout: FAST_TIMEOUT });
  } catch {
    const healed = await heal(page, selector, description);
    if (!healed) throw new Error(`Could not heal "${description}" (was: ${selector})`);
    await page.locator(healed).click({ timeout: FAST_TIMEOUT });
  }
}

async function smartFill(page, selector, value, description) {
  try {
    await page.locator(selector).fill(value, { timeout: FAST_TIMEOUT });
  } catch {
    const healed = await heal(page, selector, description);
    if (!healed) throw new Error(`Could not heal "${description}" (was: ${selector})`);
    await page.locator(healed).fill(value, { timeout: FAST_TIMEOUT });
  }
}

module.exports = { smartClick, smartFill };
