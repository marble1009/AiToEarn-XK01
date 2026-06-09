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

    const mainFrame = page.frames().find(f => f.name() === 'mainFrame');
    if (!mainFrame) {
      console.error('❌ mainFrame not found!');
      await browser.disconnect();
      return;
    }

    // Click "生成新密码" in mainFrame
    const clicked = await mainFrame.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const genLink = links.find(l => l.innerText.trim() === '生成新密码');
      if (genLink) {
        genLink.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      console.log('✅ Clicked "生成新密码" link. Waiting for 3 seconds...');
      await new Promise(r => setTimeout(r, 3000));
    } else {
      console.error('❌ Could not find "生成新密码" link!');
    }

    // Capture screenshot
    const screenshotPath = path.join(artifactDir, 'scratch', 'exmail_generate_clicked.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    // Check if there are any new popups or frames or dialogs
    const frames = page.frames();
    console.log(`Currently there are ${frames.length} frames.`);
    for (let i = 0; i < frames.length; i++) {
      const f = frames[i];
      console.log(`Frame [${i}] name: "${f.name()}" URL: ${f.url()}`);
      try {
        const text = await f.evaluate(() => document.body.innerText);
        if (text && text.includes('密码') && text.length < 5000) {
          console.log(`--- Text in Frame [${i}] ---`);
          console.log(text.substring(0, 1000));
          console.log('----------------------------');
        }
      } catch (e) {
        // ignore
      }
    }

    // Check parent document as well for dialogs
    const parentText = await page.evaluate(() => document.body.innerText);
    console.log('=== Parent Page Text ===');
    console.log(parentText.substring(0, 1000));
    console.log('========================');

    await browser.disconnect();
    console.log('🎉 Done.');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
