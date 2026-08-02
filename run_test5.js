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
    await inputs[0].fill('test3@example.com');
    await page.waitForTimeout(2500); // wait for debounce
    const msg = await page.locator('text=Error saving credentials!').isVisible();
    const msg2 = await page.locator('text=Credentials saved successfully!').isVisible();
    console.log("Auto-save error message visible?", msg, "Success?", msg2);

    // click Save manually
    await page.click('button:has-text("Save All Credentials")');
    await page.waitForTimeout(1500);
    const msg3 = await page.locator('text=Error saving credentials!').isVisible();
    const msg4 = await page.locator('text=Credentials saved successfully!').isVisible();
    console.log("Manual save error message visible?", msg3, "Success?", msg4);
  }

  await browser.close();
})();
