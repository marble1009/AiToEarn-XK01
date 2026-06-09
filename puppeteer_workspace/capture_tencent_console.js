const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    // 寻找包含 console.cloud.tencent.com 的页面
    let page = pages[0];
    for (const p of pages) {
      const url = p.url();
      if (url.includes('tencent') || url.includes('cloud')) {
        page = p;
        break;
      }
    }

    const title = await page.title();
    const url = page.url();
    console.log('==================================================');
    console.log('✨ 腾讯云控制台同步成功！');
    console.log(`🔗 当前页面 URL: ${url}`);
    console.log(`📝 当前页面标题: ${title}`);
    console.log('==================================================');

    const screenshotPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5\\scratch\\tencent_console.png';
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 控制台实时截图已成功保存至: ${screenshotPath}`);

    await browser.disconnect();
  } catch (err) {
    console.error('Failed to sync Tencent Cloud page:', err.message);
  }
})();
