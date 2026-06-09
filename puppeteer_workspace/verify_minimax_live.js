const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('🚀 Connecting to active Chrome session on port 9222...');
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    const page = pages[0] || await browser.newPage();

    console.log('🌐 Navigating browser to your live site: http://aurastring.cloud ...');
    await page.goto('http://aurastring.cloud', { waitUntil: 'networkidle2', timeout: 15000 }).catch((e) => {
      console.log('⚠️ Navigation warning:', e.message);
    });

    console.log('⏳ Waiting 5 seconds for React elements to initialize...');
    await new Promise(r => setTimeout(r, 5000));

    const pageTitle = await page.title();
    const currentUrl = page.url();
    console.log(`📡 Current State: Title="${pageTitle}", URL="${currentUrl}"`);

    // Verify if page loaded successfully or has errors
    const domText = await page.evaluate(() => document.body ? document.body.innerText.substring(0, 500) : 'No body');
    console.log('--- Page text snippet ---');
    console.log(domText);
    console.log('-------------------------');

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    const screenshotPath = path.join(artifactDir, 'aurastring_live_upgraded.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Upgraded live site screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error during live site verification:', err);
  }
})();
