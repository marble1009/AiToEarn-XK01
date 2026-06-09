const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('🚀 Connecting to your active Chrome session on port 9222...');
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    
    // Find the active OrcaTerm terminal tab
    const orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));

    if (!orcaPage) {
      console.error('❌ OrcaTerm terminal tab not found! Please ensure OrcaTerm is open in Chrome.');
      await browser.disconnect();
      return;
    }

    console.log(`🔌 Connected to OrcaTerm! Tab Title: "${await orcaPage.title()}"`);
    await orcaPage.bringToFront();

    // Focus the terminal physically using page selectors and physically click center of page
    console.log('🎯 Focusing the remote terminal window...');
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

    // Clear current line by sending Ctrl + C just in case
    console.log('⌨️ Sending Ctrl+C to clear current prompt...');
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('c');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 1000));

    // 1. Navigate to directory
    console.log('⌨️ Typing: cd ~/aitoearn');
    await orcaPage.keyboard.type('cd ~/aitoearn', { delay: 50 });
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    // 2. Pull the latest code
    console.log('⌨️ Typing: git pull origin main');
    await orcaPage.keyboard.type('git pull origin main', { delay: 50 });
    await orcaPage.keyboard.press('Enter');
    console.log('⏳ Waiting 8 seconds for Git pull to complete...');
    await new Promise(r => setTimeout(r, 8000));

    // 3. Down the container
    console.log('⌨️ Typing: sudo docker compose down');
    await orcaPage.keyboard.type('sudo docker compose down', { delay: 50 });
    await orcaPage.keyboard.press('Enter');
    console.log('⏳ Waiting 10 seconds for services to stop...');
    await new Promise(r => setTimeout(r, 10000));

    // 4. Rebuild and start container
    console.log('⌨️ Typing: sudo docker compose up -d --build');
    await orcaPage.keyboard.type('sudo docker compose up -d --build', { delay: 50 });
    await orcaPage.keyboard.press('Enter');
    
    // We will monitor building via screenshots
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    console.log('⏳ Monitoring rebuild process via live screenshots...');
    for (let step = 1; step <= 3; step++) {
      await new Promise(r => setTimeout(r, 20000)); // wait 20s
      const spath = path.join(artifactDir, `cloud_deploy_step_${step}.png`);
      await orcaPage.screenshot({ path: spath });
      console.log(`📸 [Build Step ${step}/3] Screenshot saved to: ${spath}`);
    }

    // 5. Verify status
    console.log('⌨️ Typing: sudo docker compose ps');
    await orcaPage.keyboard.type('sudo docker compose ps', { delay: 50 });
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 5000));

    // Save final status screenshot
    const finalPath = path.join(artifactDir, 'cloud_deploy_final_status.png');
    await orcaPage.screenshot({ path: finalPath });
    console.log(`🎉 [Deployment Success] Final cloud state saved to: ${finalPath}`);

    await browser.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error during automatic terminal deployment:', err);
  }
})();
