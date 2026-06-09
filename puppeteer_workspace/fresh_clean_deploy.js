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

    console.log(`🔌 Connected! Page Title: ${await orcaPage.title()}`);
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

    // Clear prompt in case there's stale input
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 1000));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1500));

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';

    // 1. Build the Docker Image
    console.log('⌨️ Typing build command: sudo docker build ...');
    await orcaPage.keyboard.type('sudo docker build -t ghcr.io/marble1009/aitoearn-web:latest -f project/aitoearn-web/Dockerfile project/aitoearn-web', { delay: 35 });
    await new Promise(r => setTimeout(r, 1000));
    await orcaPage.keyboard.press('Enter');

    console.log('⏳ Monitoring clean build (every 30 seconds for 2.5 mins)...');
    for (let step = 1; step <= 5; step++) {
      await new Promise(r => setTimeout(r, 30000));
      const spath = path.join(artifactDir, `clean_deploy_build_${step}.png`);
      await orcaPage.screenshot({ path: spath });
      console.log(`📸 [Build Step ${step}/5] Screenshot saved to: ${spath}`);
    }

    // 2. Up container
    console.log('⌨️ Restarting container: sudo docker compose up -d aitoearn-web');
    await orcaPage.keyboard.type('sudo docker compose up -d aitoearn-web', { delay: 35 });
    await new Promise(r => setTimeout(r, 1000));
    await orcaPage.keyboard.press('Enter');

    console.log('⏳ Waiting 15 seconds for container startup...');
    await new Promise(r => setTimeout(r, 15000));

    // 3. Verify
    console.log('⌨️ Verifying status: sudo docker compose ps');
    await orcaPage.keyboard.type('sudo docker compose ps', { delay: 35 });
    await new Promise(r => setTimeout(r, 1000));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 4000));

    const finalPath = path.join(artifactDir, 'clean_deploy_final_status.png');
    await orcaPage.screenshot({ path: finalPath });
    console.log(`🎉 [Clean Deployment Finished Successfully] Screenshot saved to: ${finalPath}`);

    await browser.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error during clean deploy:', err);
  }
})();
