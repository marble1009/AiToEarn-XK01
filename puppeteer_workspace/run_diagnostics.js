const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('🚀 Running diagnostic commands on OrcaTerm to investigate Docker update issue...');
  const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';

  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
    
    if (!orcaPage) {
      console.error('❌ OrcaTerm tab not found!');
      process.exit(1);
    }

    await orcaPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

    // Focus
    await orcaPage.evaluate(() => {
      const el = document.querySelector('textarea') || document.querySelector('.xterm-helper-textarea');
      if (el) el.focus();
    });
    await orcaPage.mouse.click(400, 300);
    await new Promise(r => setTimeout(r, 500));

    async function sendCommand(cmd, waitMs = 3000) {
      console.log(`➡️ Sending: [ ${cmd} ]`);
      await orcaPage.keyboard.type(cmd, { delay: 30 });
      await new Promise(r => setTimeout(r, 200));
      await orcaPage.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, waitMs));
    }

    // Interrupt
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 1000));
    await orcaPage.keyboard.press('Enter');

    // cd and git status
    await sendCommand('cd ~/aitoearn || cd aitoearn || cd Desktop/aitoearn', 1000);
    
    console.log('🔍 Diagnostics 1: Checking git status on host...');
    await sendCommand('git status', 3000);
    
    console.log('🔍 Diagnostics 2: Checking git diff on middleware...');
    await sendCommand('git diff project/aitoearn-web/src/middleware.ts', 4000);

    console.log('🔍 Diagnostics 3: Checking docker compose build and running status...');
    await sendCommand('sudo docker compose ps', 3000);

    console.log('🔍 Diagnostics 4: Checking container actual logs during startup...');
    await sendCommand('sudo docker compose logs -n 80 aitoearn-web', 5000);

    const diagScreenshot = path.join(artifactsDir, 'diagnostics_output.png');
    await orcaPage.screenshot({ path: diagScreenshot });
    console.log(`📸 Diagnostics screenshot saved to: ${diagScreenshot}`);

    await browser.disconnect();
    console.log('🎉 Diagnostics finished!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Diagnostics failed:', err);
    process.exit(1);
  }
})();
