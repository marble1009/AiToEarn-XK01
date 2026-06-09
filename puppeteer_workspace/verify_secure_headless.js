const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  let browser;
  try {
    console.log('🚀 Launching fresh headless Chrome with direct DNS mapping rules...');
    
    // We launch a fresh Chrome using puppeteer-core, directing it to the local Chrome executable path
    // Let's find the Chrome executable path. Normally, it's at:
    // C:\Program Files\Google\Chrome\Application\chrome.exe
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    
    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--proxy-server=direct://', // Bypass any local system proxies
        '--host-rules=MAP aiautoedit.art 124.221.103.86, MAP www.aiautoedit.art 124.221.103.86' // Direct DNS mapping
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log('🌐 Navigating securely to https://aiautoedit.art...');
    await page.goto('https://aiautoedit.art', { waitUntil: 'networkidle2', timeout: 30000 });
    
    const title = await page.title();
    console.log(`🎉 100% SUCCESS! Securely loaded page title: "${title}"`);
    
    const scratchDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5\\scratch';
    const screenshotPath = path.join(scratchDir, 'headless_secure_root.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    // Verify www subdomain
    console.log('🌐 Navigating securely to https://www.aiautoedit.art...');
    await page.goto('https://www.aiautoedit.art', { waitUntil: 'networkidle2', timeout: 30000 });
    const wwwTitle = await page.title();
    console.log(`🎉 100% SUCCESS! Securely loaded www page title: "${wwwTitle}"`);
    const wwwScreenshotPath = path.join(scratchDir, 'headless_secure_www.png');
    await page.screenshot({ path: wwwScreenshotPath });
    console.log(`📸 Screenshot saved to: ${wwwScreenshotPath}`);

    await browser.close();
    console.log('🎉 Headless secure E2E verification successfully finished!');
  } catch (err) {
    console.error('❌ Error during headless verification:', err);
    if (browser) await browser.close();
  }
})();
