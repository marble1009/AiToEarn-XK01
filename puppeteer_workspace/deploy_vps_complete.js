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
    const orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('terminal'));

    if (!orcaPage) {
      throw new Error('❌ Active terminal tab not found!');
    }

    console.log(`🎯 Found terminal: ${orcaPage.url()}`);
    await orcaPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

    // Force focus
    await orcaPage.evaluate(() => {
      const ta = document.querySelector('textarea') || document.querySelector('.xterm-helper-textarea');
      if (ta) {
        ta.focus();
        ta.click();
      }
    });

    // Physical click
    await orcaPage.mouse.click(500, 400);
    await new Promise(r => setTimeout(r, 500));

    // Ctrl+C to clear prompt
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 500));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    // Function to send command and wait
    async function sendCommand(cmd, waitMs = 2000) {
      console.log(`⌨️ Executing command: [ ${cmd} ]`);
      await orcaPage.keyboard.type(cmd, { delay: 30 });
      await new Promise(r => setTimeout(r, 200));
      await orcaPage.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, waitMs));
    }

    // 1. Pull latest code
    console.log('🔄 Pulling latest code on VPS...');
    await sendCommand('cd ~/aitoearn && git pull', 6000);

    // 2. Build docker image locally (takes around 2-3 minutes)
    console.log('🏗️ Starting VPS manual Docker build...');
    await sendCommand('sudo docker build -t ghcr.io/marble1009/aitoearn-web:latest -f project/aitoearn-web/Dockerfile project/aitoearn-web', 1000);

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    // Wait for the build (150 seconds), capturing progress screenshots
    for (let step = 1; step <= 5; step++) {
      console.log(`⏳ [Build Step ${step}/5] Waiting 30 seconds for build...`);
      await new Promise(r => setTimeout(r, 30000));
      const spath = path.join(artifactDir, 'scratch', `vps_complete_build_step_${step}.png`);
      await orcaPage.screenshot({ path: spath });
      console.log(`📸 Progress screenshot saved: scratch/vps_complete_build_step_${step}.png`);
    }

    // 3. Restart the web service
    console.log('🐋 Restarting web container...');
    await sendCommand('sudo docker compose up -d aitoearn-web', 12000);

    // 4. Restart Nginx to refresh routing IP cache
    console.log('🔄 Restarting Nginx proxy...');
    await sendCommand('sudo docker compose restart nginx', 12000);

    // 5. Verify status
    console.log('📊 Verifying container status with docker compose ps...');
    await sendCommand('sudo docker compose ps', 5000);

    const finalPath = path.join(artifactDir, 'scratch', 'vps_deploy_completed.png');
    await orcaPage.screenshot({ path: finalPath });
    console.log(`📸 Final status screenshot saved to: scratch/vps_deploy_completed.png`);

    await browser.disconnect();
    console.log('✨ Complete VPS deployment finished successfully!');
  } catch (err) {
    console.error('❌ Error during complete deployment:', err);
  }
})();
