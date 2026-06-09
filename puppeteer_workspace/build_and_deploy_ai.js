const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

(async () => {
  let browser;
  try {
    console.log('🔌 Connecting to Chrome debugger...');
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    console.log(`Connected! Found ${pages.length} pages total.`);

    let terminalPage = null;

    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const url = p.url();
      const title = await p.title();
      
      if (url.includes('orcaterm') || url.includes('webshell') || url.includes('terminal')) {
        const hasTerminal = await p.evaluate(() => {
          const el = document.querySelector('.xterm-rows') || 
                     document.querySelector('.xterm') ||
                     document.querySelector('.terminal') ||
                     document.querySelector('.xterm-helper-textarea');
          return !!el;
        });

        console.log(`[Page ${i}] URL: ${url} | Title: ${title} | Has Terminal DOM: ${hasTerminal}`);
        if (hasTerminal) {
          terminalPage = p;
          console.log(`🎯 Found active terminal tab at Page ${i}!`);
          break;
        }
      }
    }

    if (!terminalPage) {
      throw new Error('❌ Active terminal tab not found in any page!');
    }

    console.log(`🎯 Using terminal tab: ${terminalPage.url()}`);
    await terminalPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

    // Focus terminal
    await terminalPage.evaluate(() => {
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

    await terminalPage.mouse.click(400, 300);
    await new Promise(r => setTimeout(r, 500));

    // Send Ctrl+C to clean prompt
    console.log('🧹 Cleaning prompt with Ctrl+C...');
    await terminalPage.keyboard.down('Control');
    await terminalPage.keyboard.press('KeyC');
    await terminalPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 500));
    await terminalPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    // 1. cd project/aitoearn-backend
    console.log('📂 Navigating to backend workspace...');
    await terminalPage.keyboard.type('cd ~/aitoearn/project/aitoearn-backend\n', { delay: 10 });
    await new Promise(r => setTimeout(r, 1500));

    // 2. pnpm nx run aitoearn-ai:docker-context
    console.log('🛠️ Running NX docker-context build...');
    await terminalPage.keyboard.type('pnpm nx run aitoearn-ai:docker-context\n', { delay: 10 });
    
    // NX builds can take around 20-30 seconds. Let's wait 35 seconds.
    console.log('⏳ Waiting 35 seconds for NX build to compile...');
    await new Promise(r => setTimeout(r, 35000));

    // Let's take a temporary screenshot to inspect progress
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    await terminalPage.screenshot({ path: path.join(artifactDir, 'build_ai_1_nx.png') });
    console.log('📸 NX build step screenshot saved.');

    // 3. cd tmp/docker-context
    console.log('📂 Navigating to tmp/docker-context...');
    await terminalPage.keyboard.type('cd tmp/docker-context\n', { delay: 10 });
    await new Promise(r => setTimeout(r, 1500));

    // 4. sudo docker build
    console.log('🐋 Building aitoearn-ai Docker image locally...');
    await terminalPage.keyboard.type('sudo docker build -t ghcr.io/marble1009/aitoearn-ai:latest -f Dockerfile .\n', { delay: 10 });
    
    // Docker build may take 30-40 seconds. Wait 45 seconds.
    console.log('⏳ Waiting 45 seconds for Docker build...');
    await new Promise(r => setTimeout(r, 45000));
    await terminalPage.screenshot({ path: path.join(artifactDir, 'build_ai_2_docker.png') });
    console.log('📸 Docker build step screenshot saved.');

    // 5. Return to ~/aitoearn and restart container
    console.log('📂 Navigating back to project root and restarting aitoearn-ai...');
    await terminalPage.keyboard.type('cd ~/aitoearn\n', { delay: 10 });
    await new Promise(r => setTimeout(r, 1500));

    await terminalPage.keyboard.type('sudo docker compose up -d aitoearn-ai\n', { delay: 10 });
    console.log('⏳ Waiting 15 seconds for aitoearn-ai container to start...');
    await new Promise(r => setTimeout(r, 15000));

    // 6. Restart Nginx to refresh DNS caches
    console.log('🔄 Restarting Nginx container to refresh internal dynamic DNS caches...');
    await terminalPage.keyboard.type('sudo docker compose restart nginx\n', { delay: 10 });
    console.log('⏳ Waiting 10 seconds for Nginx restart...');
    await new Promise(r => setTimeout(r, 10000));

    // 7. Verify status
    console.log('📊 Checking final containers status...');
    await terminalPage.keyboard.type('sudo docker compose ps\n', { delay: 10 });
    await new Promise(r => setTimeout(r, 5000));

    // Final screenshot
    const finalScreenshot = path.join(artifactDir, 'build_ai_3_final.png');
    await terminalPage.screenshot({ path: finalScreenshot });
    console.log(`📸 Final deploy status screenshot saved to: ${finalScreenshot}`);

    await browser.disconnect();
    console.log('🎉 AI Build and Deploy Script completed successfully!');
  } catch (err) {
    console.error('❌ Error during AI build & deploy execution:', err);
    if (browser) await browser.disconnect();
  }
})();
