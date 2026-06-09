const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMTlhMzZlYzIwNWM2N2U4NWY2MTgwYyIsIm1haWwiOiJhZG1pbkBhaXRvZWFybi5sb2NhbCIsIm5hbWUiOiJBZG1pbiIsImlhdCI6MTc4MDcwODczMSwiZXhwIjo0OTM2NDY4NzMxfQ.TwjQ2lgIdDRhgbYNsA7SIEXQw5n7LzvUrzW1T1UnNrY";
const artifactsDir = "C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5";

(async () => {
  console.log('🚀 Taking screenshot of the gallery...');
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
    console.log('Waiting 8s for gallery and image cards to render completely...');
    await new Promise(r => setTimeout(r, 8000));

    // Capture gallery screen
    const galleryScreenshot = path.join(artifactsDir, 'media__1780713688070.png');
    await page.screenshot({ path: galleryScreenshot });
    console.log(`📸 Screenshot saved: ${galleryScreenshot}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (browser) await browser.close();
    console.log('Done.');
  }
})();
