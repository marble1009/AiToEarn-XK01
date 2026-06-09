const puppeteer = require('puppeteer-core');

(async () => {
  try {
    console.log('🔌 Connecting to Chrome debugger...');
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const page = pages[0];
    if (!page) {
      throw new Error('❌ Tab not found!');
    }

    console.log('🧹 Disabling cache & clearing network cache...');
    await page.setCacheEnabled(false);
    
    // Clear cookies and cache via CDP
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await client.send('Network.clearBrowserCache');

    console.log('🌐 Navigating to http://aurastring.cloud/ with hard reload...');
    await page.goto('http://aurastring.cloud/?t=' + Date.now(), { waitUntil: 'networkidle0', timeout: 30000 });
    
    console.log('⏳ Waiting 5 seconds for hydration...');
    await new Promise(r => setTimeout(r, 5000));

    await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\force_welcome_fresh.png' });
    console.log('📸 Saved screenshot to scratch/force_welcome_fresh.png');

    await browser.disconnect();
    console.log('✨ Done!');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
