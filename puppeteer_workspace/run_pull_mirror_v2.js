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

    // 1. Send Ctrl+C multiple times to abort the slow pulling process
    console.log('🛑 Aborting the slow ghcr.io pull using Ctrl+C...');
    await terminalPage.keyboard.down('Control');
    await terminalPage.keyboard.press('KeyC');
    await terminalPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 1000));
    
    await terminalPage.keyboard.down('Control');
    await terminalPage.keyboard.press('KeyC');
    await terminalPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 1000));

    await terminalPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1500));

    // 2. Pull from Nanjing University high-speed mirror
    console.log('🚀 Pulling image from NJU high-speed mirror (ghcr.nju.edu.cn)...');
    await terminalPage.keyboard.type('sudo docker pull ghcr.nju.edu.cn/marble1009/aitoearn-web:latest\n', { delay: 40 });
    
    // Wait 30 seconds for mirror pull
    console.log('⏳ Waiting 30 seconds for mirror pull...');
    await new Promise(r => setTimeout(r, 30000));

    // 3. Tag the image
    console.log('🏷️ Tagging mirror image as local ghcr.io image...');
    await terminalPage.keyboard.type('sudo docker tag ghcr.nju.edu.cn/marble1009/aitoearn-web:latest ghcr.io/marble1009/aitoearn-web:latest\n', { delay: 40 });
    await new Promise(r => setTimeout(r, 2000));

    // 4. Start all services using docker compose up -d
    console.log('🐋 Starting up all containers using docker compose up -d...');
    await terminalPage.keyboard.type('sudo docker compose up -d\n', { delay: 40 });
    await new Promise(r => setTimeout(r, 15000));

    // 5. Verify the status
    console.log('📊 Verifying container status with docker compose ps...');
    await terminalPage.keyboard.type('sudo docker compose ps\n', { delay: 40 });
    await new Promise(r => setTimeout(r, 5000));

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    const screenshotPath = path.join(artifactDir, 'scratch', 'mirror_up_completed.png');
    await terminalPage.screenshot({ path: screenshotPath });
    console.log(`📸 Final status screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
    console.log('✨ Script completed successfully!');
  } catch (err) {
    console.error('❌ Error during mirror pull execution:', err);
  }
})();
