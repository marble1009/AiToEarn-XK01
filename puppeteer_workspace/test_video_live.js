const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMTlhMzZlYzIwNWM2N2U4NWY2MTgwYyIsIm1haWwiOiJhZG1pbkBhaXRvZWFybi5sb2NhbCIsIm5hbWUiOiJBZG1pbiIsImlhdCI6MTc4MDcwODczMSwiZXhwIjo0OTM2NDY4NzMxfQ.TwjQ2lgIdDRhgbYNsA7SIEXQw5n7LzvUrzW1T1UnNrY";
const artifactsDir = "C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5";

(async () => {
  console.log('🚀 Launching Chrome directly via puppeteer-core...');
  let browser;
  let page;

  try {
    let executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    if (!fs.existsSync(executablePath)) {
      executablePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    }
    console.log(`Using Chrome path: ${executablePath}`);

    browser = await puppeteer.launch({
      headless: "new",
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
      defaultViewport: null
    });
    console.log('🎉 Launched Chrome successfully!');

    page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setViewport({ width: 1440, height: 900 });

    console.log('Opening base page to set localStorage token...');
    await page.goto('https://124.221.103.86/zh-CN/auth/login', { waitUntil: 'networkidle2', timeout: 30000 });
    
    console.log('Injecting auth token into localStorage key "User"...');
    await page.evaluate((jwtToken) => {
      localStorage.setItem('User', JSON.stringify({
        state: {
          token: jwtToken,
          userInfo: {
            id: "6a19a36ec205c67e85f6180c",
            _id: "6a19a36ec205c67e85f6180c",
            mail: "admin@aitoearn.local",
            name: "Admin",
            userType: "CREATOR"
          },
          hasEverLoggedIn: true,
          creditsInitialized: false
        },
        version: 0
      }));
    }, token);

    console.log('Navigating to draft-box...');
    await page.goto('https://124.221.103.86/zh-CN/draft-box', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Waiting 5s for page and stores initialization...');
    await new Promise(r => setTimeout(r, 5000));
    
    const initialScreenshot = path.join(artifactsDir, 'media__1780710859026.png');
    await page.screenshot({ path: initialScreenshot });
    console.log(`📸 Initial page loaded screenshot saved: ${initialScreenshot}`);

    // Select the model wan2.7-i2v
    console.log('Looking for model selector...');
    const buttons = await page.$$('button');
    let modelSelectorBtn;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('文生视频') || text.includes('图生视频') || text.includes('参考视频') || text.includes('wan2.7')) {
        modelSelectorBtn = btn;
        console.log(`Found model selector button with text: "${text.trim()}"`);
        break;
      }
    }

    if (modelSelectorBtn) {
      console.log('Clicking model selector button...');
      await modelSelectorBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      
      const dropdownScreenshot = path.join(artifactsDir, 'media__1780710859027.png');
      await page.screenshot({ path: dropdownScreenshot });
      console.log(`📸 Dropdown screenshot saved: ${dropdownScreenshot}`);

      // Click the wan2.7-i2v (图生视频-标准版) option
      const options = await page.$$('div, li, span, button');
      let targetOption;
      for (const opt of options) {
        const text = await page.evaluate(el => el.textContent, opt);
        if (text.includes('图生视频-标准版') || text.includes('wan2.7-i2v')) {
          targetOption = opt;
          break;
        }
      }
      if (targetOption) {
        console.log('Clicking wan2.7-i2v option...');
        await targetOption.click();
        await new Promise(r => setTimeout(r, 1500));
      } else {
        console.log('wan2.7-i2v option not found in dropdown list');
      }
    }

    // Check/Select 8s duration
    const spans = await page.$$('span, div, button');
    let durationBtn8;
    for (const span of spans) {
      const text = await page.evaluate(el => el.textContent, span);
      if (text.trim() === '8s' || text.trim() === '8秒') {
        durationBtn8 = span;
        console.log('Found 8s duration button/slider indicator');
      }
    }

    if (durationBtn8) {
      console.log('Clicking 8s duration...');
      await durationBtn8.click();
      await new Promise(r => setTimeout(r, 1000));
    }

    // Enter prompt
    const textareaSelector = 'textarea[data-testid="draftbox-ai-prompt-input"]';
    await page.waitForSelector(textareaSelector, { timeout: 5000 });
    await page.click(textareaSelector, { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type(textareaSelector, '一只可爱的小猫玩毛线球，极其精致，阳光洒落在地板上');
    console.log('Typed prompt.');

    // Click 一键智能优化
    const allButtons = await page.$$('button');
    let optimizeBtn;
    for (const btn of allButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('智能优化提示词') || text.includes('智能优化')) {
        optimizeBtn = btn;
        break;
      }
    }
    if (optimizeBtn) {
      console.log('Clicking optimize button...');
      await optimizeBtn.click();
      await new Promise(r => setTimeout(r, 6000));
      
      const optimizedScreenshot = path.join(artifactsDir, 'media__1780710859028.png');
      await page.screenshot({ path: optimizedScreenshot });
      console.log(`📸 Optimized prompt screenshot saved: ${optimizedScreenshot}`);
    }

    // Submit generation
    const submitBtnSelector = 'button[data-testid="draftbox-ai-submit-btn"]';
    await page.waitForSelector(submitBtnSelector, { timeout: 5000 });
    const submitBtn = await page.$(submitBtnSelector);
    if (submitBtn) {
      console.log('Clicking generate button...');
      await submitBtn.click();
      console.log('Waiting 5s after generation submit...');
      await new Promise(r => setTimeout(r, 5000));
      
      const submittedScreenshot = path.join(artifactsDir, 'media__1780710859029.png');
      await page.screenshot({ path: submittedScreenshot });
      console.log(`📸 Submitted task screenshot saved: ${submittedScreenshot}`);
    }

    // Wait for the task status to update or show card
    console.log('Waiting 20s for the video generation to start/show generating status...');
    await new Promise(r => setTimeout(r, 20000));
    
    const finalScreenshot = path.join(artifactsDir, 'media__1780710859030.png');
    await page.screenshot({ path: finalScreenshot });
    console.log(`📸 Final screenshot saved: ${finalScreenshot}`);

  } catch (err) {
    console.error('Error during test execution:', err);
    if (page) {
      const errScreenshot = path.join(artifactsDir, 'media__1780710859031.png');
      await page.screenshot({ path: errScreenshot });
      console.log(`📸 Error screenshot saved: ${errScreenshot}`);
    }
  } finally {
    if (browser) await browser.close();
    console.log('Chrome closed.');
  }
})();
