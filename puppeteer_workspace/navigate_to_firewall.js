const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    // Locate the tab that was on tencent cloud domain
    const page = pages.find(p => p.url().includes('cloud.tencent.com'));

    if (!page) {
      console.error('❌ Tencent Cloud tab not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔌 Connected! Current URL: ${page.url()}`);
    await page.bringToFront();

    const scratchDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5\\scratch';

    // Click the server "aiautoedit"
    console.log('Searching for "aiautoedit" link/element and clicking it...');
    const clickResult = await page.evaluate(() => {
      // Look for any element that has text "aiautoedit"
      const elements = Array.from(document.querySelectorAll('*'));
      const aiautoeditElement = elements.find(el => {
        if (el.children.length > 0) return false; // leaf element
        return el.innerText && el.innerText.trim() === 'aiautoedit';
      });

      if (aiautoeditElement) {
        // Find nearest clickable parent or click the element itself
        let clickTarget = aiautoeditElement;
        clickTarget.click();
        return { clicked: true, tagName: clickTarget.tagName, text: clickTarget.innerText };
      }
      return { clicked: false };
    });

    console.log('Click server result:', JSON.stringify(clickResult));

    if (!clickResult.clicked) {
      console.log('❌ Could not click "aiautoedit" automatically. Taking screenshot for diagnosis.');
      await page.screenshot({ path: path.join(scratchDir, 'click_error.png') });
      await browser.disconnect();
      return;
    }

    console.log('⏳ Waiting 6 seconds for instance detail page to load...');
    await new Promise(r => setTimeout(r, 6000));

    // Take screenshot of the detail page
    const detailScreenshotPath = path.join(scratchDir, 'instance_detail.png');
    await page.screenshot({ path: detailScreenshotPath });
    console.log(`📸 Detail page screenshot saved to: ${detailScreenshotPath}`);

    // Try to find and click "防火墙" tab
    console.log('Searching for "防火墙" tab and clicking it...');
    const firewallClickResult = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const firewallTab = elements.find(el => {
        if (el.children.length > 0) return false;
        return el.innerText && el.innerText.trim() === '防火墙';
      });

      if (firewallTab) {
        firewallTab.click();
        return { clicked: true, tagName: firewallTab.tagName };
      }
      return { clicked: false };
    });

    console.log('Click firewall tab result:', JSON.stringify(firewallClickResult));

    if (firewallClickResult.clicked) {
      console.log('⏳ Waiting 4 seconds for firewall tab to load...');
      await new Promise(r => setTimeout(r, 4000));
      
      const firewallScreenshotPath = path.join(scratchDir, 'firewall_detail.png');
      await page.screenshot({ path: firewallScreenshotPath });
      console.log(`📸 Firewall tab screenshot saved to: ${firewallScreenshotPath}`);
    } else {
      console.log('❌ Could not click "防火墙" tab automatically.');
    }

    await browser.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err);
  }
})();
