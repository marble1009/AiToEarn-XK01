const puppeteer = require('puppeteer-core');
(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    const testPage = await browser.newPage();
    
    console.log('Navigating...');
    try {
      await testPage.goto('http://aurastring.cloud', { waitUntil: 'commit', timeout: 5000 });
    } catch (e) {
      console.log('Timeout');
    }
    
    await new Promise(r => setTimeout(r, 6000));
    
    const info = await testPage.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        bodyHtml: document.body ? document.body.innerHTML : 'No body element'
      };
    });
    console.log('--- Page Info ---');
    console.log(JSON.stringify(info, null, 2));
    console.log('------------------');
    
    await testPage.close();
    await browser.disconnect();
  } catch (err) {
    console.error(err);
  }
})();
