const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

(async () => {
  let browser;
  try {
    console.log('🔌 Connecting to Chrome debugger...');
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    
    console.log('📸 Capturing active pages...');
    const pages = await browser.pages();
    
    // 找出 OrcaTerm 选项卡
    let orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
    if (orcaPage) {
      console.log('🎯 Found OrcaTerm tab!');
      await orcaPage.bringToFront();
      const screenshotPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\current_orca_status.png';
      await orcaPage.screenshot({ path: screenshotPath });
      console.log(`✅ Screenshot saved to: ${screenshotPath}`);
    } else {
      console.log('❌ OrcaTerm tab not found.');
      // 截一张当前第一个 page 的图
      if (pages.length > 0) {
        const screenshotPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\current_chrome_page.png';
        await pages[0].screenshot({ path: screenshotPath });
        console.log(`✅ Screenshot of first tab saved to: ${screenshotPath}`);
      }
    }
    
    await browser.disconnect();
  } catch (err) {
    console.error('❌ Failed to capture screenshot:', err);
  }
})();
