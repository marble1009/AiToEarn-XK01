const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('🔌 Connecting to Chrome debugger...');
  let browser;
  try {
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

    // Send Ctrl+C to clean prompt
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

    // Run curl to sync
    console.log('🔄 Downloading router service from dpaste...');
    const syncCmd = 'curl -sL https://dpaste.com/CNWLXN2RX.txt > project/aitoearn-backend/apps/aitoearn-ai/src/core/agent/claude-code-router/claude-code-router.service.ts\n';
    await terminalPage.keyboard.type(syncCmd, { delay: 10 });
    await new Promise(r => setTimeout(r, 3000));

    // Check git diff
    console.log('📊 Checking git diff of synced file...');
    await terminalPage.keyboard.type('git diff project/aitoearn-backend/apps/aitoearn-ai/src/core/agent/claude-code-router/claude-code-router.service.ts\n', { delay: 10 });
    await new Promise(r => setTimeout(r, 4000));

    // Screenshot
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    const screenshotPath = path.join(artifactDir, 'sync_router_service_diff.png');
    await terminalPage.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
    console.log('🎉 Sync Router Service completed successfully!');
  } catch (err) {
    console.error('❌ Error during sync:', err);
    if (browser) await browser.disconnect();
  }
})();
