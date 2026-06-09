const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    console.log(`Connected to Chrome. Found ${pages.length} pages.`);

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const url = page.url();
      const title = await page.title();
      console.log(`Page ${i}: URL="${url}", Title="${title}"`);

      // Let's take a screenshot of the first visible web page
      if (url.startsWith('http') && !url.includes('devtools')) {
        const screenshotPath = `C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\screenshot_${i}.png`;
        await page.screenshot({ path: screenshotPath });
        console.log(`Screenshot saved to: ${screenshotPath}`);
      }
    }

    await browser.disconnect();
  } catch (err) {
    console.error('Error connecting to Chrome:', err);
  }
})();
