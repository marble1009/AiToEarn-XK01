const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  let browser;
  try {
    console.log('🔌 Connecting to Chrome debugger...');
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    let terminalPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));

    if (!terminalPage) {
      throw new Error('❌ Active terminal tab not found!');
    }

    await terminalPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

    // Focus
    await terminalPage.evaluate(() => {
      const el = document.querySelector('textarea') || document.querySelector('.xterm-helper-textarea');
      if (el) el.focus();
    });
    await terminalPage.mouse.click(400, 300);
    await new Promise(r => setTimeout(r, 500));

    // Send Ctrl+C to clean prompt just in case
    console.log('🧹 Cleaning prompt...');
    await terminalPage.keyboard.down('Control');
    await terminalPage.keyboard.press('KeyC');
    await terminalPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 500));
    await terminalPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    // cd ~/aitoearn
    console.log('📂 Going to project root...');
    await terminalPage.keyboard.type('cd ~/aitoearn\n', { delay: 10 });
    await new Promise(r => setTimeout(r, 1500));

    // up aitoearn-ai
    console.log('🐋 Starting container: aitoearn-ai...');
    await terminalPage.keyboard.type('sudo docker compose up -d aitoearn-ai\n', { delay: 10 });
    console.log('⏳ Waiting 15 seconds...');
    await new Promise(r => setTimeout(r, 15000));

    // restart nginx
    console.log('🔄 Restarting Nginx...');
    await terminalPage.keyboard.type('sudo docker compose restart nginx\n', { delay: 10 });
    console.log('⏳ Waiting 10 seconds...');
    await new Promise(r => setTimeout(r, 10000));

    // compose ps
    console.log('📊 Verifying with docker compose ps...');
    await terminalPage.keyboard.type('sudo docker compose ps\n', { delay: 10 });
    await new Promise(r => setTimeout(r, 5000));

    // Screenshot
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    const screenshotPath = path.join(artifactDir, 'restart_services_final.png');
    await terminalPage.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
    console.log('🎉 Restart Services completed successfully!');
  } catch (err) {
    console.error('❌ Error:', err);
    if (browser) await browser.disconnect();
  }
})();
