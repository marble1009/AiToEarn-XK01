const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  let browser;
  try {
    console.log('🔌 Connecting to Chrome on 9222...');
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const consolePage = pages.find(p => p.url().includes('console.cloud.tencent.com/lighthouse'));

    if (!consolePage) {
      console.error('❌ Tencent Cloud Console tab not found!');
      await browser.disconnect();
      return;
    }

    console.log('⏳ Starting loop to wait for password reset task to finish...');
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';

    for (let attempt = 1; attempt <= 10; attempt++) {
      console.log(`🔄 Attempt ${attempt}: Refreshing and checking status...`);
      await consolePage.reload({ waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 4000));

      const statusInfo = await consolePage.evaluate(() => {
        const bodyText = document.body.innerText;
        const isResetting = bodyText.includes('重置实例密码') || bodyText.includes('重置中');
        const isRunning = bodyText.includes('运行中');
        return { isResetting, isRunning };
      });

      console.log('Current status:', JSON.stringify(statusInfo));

      if (statusInfo.isRunning && !statusInfo.isResetting) {
        console.log('🎉 Reset password task completed! The instance is back online in RUNNING status.');
        const finalPath = path.join(artifactDir, 'scratch\\reset_completed_status.png');
        await consolePage.screenshot({ path: finalPath });
        console.log(`📸 Screenshot saved to: ${finalPath}`);
        break;
      }

      console.log('⏳ Still resetting. Waiting 10 seconds...');
      await new Promise(r => setTimeout(r, 10000));
    }

    await browser.disconnect();
    console.log('🎉 Loop finished.');
  } catch (err) {
    console.error('❌ Error in wait loop:', err);
    if (browser) await browser.disconnect();
  }
})();
