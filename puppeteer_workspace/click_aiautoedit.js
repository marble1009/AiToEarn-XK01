const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('🚀 Connecting to Chrome debugger to trigger OrcaTerm connection for aiautoedit...');
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

    // 1. Click on "aiautoedit" in the connection list
    console.log('🖱️ Clicking aiautoedit connection...');
    const clickConnResult = await orcaPage.evaluate(() => {
      const items = Array.from(document.querySelectorAll('*')).filter(x => {
        return x.innerText && x.innerText.trim() === 'aiautoedit';
      });

      if (items.length > 0) {
        // Find the interactive element that is clickable (usually the parent or the item itself)
        const item = items[0];
        item.click();
        
        // Also try standard click events
        const event = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        item.dispatchEvent(event);
        return { success: true };
      }
      return { success: false };
    });

    console.log('Click connection result:', JSON.stringify(clickConnResult, null, 2));
    await new Promise(r => setTimeout(r, 4000));

    // 2. Click the "登录" button on the popup connection dialog
    console.log('🖱️ Checking for "登录" login button...');
    const clickLoginResult = await orcaPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, div, span')).filter(x => {
        if (x.children.length > 0) return false; // leaf only
        return x.innerText && x.innerText.trim() === '登录';
      });

      if (buttons.length > 0) {
        const btn = buttons[buttons.length - 1]; // last rendered
        btn.click();
        return { success: true, text: btn.innerText.trim() };
      }
      return { success: false };
    });

    console.log('Click login result:', JSON.stringify(clickLoginResult, null, 2));
    
    // Wait 12 seconds for the terminal session to fully establish and show bash prompt
    console.log('⏳ Waiting 12 seconds for SSH session to establish completely...');
    await new Promise(r => setTimeout(r, 12000));

    // 3. Focus the terminal textarea so we can start typing
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
      await orcaPage.keyboard.type(cmd, { delay: 30 });
      await new Promise(r => setTimeout(r, 200));
      await orcaPage.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, waitMs));
    }

    // 4. Send the redeployment commands
    console.log('📦 Executing deployment commands...');
    await sendCommand('cd ~/aitoearn', 2000);
    await sendCommand('git pull', 6000);
    
    console.log('🐋 Building web Docker container (Local compilation)...');
    const buildCmd = 'sudo docker build -t ghcr.io/marble1009/aitoearn-web:latest -f project/aitoearn-web/Dockerfile project/aitoearn-web';
    await sendCommand(buildCmd, 120000); // 120s wait for Docker build

    console.log('🚀 Restarting the front-end web service container...');
    await sendCommand('sudo docker compose up -d aitoearn-web', 10000);
    await sendCommand('sudo docker compose ps', 4000);

    // Save screenshot of the completed terminal
    const screenshotPath = path.join(artifactsDir, 'scratch', 'deploy_browser_completed.png');
    await orcaPage.screenshot({ path: screenshotPath });
    console.log(`📸 Deploy screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
    console.log('🎉 Browser-based deployment completed successfully! Chrome browser kept open.');
    process.exit(0);

  } catch (err) {
    console.error('❌ Browser Deployment Failed:', err);
    process.exit(1);
  }
})();
