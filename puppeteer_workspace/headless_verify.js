const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('🌐 Start headless E2E verification of clean URLs...');
  const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true, // 100% headless! Completely invisible to the user!
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      defaultViewport: { width: 1280, height: 800 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setCacheEnabled(false); // Disable cache for fresh checks
    
    // 1. Check anonymous visit to "/"
    console.log('Checking http://aurastring.cloud/ ...');
    await page.goto('http://aurastring.cloud/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000));
    
    let url = page.url();
    console.log('Current URL for root:', url);
    
    const rootScreenshot = path.join(artifactsDir, 'quick_test_root.png');
    await page.screenshot({ path: rootScreenshot });
    console.log(`Screenshot saved to: ${rootScreenshot}`);
    
    // 2. Check anonymous visit to "/login"
    console.log('Checking http://aurastring.cloud/login ...');
    await page.goto('http://aurastring.cloud/login', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000));
    
    url = page.url();
    console.log('Current URL for login:', url);
    
    const loginScreenshot = path.join(artifactsDir, 'quick_test_login.png');
    await page.screenshot({ path: loginScreenshot });
    console.log(`Screenshot saved to: ${loginScreenshot}`);
    
    console.log('🎉 Headless verification completed.');
    await browser.close();
  } catch (err) {
    console.error('❌ Error during verification:', err);
    if (browser) await browser.close();
  }
})();
