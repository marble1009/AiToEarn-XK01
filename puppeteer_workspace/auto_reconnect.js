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

    // Try to click "重新连接" or "重连并托管" button
    console.log('🖱️ Clicking Reconnect button in OrcaTerm...');
    const clicked = await terminalPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const reconnectBtn = btns.find(b => b.textContent.includes('重新连接') || 
                                           b.textContent.includes('重连') ||
                                           b.textContent.includes('Reconnect'));
      if (reconnectBtn) {
        reconnectBtn.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      console.log('✅ Reconnect button clicked successfully! Waiting 10 seconds for session recovery...');
      await new Promise(r => setTimeout(r, 10000));
    } else {
      console.log('⚠️ Reconnect button not found. Maybe session is already active or selectors differ.');
    }

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    const screenshotPath = path.join(artifactDir, 'scratch', 'reconnect_status.png');
    await terminalPage.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);

    await browser.disconnect();
  } catch (err) {
    console.error('❌ Error during auto_reconnect:', err);
  }
})();
