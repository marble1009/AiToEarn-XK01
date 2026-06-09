const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('Launching headless Chrome with local browser...');
  let browser;
  try {
    let executablePath;
    if (fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')) {
      executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    } else if (fs.existsSync('C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe')) {
      executablePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    }

    browser = await puppeteer.launch({
      headless: "new",
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
      defaultViewport: null
    });
  } catch (err) {
    console.error('Failed to launch Chrome:', err);
    process.exit(1);
  }

  console.log('Connected successfully. Opening login page...');
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1280, height: 800 });

  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  try {
    // Navigate to login page
    await page.goto('https://124.221.103.86/zh-CN/auth/login', { waitUntil: 'networkidle2' });
    console.log('Navigated to login page. Waiting 2s...');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(screenshotDir, '01_login_page.png') });

    // Find input fields on login page
    const inputs = await page.$$('input');
    let emailField, passwordField;
    for (const input of inputs) {
      const placeholder = await page.evaluate(el => el.getAttribute('placeholder'), input);
      const type = await page.evaluate(el => el.getAttribute('type'), input);
      if (type === 'email' || type === 'text' || (placeholder && (placeholder.includes('邮箱') || placeholder.includes('Email') || placeholder.includes('用户名')))) {
        if (!emailField) emailField = input;
      } else if (type === 'password' || (placeholder && (placeholder.includes('密码') || placeholder.includes('Password')))) {
        passwordField = input;
      }
    }

    if (!emailField || !passwordField) {
      throw new Error('Login input fields not found!');
    }

    console.log('Typing login credentials...');
    await emailField.type('test_ps2@example.com');
    await passwordField.type('password123');
    await page.screenshot({ path: path.join(screenshotDir, '02_login_filled.png') });

    // Find submit button for login
    const loginButtons = await page.$$('button');
    let submitBtn;
    for (const btn of loginButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      const type = await page.evaluate(el => el.getAttribute('type'), btn);
      if (type === 'submit' && (text.includes('登录') || text.includes('Login') || text.includes('Sign in'))) {
        submitBtn = btn;
        break;
      }
    }

    if (!submitBtn) {
      throw new Error('Login submit button not found!');
    }

    console.log('Clicking login button...');
    await submitBtn.click();
    console.log('Waiting 5s for login and redirect...');
    await new Promise(r => setTimeout(r, 5000));
    await page.screenshot({ path: path.join(screenshotDir, '03_after_login.png') });

    // Navigate to draft box page
    console.log('Navigating to draft-box...');
    await page.goto('https://124.221.103.86/zh-CN/draft-box', { waitUntil: 'networkidle2' });
    console.log('Navigated. Waiting 5s for dashboard load...');
    await new Promise(r => setTimeout(r, 5000));
    await page.screenshot({ path: path.join(screenshotDir, '05_draft_box_initial.png') });

    // Find prompt input
    console.log('Typing test prompt...');
    const textareaSelector = 'textarea[data-testid="draftbox-ai-prompt-input"]';
    await page.waitForSelector(textareaSelector, { timeout: 10000 });
    
    // Clear and type
    await page.click(textareaSelector, { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type(textareaSelector, '国潮风，复古怀旧，唯美逆光，爆款新品');
    await page.screenshot({ path: path.join(screenshotDir, '06_typed_prompt.png') });
    console.log('Saved 06_typed_prompt.png');

    // Click optimize button
    console.log('Clicking optimize button...');
    const optimizeBtnSelector = 'button';
    const optimizeButtons = await page.$$(optimizeBtnSelector);
    let optimizeBtn;
    for (const btn of optimizeButtons) {
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
    console.log('Clicked optimize button. Waiting 8s for prompt stream response...');
    await new Promise(r => setTimeout(r, 8000));

    await page.screenshot({ path: path.join(screenshotDir, '07_optimized_prompt.png') });
    console.log('Saved 07_optimized_prompt.png');

    // Read the optimized prompt value
    const optimizedValue = await page.evaluate(el => el.value, await page.$(textareaSelector));
    console.log('Optimized prompt result:', optimizedValue);

    // Find generate button
    console.log('Finding generate button...');
    const submitBtnSelector = 'button[data-testid="draftbox-ai-submit-btn"]';
    await page.waitForSelector(submitBtnSelector, { timeout: 5000 });
    const generateBtn = await page.$(submitBtnSelector);

    if (!generateBtn) {
      throw new Error('Generate button not found!');
    }

    console.log('Clicking generate button...');
    await generateBtn.click();
    console.log('Clicked. Waiting 10s for generation task initialization...');
    await new Promise(r => setTimeout(r, 10000));
    await page.screenshot({ path: path.join(screenshotDir, '08_after_generation_click.png') });
    console.log('Saved 08_after_generation_click.png');

    console.log('Test completed successfully!');
  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    await page.close();
    await browser.disconnect();
  }
}

run();
