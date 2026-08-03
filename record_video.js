const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  // Set up context with recording
  const context = await browser.newContext({
    recordVideo: {
      dir: 'videos/', // Video directory
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();

  await page.goto('http://localhost:3000/owner');

  // Inject into local storage
  await page.evaluate(() => {
    localStorage.setItem('ownerPanelLoggedIn', 'true');
  });

  await page.reload();
  await page.waitForTimeout(2000);

  const emailInput = await page.locator('input[placeholder="Email"]').first();
  await emailInput.fill('live_test@gmail.com');
  await page.waitForTimeout(1500); // trigger save

  const pwInput = await page.locator('input[placeholder="Password"]').first();
  await pwInput.fill('secret123');
  await page.waitForTimeout(1500); // trigger save

  console.log("Filled data. Waiting for save, then reloading...");

  // Reload page to prove it saved
  await page.reload();
  await page.waitForTimeout(2000);

  const finalEmail = await page.locator('input[placeholder="Email"]').first().inputValue();
  console.log("Final Email after reload:", finalEmail);

  await page.screenshot({ path: 'frontend_screenshot.png' });

  await context.close();
  await browser.close();

  // Rename video to fixed name
  const files = fs.readdirSync('videos');
  const videoFile = files.find(f => f.endsWith('.webm'));
  if (videoFile) {
    fs.renameSync(`videos/${videoFile}`, 'videos/owner_panel_save.webm');
    console.log("Video saved to videos/owner_panel_save.webm");
  }
})();
