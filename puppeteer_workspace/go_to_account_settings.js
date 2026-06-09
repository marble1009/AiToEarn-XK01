const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('🚀 Connecting to Chrome...');
  const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';

  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    let page = pages.find(p => p.url().includes('exmail') || p.url().includes('work.weixin'));
    if (!page) {
      console.error('❌ Exmail page not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔗 Connected to page: ${page.url()}`);
    await page.bringToFront();

    // Find mainFrame
    const frames = page.frames();
    const mainFrame = frames.find(f => f.name() === 'mainFrame');
    if (!mainFrame) {
      console.error('❌ mainFrame not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔗 Found mainFrame: ${mainFrame.url()}`);

    // Click "账户" link in mainFrame
    const clicked = await mainFrame.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const accountLink = links.find(l => l.innerText.trim() === '账户');
      if (accountLink) {
        accountLink.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      console.log('✅ Clicked "账户" link in mainFrame. Waiting for 3 seconds...');
      await new Promise(r => setTimeout(r, 3000));
    } else {
      console.log('❌ Could not find "账户" link in mainFrame, attempting direct navigation of mainFrame...');
      // Direct navigate mainFrame using the URL
      const sidMatch = page.url().match(/sid=([^&]+)/);
      if (sidMatch) {
        const sid = sidMatch[1];
        const targetUrl = `https://exmail.qq.com/cgi-bin/setting4?fun=list&acc=1&sid=${sid}`;
        console.log(`Navigating mainFrame to: ${targetUrl}`);
        await mainFrame.goto(targetUrl, { waitUntil: 'networkidle2' });
      } else {
        console.error('❌ Could not extract sid from URL!');
      }
    }

    // Capture screenshot
    const screenshotPath = path.join(artifactDir, 'scratch', 'exmail_account_clicked.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    // Dump current mainFrame inner text
    const text = await mainFrame.evaluate(() => document.body.innerText);
    console.log(`\nFrame inner text (first 1000 chars):`);
    console.log(text.substring(0, 1000));

    await browser.disconnect();
    console.log('🎉 Done.');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
