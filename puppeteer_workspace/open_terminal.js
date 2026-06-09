const puppeteer = require('puppeteer-core');

(async () => {
  let browser;
  try {
    console.log('🔌 Connecting to Chrome debugger...');
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    
    console.log('🌐 Opening OrcaTerm console tab...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to OrcaTerm
    const url = 'https://orcaterm.cloud.tencent.com/terminal?type=lighthouse&instanceId=lhins-1ffo71cw&region=ap-shanghai&from=lh_console_login_btn';
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log('🎉 OrcaTerm tab opened successfully. Waiting for session...');
    
    await new Promise(r => setTimeout(r, 6000));
    await browser.disconnect();
  } catch (err) {
    console.error('❌ Failed to open terminal:', err);
    if (browser) await browser.disconnect();
  }
})();
