const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    console.log('🔌 Connecting to Chrome debugger...');
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    let terminalPage = null;

    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const url = p.url();
      
      if (url.includes('orcaterm') || url.includes('webshell') || url.includes('terminal')) {
        terminalPage = p;
        break;
      }
    }

    if (!terminalPage) {
      throw new Error('❌ Active terminal tab not found!');
    }

    console.log(`🎯 Using terminal tab: ${terminalPage.url()}`);
    await terminalPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

    // Try to click "立即刷新" or "重新连接"
    console.log('🖱️ Clicking Refresh/Reconnect button in OrcaTerm...');
    const clicked = await terminalPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, div, span'));
      const refreshBtn = btns.find(b => b.textContent && (
        b.textContent.includes('立即刷新') || 
        b.textContent.includes('重新连接') || 
        b.textContent.includes('重连')
      ));
      if (refreshBtn) {
        refreshBtn.click();
        return { clicked: true, text: refreshBtn.textContent.trim() };
      }
      return { clicked: false };
    });

    console.log('Click Result:', JSON.stringify(clicked, null, 2));

    if (clicked.clicked) {
      console.log('✅ Reconnect/Refresh button clicked! Waiting 12 seconds for page reload...');
      await new Promise(r => setTimeout(r, 12000));
    } else {
      console.log('⚠️ Reconnect/Refresh button not found. Taking screenshot to diagnose...');
    }

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    const screenshotPath = path.join(artifactDir, 'scratch', 'reconnect_after_refresh.png');
    await terminalPage.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);

    await browser.disconnect();
  } catch (err) {
    console.error('❌ Error during auto_reconnect:', err);
  }
})();
