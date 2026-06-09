const puppeteer = require('puppeteer-core');
const path = require('path');

const hexEnv = '4d41494c5f555345523d6169746f6561726e4061757261737472696e672e636c6f75640a4d41494c5f504153533d647262686e41454665736566787368390a4d41494c5f504f52543d3436350a4d41494c5f484f53543d736d74702e65786d61696c2e71712e636f6d0a4f50454e41495f4150495f4b45593d736b2d63702d72334957506d4b58554d394e414a3645466669336b416438575f4930566c6a394a5333396b6667536f4f6d6e44674270786b66394842726c6552417a556344354c386541744e76365a67515865316977427838336d44576b74376b5877432d6a3676514e745367747336457037416e6b6c4571316c7a380a4f50454e41495f424153455f55524c3d68747470733a2f2f6170692e6d696e696d6178692e636f6d2f76310a414e5448524f5049435f4150495f4b45593d736b2d63702d72334957506d4b58554d394e414a3645466669336b416438575f4930566c6a394a5333396b6667536f4f6d6e44674270786b66394842726c6552417a556344354c386541744e76365a67515865316977427838336d44576b74376b5877432d6a3676514e745367747336457037416e6b6c4571316c7a380a414e5448524f5049435f424153455f55524c3d68747470733a2f2f6170692e6d696e696d6178692e636f6d2f616e7468726f7069630a';
const command = `echo '${hexEnv}' | python3 -c "import sys; sys.stdout.buffer.write(bytes.fromhex(sys.stdin.read().strip()))" > ~/aitoearn/.env`;

(async () => {
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

    console.log(`🔌 Connected! Page: ${await orcaPage.title()}`);
    await orcaPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

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

    console.log('🛑 Sending Control+C to clear prompt...');
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 500));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    console.log(`➡️ Executing command to write clean env...`);
    await orcaPage.keyboard.type(command, { delay: 30 });
    await new Promise(r => setTimeout(r, 300));
    await orcaPage.keyboard.press('Enter');

    console.log('⏳ Waiting 4 seconds for file write...');
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Verify it
    console.log(`➡️ Executing cat command to verify...`);
    await orcaPage.keyboard.type('cat ~/aitoearn/.env', { delay: 30 });
    await new Promise(r => setTimeout(r, 300));
    await orcaPage.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const screenshotPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\env_hex_final.png';
    await orcaPage.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    await browser.disconnect();
    console.log('🎉 Done.');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
