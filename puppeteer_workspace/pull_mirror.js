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

    console.log('Pulling from NJU mirror...');
    await orcaPage.keyboard.type('sudo docker pull ghcr.nju.edu.cn/marble1009/aitoearn-web:latest\n');
    
    // Wait 40 seconds for pull to complete
    console.log('Waiting 40 seconds for mirror pull...');
    await new Promise(r => setTimeout(r, 40000));

    console.log('Tagging image...');
    await orcaPage.keyboard.type('sudo docker tag ghcr.nju.edu.cn/marble1009/aitoearn-web:latest ghcr.io/marble1009/aitoearn-web:latest\n');
    await new Promise(r => setTimeout(r, 1000));

    console.log('Starting container...');
    await orcaPage.keyboard.type('sudo docker compose up -d aitoearn-web\n');
    await new Promise(r => setTimeout(r, 5000));

    const screenshotPath = `C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\remote_pull_mirror.png`;
    await orcaPage.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
})();
