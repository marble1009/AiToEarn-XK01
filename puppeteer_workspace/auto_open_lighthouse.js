const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    // Locate the tab that was on tencent cloud domain
    const targetPage = pages.find(p => p.url().includes('cloud.tencent.com'));

    if (!targetPage) {
      console.error('❌ Tencent Cloud tab not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔌 Connected! Current URL: ${targetPage.url()}`);
    await targetPage.bringToFront();

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';

    // 1. Try navigating directly to Lighthouse (Lightweight Application Server) Console
    console.log('🌐 Directing Tab to Lighthouse Console...');
    await targetPage.goto('https://console.cloud.tencent.com/lighthouse', { waitUntil: 'domcontentloaded' }).catch(() => {});
    
    console.log('⏳ Waiting 8 seconds for instances list to load asynchronous elements...');
    await new Promise(r => setTimeout(r, 8000));

    // Capture screenshot of Lighthouse console
    const lighthousePath = path.join(artifactDir, 'lighthouse_console_state.png');
    await targetPage.screenshot({ path: lighthousePath });
    console.log(`📸 Lighthouse state screenshot saved to: ${lighthousePath}`);

    // Try to find a clickable link/button with text "登录" or "连接"
    const clickedLighthouse = await targetPage.evaluate(() => {
      // Find "登录" button
      const loginBtn = Array.from(document.querySelectorAll('*')).find(x => {
        if (x.children.length > 0) return false;
        return x.innerText && (x.innerText.trim() === '登录' || x.innerText.trim() === '远程连接' || x.innerText.trim() === 'WebShell');
      });
      if (loginBtn) {
        loginBtn.click();
        return { clicked: true, text: loginBtn.innerText.trim(), tagName: loginBtn.tagName };
      }
      return { clicked: false };
    });
    console.log('Lighthouse auto-click result:', JSON.stringify(clickedLighthouse, null, 2));

    if (clickedLighthouse.clicked) {
      console.log('🎉 Clicked login button in Lighthouse Console successfully!');
      await new Promise(r => setTimeout(r, 5000));
      await browser.disconnect();
      return;
    }

    // 2. If Lighthouse login wasn't clicked, try standard CVM Console!
    console.log('🌐 Directing Tab to CVM Instance Console...');
    await targetPage.goto('https://console.cloud.tencent.com/cvm/instance', { waitUntil: 'domcontentloaded' }).catch(() => {});
    
    console.log('⏳ Waiting 8 seconds for CVM instances list...');
    await new Promise(r => setTimeout(r, 8000));

    const cvmPath = path.join(artifactDir, 'cvm_console_state.png');
    await targetPage.screenshot({ path: cvmPath });
    console.log(`📸 CVM state screenshot saved to: ${cvmPath}`);

    const clickedCvm = await targetPage.evaluate(() => {
      const loginBtn = Array.from(document.querySelectorAll('*')).find(x => {
        if (x.children.length > 0) return false;
        return x.innerText && (x.innerText.trim() === '登录' || x.innerText.trim() === '远程连接');
      });
      if (loginBtn) {
        loginBtn.click();
        return { clicked: true, text: loginBtn.innerText.trim(), tagName: loginBtn.tagName };
      }
      return { clicked: false };
    });
    console.log('CVM auto-click result:', JSON.stringify(clickedCvm, null, 2));

    if (clickedCvm.clicked) {
      console.log('🎉 Clicked login button in CVM Console successfully!');
      await new Promise(r => setTimeout(r, 5000));
    }

    await browser.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error during auto terminal opening:', err);
  }
})();
