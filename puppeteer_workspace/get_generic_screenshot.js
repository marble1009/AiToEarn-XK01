const puppeteer = require('puppeteer-core');
(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    if (pages.length > 0) {
      const spath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\current_page.png';
      await pages[0].screenshot({ path: spath });
      console.log('Screenshot of page[0] saved to:', spath);
    }
    await browser.disconnect();
  } catch (err) {
    console.error(err);
  }
})();
