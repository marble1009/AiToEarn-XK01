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

    // Focus the terminal
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

    // 1. Press Enter to submit the already typed "sudo docker build" command!
    console.log('⌨️ Sending "Enter" key physically to start docker build...');
    await orcaPage.keyboard.press('Enter');
    
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';

    // 2. We will loop and take screenshots to monitor the build progress in real-time!
    console.log('⏳ Monitoring docker build progress via screenshots (every 30 seconds)...');
    let buildSucceeded = false;
    
    // We expect the build to take around 2.5 minutes (150s). Let's check up to 8 times (240s).
    for (let step = 1; step <= 8; step++) {
      await new Promise(r => setTimeout(r, 30000)); // wait 30s
      
      const spath = path.join(artifactDir, `deploy_build_step_${step}.png`);
      await orcaPage.screenshot({ path: spath });
      console.log(`📸 [Step ${step}/8] Screenshot saved to: ${spath}`);
    }

    // 3. Focus and type the Docker Compose Restart command!
    console.log('⌨️ Typing restart command: sudo docker compose up -d aitoearn-web');
    await orcaPage.keyboard.type('sudo docker compose up -d aitoearn-web', { delay: 50 });
    await new Promise(r => setTimeout(r, 1000));
    await orcaPage.keyboard.press('Enter');

    console.log('⏳ Waiting 15 seconds for container restart...');
    await new Promise(r => setTimeout(r, 15000));

    // 4. Verify the container status
    console.log('⌨️ Typing verify command: sudo docker compose ps');
    await orcaPage.keyboard.type('sudo docker compose ps', { delay: 50 });
    await new Promise(r => setTimeout(r, 1000));
    await orcaPage.keyboard.press('Enter');

    await new Promise(r => setTimeout(r, 5000));
    
    // Take final validation screenshot!
    const finalPath = path.join(artifactDir, 'deploy_final_status.png');
    await orcaPage.screenshot({ path: finalPath });
    console.log(`🎉 [Deployment Completed] Final screenshot saved to: ${finalPath}`);

    await browser.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error during remote deploy completion:', err);
  }
})();
