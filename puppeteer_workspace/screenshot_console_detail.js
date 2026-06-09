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
      console.error('❌ Tencent Cloud Console (Lighthouse) tab not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔌 Connected to console! Page Title: ${await consolePage.title()}`);
    await consolePage.bringToFront();
    await new Promise(r => setTimeout(r, 2000));

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    const detailPath = path.join(artifactDir, 'scratch\\tencent_console_detail.png');
    await consolePage.screenshot({ path: detailPath });
    console.log(`📸 Detail page screenshot saved to: ${detailPath}`);

    // Let's also scan for elements containing "登录" or "连接" to find the real terminal login button
    const buttons = await consolePage.evaluate(() => {
      const items = Array.from(document.querySelectorAll('a, button, span, div'));
      return items
        .map(el => ({
          tag: el.tagName,
          text: (el.innerText || el.textContent || '').trim(),
          className: el.className
        }))
        .filter(x => x.text.includes('登录') || x.text.includes('连接') || x.text.includes('远程'));
    });

    console.log('🔍 Found elements related to Login/Connect in Detail Page:', JSON.stringify(buttons, null, 2));

    await browser.disconnect();
    console.log('🎉 Done.');
  } catch (err) {
    console.error('❌ Error:', err);
    if (browser) await browser.disconnect();
  }
})();
