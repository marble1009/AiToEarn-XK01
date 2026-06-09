const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  let browser;
  try {
    console.log('🔌 Connecting to Chrome debugger...');
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    
    console.log('🌐 Opening a new tab to capture Hub page...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    
    // Navigate to Hub
    console.log('导航到 Hub 页面...');
    await page.goto('http://aurastring.cloud/zh-CN/hub', { waitUntil: 'networkidle2', timeout: 15000 });
    
    console.log('等待 5 秒进行渲染...');
    await new Promise(r => setTimeout(r, 5000));
    
    const screenshotPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\verify_hub_bento.png';
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Hub 页面截图已成功保存到: ${screenshotPath}`);
    
    await browser.disconnect();
  } catch (err) {
    console.error('❌ 截图捕获失败:', err);
    if (browser) await browser.disconnect();
  }
})();
