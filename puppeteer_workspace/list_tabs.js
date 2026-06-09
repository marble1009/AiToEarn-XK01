const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    console.log('=== Active Tabs ===');
    for (let i = 0; i < pages.length; i++) {
      console.log(`[Tab ${i}] URL: ${pages[i].url()} | Title: ${await pages[i].title()}`);
    }
    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
