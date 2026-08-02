const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/owner');

  await page.fill('input[placeholder="Enter username"]', 'HAWA.IN');
  await page.fill('input[placeholder="Enter password"]', 'HAWA.OWNER/CEO');
  await page.fill('input[placeholder="Enter key"]', '25/7/2026');
  await page.click('button:has-text("Sign In")');

  // wait for dashboard
  await page.waitForSelector('text=Owner Control Panel');

  // type into first email
  await page.fill('input[placeholder="Email"]', 'test@example.com');

  // wait 2 seconds
  await page.waitForTimeout(2000);

  const msg = await page.locator('text=Credentials saved successfully!').isVisible();
  console.log("Auto-save message visible?", msg);

  await browser.close();
})();
