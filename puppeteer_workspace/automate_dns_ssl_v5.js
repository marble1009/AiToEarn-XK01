const { spawn, exec } = require('child_process');
const puppeteer = require('puppeteer-core');
const path = require('path');

// Target domains
const domains = ['aiautoedit.art', 'www.aiautoedit.art'];
const email = 'aitoearn@aiautoedit.art';

// Absolute paths
const scratchDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5\\scratch';
const sshKeyPath = 'C:\\Users\\Admin\\.ssh\\id_ed25519';
const remoteHost = '124.221.103.86';

// DNS Query Helper running on the remote server via SSH (queries DNSPod authoritative server directly)
function checkRemoteDns(host, expectedValue) {
  return new Promise((resolve) => {
    const fullDomain = `${host}.aiautoedit.art`;
    // We execute dig +short -t TXT <Domain> @1.12.0.4 (DNSPod's authoritative nameserver)
    const cmd = `ssh -i "${sshKeyPath}" -o ConnectTimeout=10 ubuntu@${remoteHost} "dig +short -t TXT ${fullDomain} @1.12.0.4"`;
    
    console.log(`🔍 SSH querying DNSPod Authoritative Nameserver for ${fullDomain}...`);
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.log(`   [Remote DNS Query Error]: ${err.message}`);
        resolve(false);
      } else {
        const val = stdout.toString().replace(/"/g, '').trim();
        console.log(`   [Remote DNS Answer]: "${val}"`);
        if (val === expectedValue.trim()) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  });
}

// Wait until DNS record is propagated globally with 45s secondary validation margin
async function waitForDnsPropagation(host, expectedValue) {
  console.log(`⏳ Starting authoritative propagation check for ${host}.aiautoedit.art -> ${expectedValue}`);
  // Wait up to 5 minutes (15 attempts * 20s)
  for (let attempt = 1; attempt <= 15; attempt++) {
    const isPropagated = await checkRemoteDns(host, expectedValue);
    if (isPropagated) {
      console.log(`🎉 DNS successfully propagated on authoritative nameservers!`);
      console.log(`⏳ [IMPORTANT] Waiting an extra 45 seconds for DNSPod global synchronization (to satisfy Let's Encrypt Multi-Perspective Secondary Validation)...`);
      await new Promise(r => setTimeout(r, 45000));
      return true;
    }
    console.log(`   (Attempt ${attempt}/15) Not propagated yet. Retrying in 20 seconds...`);
    await new Promise(r => setTimeout(r, 20000));
  }
  console.warn(`⚠️ Propagation check timed out. Continuing anyway...`);
  return false;
}

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

    // 2. Perform pre-cleanup of any existing _acme-challenge TXT records
    console.log('🧹 Cleaning up old _acme-challenge TXT records on DNSPod to avoid clutter...');
    let cleanAttempt = true;
    while (cleanAttempt) {
      const recordsToClean = await page.evaluate(() => {
        const trs = Array.from(document.querySelectorAll('tr'));
        return trs.map((tr, index) => {
          const tds = Array.from(tr.querySelectorAll('td'));
          if (tds.length < 10) return null;
          const host = tds[2].innerText ? tds[2].innerText.trim() : '';
          const type = tds[3].innerText ? tds[3].innerText.trim() : '';
          const value = tds[5].innerText ? tds[5].innerText.trim() : '';
          return { index, host, type, value };
        }).filter(r => r && r.type === 'TXT' && r.host.includes('_acme-challenge'));
      });

      if (recordsToClean.length > 0) {
        const target = recordsToClean[0];
        console.log(`   - Deleting old challenge record: Host="${target.host}", Value="${target.value}"`);
        
        await page.evaluate((hostVal, valVal) => {
          const trs = Array.from(document.querySelectorAll('tr'));
          const targetTr = trs.find(tr => {
            const tds = Array.from(tr.querySelectorAll('td'));
            if (tds.length < 10) return false;
            const h = tds[2].innerText ? tds[2].innerText.trim() : '';
            const t = tds[3].innerText ? tds[3].innerText.trim() : '';
            const v = tds[5].innerText ? tds[5].innerText.trim() : '';
            return t === 'TXT' && h === hostVal && v === valVal;
          });

          if (targetTr) {
            const deleteBtn = Array.from(targetTr.querySelectorAll('a, button')).find(el => el.innerText && el.innerText.trim() === '删除');
            if (deleteBtn) {
              deleteBtn.click();
            }
          }
        }, target.host, target.value);

        await new Promise(r => setTimeout(r, 2000));

        // Click confirm delete ("删除" blue button in modal)
        await page.evaluate(() => {
          const dialog = Array.from(document.querySelectorAll('.app-cns-console-dialog, .tc-modal, .tea-modal')).find(el => el.innerText.includes('确定删除') || el.innerText.includes('删除解析'));
          if (dialog) {
            const confirmBtn = Array.from(dialog.querySelectorAll('button')).find(btn => btn.innerText && btn.innerText.trim() === '删除');
            if (confirmBtn) confirmBtn.click();
          }
        });

        await new Promise(r => setTimeout(r, 3000));
      } else {
        cleanAttempt = false;
      }
    }
    console.log('✅ Old challenge records cleared!');

    // 3. Start Certbot via SSH spawn
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
            
            // 4. Remote Authoritative DNS Propagation Checking with 45s margin
            await waitForDnsPropagation(cleanHost, value);
            
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

      // 3. Fill in host record name in tds[2] using native property setter to trigger React state correctly
      console.log('   - Setting host record name in Host field...');
      const hostInput = await tds[2].$('input');
      if (hostInput) {
        await page.evaluate((inputEl, textVal) => {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          nativeInputValueSetter.call(inputEl, textVal);
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
          inputEl.dispatchEvent(new Event('change', { bubbles: true }));
        }, hostInput, rec.host);
      } else {
        throw new Error('❌ Host input element not found in cell 2!');
      }

      // 4. Click Record Type dropdown in tds[3]
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

      // 6. Enter token value in tds[5] using native property setter to trigger React state correctly
      console.log('   - Setting token value into Value field...');
      const valInput = await tds[5].$('input');
      if (valInput) {
        await page.evaluate((inputEl, textVal) => {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          nativeInputValueSetter.call(inputEl, textVal);
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
          inputEl.dispatchEvent(new Event('change', { bubbles: true }));
        }, valInput, rec.value);
      } else {
        throw new Error('❌ Value input element not found in cell 5!');
      }

      await new Promise(r => setTimeout(r, 1000));

      // 7. Click the "确认" (Confirm) button inside activeTr
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
        const modal = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.trim().includes('身份验证'));
        return !!modal;
      });

      if (mfaRequired) {
        const mfaScreenshotPath = path.join(scratchDir, 'wechat_mfa_qr.png');
        await page.screenshot({ path: mfaScreenshotPath });
        
        console.log(`⚠️ [MFA_REQUIRED]: WeChat QR verification required. Image saved to: ${mfaScreenshotPath}`);
        console.log('⏳ Waiting for user to scan the WeChat QR code using phone...');

        let scanned = false;
        for (let attempt = 0; attempt < 60; attempt++) { // Wait up to 3 minutes
          await new Promise(r => setTimeout(r, 3000));
          const stillExists = await page.evaluate(() => {
            const modal = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.trim().includes('身份验证'));
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

      await new Promise(r => setTimeout(r, 2000));

      // 8. Dismiss "添加成功" popup if present
      console.log('   - Dismissing "添加成功" success dialog if present...');
      await page.evaluate(() => {
        const modal = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.trim().includes('添加成功'));
        if (modal) {
          const confirmBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.innerText && btn.innerText.trim() === '确认');
          if (confirmBtn) confirmBtn.click();
        }
      });

      await new Promise(r => setTimeout(r, 2000));

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
          'sudo docker restart aitoearn-nginx'
        ]);
        
        restartSsh.on('exit', async (c) => {
          console.log(`🎉 Nginx restart complete! (Exit code: ${c})`);
          
          // Verify site locally
          console.log('🌐 Verifying live site...');
          const verifyPage = await browser.newPage();
          await verifyPage.goto('https://aiautoedit.art', { waitUntil: 'networkidle2' });
          const title = await verifyPage.title();
          console.log(`🎉 Verified! Site Title: ${title}`);
          
          // Take screenshot of home page
          const finalHomePath = path.join(scratchDir, 'final_secure_home.png');
          await verifyPage.screenshot({ path: finalHomePath });
          console.log(`📸 Verified secure home screenshot saved to: ${finalHomePath}`);
          
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
