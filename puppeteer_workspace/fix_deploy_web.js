const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('🚀 Connecting to Chrome debugger to fix and redeploy aiautoedit-web on OrcaTerm...');
  const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5';

  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const orcaPage = pages.find(p => p.url().includes('orcaterm.cloud.tencent.com'));

    if (!orcaPage) {
      throw new Error('❌ OrcaTerm tab not found!');
    }

    console.log('🎯 Found OrcaTerm tab. Activating and focusing...');
    await orcaPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

    // Focus terminal
    console.log('🎯 Focusing terminal input...');
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

    // High reliability command typing function
    async function sendCommand(cmd, waitMs = 2000) {
      console.log(`➡️ Sending: [ ${cmd} ]`);
      await orcaPage.keyboard.type(cmd, { delay: 40 });
      await new Promise(r => setTimeout(r, 300));
      await orcaPage.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, waitMs));
    }

    // Clear active prompt using Ctrl+C
    console.log('🛑 Sending Ctrl + C interrupt...');
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 1000));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 2000));

    // 1. cd to project directory
    await sendCommand('cd ~/aitoearn', 2000);

    // 2. git pull
    console.log('🔄 Executing git pull on remote host...');
    await sendCommand('git pull', 6000);

    // 3. Local build docker image to bypass third-party mirror delay
    console.log('🐋 Building docker image locally to avoid mirror sync delay...');
    const buildCmd = 'sudo docker build -t ghcr.io/marble1009/aitoearn-web:latest -f project/aitoearn-web/Dockerfile project/aitoearn-web';
    await sendCommand(buildCmd, 120000); // 120 seconds wait for Docker Build

    // 4. docker compose up -d aitoearn-web
    console.log('🚀 Restarting the front-end web service...');
    await sendCommand('sudo docker compose up -d aitoearn-web', 10000); // Wait 10s for start

    // 5. check container status
    console.log('📊 Checking container status...');
    await sendCommand('sudo docker compose ps', 4000);

    // Save screenshot
    const fixedScreenshot = path.join(artifactsDir, 'scratch', 'deploy_browser_fixed.png');
    await orcaPage.screenshot({ path: fixedScreenshot });
    console.log(`📸 Fixed deploy screenshot saved to: ${fixedScreenshot}`);

    // Clean up Puppeteer connection but DO NOT CLOSE BROWSER!
    await browser.disconnect();
    console.log('🎉 Browser-based deployment completed successfully! Chrome browser kept open.');
    process.exit(0);

  } catch (err) {
    console.error('❌ Deployment Failed:', err);
    process.exit(1);
  }
})();
