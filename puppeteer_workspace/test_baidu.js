const puppeteer = require('puppeteer-core');
(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    const testPage = await browser.newPage();
    
    console.log('Navigating to Baidu...');
    try {
      await testPage.goto('https://www.baidu.com', { waitUntil: 'load', timeout: 8000 });
      console.log('Baidu loaded! URL is:', testPage.url());
    } catch (e) {
      console.error('Baidu failed to load:', e.message);
    }
    
    await testPage.close();
    await browser.disconnect();
  } catch (err) {
    console.error(err);
  }
})();
