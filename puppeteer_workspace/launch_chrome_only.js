const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const profileDir = 'C:\\Users\\Admin\\Desktop\\github\\aiautoedit\\puppeteer_workspace\\chrome-debug-profile';
  
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }

  console.log('🚀 Launching GUI Chrome with user profile to preserve all login sessions...');
  try {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      defaultViewport: null,
      args: [
        '--start-maximized', 
        '--remote-debugging-port=9222', 
        `--user-data-dir=${profileDir}`,
        '--no-first-run',
        '--no-default-browser-check'
      ]
    });
    console.log('🎉 Chrome launched successfully on port 9222!');
    
    const pages = await browser.pages();
    const page = pages[0];
    console.log('Navigating to DNS records page...');
    await page.goto('https://console.cloud.tencent.com/cns/detail/aiautoedit.art/records', { waitUntil: 'networkidle2' }).catch(() => {});
    
    // Wait forever (10 hours) to keep Chrome alive
    await new Promise(r => setTimeout(r, 36000000));
  } catch (err) {
    console.error('❌ Failed to launch Chrome:', err);
    process.exit(1);
  }
})();
