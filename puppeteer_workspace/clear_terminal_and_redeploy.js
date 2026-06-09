const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('🔌 Connecting to Chrome debugger...');
  let browser;
  try {
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    let terminalPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));

    if (!terminalPage) {
      throw new Error('❌ Active terminal tab not found!');
    }

    console.log('🎯 Found terminal! Bringing it to front...');
    await terminalPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

    // Focus
    await terminalPage.evaluate(() => {
      const el = document.querySelector('textarea') || document.querySelector('.xterm-helper-textarea');
      if (el) el.focus();
    });
    await terminalPage.mouse.click(400, 300);
    await new Promise(r => setTimeout(r, 500));

    // 1. Send 'q' key to quit less/pager
    console.log("⌨️ Sending 'q' to quit less...");
    await terminalPage.keyboard.press('KeyQ');
    await new Promise(r => setTimeout(r, 1000));

    // 2. Send multiple Ctrl+C to force cancel any hanging commands
    console.log('🧹 Sending Ctrl+C and Enter...');
    await terminalPage.keyboard.down('Control');
    await terminalPage.keyboard.press('KeyC');
    await terminalPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 500));
    await terminalPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    // 3. Take a screenshot to verify we are back at the normal prompt
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    await terminalPage.screenshot({ path: path.join(artifactDir, 'redeploy_1_cleared.png') });
    console.log('📸 Screenshot of cleared terminal saved.');

    // 4. Navigate and build using Nx
    console.log('📂 Navigating to backend and running NX docker-context...');
    await terminalPage.keyboard.type('cd ~/aitoearn/project/aitoearn-backend\n', { delay: 10 });
    await new Promise(r => setTimeout(r, 1500));

    await terminalPage.keyboard.type('pnpm nx run aitoearn-ai:docker-context\n', { delay: 10 });
    console.log('⏳ Waiting 35 seconds for NX compilation...');
    await new Promise(r => setTimeout(r, 35000));
    await terminalPage.screenshot({ path: path.join(artifactDir, 'redeploy_2_nx_done.png') });

    // 5. Navigate to docker context and build image
    console.log('📂 Going to docker-context and building image...');
    await terminalPage.keyboard.type('cd tmp/docker-context\n', { delay: 10 });
    await new Promise(r => setTimeout(r, 1500));

    await terminalPage.keyboard.type('sudo docker build -t ghcr.io/marble1009/aitoearn-ai:latest -f Dockerfile .\n', { delay: 10 });
    console.log('⏳ Waiting 50 seconds for Docker build...');
    await new Promise(r => setTimeout(r, 50000));
    await terminalPage.screenshot({ path: path.join(artifactDir, 'redeploy_3_docker_done.png') });

    // 6. Return and recreate container
    console.log('🐋 Recreating aitoearn-ai container...');
    await terminalPage.keyboard.type('cd ~/aitoearn\n', { delay: 10 });
    await new Promise(r => setTimeout(r, 1500));

    await terminalPage.keyboard.type('sudo docker compose up -d aitoearn-ai\n', { delay: 10 });
    console.log('⏳ Waiting 15 seconds for container...');
    await new Promise(r => setTimeout(r, 15000));

    // 7. Restart Nginx to refresh upstream dynamic IPs
    console.log('🔄 Restarting Nginx container...');
    await terminalPage.keyboard.type('sudo docker compose restart nginx\n', { delay: 10 });
    console.log('⏳ Waiting 10 seconds...');
    await new Promise(r => setTimeout(r, 10000));

    // 8. Confirm status
    console.log('📊 Running final ps checks...');
    await terminalPage.keyboard.type('sudo docker compose ps\n', { delay: 10 });
    await new Promise(r => setTimeout(r, 5000));

    const finalPath = path.join(artifactDir, 'redeploy_4_final_status.png');
    await terminalPage.screenshot({ path: finalPath });
    console.log(`📸 Final screenshot saved to: ${finalPath}`);

    await browser.disconnect();
    console.log('🎉 Redeployment completed successfully!');
  } catch (err) {
    console.error('❌ Error during redeployment:', err);
    if (browser) await browser.disconnect();
  }
})();
