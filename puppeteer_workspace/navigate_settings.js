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

    // Get the href of "设置" in the main document
    const href = await page.evaluate(() => {
      const settingsLink = Array.from(document.querySelectorAll('a')).find(el => el.textContent.trim() === '设置');
      return settingsLink ? settingsLink.getAttribute('href') : null;
    });

    if (!href) {
      console.error('❌ Could not find settings link href!');
      await browser.disconnect();
      return;
    }

    const settingsUrl = 'https://exmail.qq.com' + href;
    console.log(`➡️ Navigating directly to: ${settingsUrl}`);
    await page.goto(settingsUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    await new Promise(r => setTimeout(r, 3000));

    const screenshotPath = path.join(artifactDir, 'scratch', 'settings_direct.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
    console.log('🎉 Done.');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
