const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');
const path = require('path');

// Target domains
const domains = ['aiautoedit.art', 'www.aiautoedit.art'];
const email = 'aitoearn@aiautoedit.art';

// Absolute paths
const scratchDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5\\scratch';
const sshKeyPath = 'C:\\Users\\Admin\\.ssh\\id_ed25519';
const remoteHost = '124.221.103.86';

(async () => {
  let browser = null;
  let page = null;

  try {
    // 1. Connect to local debugging Chrome
    console.log('🔌 Connecting to local Chrome debugging port 9222...');
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    const pages = await browser.pages();
    page = pages.find(p => p.url().includes('cloud.tencent.com'));

    if (!page) {
      console.error('❌ Active Tencent Cloud/DNSPod tab not found in Chrome!');
      await browser.disconnect();
      return;
    }
    console.log(`✅ Connected! Active Tab: ${page.url()}`);
    await page.bringToFront();

    console.log('🔄 Reloading DNSPod page to ensure a clean slate...');
    await page.reload({ waitUntil: 'networkidle2' }).catch(() => {});
    await new Promise(r => setTimeout(r, 4000));

    // 2. Start Certbot via SSH spawn
    console.log('🚀 Spawning Certbot DNS-01 manual challenge via SSH...');
    const certbotCmd = `sudo certbot certonly --manual --preferred-challenges dns -d aiautoedit.art -d www.aiautoedit.art --email ${email} --agree-tos --manual-public-ip-logging-ok`;
    
    const ssh = spawn('ssh', [
      '-i', sshKeyPath,
      '-o', 'ConnectTimeout=10',
      `ubuntu@${remoteHost}`,
      certbotCmd
    ]);

    let outputBuffer = '';
    const processedChallenges = new Set();
    let isProcessing = false;

    ssh.stdout.on('data', async (data) => {
      const str = data.toString();
      console.log(`[Certbot STDOUT]: ${str}`);
      outputBuffer += str;
      
      // Parse output for challenges
      await parseAndProcessChallenges();
    });

    ssh.stderr.on('data', (data) => {
      console.log(`[Certbot STDERR]: ${data.toString()}`);
    });

    ssh.on('close', (code) => {
      console.log(`[Certbot Process Exited] Code: ${code}`);
    });

    async function parseAndProcessChallenges() {
      if (isProcessing) return; // avoid concurrent browser actions
      
      // Regex pattern to extract DNS TXT record details:
      // Please deploy a DNS TXT record under the name:
      // _acme-challenge.aiautoedit.art.
      // with the following value:
      // <VALUE>
      const regex = /Please deploy a DNS TXT record under the name:\s*\r?\n?\s*(_acme-challenge\S*)\s*\r?\n?\s*with the following value:\s*\r?\n?\s*(\S+)/gi;
      
      let match;
      while ((match = regex.exec(outputBuffer)) !== null) {
        const fullHost = match[1].trim();
        const value = match[2].trim();
        
        // Clean trailing dots and strip domain name
        const cleanHost = fullHost.replace(/\.*$/, '').replace('.aiautoedit.art', '');
        const uniqueKey = `${cleanHost}:${value}`;

        if (!processedChallenges.has(uniqueKey)) {
          processedChallenges.add(uniqueKey);
          isProcessing = true;
          
          console.log(`✨ Parsed Challenge: Host="${cleanHost}" (for ${fullHost}), Value="${value}"`);
          
          try {
            await deployDNSRecord({ host: cleanHost, value });
            
            console.log('⏳ Waiting 25 seconds for DNSPod DNS propagation to take effect...');
            await new Promise(r => setTimeout(r, 25000));
            
            console.log('⌨️ Sending ENTER to Certbot process to continue...');
            ssh.stdin.write('\n');
          } catch (err) {
            console.error('❌ Failed to process challenge:', err);
          } finally {
            isProcessing = false;
            // Trigger again just in case another challenge was buffered while we were processing
            await parseAndProcessChallenges();
          }
        }
      }
    }

    async function deployDNSRecord(rec) {
      console.log(`🌐 Deploying TXT record to DNSPod: Host="${rec.host}", Value="${rec.value}"`);

      // 1. Click "添加记录" button
      console.log('   - Clicking "添加记录" button...');
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const addBtn = buttons.find(btn => btn.innerText && btn.innerText.trim() === '添加记录');
        if (addBtn) addBtn.click();
      });
      
      await new Promise(r => setTimeout(r, 2000));

      // 2. Find the active editing row
      const trs = await page.$$('tr');
      let activeTr = null;
      for (const tr of trs) {
        const text = await page.evaluate(el => el.innerText, tr);
        if (text.includes('确认') && text.includes('取消')) {
          activeTr = tr;
          break;
        }
      }

      if (!activeTr) {
        throw new Error('❌ Active edit row not found in the table!');
      }

      const tds = await activeTr.$$('td');

      // 3. Fill in host record name in tds[2] (主机记录, name="Name") using actual typing
      console.log('   - Typing host record name into Host field...');
      const hostInput = await tds[2].$('input');
      if (hostInput) {
        await hostInput.focus();
        await page.keyboard.down('Control');
        await page.keyboard.press('KeyA');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
        await hostInput.type(rec.host);
      } else {
        throw new Error('❌ Host input element not found in cell 2!');
      }

      // 4. Click Record Type dropdown in tds[3] (记录类型 dropdown)
      console.log('   - Clicking Record Type dropdown in cell 3...');
      const typeDropdown = await tds[3].$('.app-cns-console-dropdown') || await tds[3].$('.app-cns-console-dropdown__value') || await tds[3].$('.app-cns-console-select') || tds[3];
      await typeDropdown.click();

      await new Promise(r => setTimeout(r, 1000));

      // 5. Select TXT option
      console.log('   - Selecting TXT option from dropdown list...');
      await page.evaluate(() => {
        const options = Array.from(document.querySelectorAll('li'));
        const txtOption = options.find(el => el.innerText && el.innerText.trim() === 'TXT');
        if (txtOption) txtOption.click();
      });

      await new Promise(r => setTimeout(r, 1000));

      // 6. Enter token value in tds[5] (记录值, name="Value") using actual typing
      console.log('   - Typing token value into Value field...');
      const valInput = await tds[5].$('input');
      if (valInput) {
        await valInput.focus();
        await page.keyboard.down('Control');
        await page.keyboard.press('KeyA');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
        await valInput.type(rec.value);
      } else {
        throw new Error('❌ Value input element not found in cell 5!');
      }

      await new Promise(r => setTimeout(r, 1000));

      // 7. Click the "确认" (Confirm) button inside activeTr (tds[11])
      console.log('   - Clicking "确认" (Confirm) to save...');
      const confirmBtn = await page.evaluateHandle((tr) => {
        return Array.from(tr.querySelectorAll('button')).find(btn => btn.innerText && btn.innerText.trim() === '确认');
      }, activeTr);
      
      if (confirmBtn) {
        await confirmBtn.click();
      } else {
        throw new Error('❌ Confirm button not found!');
      }

      console.log('   - Clicked Confirm button. Checking for security MFA dialog...');
      await new Promise(r => setTimeout(r, 2000));

      // Check if WeChat verification modal appeared
      const mfaRequired = await page.evaluate(() => {
        const modal = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.trim() === '身份验证');
        return !!modal;
      });

      if (mfaRequired) {
        const mfaScreenshotPath = path.join(scratchDir, 'wechat_mfa_qr.png');
        await page.screenshot({ path: mfaScreenshotPath });
        
        console.log(`⚠️ [MFA_REQUIRED]: WeChat QR verification required. Image saved to: C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5\\scratch\\wechat_mfa_qr.png`);
        console.log('⏳ Waiting for user to scan the WeChat QR code using phone...');

        let scanned = false;
        for (let attempt = 0; attempt < 60; attempt++) { // Wait up to 3 minutes
          await new Promise(r => setTimeout(r, 3000));
          const stillExists = await page.evaluate(() => {
            const modal = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.trim() === '身份验证');
            return !!modal;
          });
          
          if (!stillExists) {
            console.log('🎉 WeChat MFA scan completed successfully!');
            scanned = true;
            break;
          }
        }

        if (!scanned) {
          throw new Error('❌ WeChat MFA verification timed out. Please run the script again and scan faster!');
        }
      } else {
        console.log('   - Saved record successfully without MFA challenge.');
      }

      await new Promise(r => setTimeout(r, 3000));

      // Take a screenshot of the deployed records list
      const recordsScreenshotPath = path.join(scratchDir, `dns_record_${rec.host}.png`);
      await page.screenshot({ path: recordsScreenshotPath });
      console.log(`📸 Screenshot of deployed records list saved to: ${recordsScreenshotPath}`);
    }

    // Monitor exit
    ssh.on('exit', async (code) => {
      if (code === 0) {
        console.log('🚀 Certbot completed successfully! SSL certificates acquired!');
        
        // Restart nginx container
        console.log('🔄 Restarting aitoearn-nginx to apply the new certificates...');
        const restartSsh = spawn('ssh', [
          '-i', sshKeyPath,
          `ubuntu@${remoteHost}`,
          'sudo docker start aitoearn-nginx'
        ]);
        restartSsh.on('exit', async (c) => {
          console.log(`🎉 Nginx restart complete! (Exit code: ${c})`);
          
          // Verify site locally
          console.log('🌐 Verifying live site...');
          const verifyPage = await browser.newPage();
          await verifyPage.goto('https://aiautoedit.art', { waitUntil: 'networkidle2' });
          const title = await verifyPage.title();
          console.log(`🎉 Verified! Site Title: ${title}`);
          
          await browser.disconnect();
          process.exit(0);
        });
      } else {
        console.error(`❌ Certbot failed with exit code ${code}.`);
        if (browser) await browser.disconnect();
        process.exit(1);
      }
    });

  } catch (err) {
    console.error('Error:', err);
    if (browser) await browser.disconnect();
    process.exit(1);
  }
})();
