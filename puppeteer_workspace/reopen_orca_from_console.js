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

    console.log(`🔌 Connected to Tencent Console! Title: ${await consolePage.title()}`);
    await consolePage.bringToFront();
    await new Promise(r => setTimeout(r, 2000));

    // Save screenshot of the current console to see its layout
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    const consolePath = path.join(artifactDir, 'scratch\\tencent_console_initial.png');
    await consolePage.screenshot({ path: consolePath });
    console.log(`📸 Initial console screenshot saved to: ${consolePath}`);

    // Try to find the "登录" button inside the console table row
    console.log('🔍 Scanning console page for "登录" or "一键登录" elements...');
    const scanResult = await consolePage.evaluate(() => {
      // Find all elements that might be clickable buttons/links containing 登录
      const elements = Array.from(document.querySelectorAll('a, button, span, div')).filter(el => {
        const text = el.innerText || el.textContent;
        return text && (text.trim() === '登录' || text.trim() === '一键登录');
      });

      if (elements.length > 0) {
        // Let's click the first one that looks like a login link
        const target = elements[0];
        target.click();
        return { success: true, count: elements.length, tag: target.tagName, text: target.innerText };
      }
      return { success: false, allTextLength: document.body.innerText.length };
    });

    console.log('Scan & Click Result:', JSON.stringify(scanResult, null, 2));

    if (scanResult.success) {
      console.log('🎉 Clicked "登录" button on Tencent Console! Waiting 10 seconds for new tab to open...');
      await new Promise(r => setTimeout(r, 10000));

      // Capture all tabs to see if a new OrcaTerm opened
      const currentPages = await browser.pages();
      console.log('=== Current Tabs After Click ===');
      for (let i = 0; i < currentPages.length; i++) {
        console.log(`[Tab ${i}] URL: ${currentPages[i].url()} | Title: ${await currentPages[i].title()}`);
      }
    } else {
      console.log('⚠️ Could not find any "登录" or "一键登录" button in Console DOM.');
    }

    await browser.disconnect();
    console.log('🎉 Reopen logic completed.');
  } catch (err) {
    console.error('❌ Error:', err);
    if (browser) await browser.disconnect();
  }
})();
