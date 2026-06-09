const puppeteer = require('puppeteer-core');

const commandToRun = process.argv[2];
const waitMs = parseInt(process.argv[3], 10) || 5000;

if (!commandToRun) {
  console.error('❌ Please provide a command to run!');
  process.exit(1);
}

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

    await orcaPage.bringToFront();
    await new Promise(r => setTimeout(r, 500));

    // Focus terminal Helper Textarea explicitly
    await orcaPage.evaluate(() => {
      const ta = document.querySelector('.xterm-helper-textarea') || 
                 document.querySelector('textarea') || 
                 document.querySelector('.xterm-rows') || 
                 document.querySelector('.terminal');
      if (ta) ta.focus();
    });

    // Also click to be completely sure
    await orcaPage.mouse.click(400, 300);
    await new Promise(r => setTimeout(r, 500));

    // Interrupt previous inputs to get a clean prompt
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 300));
    await orcaPage.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 800));

    const topic = `antigravity-tunnel-${Date.now()}`;
    // Base64 command wrapper
    const cmd = `curl -s -d "$(${commandToRun} 2>&1 | base64 -w 0)" https://ntfy.sh/${topic}`;
    
    console.log(`➡️ Sending command to VPS: [ ${commandToRun} ]`);
    await orcaPage.keyboard.type(cmd, { delay: 35 });
    await new Promise(r => setTimeout(r, 500));
    await orcaPage.keyboard.press('Enter');

    console.log(`⏳ Waiting ${waitMs}ms for execution...`);
    await new Promise(r => setTimeout(r, waitMs));

    await browser.disconnect();

    // Fetch result from ntfy.sh
    console.log(`📡 Fetching from tunnel: https://ntfy.sh/${topic}`);
    const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1`);
    const jsonText = await res.text();
    
    const lines = jsonText.trim().split('\n').filter(Boolean);
    let lastMessage = null;
    let attachmentUrl = null;
    
    for (let i = lines.length - 1; i >= 0; i--) {
      const msg = JSON.parse(lines[i]);
      if (msg.event === 'message') {
        if (msg.attachment && msg.attachment.url) {
          attachmentUrl = msg.attachment.url;
          break;
        } else if (msg.message && !msg.message.startsWith('You received a file')) {
          lastMessage = msg.message;
          break;
        }
      }
    }

    let base64Content = '';
    if (attachmentUrl) {
      console.log(`📂 Found large output saved as attachment: ${attachmentUrl}`);
      const attachRes = await fetch(attachmentUrl);
      base64Content = (await attachRes.text()).trim();
    } else if (lastMessage) {
      base64Content = lastMessage;
    }

    if (base64Content) {
      const decoded = Buffer.from(base64Content, 'base64').toString('utf-8');
      console.log('\n========= REMOTE EXECUTION OUTPUT =========');
      console.log(decoded.trim());
      console.log('===========================================\n');
    } else {
      console.log('❌ No output received from VPS.');
    }

  } catch (err) {
    console.error('❌ Safe remote execution error:', err);
  }
})();
