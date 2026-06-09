const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    console.log(`Found ${pages.length} pages.`);

    // Find if there is already a page with aurastring.cloud
    let webPage = pages.find(p => p.url().includes('aurastring.cloud'));
    if (!webPage) {
      console.log('Opening new tab for aurastring.cloud...');
      webPage = await browser.newPage();
    } else {
      console.log(`Found existing aurastring.cloud page: ${webPage.url()}`);
    }

    // Enable console log capture
    webPage.on('console', msg => console.log('BROWSER LOG:', msg.text()));

    console.log('Navigating to http://aurastring.cloud/zh-CN...');
    await webPage.goto('http://aurastring.cloud/zh-CN', { waitUntil: 'networkidle2' });

    console.log('Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const currentUrl = webPage.url();
    console.log(`Current URL: ${currentUrl}`);

    const localStorageData = await webPage.evaluate(() => {
      return { ...localStorage };
    });
    console.log('Local Storage:', JSON.stringify(localStorageData, null, 2));

    const screenshotPath = `C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\aurastring_home.png`;
    await webPage.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
  } catch (err) {
    console.error(err);
  }
})();
