const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMTlhMzZlYzIwNWM2N2U4NWY2MTgwYyIsIm1haWwiOiJhZG1pbkBhaXRvZWFybi5sb2NhbCIsIm5hbWUiOiJBZG1pbiIsImlhdCI6MTc4MDcwODczMSwiZXhwIjo0OTM2NDY4NzMxfQ.TwjQ2lgIdDRhgbYNsA7SIEXQw5n7LzvUrzW1T1UnNrY";
const artifactsDir = "C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5";

(async () => {
  console.log('🚀 Running Direct Click Test...');
  let browser;
  let page;

  try {
    let executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    if (!fs.existsSync(executablePath)) {
      executablePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    }

    browser = await puppeteer.launch({
      headless: "new",
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
      defaultViewport: null
    });

    page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => {
      console.log(`[Browser Console]: ${msg.text()}`);
    });

    page.on('pageerror', err => {
      console.error(`[Browser Error]:`, err);
    });

    page.on('request', req => {
      if (req.url().includes('/api/')) {
        console.log(`[API Request]: ${req.method()} ${req.url()}`);
        // Log post data if any
        if (req.method() === 'POST') {
          console.log(`[API Request PostData]:`, req.postData());
        }
      }
    });

    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/')) {
        try {
          const text = await response.text();
          console.log(`[API Response] ${response.status()} ${url} ->`, text.slice(0, 300));
        } catch (e) {
          // ignore
        }
      }
    });

    console.log('Opening base page to set localStorage token...');
    await page.goto('https://124.221.103.86/zh-CN/auth/login', { waitUntil: 'networkidle2', timeout: 30000 });
    
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
    await new Promise(r => setTimeout(r, 6000));

    // Type prompt
    const textareaSelector = 'textarea[data-testid="draftbox-ai-prompt-input"]';
    await page.waitForSelector(textareaSelector, { timeout: 5000 });
    await page.click(textareaSelector, { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type(textareaSelector, '肥美的大闸蟹在蒸锅里，热气腾腾，蟹黄四溢，极其诱人');
    console.log('Typed prompt.');

    // Click submit button via page.evaluate to see if click registers and if any error occurs
    console.log('Triggering submit button click via page.evaluate...');
    const result = await page.evaluate(() => {
      const submitBtn = document.querySelector('button[data-testid="draftbox-ai-submit-btn"]');
      if (!submitBtn) {
        return 'BUTTON_NOT_FOUND';
      }
      if (submitBtn.disabled) {
        return 'BUTTON_DISABLED';
      }
      submitBtn.click();
      return 'CLICKED';
    });

    console.log(`Click result: ${result}`);
    
    // Wait to see if any network requests or responses occur
    await new Promise(r => setTimeout(r, 10000));

    // Screenshot after click
    const afterClickScreenshot = path.join(artifactsDir, 'media__1780713678522.png');
    await page.screenshot({ path: afterClickScreenshot });
    console.log(`📸 Screenshot saved: ${afterClickScreenshot}`);

  } catch (err) {
    console.error('Error during test execution:', err);
  } finally {
    if (browser) await browser.close();
    console.log('Done.');
  }
})();
