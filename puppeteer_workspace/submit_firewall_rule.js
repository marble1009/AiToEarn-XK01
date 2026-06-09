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

    console.log('Filling in the firewall rule details...');
    const fillResult = await page.evaluate(() => {
      // Find inputs by placeholder
      const portInput = Array.from(document.querySelectorAll('input')).find(
        input => input.placeholder === '如53,80,443或80-90'
      );
      const remarkInput = Array.from(document.querySelectorAll('input')).find(
        input => input.placeholder === '可输入60个字符'
      );

      if (!portInput) {
        return { success: false, error: 'Port input not found' };
      }

      // Enter value into port input
      portInput.value = '80,443,9010';
      // Trigger change and input events
      portInput.dispatchEvent(new Event('input', { bubbles: true }));
      portInput.dispatchEvent(new Event('change', { bubbles: true }));

      if (remarkInput) {
        remarkInput.value = 'HTTP, HTTPS, RustFS';
        remarkInput.dispatchEvent(new Event('input', { bubbles: true }));
        remarkInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      return { success: true };
    });

    console.log('Fill result:', JSON.stringify(fillResult));

    if (!fillResult.success) {
      console.error('❌ Failed to fill the form:', fillResult.error);
      await browser.disconnect();
      return;
    }

    console.log('⏳ Waiting 1 second...');
    await new Promise(r => setTimeout(r, 1000));

    // Capture screenshot of filled dialog
    const filledScreenshotPath = path.join(scratchDir, 'filled_rule_dialog.png');
    await page.screenshot({ path: filledScreenshotPath });
    console.log(`📸 Screenshot of filled dialog saved to: ${filledScreenshotPath}`);

    // Click the "确定" (OK) button
    console.log('Clicking the "确定" (OK) button...');
    const clickOkResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const okBtn = buttons.find(btn => btn.innerText && btn.innerText.trim() === '确定');

      if (okBtn) {
        okBtn.click();
        return { success: true, text: okBtn.innerText.trim() };
      }
      return { success: false, error: 'OK button not found' };
    });

    console.log('Click OK result:', JSON.stringify(clickOkResult));

    if (!clickOkResult.success) {
      console.error('❌ Failed to click OK button:', clickOkResult.error);
      await browser.disconnect();
      return;
    }

    console.log('⏳ Waiting 8 seconds for the rules to be applied...');
    await new Promise(r => setTimeout(r, 8000));

    // Capture final firewall table screenshot
    const finalScreenshotPath = path.join(scratchDir, 'final_firewall_state.png');
    await page.screenshot({ path: finalScreenshotPath });
    console.log(`📸 Final firewall state saved to: ${finalScreenshotPath}`);

    await browser.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err);
  }
})();
