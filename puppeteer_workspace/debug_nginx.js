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
    let terminalPage = null;

    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const url = p.url();
      
      if (url.includes('orcaterm') || url.includes('webshell') || url.includes('terminal')) {
        const hasTerminal = await p.evaluate(() => {
          const el = document.querySelector('.xterm-rows') || 
                     document.querySelector('.xterm') ||
                     document.querySelector('.terminal') ||
                     document.querySelector('.xterm-helper-textarea');
          return !!el;
        });

        if (hasTerminal) {
          terminalPage = p;
          break;
        }
      }
    }

    if (!terminalPage) {
      throw new Error('❌ Active terminal tab not found!');
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

    // Send Ctrl+C to clean prompt
    await terminalPage.keyboard.down('Control');
    await terminalPage.keyboard.press('KeyC');
    await terminalPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 500));
    await terminalPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    // Type `sudo docker compose logs --tail=40 nginx`
    console.log('📋 Fetching nginx container logs...');
    await terminalPage.keyboard.type('sudo docker compose logs --tail=40 nginx\n', { delay: 40 });
    await new Promise(r => setTimeout(r, 6000));

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    const screenshotPath = path.join(artifactDir, 'scratch', 'nginx_logs.png');
    await terminalPage.screenshot({ path: screenshotPath });
    console.log(`📸 Nginx logs screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
    console.log('✨ Script completed successfully!');
  } catch (err) {
    console.error('❌ Error during logs fetch execution:', err);
  }
})();
