const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    console.log('🔌 Connecting to Chrome debugger...');
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    let terminalPage = pages[2];

    if (!terminalPage) {
      throw new Error('❌ Page at index 2 not found.');
    }

    console.log(`🎯 Using terminal tab: ${terminalPage.url()}`);
    await terminalPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

    // Focus terminal
    await terminalPage.evaluate(() => {
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

    await terminalPage.mouse.click(400, 300);
    await new Promise(r => setTimeout(r, 500));

    // Type `sudo docker compose ps`
    console.log('📊 Typing: sudo docker compose ps');
    await terminalPage.keyboard.type('sudo docker compose ps\n', { delay: 40 });
    
    // Wait 5 seconds
    await new Promise(r => setTimeout(r, 5000));

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    const screenshotPath = path.join(artifactDir, 'scratch', 'ps_check_1.png');
    await terminalPage.screenshot({ path: screenshotPath });
    console.log(`📸 Progress screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
    console.log('✨ Script completed successfully!');
  } catch (err) {
    console.error('❌ Error during ps check:', err);
  }
})();
