const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell'));
    
    if (!orcaPage) {
      console.error('❌ OrcaTerm page not found!');
      await browser.disconnect();
      return;
    }

    console.log('🔌 Connected to OrcaTerm.');
    await orcaPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));

    // Focus and click
    await orcaPage.mouse.click(400, 300);
    await new Promise(r => setTimeout(r, 500));

    // Interrupted control C
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 1000));

    // Type docker command to write out.txt to /data/aitoearn/out.txt and chmod it
    const cmd = "sudo docker exec aitoearn-rustfs sh -c \"echo 'Hello Antigravity at '`date` > /data/aitoearn/out.txt && chmod 777 /data/aitoearn/out.txt\"";
    console.log(`➡️ Executing on VPS: ${cmd}`);
    await orcaPage.keyboard.type(cmd, { delay: 20 });
    await new Promise(r => setTimeout(r, 300));
    await orcaPage.keyboard.press('Enter');

    console.log('⏳ Waiting 4000ms...');
    await new Promise(r => setTimeout(r, 4000));

    await browser.disconnect();

    // Now, let's fetch it locally!
    console.log('📡 Fetching output from cloud server...');
    const url = 'http://111.229.159.100/oss/out.txt';
    const res = await fetch(url);
    const text = await res.text();
    console.log('\n========= HTTP FETCHED RESULT =========');
    console.log(text.trim());
    console.log('=======================================\n');

  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
