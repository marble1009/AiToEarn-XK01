const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  let browser;
  try {
    console.log('🔌 Connecting to Chrome on 9222...');
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const scratchDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5\\scratch';
    
    // 1. Verify aiautoedit.art
    console.log('🌐 Navigating to https://aiautoedit.art...');
    const page1 = await browser.newPage();
    await page1.goto('https://aiautoedit.art', { waitUntil: 'networkidle2' });
    console.log(`🎉 Title for aiautoedit.art: "${await page1.title()}"`);
    const path1 = path.join(scratchDir, 'verify_secure_root.png');
    await page1.screenshot({ path: path1 });
    console.log(`📸 Screenshot saved to: ${path1}`);

    // 2. Verify www.aiautoedit.art
    console.log('🌐 Navigating to https://www.aiautoedit.art...');
    const page2 = await browser.newPage();
    await page2.goto('https://www.aiautoedit.art', { waitUntil: 'networkidle2' });
    console.log(`🎉 Title for www.aiautoedit.art: "${await page2.title()}"`);
    const path2 = path.join(scratchDir, 'verify_secure_www.png');
    await page2.screenshot({ path: path2 });
    console.log(`📸 Screenshot saved to: ${path2}`);

    await browser.disconnect();
    console.log('🎉 Verification complete!');
  } catch (err) {
    console.error('❌ Error during verification:', err);
    if (browser) await browser.disconnect();
  }
})();
