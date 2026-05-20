const puppeteer = require('puppeteer');
const { MongoClient } = require('mongodb');
const { join } = require('path');
const fs = require('fs');

async function main() {
    console.log("Starting XHS Login Script on Cloud...");
    const mongoUri = "mongodb://admin:password@localhost:27018/?authSource=admin";
    const client = new MongoClient(mongoUri);
    const xhsAccountId = "xhs_18996341588"; // 我们之前创建的账号ID
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: '/usr/bin/google-chrome'
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log("Navigating to XHS Login...");
        await page.goto('https://creator.xiaohongshu.com/login', { waitUntil: 'networkidle2' });

        // 确保切换到二维码模式
        const qrTab = await page.$('.login-mode-switch') || await page.$('.qrcode-container');
        // 如果需要点击切换，可以在这里操作
        
        console.log("Taking QR Code Screenshot...");
        // 将二维码保存到 web 端的 public 目录下，方便用户访问
        const qrPath = "/root/AiToEarn-main/project/aitoearn-web/public/xhs_login.png";
        await page.screenshot({ path: qrPath, clip: { x: 400, y: 150, width: 500, height: 500 } }); // 粗略定位二维码区域
        
        console.log(`QR Code saved to: ${qrPath}`);
        console.log("Please visit http://aurastring.cloud/xhs_login.png and scan it.");

        // 轮询检查是否登录成功
        let loggedIn = false;
        for (let i = 0; i < 60; i++) { // 最多等待 5 分钟 (60 * 5s)
            const userInfo = await page.$('.user-info') || await page.$('.creator-home');
            if (userInfo) {
                console.log("Login Successful!");
                const cookies = await page.cookies();
                
                await client.connect();
                const db = client.db("aitoearn");
                await db.collection("account").updateOne(
                    { _id: xhsAccountId },
                    { $set: { loginCookie: JSON.stringify(cookies), status: 1, loginTime: new Date() } }
                );
                console.log("Cookies saved to database.");
                loggedIn = true;
                break;
            }
            await new Promise(r => setTimeout(r, 5000));
            // 如果二维码过期，这里可以逻辑刷新，但先保持简单
        }

        if (!loggedIn) console.log("Login timed out.");

    } catch (e) {
        console.error("Error during login:", e);
    } finally {
        await browser.close();
        await client.close();
    }
}

main().catch(console.error);
