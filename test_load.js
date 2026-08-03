const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/owner');

  await page.evaluate(() => {
    localStorage.setItem('ownerPanelLoggedIn', 'true');
  });

  await page.reload();
  await page.waitForTimeout(2000); // Wait for snapshot to load data

  const savedVal = await page.locator('input[placeholder="Email"]').first().inputValue();
  console.log("Loaded value:", savedVal);

  await browser.close();
})();
