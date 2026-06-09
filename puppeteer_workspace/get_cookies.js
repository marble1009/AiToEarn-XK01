const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const page = pages[0];
    
    const cookies = await page.cookies();
    console.log('--- Page Cookies ---');
    console.log(JSON.stringify(cookies, null, 2));
    console.log('--------------------');

    await browser.disconnect();
  } catch (err) {
    console.error(err);
  }
})();
