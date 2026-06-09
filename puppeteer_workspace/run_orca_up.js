const puppeteer = require('puppeteer-core');
const path = require('path');

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

    console.log('🔌 Connected to OrcaTerm!');
    await orcaPage.bringToFront();
    await orcaPage.mouse.click(400, 300);
    await new Promise(r => setTimeout(r, 1000));

    // Clear prompt using Control+C
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 1000));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    // Send the docker compose up command
    console.log('➡️ Sending: sudo docker compose up -d');
    await orcaPage.keyboard.type('sudo docker compose up -d\n', { delay: 40 });
    
    // Wait 60 seconds for all pulls and startup to complete fully
    console.log('⏳ Waiting 60 seconds for pulls and container startup to complete...');
    await new Promise(r => setTimeout(r, 60000));

    const screenshotPath = `C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\up_completed.png`;
    await orcaPage.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
    console.log('🎉 Done.');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
