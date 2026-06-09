const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('🚀 Connecting to Chrome debugger to deploy the web routing guard...');
  const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';

  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    console.log(`🔌 Connected! Active tabs: ${pages.length}`);

    const orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
    if (!orcaPage) {
      throw new Error('❌ OrcaTerm tab not found! Please open your cloud console terminal.');
    }

    console.log('🎯 Found OrcaTerm tab. Activating and focusing...');
    await orcaPage.bringToFront();
    await new Promise(r => setTimeout(r, 2000));

    // Focus Terminal
    await orcaPage.evaluate(() => {
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

    await orcaPage.mouse.click(400, 300);
    await new Promise(r => setTimeout(r, 1000));

    // High reliability command typing function
    async function sendCommand(cmd, waitMs = 2000) {
      console.log(`➡️ Sending: [ ${cmd} ]`);
      await orcaPage.keyboard.type(cmd, { delay: 30 });
      await new Promise(r => setTimeout(r, 200));
      await orcaPage.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, waitMs));
    }

    // Clear active prompt
    console.log('🛑 Sending Ctrl + C interrupt...');
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 500));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    // 1. cd to project directory
    await sendCommand('cd ~/aitoearn || cd aitoearn || cd Desktop/aitoearn', 2000);

    // 2. git pull
    console.log('🔄 Executing git pull on remote host...');
    await sendCommand('git pull', 6000);

    // 3. docker compose pull aitoearn-web
    console.log('🐋 Pulling the newly compiled ghcr.io docker image for aitoearn-web...');
    await sendCommand('sudo docker compose pull aitoearn-web', 25000); // Wait 25s for download

    // 4. docker compose up -d aitoearn-web
    console.log('🚀 Restarting the front-end web service...');
    await sendCommand('sudo docker compose up -d aitoearn-web', 10000); // Wait 10s for start

    // 5. check container status
    console.log('📊 Checking container status...');
    await sendCommand('sudo docker compose ps', 4000);

    // Save screenshot
    const deployScreenshot = path.join(artifactsDir, 'deploy_web_status.png');
    await orcaPage.screenshot({ path: deployScreenshot });
    console.log(`📸 Remote deploy screenshot saved to: ${deployScreenshot}`);

    await browser.disconnect();
    console.log('🎉 Remote deployment commands executed successfully!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Deployment Failed:', err);
    process.exit(1);
  }
})();
