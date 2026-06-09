const puppeteer = require('puppeteer-core');
const fs = require('fs');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMTlhMzZlYzIwNWM2N2U4NWY2MTgwYyIsIm1haWwiOiJhZG1pbkBhaXRvZWFybi5sb2NhbCIsIm5hbWUiOiJBZG1pbiIsImlhdCI6MTc4MDcwODczMSwiZXhwIjo0OTM2NDY4NzMxfQ.TwjQ2lgIdDRhgbYNsA7SIEXQw5n7LzvUrzW1T1UnNrY";

(async () => {
  let browser;
  try {
    let executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    if (!fs.existsSync(executablePath)) {
      executablePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    }

    browser = await puppeteer.launch({
      headless: "new",
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log('Injecting token...');
    await page.goto('https://124.221.103.86/zh-CN/auth/login', { waitUntil: 'networkidle2' });
    await page.evaluate((jwtToken) => {
      localStorage.setItem('User', JSON.stringify({
        state: {
          token: jwtToken,
          userInfo: { id: "6a19a36ec205c67e85f6180c", mail: "admin@aitoearn.local", name: "Admin", userType: "CREATOR" }
        },
        version: 0
      }));
    }, token);

    console.log('Navigating to draft-box...');
    await page.goto('https://124.221.103.86/zh-CN/draft-box', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 8000));

    const imgData = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        outerHTML: img.outerHTML,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      }));
    });

    console.log('--- Images in the page ---');
    console.log(JSON.stringify(imgData, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    if (browser) await browser.close();
  }
})();
