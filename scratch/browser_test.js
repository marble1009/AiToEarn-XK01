const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('Connecting to Chrome on port 9222...');
  let browser;
  try {
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
  } catch (err) {
    console.error('Failed to connect to Chrome:', err);
    process.exit(1);
  }

  console.log('Connected successfully. Opening draft-box page...');
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // Navigate to draft box
    await page.goto('https://124.221.103.86/zh/draft-box', { waitUntil: 'networkidle2' });
    console.log('Navigated. Waiting 5s...');
    await new Promise(r => setTimeout(r, 5000));

    // Capture initial screenshot
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }
    
    await page.screenshot({ path: path.join(screenshotDir, '01_initial.png') });
    console.log('Saved 01_initial.png');

    // Find prompt input
    console.log('Typing test prompt...');
    const textareaSelector = 'textarea[data-testid="draftbox-ai-prompt-input"]';
    await page.waitForSelector(textareaSelector, { timeout: 10000 });
    
    // Clear existing text
    await page.click(textareaSelector, { clickCount: 3 });
    await page.keyboard.press('Backspace');
    
    // Type new text
    await page.type(textareaSelector, '哈哈哈，极具性价比的同城爆款火锅店');
    await page.screenshot({ path: path.join(screenshotDir, '02_typed.png') });
    console.log('Saved 02_typed.png');

    // Click optimize button
    console.log('Clicking optimize button...');
    const optimizeBtnSelector = 'button';
    const buttons = await page.$$(optimizeBtnSelector);
    let optimizeBtn;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('智能优化') || text.includes('一键智能优化') || text.includes('优化中')) {
        optimizeBtn = btn;
        break;
      }
    }

    if (!optimizeBtn) {
      throw new Error('Optimize button not found!');
    }

    await optimizeBtn.click();
    console.log('Clicked optimize button. Waiting 8s for stream response...');
    await new Promise(r => setTimeout(r, 8000));

    await page.screenshot({ path: path.join(screenshotDir, '03_optimized.png') });
    console.log('Saved 03_optimized.png');

    // Read the optimized prompt value
    const optimizedValue = await page.evaluate(el => el.value, await page.$(textareaSelector));
    console.log('Optimized prompt result:', optimizedValue);

    console.log('Test completed successfully!');
  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    await page.close();
    await browser.disconnect();
  }
}

run();
