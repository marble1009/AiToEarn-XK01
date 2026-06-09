const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes('cloud.tencent.com'));

    if (!page) {
      console.error('❌ Tencent Cloud tab not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔌 Connected! Current URL: ${page.url()}`);
    await page.bringToFront();

    const scratchDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5\\scratch';

    console.log('Clicking the "解析" button for aiautoedit.art...');
    const clickResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const parseBtn = buttons.find(btn => btn.innerText && btn.innerText.trim() === '解析');

      if (parseBtn) {
        parseBtn.click();
        return { success: true, tagName: parseBtn.tagName };
      }
      return { success: false, error: 'Parse button not found' };
    });

    console.log('Click result:', JSON.stringify(clickResult));

    if (clickResult.success) {
      console.log('⏳ Waiting 6 seconds for the DNS records page to load...');
      await new Promise(r => setTimeout(r, 6000));
      
      const recordsScreenshotPath = path.join(scratchDir, 'dns_records_detail.png');
      await page.screenshot({ path: recordsScreenshotPath });
      console.log(`📸 DNS Records screenshot saved to: ${recordsScreenshotPath}`);
    } else {
      console.error('❌ Could not click "解析" button.');
    }

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
