const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMTlhMzZlYzIwNWM2N2U4NWY2MTgwYyIsIm1haWwiOiJhZG1pbkBhaXRvZWFybi5sb2NhbCIsIm5hbWUiOiJBZG1pbiIsImlhdCI6MTc4MDcwODczMSwiZXhwIjo0OTM2NDY4NzMxfQ.TwjQ2lgIdDRhgbYNsA7SIEXQw5n7LzvUrzW1T1UnNrY";
const artifactsDir = "C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5";

(async () => {
  console.log('🚀 Starting Comprehensive Workspace Test...');
  let browser;
  let page;
  const consoleLogs = [];
  const pageErrors = [];

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

    page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setViewport({ width: 1440, height: 900 });

    // Capture console messages
    page.on('console', msg => {
      const log = `[Console ${msg.type()}]: ${msg.text()}`;
      consoleLogs.push(log);
      console.log(log);
    });

    // Capture page errors
    page.on('pageerror', err => {
      const errorMsg = `[Page Error]: ${err.toString()}`;
      pageErrors.push(errorMsg);
      console.error(errorMsg);
    });

    console.log('Opening login page to inject localStorage token...');
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
    
    // Screenshot 1: Initial Page
    const screenshot1 = path.join(artifactsDir, 'media__1780713670068.png');
    await page.screenshot({ path: screenshot1 });
    console.log(`📸 Screenshot 1: Initial page loaded saved to ${screenshot1}`);

    // Print initial credits balance shown on page
    const creditsBalanceText = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('span, div, p, button'));
      // Find element with coin icon or credits text near the bottom right or sidebar
      for (const el of elements) {
        if (el.textContent.includes('当前余额') || (el.className && el.className.includes('credits'))) {
          return el.textContent.trim();
        }
      }
      return 'Not found directly';
    });
    console.log(`Initial Credits Text on page: "${creditsBalanceText}"`);

    // Test Tag Selection
    console.log('Testing tag selection...');
    const tagClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const tagBtn = buttons.find(b => b.textContent.trim() === '网红打卡' || b.textContent.trim() === '市井烟火' || b.textContent.trim() === '温馨治愈');
      if (tagBtn) {
        tagBtn.click();
        return tagBtn.textContent.trim();
      }
      return null;
    });
    
    if (tagClicked) {
      console.log(`Clicked tag: "${tagClicked}"`);
      await new Promise(r => setTimeout(r, 1000));
      const textareaVal = await page.evaluate(() => {
        const ta = document.querySelector('textarea[data-testid="draftbox-ai-prompt-input"]');
        return ta ? ta.value : '';
      });
      console.log(`Textarea content after clicking tag: "${textareaVal}"`);
    } else {
      console.log('No industry tags found to click');
    }

    // Enter prompt & AI Optimization
    const textareaSelector = 'textarea[data-testid="draftbox-ai-prompt-input"]';
    await page.waitForSelector(textareaSelector, { timeout: 5000 });
    
    // Clear textarea
    await page.click(textareaSelector, { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type(textareaSelector, '肥美的大闸蟹在蒸锅里，热气腾腾，蟹黄四溢，极其诱人');
    console.log('Typed custom prompt.');

    // Click 一键智能优化
    const optimizeBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('智能优化提示词') || btn.textContent.includes('一键智能优化') || btn.textContent.includes('优化提示词'));
    });
    
    if (optimizeBtn.asElement()) {
      console.log('Clicking optimize button...');
      await optimizeBtn.asElement().click();
      console.log('Waiting 7s for prompt optimization stream to complete...');
      await new Promise(r => setTimeout(r, 7000));
      
      const optimizedText = await page.evaluate((sel) => {
        return document.querySelector(sel).value;
      }, textareaSelector);
      console.log(`Optimized prompt: "${optimizedText}"`);
      
      const screenshot2 = path.join(artifactsDir, 'media__1780713674284.png');
      await page.screenshot({ path: screenshot2 });
      console.log(`📸 Screenshot 2: Optimized prompt saved to ${screenshot2}`);
    } else {
      console.log('Optimize button not found');
    }

    // Test Gen Mode Selector
    console.log('Opening Gen Mode Selector...');
    const genModeBtn = await page.$('[data-testid="draftbox-ai-gen-mode"]');
    if (genModeBtn) {
      await genModeBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      
      // Let's find the option for 草稿(图文)
      const clickedImageTextMode = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const opt = buttons.find(b => b.textContent.includes('图文') && b.textContent.includes('草稿'));
        if (opt) {
          opt.click();
          return true;
        }
        return false;
      });
      
      if (clickedImageTextMode) {
        console.log('Switched Gen Mode to "草稿(图文)"');
        await new Promise(r => setTimeout(r, 2000));
        
        // Screenshot 3: ImageText Mode
        const screenshot3 = path.join(artifactsDir, 'media__1780713678518.png');
        await page.screenshot({ path: screenshot3 });
        console.log(`📸 Screenshot 3: Switched to ImageText mode saved to ${screenshot3}`);

        // Click Model selector in ImageText mode to see what image models exist
        const imgModelBtn = await page.$('[data-testid="draftbox-ai-model"]');
        if (imgModelBtn) {
          await imgModelBtn.click();
          await new Promise(r => setTimeout(r, 1000));
          const imgModels = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('div, li, button'));
            return elements.map(el => el.textContent.trim()).filter(txt => txt.includes('flux') || txt.includes('SD') || txt.includes('极速') || txt.includes('专业'));
          });
          console.log('Available Image Models in dropdown:', imgModels);
          // Close model popover by clicking outside or clicking model button again
          await imgModelBtn.click();
          await new Promise(r => setTimeout(r, 1000));
        }
      }
      
      // Switch back to "草稿(视频)"
      console.log('Switching back to 草稿(视频)...');
      await genModeBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const opt = buttons.find(b => b.textContent.includes('视频') && b.textContent.includes('草稿'));
        if (opt) opt.click();
      });
      await new Promise(r => setTimeout(r, 2000));
      console.log('Gen Mode restored to video.');
    }

    // Verify model selection is "阿里万相 2.7 文生视频-标准版" (default) or select it
    const modelBtn = await page.$('[data-testid="draftbox-ai-model"]');
    if (modelBtn) {
      const currentModelText = await page.evaluate(el => el.textContent.trim(), modelBtn);
      console.log(`Current selected model before change: "${currentModelText}"`);
      
      if (!currentModelText.includes('2.7 文生视频-标准版')) {
        console.log('Selecting "阿里万相 2.7 文生视频-标准版"...');
        await modelBtn.click();
        await new Promise(r => setTimeout(r, 1000));
        
        const selected = await page.evaluate(() => {
          const options = Array.from(document.querySelectorAll('div, li, button, span'));
          // Find option that contains "2.7 文生视频-标准版"
          // We must click the inner span or div to register properly
          const target = options.find(o => o.textContent.includes('2.7') && o.textContent.includes('文生视频-标准版') && o.className && o.className.includes('rounded-md'));
          if (target) {
            target.click();
            return true;
          }
          // Fallback to text matching
          const targetFallback = options.find(o => o.textContent.includes('2.7 文生视频-标准版'));
          if (targetFallback) {
            targetFallback.click();
            return true;
          }
          return false;
        });
        console.log(`Model selection result: ${selected}`);
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    // Verify duration is "8s" (default)
    const durationBtn = await page.$('[data-testid="draftbox-ai-duration"]');
    if (durationBtn) {
      const durationText = await page.evaluate(el => el.textContent.trim(), durationBtn);
      console.log(`Current selected duration: "${durationText}"`);
    }

    // Verify quantity is "1" (default)
    const quantityBtn = await page.$('[data-testid="draftbox-ai-quantity"]');
    if (quantityBtn) {
      const quantityText = await page.evaluate(el => el.textContent.trim(), quantityBtn);
      console.log(`Current selected quantity: "${quantityText}"`);
    }

    // Print selected platforms (badges under input area)
    const selectedPlatforms = await page.evaluate(() => {
      const platformBadges = Array.from(document.querySelectorAll('[data-testid="platform-selector-badge"], .platform-badge, span'));
      return platformBadges
        .filter(b => b.textContent.includes('抖音') || b.textContent.includes('小红书') || b.textContent.includes('快手') || b.textContent.includes('视频号'))
        .map(b => b.textContent.trim());
    });
    console.log('Selected Platforms:', selectedPlatforms);

    // Submit AI Batch Generation
    const submitBtnSelector = 'button[data-testid="draftbox-ai-submit-btn"]';
    const submitBtn = await page.$(submitBtnSelector);
    if (submitBtn) {
      console.log('Clicking the batch generation submit button...');
      await submitBtn.click();
      console.log('Waiting 5s after generation submit...');
      await new Promise(r => setTimeout(r, 5000));
      
      // Screenshot 4: Task Submitted
      const screenshot4 = path.join(artifactsDir, 'media__1780713683551.png');
      await page.screenshot({ path: screenshot4 });
      console.log(`📸 Screenshot 4: Task submitted saved to ${screenshot4}`);
      
      // Wait for task card to appear or show generating
      console.log('Waiting 30s to verify generating card and progress in the gallery panel...');
      for (let i = 0; i < 3; i++) {
        await new Promise(r => setTimeout(r, 10000));
        const checkScreenshot = path.join(artifactsDir, `media__178071368806${i+7}.png`);
        await page.screenshot({ path: checkScreenshot });
        console.log(`📸 Screenshot checking progress (${(i+1)*10}s) saved to ${checkScreenshot}`);
      }
    } else {
      console.log('Submit button [data-testid="draftbox-ai-submit-btn"] not found!');
    }

  } catch (err) {
    console.error('Error occurred during test execution:', err);
    if (page) {
      const errScreenshot = path.join(artifactsDir, 'media__1780713596771.png');
      await page.screenshot({ path: errScreenshot });
      console.log(`📸 Error screenshot saved to ${errScreenshot}`);
    }
  } finally {
    if (browser) await browser.close();
    console.log('Chrome closed.');
    
    // Save execution report
    console.log('--- TEST LOGS SUMMARY ---');
    console.log(`Total console logs captured: ${consoleLogs.length}`);
    console.log(`Total page errors captured: ${pageErrors.length}`);
  }
})();
