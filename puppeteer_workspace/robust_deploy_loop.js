const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    const orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));

    if (!orcaPage) {
      console.error('❌ OrcaTerm tab not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔌 Connected to OrcaTerm! Page Title: ${await orcaPage.title()}`);
    await orcaPage.bringToFront();

    // Focus terminal
    await orcaPage.evaluate(() => {
      const el = document.querySelector('textarea') || 
                 document.querySelector('.xterm-helper-textarea') || 
                 document.querySelector('.xterm') ||
                 document.querySelector('.terminal');
      if (el) {
        el.focus();
        if (el.click && el.tagName !== 'TEXTAREA') el.click();
      }
    });
    await orcaPage.mouse.click(400, 300);
    await new Promise(r => setTimeout(r, 1000));

    // 1. Interrupt any running build immediately!
    console.log('🛑 Sending Control+C to abort the old incomplete build...');
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 1000));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    // 2. Precising path
    console.log('📂 Navigating to the workspace directory...');
    await orcaPage.keyboard.type('cd ~/aitoearn || cd aitoearn || cd Desktop/aitoearn || cd ~/github/AiToEarn-main', { delay: 30 });
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1500));

    // 3. Executing robust git pull loop until absolutely successful!
    console.log('⌨️ Executing robust git pull loop...');
    await orcaPage.keyboard.type('git reset --hard && until git pull; do echo "Pull failed, retrying in 3s..."; sleep 3; done', { delay: 30 });
    await orcaPage.keyboard.press('Enter');

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';

    console.log('⏳ Waiting 25 seconds for code synchronization to succeed...');
    await new Promise(r => setTimeout(r, 25000));

    // Take screenshot of code sync state
    const syncPath = path.join(artifactDir, 'deploy_code_sync_status.png');
    await orcaPage.screenshot({ path: syncPath });
    console.log(`📸 Code sync state screenshot saved to: ${syncPath}`);

    // 4. Executing docker build
    console.log('⌨️ Typing build command: sudo docker build ...');
    await orcaPage.keyboard.type('sudo docker build -t ghcr.io/marble1009/aitoearn-web:latest -f project/aitoearn-web/Dockerfile project/aitoearn-web', { delay: 30 });
    await orcaPage.keyboard.press('Enter');

    console.log('⏳ Monitoring new docker build (every 30 seconds for 2.5 mins)...');
    for (let step = 1; step <= 5; step++) {
      await new Promise(r => setTimeout(r, 30000));
      const spath = path.join(artifactDir, `deploy_loop_build_${step}.png`);
      await orcaPage.screenshot({ path: spath });
      console.log(`📸 [Build Step ${step}/5] Screenshot saved to: ${spath}`);
    }

    // 5. Restart container
    console.log('⌨️ Restarting container: sudo docker compose up -d aitoearn-web');
    await orcaPage.keyboard.type('sudo docker compose up -d aitoearn-web', { delay: 30 });
    await orcaPage.keyboard.press('Enter');

    console.log('⏳ Waiting 15 seconds for service startup...');
    await new Promise(r => setTimeout(r, 15000));

    // 6. Verify container status
    console.log('⌨️ Executing: sudo docker compose ps');
    await orcaPage.keyboard.type('sudo docker compose ps', { delay: 30 });
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 4000));

    const finalPath = path.join(artifactDir, 'deploy_loop_final_status.png');
    await orcaPage.screenshot({ path: finalPath });
    console.log(`🎉 [Robust Deployment Finished] Final screenshot saved to: ${finalPath}`);

    await browser.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error during robust deploy loop:', err);
  }
})();
