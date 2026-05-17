import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const CONFIG = {
    cookiePath: path.join(__dirname, 'xhs_cookies.json'),
    screenshotDir: path.join(__dirname, 'screenshots'),
};

async function main() {
    console.log('==================================================');
    console.log('  小红书 (XHS) 作品列表与审核状态检查');
    console.log('==================================================');

    if (!fs.existsSync(CONFIG.cookiePath)) {
        console.error('❌ 未找到 Cookie 文件，请先运行发布测试登录。');
        return;
    }

    let executablePath: string | undefined = undefined;
    if (process.platform === 'win32') {
        for (const p of [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
        ]) { if (fs.existsSync(p)) { executablePath = p; break; } }
    }

    const browser = await puppeteer.launch({
        headless: false,
        executablePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        const cookies = JSON.parse(fs.readFileSync(CONFIG.cookiePath, 'utf8'));
        await page.setCookie(...cookies);
        console.log('👉 已注入 Cookie，正在前往创作者服务平台...');

        await page.goto('https://creator.xiaohongshu.com', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await new Promise(r => setTimeout(r, 4000));

        // 截图首页
        if (!fs.existsSync(CONFIG.screenshotDir)) fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
        await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'check_01_home.png') });
        console.log('📸 首页截图已保存');

        // 点击“笔记管理”
        console.log('👉 正在寻找并点击“笔记管理”菜单...');
        const clickedMenu = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            for (const el of elements) {
                const text = ((el as HTMLElement).innerText || '').trim();
                if (text === '笔记管理') {
                    (el as HTMLElement).click();
                    return true;
                }
            }
            return false;
        });

        if (clickedMenu) {
            console.log('🎉 已点击“笔记管理”菜单，等待页面加载...');
            await new Promise(r => setTimeout(r, 5000));
            await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'check_02_notes.png') });
            console.log('📸 笔记管理页面截图已保存');

            // 抓取第一页所有的作品标题和状态
            const notes = await page.evaluate(() => {
                // 查找可能的笔记卡片或列表项
                const items = Array.from(document.querySelectorAll('[class*="note"], [class*="card"], tr, [class*="item"]'));
                return items
                    .map(el => {
                        const text = (el.textContent || '').trim();
                        // 提取包含标题、状态和日期的信息
                        if (text.includes('发布') || text.includes('审核') || text.includes('未通过') || text.includes('公开') || text.includes('测试')) {
                            return text.replace(/\s+/g, ' ').substring(0, 150);
                        }
                        return null;
                    })
                    .filter(t => t !== null && t.length > 10);
            });
            console.log('\n📋 页面抓取到的笔记文本内容（前几条）：');
            const uniqueNotes = Array.from(new Set(notes)).slice(0, 10);
            uniqueNotes.forEach((note, idx) => {
                console.log(`[${idx + 1}] ${note}`);
            });

        } else {
            console.error('❌ 未找到“笔记管理”菜单项');
            // 尝试直接导航到可能的内容管理 URL
            console.log('👉 尝试直接导航到 /new-creator/content...');
            await page.goto('https://creator.xiaohongshu.com/new-creator/content', { waitUntil: 'domcontentloaded' });
            await new Promise(r => setTimeout(r, 4000));
            await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'check_03_direct_notes.png') });
        }

    } catch (e) {
        console.error('❌ 错误:', e);
    } finally {
        await browser.close();
        console.log('[结束] 诊断完成。');
    }
}

main().catch(console.error);
