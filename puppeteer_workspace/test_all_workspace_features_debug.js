const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMTlhMzZlYzIwNWM2N2U4NWY2MTgwYyIsIm1haWwiOiJhZG1pbkBhaXRvZWFybi5sb2NhbCIsIm5hbWUiOiJBZG1pbiIsImlhdCI6MTc4MDcwODczMSwiZXhwIjo0OTM2NDY4NzMxfQ.TwjQ2lgIdDRhgbYNsA7SIEXQw5n7LzvUrzW1T1UnNrY";
const artifactsDir = "C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5";

(async () => {
  console.log('🚀 Starting Comprehensive Debug Workspace Test...');
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

    // Capture console messages
    page.on('console', msg => {
      console.log(`[Console]: ${msg.text()}`);
    });

    // Capture response contents
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/')) {
        try {
          const text = await response.text();
          console.log(`[API Response] ${response.status()} ${url} ->`, text.slice(0, 500));
        } catch (e) {
          // ignore binary or failed responses
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

    // Let's print the balance via page evaluate check
    const creditsStoreVal = await page.evaluate(() => {
      try {
        // We can inspect zustand stores if they are attached to window, or check localStorage/session
        return window.__NEXT_DATA__ || {};
      } catch (e) {
        return e.message;
      }
    });
    console.log('Next Data:', JSON.stringify(creditsStoreVal).slice(0, 300));

    // Print all text elements on the screen to see what is shown
    const allText = await page.evaluate(() => document.body.innerText.slice(0, 1000));
    console.log('--- Page text preview ---');
    console.log(allText);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (browser) await browser.close();
    console.log('Done.');
  }
})();
