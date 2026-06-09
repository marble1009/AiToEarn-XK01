const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('🚀 Connecting to Chrome...');
  const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';

  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    let page = pages.find(p => p.url().includes('exmail') || p.url().includes('work.weixin'));
    if (!page) {
      console.error('❌ Exmail page not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔗 Connected to page: ${page.url()}`);
    await page.bringToFront();

    // Click "确定" button (id: QMconfirm_s_confirm) on the main page/frame
    const clicked = await page.evaluate(() => {
      const btn = document.getElementById('QMconfirm_s_confirm');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      console.log('✅ Clicked "确定" button to close the password dialog. Waiting for 3 seconds...');
      await new Promise(r => setTimeout(r, 3000));
    } else {
      console.error('❌ Could not find "确定" button with id QMconfirm_s_confirm!');
    }

    // Capture screenshot
    const screenshotPath = path.join(artifactDir, 'scratch', 'exmail_dialog_finalized.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
    console.log('🎉 Done.');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
