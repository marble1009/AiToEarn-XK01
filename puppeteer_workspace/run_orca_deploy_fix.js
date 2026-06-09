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
    console.log(`Connected! Found ${pages.length} pages total.`);

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

        console.log(`[Page ${i}] URL: ${url} | Title: ${title} | Has Terminal DOM: ${hasTerminal}`);
        if (hasTerminal) {
          terminalPage = p;
          console.log(`🎯 Found active terminal tab at Page ${i}!`);
          break;
        }
      }
    }

    if (!terminalPage) {
      throw new Error('❌ Active terminal tab not found in any page!');
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

    // 1. Git pull
    console.log('🔄 Typing: git pull');
    await terminalPage.keyboard.type('git pull\n', { delay: 40 });
    await new Promise(r => setTimeout(r, 5000));

    // 2. Pull the latest image
    console.log('🚀 Pulling newest image from NJU high-speed mirror...');
    await terminalPage.keyboard.type('sudo docker pull ghcr.nju.edu.cn/marble1009/aitoearn-web:latest\n', { delay: 40 });
    
    // Wait 25 seconds for mirror pull
    console.log('⏳ Waiting 25 seconds for mirror pull...');
    await new Promise(r => setTimeout(r, 25000));

    // 3. Tag the image
    console.log('🏷️ Tagging image...');
    await terminalPage.keyboard.type('sudo docker tag ghcr.nju.edu.cn/marble1009/aitoearn-web:latest ghcr.io/marble1009/aitoearn-web:latest\n', { delay: 40 });
    await new Promise(r => setTimeout(r, 2000));

    // 4. Restart web service
    console.log('🐋 Restarting aitoearn-web service...');
    await terminalPage.keyboard.type('sudo docker compose up -d aitoearn-web\n', { delay: 40 });
    await new Promise(r => setTimeout(r, 10000));

    // 5. Verify status
    console.log('📊 Verifying container status with docker compose ps...');
    await terminalPage.keyboard.type('sudo docker compose ps\n', { delay: 40 });
    await new Promise(r => setTimeout(r, 5000));

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    const screenshotPath = path.join(artifactDir, 'scratch', 'pull_deploy_fix.png');
    await terminalPage.screenshot({ path: screenshotPath });
    console.log(`📸 Deploy fix screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
    console.log('✨ Script completed successfully!');
  } catch (err) {
    console.error('❌ Error during deploy fix execution:', err);
  }
})();
