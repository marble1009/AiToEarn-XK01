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
      const title = await p.title();
      
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

    // 1. Run local Docker Compose build for the web service
    console.log('🏗️ Starting local Docker Compose build for aitoearn-web...');
    await terminalPage.keyboard.type('sudo docker compose build aitoearn-web\n', { delay: 40 });
    
    // We will wait 120 seconds in total for the build, taking progress screenshots every 30 seconds
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    
    for (let step = 1; step <= 4; step++) {
      console.log(`⏳ [Build Step ${step}/4] Waiting 30 seconds...`);
      await new Promise(r => setTimeout(r, 30000));
      const spath = path.join(artifactDir, 'scratch', `local_build_step_${step}.png`);
      await terminalPage.screenshot({ path: spath });
      console.log(`📸 Progress screenshot saved to: ${spath}`);
    }

    // 2. Restart the web service with the newly built local image
    console.log('🐋 Restarting aitoearn-web with the new locally compiled image...');
    await terminalPage.keyboard.type('sudo docker compose up -d aitoearn-web\n', { delay: 40 });
    await new Promise(r => setTimeout(r, 15000));

    // 3. Verify status
    console.log('📊 Verifying status...');
    await terminalPage.keyboard.type('sudo docker compose ps\n', { delay: 40 });
    await new Promise(r => setTimeout(r, 5000));

    const finalPath = path.join(artifactDir, 'scratch', 'local_build_completed.png');
    await terminalPage.screenshot({ path: finalPath });
    console.log(`📸 Final status screenshot saved to: ${finalPath}`);

    await browser.disconnect();
    console.log('✨ Local build and restart script completed successfully!');
  } catch (err) {
    console.error('❌ Error during local build execution:', err);
  }
})();
