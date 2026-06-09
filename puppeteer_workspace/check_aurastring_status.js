const puppeteer = require('puppeteer-core');

(async () => {
  let browser;
  try {
    console.log('🔌 Connecting to Chrome on 9222...');
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const page = await browser.newPage();
    console.log('🌐 Navigating to http://aurastring.cloud/login ...');
    
    let response;
    try {
      response = await page.goto('http://aurastring.cloud/login', { waitUntil: 'domcontentloaded', timeout: 8000 });
      console.log(`📡 HTTP Status Code: ${response ? response.status() : 'No response'}`);
      console.log(`📄 Page Title: ${await page.title()}`);
    } catch (e) {
      console.log('⚠️ Navigation failed or timed out:', e.message);
    }

    await page.close();
    await browser.disconnect();
    console.log('🎉 Check done.');
  } catch (err) {
    console.error('❌ Error:', err);
    if (browser) await browser.disconnect();
  }
})();
