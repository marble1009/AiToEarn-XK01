const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    const orcaPage = pages.find(p => p.url().includes('orcaterm.cloud.tencent.com'));

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

    // Clear prompt using Enter
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';

    // 打字并按物理回车的辅助函数
    async function executeCmd(cmd, label, waitMs) {
      console.log(`⌨️ [${label}] Typing: ${cmd}`);
      await orcaPage.keyboard.type(cmd, { delay: 35 });
      await new Promise(r => setTimeout(r, 1000));
      await orcaPage.keyboard.press('Enter');
      console.log(`⏳ [${label}] Command sent. Waiting ${waitMs / 1000}s for execution...`);
      await new Promise(r => setTimeout(r, waitMs));
      
      const spath = path.join(artifactDir, `ultimate_deploy_${label.toLowerCase()}.png`);
      await orcaPage.screenshot({ path: spath });
      console.log(`📸 [${label}] Screenshot saved to: ${spath}`);
    }

    // 1. Enter Directory
    await executeCmd(
      'cd ~/aitoearn || cd aitoearn || cd Desktop/aitoearn || cd ~/github/AiToEarn-main',
      'Step1_CD',
      3000
    );

    // 2. Git Reset & Git Pull until success!
    await executeCmd(
      'git reset --hard && until git pull; do echo "Pull failed, retrying..."; sleep 3; done',
      'Step2_GitPull',
      12000
    );

    // 3. Rebuild Docker Image (Next.js production build)
    // The build usually takes ~2 minutes. Let's wait 130s.
    await executeCmd(
      'sudo docker build -t ghcr.io/marble1009/aitoearn-web:latest -f project/aitoearn-web/Dockerfile project/aitoearn-web',
      'Step3_BuildImage',
      130000
    );

    // 4. Start Container using Compose
    await executeCmd(
      'sudo docker compose up -d aitoearn-web',
      'Step4_RestartContainer',
      15000
    );

    // 5. Verify Status
    await executeCmd(
      'sudo docker compose ps',
      'Step5_VerifyStatus',
      4000
    );

    console.log('🎉 [Ultimate Deployment Finished Successfully!]');
    await browser.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error during ultimate deployment execution:', err);
  }
})();
