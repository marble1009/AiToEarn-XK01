const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    console.log(`Connected. Found ${pages.length} pages.`);

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const url = page.url();
      const title = await page.title();
      console.log(`Tab ${i}: URL="${url}", Title="${title}"`);

      const spath = path.join(artifactDir, `tab_${i}_screenshot.png`);
      await page.screenshot({ path: spath });
      console.log(`Saved screenshot of Tab ${i} to: ${spath}`);
    }

    await browser.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error during all tabs screenshot:', err);
  }
})();
