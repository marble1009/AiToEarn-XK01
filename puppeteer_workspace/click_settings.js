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

    // We search all frames and the main document for the "设置" link
    await page.evaluate(() => {
      function findAndClick(doc) {
        const links = Array.from(doc.querySelectorAll('a, span, div'));
        const settingsLink = links.find(el => el.textContent.trim() === '设置');
        if (settingsLink) {
          settingsLink.click();
          return true;
        }
        return false;
      }

      // Try main document first
      if (findAndClick(document)) {
        console.log('Clicked in main document');
        return;
      }

      // Try iframes
      const frames = Array.from(document.querySelectorAll('iframe'));
      for (const frame of frames) {
        try {
          const doc = frame.contentDocument || frame.contentWindow.document;
          if (findAndClick(doc)) {
            console.log('Clicked in iframe: ' + frame.id);
            return;
          }
        } catch (e) {
          // ignore cross-origin errors if any
        }
      }
    });

    await new Promise(r => setTimeout(r, 2000));

    const screenshotPath = path.join(artifactDir, 'scratch', 'exmail_settings.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
    console.log('🎉 Done.');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
