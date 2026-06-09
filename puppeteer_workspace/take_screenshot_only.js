const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    let terminalPage = pages[2];

    if (!terminalPage) {
      throw new Error('❌ Page at index 2 not found.');
    }

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    const screenshotPath = path.join(artifactDir, 'scratch', 'screenshot_only.png');
    await terminalPage.screenshot({ path: screenshotPath });
    console.log(`📸 Progress screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
  } catch (err) {
    console.error('❌ Error taking screenshot:', err);
  }
})();
