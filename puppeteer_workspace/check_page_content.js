const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const page = pages[0];
    const textContent = await page.evaluate(() => document.body.innerText);
    console.log('--- Page inner text ---');
    console.log(textContent.substring(0, 1000));
    console.log('-----------------------');

    await browser.disconnect();
  } catch (err) {
    console.error(err);
  }
})();
