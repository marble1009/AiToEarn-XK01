const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const orcaPage = pages.find(p => p.url().includes('orcaterm'));
    
    if (!orcaPage) {
      console.error('OrcaTerm page not found!');
      await browser.disconnect();
      return;
    }

    console.log('Focusing terminal...');
    await orcaPage.click('.xterm-helper-textarea');
    
    // Clear prompt
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await orcaPage.keyboard.type('\n');
    await new Promise(r => setTimeout(r, 1000));

    console.log('Navigating to aitoearn directory...');
    await orcaPage.keyboard.type('cd aitoearn\n');
    await new Promise(r => setTimeout(r, 500));

    console.log('Sending docker compose pull...');
    await orcaPage.keyboard.type('sudo docker compose pull aitoearn-web\n');
    
    // Wait 30 seconds for pull to complete
    console.log('Waiting 30 seconds for pull...');
    await new Promise(r => setTimeout(r, 30000));

    console.log('Sending docker compose up...');
    await orcaPage.keyboard.type('sudo docker compose up -d aitoearn-web\n');

    // Wait 15 seconds for container to start
    console.log('Waiting 15 seconds...');
    await new Promise(r => setTimeout(r, 15000));

    const screenshotPath = `C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\remote_deploy.png`;
    await orcaPage.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
