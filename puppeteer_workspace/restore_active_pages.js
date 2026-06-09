const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    console.log('Connected to Chrome. Restoring active pages...');

    const pages = await browser.pages();
    const tab0 = pages[0] || await browser.newPage();
    
    // Tab 0 -> Tencent Cloud Login/Console
    console.log('Navigating Tab 0 to Tencent Cloud Login...');
    await tab0.goto('https://cloud.tencent.com/login', { waitUntil: 'domcontentloaded' }).catch(() => {});

    // Tab 1 -> aurastring.cloud/login
    console.log('Creating Tab 1 for aurastring.cloud/login...');
    const tab1 = await browser.newPage();
    await tab1.goto('http://aurastring.cloud/login', { waitUntil: 'domcontentloaded' }).catch(() => {});

    await browser.disconnect();
    console.log('Active pages restored successfully.');
  } catch (err) {
    console.error('Error during active pages restoration:', err);
  }
})();
