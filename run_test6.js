const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err));

  await page.goto('http://localhost:3000/owner');

  await page.fill('input[placeholder="Enter username"]', 'HAWA.IN');
  await page.fill('input[placeholder="Enter password"]', 'HAWA.OWNER/CEO');
  await page.fill('input[placeholder="Enter key"]', '25/7/2026');
  await page.click('button:has-text("Sign In")');

  await page.waitForSelector('text=Owner Control Panel');

  const inputs = await page.$$('input[placeholder="Email"]');
  console.log(`Found ${inputs.length} email inputs`);

  if (inputs.length > 0) {
    // Modify one input
    await inputs[0].fill('test-update@example.com');
    // Now wait a bit and we should see "Credentials saved successfully!"
    await page.waitForTimeout(3000);
    const msgVisible = await page.locator('text=Error saving credentials!').isVisible();
    console.log("Success message visible?", msgVisible);
  }

  await browser.close();
})();
