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

    // Click cancel first just in case there is a stale dialog or click the inputs to clear them
    console.log('Clearing and entering values using page.type...');
    
    // We will find the inputs by their placeholders using page.evaluate to get unique identifiers or selectors, or click them
    // Let's use evaluate to find the index or clear them, or we can just use element handles.
    
    // Wait, let's click the port input and type into it
    const inputs = await page.$$('input');
    let portInputHandle = null;
    let remarkInputHandle = null;
    
    for (const input of inputs) {
      const placeholder = await page.evaluate(el => el.placeholder, input);
      if (placeholder === '如53,80,443或80-90') {
        portInputHandle = input;
      } else if (placeholder === '可输入60个字符') {
        remarkInputHandle = input;
      }
    }
    
    if (!portInputHandle) {
      console.error('❌ Port input handle not found!');
      await browser.disconnect();
      return;
    }
    
    // Focus, select all, and type for port
    console.log('Typing port values...');
    await portInputHandle.focus();
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await portInputHandle.type('80,443,9010');
    
    if (remarkInputHandle) {
      console.log('Typing remark...');
      await remarkInputHandle.focus();
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyA');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
      await remarkInputHandle.type('HTTP, HTTPS, RustFS');
    }
    
    console.log('⏳ Waiting 1 second...');
    await new Promise(r => setTimeout(r, 1000));
    
    const typedScreenshotPath = path.join(scratchDir, 'typed_rule_dialog.png');
    await page.screenshot({ path: typedScreenshotPath });
    console.log(`📸 Screenshot of typed dialog saved to: ${typedScreenshotPath}`);
    
    // Click "确定" button
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
    
    console.log('⏳ Waiting 8 seconds for the rules to be applied...');
    await new Promise(r => setTimeout(r, 8000));
    
    const finalScreenshotPath = path.join(scratchDir, 'final_firewall_state_typed.png');
    await page.screenshot({ path: finalScreenshotPath });
    console.log(`📸 Final firewall state saved to: ${finalScreenshotPath}`);

    await browser.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err);
  }
})();
