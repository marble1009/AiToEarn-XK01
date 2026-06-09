const puppeteer = require('puppeteer-core');

(async () => {
  try {
    console.log('🔌 Connecting to Chrome debugger...');
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    // Locate OrcaTerm page
    const page = pages.find(p => p.url().includes('orcaterm') || p.url().includes('terminal'));

    if (!page) {
      throw new Error('❌ Active terminal tab not found!');
    }

    console.log('🎯 Found terminal tab! Clicking Reconnect...');
    
    // Click button with text "重新连接"
    const clickResult = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, div, span'));
      const reconnectBtn = btns.find(x => x.innerText && x.innerText.trim() === '重新连接');
      if (reconnectBtn) {
        reconnectBtn.click();
        return { success: true, tagName: reconnectBtn.tagName };
      }
      return { success: false };
    });

    console.log('Click result:', JSON.stringify(clickResult, null, 2));

    console.log('⏳ Waiting 8 seconds for terminal reconnection...');
    await new Promise(r => setTimeout(r, 8000));

    await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\after_reconnect_popup_click.png' });
    console.log('📸 Saved screenshot to scratch/after_reconnect_popup_click.png');

    await browser.disconnect();
    console.log('✨ Done!');
  } catch (err) {
    console.error('❌ Error during clicking reconnect popup:', err);
  }
})();
