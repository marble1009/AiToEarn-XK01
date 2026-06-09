const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const orcaPage = pages.find(p => p.url().includes('orcaterm'));
    
    if (!orcaPage) {
      console.error('❌ OrcaTerm page not found!');
      await browser.disconnect();
      return;
    }

    await orcaPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

    await orcaPage.evaluate(() => {
      const el = document.querySelector('textarea') || 
                 document.querySelector('.xterm-helper-textarea') || 
                 document.querySelector('.xterm-rows') || 
                 document.querySelector('.xterm') ||
                 document.querySelector('.terminal');
      if (el) {
        el.focus();
        if (el.click && el.tagName !== 'TEXTAREA') el.click();
      }
    });

    await orcaPage.mouse.click(400, 300);
    await new Promise(r => setTimeout(r, 500));

    // Clear prompt
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 500));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    const cmd = 'sudo docker exec aitoearn-rustfs ls -la /data';
    console.log(`➡️ Sending command...`);
    await orcaPage.keyboard.type(cmd, { delay: 10 });
    await new Promise(r => setTimeout(r, 500));
    await orcaPage.keyboard.press('Enter');

    console.log(`⏳ Waiting 5 seconds...`);
    await new Promise(resolve => setTimeout(resolve, 5000));

    const screenshotPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\rustfs_ls.png';
    await orcaPage.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
