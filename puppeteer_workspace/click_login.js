const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes('lighthouse'));
    if (!page) {
      console.error('Lighthouse page not found!');
      await browser.disconnect();
      return;
    }

    console.log('Finding 登录 button...');
    
    // Evaluate to find and click button
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, span, div'));
      const loginBtn = buttons.find(b => b.textContent.trim() === '登录');
      if (loginBtn) {
        loginBtn.click();
        return true;
      }
      return false;
    });

    console.log('Clicked login button:', clicked);

    console.log('Waiting 10 seconds for OrcaTerm tab/window to open...');
    await new Promise(r => setTimeout(r, 10000));

    // List all pages now
    const allPages = await browser.pages();
    console.log('All pages currently open:');
    for (let i = 0; i < allPages.length; i++) {
      console.log(`Page ${i}: ${await allPages[i].title()} (${allPages[i].url()})`);
    }

    // Take screenshot of all pages or OrcaTerm
    const orca = allPages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
    if (orca) {
      console.log('OrcaTerm page found! Taking screenshot...');
      const screenshotPath = `C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\orcaterm_opened.png`;
      await orca.screenshot({ path: screenshotPath });
      console.log(`Screenshot saved to: ${screenshotPath}`);
    }

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
