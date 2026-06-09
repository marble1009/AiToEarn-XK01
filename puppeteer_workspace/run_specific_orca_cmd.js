const puppeteer = require('puppeteer-core');

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

    console.log(`🔌 Connected to OrcaTerm!`);
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

    // Clear prompt
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 500));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    // Command to enter mongosh inside aitoearn-mongodb container
    const mongoshCmd = "sudo docker exec -it aitoearn-mongodb mongosh mongodb://admin:password@localhost:27017/aitoearn?authSource=admin";
    console.log(`➡️ Entering mongosh: [ ${mongoshCmd} ]`);
    await orcaPage.keyboard.type(mongoshCmd, { delay: 10 });
    await new Promise(r => setTimeout(r, 500));
    await orcaPage.keyboard.press('Enter');

    console.log(`⏳ Waiting 3 seconds for mongosh to load...`);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Execute upsert query for all users in the system
    const upsertQuery = "db.user.find().forEach(function(u) { db.creditsBalance.updateOne({ userId: u._id.toString() }, { $set: { balance: 1000000 } }, { upsert: true }); });";
    console.log(`➡️ Running balance upsert query...`);
    await orcaPage.keyboard.type(upsertQuery, { delay: 10 });
    await new Promise(r => setTimeout(r, 500));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 4000));

    // Exit mongosh
    console.log(`➡️ Exiting mongosh...`);
    await orcaPage.keyboard.type("exit", { delay: 10 });
    await new Promise(r => setTimeout(r, 500));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1000));

    await browser.disconnect();
    console.log('🎉 Executed specific command.');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
