const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const orcaPage = pages.find(p => p.url().includes('orcaterm'));
    
    if (!orcaPage) {
      console.error('❌ OrcaTerm page not found!');
      await browser.disconnect();
      return;
    }

    console.log('🔌 Connected to OrcaTerm!');
    await orcaPage.bringToFront();
    await orcaPage.mouse.click(400, 300);
    await new Promise(r => setTimeout(r, 1000));

    // Clear prompt
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 1000));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';

    async function executeCmd(cmd, label, waitMs) {
      console.log(`⌨️ [${label}] Typing: ${cmd}`);
      await orcaPage.keyboard.type(cmd, { delay: 35 });
      await new Promise(r => setTimeout(r, 1000));
      await orcaPage.keyboard.press('Enter');
      console.log(`⏳ [${label}] Command sent. Waiting ${waitMs / 1000}s...`);
      await new Promise(r => setTimeout(r, waitMs));
      
      const spath = path.join(artifactDir, `scratch\\rebuild_${label.toLowerCase()}.png`);
      await orcaPage.screenshot({ path: spath });
      console.log(`📸 [${label}] Screenshot saved to: ${spath}`);
    }

    // 1. Enter Directory
    await executeCmd(
      'cd ~/aitoearn || cd aitoearn || cd Desktop/aitoearn || cd ~/github/AiToEarn-main',
      'Step1_CD',
      3000
    );

    // 2. Git Reset & Git Pull
    await executeCmd(
      'git reset --hard && until git pull; do echo "Pull failed, retrying..."; sleep 3; done',
      'Step2_GitPull',
      12000
    );

    // 3. Rebuild locally to avoid github packages network timeouts!
    await executeCmd(
      'sudo docker build -t ghcr.io/marble1009/aitoearn-web:latest -f project/aitoearn-web/Dockerfile project/aitoearn-web',
      'Step3_BuildImage',
      130000
    );

    // 4. Start all containers (including mongodb, server, web, nginx)
    await executeCmd(
      'sudo docker compose up -d',
      'Step4_ComposeUp',
      25000
    );

    // 5. Verify Status
    await executeCmd(
      'sudo docker compose ps',
      'Step5_VerifyStatus',
      5000
    );

    await browser.disconnect();
    console.log('🎉 Rebuild complete.');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
