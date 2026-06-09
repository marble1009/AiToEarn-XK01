const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const page = pages[0];
    
    const localStorageData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });
    
    console.log('--- LocalStorage Keys and Values ---');
    console.log(JSON.stringify(localStorageData, null, 2));
    console.log('------------------------------------');

    await browser.disconnect();
  } catch (err) {
    console.error(err);
  }
})();
