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
    }

    await browser.disconnect();
  } catch (err) {
    console.error('Error connecting to Chrome:', err);
  }
})();
