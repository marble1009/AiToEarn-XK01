const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('🚀 Connecting to Chrome...');
  const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';

  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
    
    if (!orcaPage) {
      console.error('❌ OrcaTerm page not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔌 Connected to OrcaTerm! Page Title: ${await orcaPage.title()}`);
    await orcaPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

    // Focus terminal
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

    await orcaPage.mouse.click(400, 300);
    await new Promise(r => setTimeout(r, 500));

    // Interrupt any active command
    console.log('🛑 Sending Control+C to clear prompt...');
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 500));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    // Type the cat command to write the new .env
    const envCommand = `cat > ~/aitoearn/.env << 'EOF'
MAIL_USER=aitoearn@aurastring.cloud
MAIL_PASS=drbhnAEFesefxsh9
MAIL_PORT=465
MAIL_HOST=smtp.exmail.qq.com
EOF
`;
    console.log('➡️ Writing new .env file on the remote server...');
    await orcaPage.keyboard.type(envCommand, { delay: 20 });
    await new Promise(r => setTimeout(r, 500));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 2000));

    // Verify .env file content
    console.log('➡️ Verifying .env file...');
    await orcaPage.keyboard.type('cat ~/aitoearn/.env', { delay: 20 });
    await new Promise(r => setTimeout(r, 200));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 2000));

    // Restart docker container
    console.log('➡️ Restarting aitoearn-server container...');
    await orcaPage.keyboard.type('cd ~/aitoearn && sudo docker compose up -d aitoearn-server && sudo docker compose ps', { delay: 20 });
    await new Promise(r => setTimeout(r, 200));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 8000));

    const screenshotPath = path.join(artifactDir, 'scratch', 'restart_server_screenshot.png');
    await orcaPage.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
    console.log('🎉 Done.');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
