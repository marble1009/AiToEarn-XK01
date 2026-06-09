const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  let browser;
  try {
    console.log('🔌 Connecting to Chrome on 9222...');
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const consolePage = pages.find(p => p.url().includes('console.cloud.tencent.com/lighthouse'));

    if (!consolePage) {
      console.error('❌ Tencent Cloud Console (Lighthouse) tab not found!');
      await browser.disconnect();
      return;
    }

    console.log(`🔌 Connected to console! Title: ${await consolePage.title()}`);
    await consolePage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

    // Click the blue "登录" button on top bar
    console.log('🖱️ Clicking the blue "登录" button on the top bar of console...');
    const clickedConsole = await consolePage.evaluate(() => {
      // Find all buttons containing "登录"
      const buttons = Array.from(document.querySelectorAll('button, a, div, span'));
      // We want the prominent blue button at the top bar. It typically has class with "btn" or "primary"
      const loginBtn = buttons.find(b => {
        const text = (b.innerText || b.textContent || '').trim();
        return text === '登录' && b.tagName === 'BUTTON';
      });

      if (loginBtn) {
        loginBtn.click();
        return { success: true, tag: loginBtn.tagName, text: loginBtn.innerText };
      }

      // Fallback: any element strictly named "登录"
      const anyLogin = buttons.find(b => (b.innerText || b.textContent || '').trim() === '登录');
      if (anyLogin) {
        anyLogin.click();
        return { success: true, tag: anyLogin.tagName, text: anyLogin.innerText };
      }

      return { success: false };
    });

    console.log('Console login click result:', JSON.stringify(clickedConsole, null, 2));

    if (!clickedConsole.success) {
      console.error('❌ Failed to find and click the top bar login button!');
      await browser.disconnect();
      return;
    }

    console.log('⏳ Waiting 10 seconds for the new OrcaTerm tab to launch...');
    await new Promise(r => setTimeout(r, 10000));

    // Get all pages again
    const allPages = await browser.pages();
    console.log('=== Current Tabs After Action ===');
    for (let i = 0; i < allPages.length; i++) {
      console.log(`[Tab ${i}] URL: ${allPages[i].url()} | Title: ${await allPages[i].title()}`);
    }

    // Find the newly opened OrcaTerm page
    // (Usually it is the last tab or url matching orcaterm)
    // Note: We might have an old defunct orcaterm page. Let's find the one that is NOT Tab 6 (or find all and use the last one in DOM order)
    const orcaPages = allPages.filter(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
    if (orcaPages.length === 0) {
      console.error('❌ No OrcaTerm tab found after clicking console login!');
      await browser.disconnect();
      return;
    }

    const latestOrca = orcaPages[orcaPages.length - 1]; // select the newest tab
    console.log(`🔌 Selected newest OrcaTerm Tab: ${latestOrca.url()}`);
    await latestOrca.bringToFront();
    await new Promise(r => setTimeout(r, 2000));

    // Now click the modal "登录" button inside this new tab
    console.log('🖱️ Clicking modal "登录" button inside the new OrcaTerm Tab...');
    const clickedModal = await latestOrca.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, div, span')).filter(x => {
        if (x.children.length > 0) return false; // leaf element
        return x.innerText && x.innerText.trim() === '登录';
      });
      if (btns.length > 0) {
        const btn = btns[btns.length - 1]; // pick the last rendered modal button
        btn.click();
        return { success: true, text: btn.innerText };
      }
      return { success: false };
    });

    console.log('Modal login click result:', JSON.stringify(clickedModal, null, 2));

    if (clickedModal.success) {
      console.log('⏳ Waiting 12 seconds for the SSH session to establish completely...');
      await new Promise(r => setTimeout(r, 12000));
    } else {
      console.log('⚠️ Could not find modal "登录" button automatically. Attempting physical click fallback...');
      await latestOrca.mouse.click(500, 560);
      await new Promise(r => setTimeout(r, 12000));
    }

    // Screenshot final state
    const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d';
    const finalPath = path.join(artifactDir, 'scratch\\new_orca_ssh_success.png');
    await latestOrca.screenshot({ path: finalPath });
    console.log(`📸 Final re-established SSH screen saved to: ${finalPath}`);

    // Optional: Let's close the old dead Tab 6 to clean up browser
    const oldOrca = allPages.find((p, idx) => idx === 6 && p.url().includes('orcaterm'));
    if (oldOrca) {
      console.log('🧹 Closing defunct Tab 6...');
      await oldOrca.close();
    }

    await browser.disconnect();
    console.log('🎉 Full automation cycle successful.');
  } catch (err) {
    console.error('❌ Error during console click integration:', err);
    if (browser) await browser.disconnect();
  }
})();
