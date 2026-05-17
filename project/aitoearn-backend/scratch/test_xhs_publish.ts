import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// ==================== 测试配置 ====================
const CONFIG = {
    commitPublish: true,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'AiToEarn 自动化发布测试',
    desc: '这是一条由 AiToEarn 智能分发引擎自动生成的发布测试内容。',
    topics: ['AiToEarn', '智能分发', '自动化测试'],
    cookiePath: path.join(__dirname, 'xhs_cookies.json'),
    screenshotDir: path.join(__dirname, 'screenshots'),
};
// ==================================================

// 截图辅助函数
async function screenshot(page: puppeteer.Page, name: string) {
    if (!fs.existsSync(CONFIG.screenshotDir)) {
        fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
    }
    const filePath = path.join(CONFIG.screenshotDir, `${name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`📸 [截图] 已保存: ${filePath}`);
}

async function downloadVideo(url: string, destPath: string): Promise<void> {
    console.log(`[准备工作] 正在下载测试视频: ${url}...`);
    const tempDir = path.dirname(destPath);
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    const writer = fs.createWriteStream(destPath);
    const response = await axios({ url, method: 'GET', responseType: 'stream' });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', () => { console.log(`[准备工作] 视频下载成功: ${destPath}`); resolve(); });
        writer.on('error', reject);
    });
}

// 诊断页面上所有输入框
async function diagnosInputs(page: puppeteer.Page) {
    const inputs = await page.evaluate(() => {
        const allInputs = Array.from(document.querySelectorAll('input, textarea, [contenteditable="true"], div[class*="input"], div[class*="title"], div[class*="desc"], div[class*="editor"], div[class*="ql-editor"]'));
        return allInputs.map(el => ({
            tagName: el.tagName.toLowerCase(),
            type: (el as HTMLInputElement).type || '',
            placeholder: (el as HTMLInputElement).placeholder || el.getAttribute('placeholder') || '',
            className: el.className?.toString?.() || '',
            id: el.id || '',
            contentEditable: el.getAttribute('contenteditable'),
            text: ((el as HTMLElement).innerText || '').substring(0, 50),
            visible: (el as HTMLElement).offsetWidth > 0 && (el as HTMLElement).offsetHeight > 0,
            size: { w: (el as HTMLElement).offsetWidth, h: (el as HTMLElement).offsetHeight },
        }));
    });
    return inputs.filter(i => i.visible);
}

async function main() {
    console.log('==================================================');
    console.log('  小红书 (XHS) 自动化发布 - 全流程诊断版 v2');
    console.log('==================================================');
    console.log(`- 模式: ${CONFIG.commitPublish ? '🔴 真实发布' : '🟢 仅填充不发布'}`);
    console.log(`- 标题: ${CONFIG.title}`);
    console.log('==================================================\n');

    const localVideoPath = path.join(__dirname, 'temp', 'test_xhs.mp4');
    await downloadVideo(CONFIG.videoUrl, localVideoPath);

    // 智能查找本地 Chrome 路径
    let executablePath: string | undefined = undefined;
    if (process.platform === 'win32') {
        for (const p of [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
        ]) { if (fs.existsSync(p)) { executablePath = p; break; } }
    } else if (process.platform === 'linux') {
        for (const p of ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']) {
            if (fs.existsSync(p)) { executablePath = p; break; }
        }
    }
    console.log(`[浏览器] Chrome 路径: ${executablePath || '使用 Puppeteer 内置'}`);

    const browser = await puppeteer.launch({
        headless: false,
        executablePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // ===== 1. 登录 =====
        console.log('\n===== 阶段1: 登录 =====');
        let cookiesLoaded = false;
        if (fs.existsSync(CONFIG.cookiePath)) {
            try {
                const cookies = JSON.parse(fs.readFileSync(CONFIG.cookiePath, 'utf8'));
                await page.setCookie(...cookies);
                console.log('👉 已注入本地 Cookie');
                cookiesLoaded = true;
            } catch (e) {
                console.warn('⚠️ Cookie 文件损坏:', (e as Error).message);
            }
        }

        await page.goto('https://creator.xiaohongshu.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });

        if (cookiesLoaded) {
            await page.goto('https://creator.xiaohongshu.com/publish/publish', { waitUntil: 'domcontentloaded', timeout: 60000 });
            await new Promise(r => setTimeout(r, 3000)); // 等待页面 JS 渲染完成
        }

        const checkLogin = async () => {
            const url = page.url();
            return url.includes('/publish') || url.includes('/creator/home');
        };

        let loggedIn = await checkLogin();
        if (!loggedIn) {
            console.log('\n🔵 请在浏览器中扫码登录（最长等待 5 分钟）...');
            for (let i = 0; i < 150; i++) {
                await new Promise(r => setTimeout(r, 2000));
                loggedIn = await checkLogin();
                if (loggedIn) {
                    const cookies = await page.cookies();
                    fs.writeFileSync(CONFIG.cookiePath, JSON.stringify(cookies, null, 2), 'utf8');
                    console.log('🎉 登录成功！Cookie 已保存');
                    break;
                }
            }
            if (!loggedIn) throw new Error('登录超时');
        } else {
            console.log('🎉 Cookie 有效，已登录');
        }

        // ===== 2. 进入发布页 =====
        console.log('\n===== 阶段2: 进入发布页 =====');
        if (!page.url().includes('/publish/publish')) {
            await page.goto('https://creator.xiaohongshu.com/publish/publish', { waitUntil: 'domcontentloaded', timeout: 60000 });
        }
        await new Promise(r => setTimeout(r, 2000));
        await screenshot(page, '01_publish_page');

        // ===== 3. 上传视频 =====
        console.log('\n===== 阶段3: 上传视频 =====');
        await page.waitForSelector('input[type="file"]', { timeout: 15000 });
        const fileInput = await page.$('input[type="file"]');
        if (!fileInput) throw new Error('找不到文件上传控件');

        await fileInput.uploadFile(localVideoPath);
        console.log('👉 视频文件已投递，等待上传处理...');

        // 等待视频真正上传完成（等待进度条消失或视频预览出现）
        // 小红书上传完成后通常会显示视频封面预览
        await new Promise(r => setTimeout(r, 8000)); // 固定等待 8 秒让视频上传处理
        await screenshot(page, '02_after_upload');

        // 诊断当前页面上的所有输入控件
        console.log('\n===== 阶段4: 诊断页面输入控件 =====');
        const visibleInputs = await diagnosInputs(page);
        console.log('📋 页面上所有可见的输入控件:');
        for (const inp of visibleInputs) {
            console.log(`  - <${inp.tagName}> class="${inp.className}" placeholder="${inp.placeholder}" editable=${inp.contentEditable} size=${inp.size.w}x${inp.size.h} text="${inp.text}"`);
        }

        // ===== 5. 填写标题 =====
        console.log('\n===== 阶段5: 填写标题 =====');
        // 尝试多种选择器
        let titleFilled = false;
        const titleSelectors = [
            'input.title-input',
            '.title-input',
            'input[placeholder*="标题"]',
            'input[placeholder*="填写标题"]',
            '#post-textarea',
            'div[contenteditable="true"][class*="title"]',
            '.c-input_inner',  // 小红书可能使用的自定义输入框
        ];
        for (const sel of titleSelectors) {
            const el = await page.$(sel);
            if (el) {
                console.log(`👉 使用选择器 "${sel}" 找到标题输入框`);
                await el.click({ clickCount: 3 });
                await page.keyboard.press('Backspace');
                await el.type(CONFIG.title, { delay: 30 });
                titleFilled = true;
                break;
            }
        }
        if (!titleFilled) {
            console.warn('⚠️ 所有标题选择器均未匹配！尝试使用 XPath 查找...');
            // 尝试 XPath 查找包含"标题"placeholder 的元素
            const titleByXpath = await page.$x('//input[contains(@placeholder, "标题")]');
            if (titleByXpath.length > 0) {
                console.log(`👉 通过 XPath 找到标题输入框`);
                await (titleByXpath[0] as puppeteer.ElementHandle).click({ clickCount: 3 });
                await page.keyboard.press('Backspace');
                await (titleByXpath[0] as puppeteer.ElementHandle).type(CONFIG.title, { delay: 30 });
                titleFilled = true;
            }
        }
        if (!titleFilled) {
            console.error('❌ 无法定位标题输入框');
        }
        await screenshot(page, '03_after_title');

        // ===== 6. 填写描述 =====
        console.log('\n===== 阶段6: 填写描述 =====');
        let descFilled = false;
        const descWithTopics = `${CONFIG.desc} ${CONFIG.topics.map(t => `#${t}`).join(' ')}`;
        const descSelectors = [
            '.ql-editor',           // Quill 富文本编辑器
            '#post-textarea',       // 可能的 textarea
            '.content-input',
            'div[contenteditable="true"]:not([class*="title"])',
            'div[data-placeholder]',
            '[class*="editor"][contenteditable="true"]',
            'textarea',
        ];
        for (const sel of descSelectors) {
            const els = await page.$$(sel);
            for (const el of els) {
                const isVisible = await el.evaluate((e: Element) => {
                    const rect = e.getBoundingClientRect();
                    return rect.width > 100 && rect.height > 30;
                });
                if (isVisible) {
                    console.log(`👉 使用选择器 "${sel}" 找到描述输入框`);
                    await el.click();
                    await new Promise(r => setTimeout(r, 300));
                    await page.keyboard.down('Control');
                    await page.keyboard.press('KeyA');
                    await page.keyboard.up('Control');
                    await page.keyboard.press('Backspace');
                    await el.type(descWithTopics, { delay: 20 });
                    descFilled = true;
                    break;
                }
            }
            if (descFilled) break;
        }
        if (!descFilled) {
            console.error('❌ 无法定位描述输入框');
        }
        await screenshot(page, '04_after_desc');

        // ===== 7. 发布 =====
        console.log('\n===== 阶段7: 发布 =====');
        // 先关闭可能遮挡发布按钮的话题推荐浮层
        await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 500));
        // 点击页面空白区域，关闭所有浮层
        await page.mouse.click(10, 400);
        await new Promise(r => setTimeout(r, 500));
        // 滚动到页面底部确保发布按钮可见
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(r => setTimeout(r, 2000));
        await screenshot(page, '05_before_publish');

        if (CONFIG.commitPublish) {
            // 更全面的诊断：搜索所有包含"发布"子串且文本不超过4个字的可见元素
            const publishDiag = await page.evaluate(() => {
                const all = Array.from(document.querySelectorAll('*'));
                return all
                    .filter(el => {
                        const inner = ((el as HTMLElement).innerText || '').trim();
                        const content = ((el as HTMLElement).textContent || '').trim();
                        const text = inner || content;
                        const rect = el.getBoundingClientRect();
                        return (text.includes('发布') || text.includes('暂存')) && text.length <= 6 && rect.width > 0 && rect.height > 0;
                    })
                    .map(el => {
                        const rect = el.getBoundingClientRect();
                        return {
                            tagName: el.tagName.toLowerCase(),
                            innerText: ((el as HTMLElement).innerText || '').trim(),
                            textContent: ((el as HTMLElement).textContent || '').trim(),
                            className: el.className?.toString?.() || '',
                            rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
                        };
                    });
            });
            console.log('📋 所有"发布/暂存"相关可见元素 (含坐标):\n', JSON.stringify(publishDiag, null, 2));

            // 策略1：查找文本精确为"发布"（不是"发布笔记"）的元素
            let clicked = await page.evaluate(() => {
                const all = Array.from(document.querySelectorAll('*'));
                for (const el of all) {
                    const inner = ((el as HTMLElement).innerText || '').trim();
                    const content = ((el as HTMLElement).textContent || '').trim();
                    const text = inner || content;
                    const rect = el.getBoundingClientRect();
                    if (text === '发布' && rect.width > 30 && rect.height > 15) {
                        (el as HTMLElement).click();
                        return { success: true, method: 'text-match', tagName: el.tagName, className: el.className?.toString?.() || '', y: Math.round(rect.y) };
                    }
                }
                return { success: false, method: '' };
            });

            // 策略2：找到"暂存离开"按钮位置，然后计算右边红色按钮的坐标
            if (!clicked.success) {
                console.log('⚠️ 文本匹配未找到，尝试通过"暂存离开"按钮坐标定位...');
                const saveBtn = await page.evaluate(() => {
                    const all = Array.from(document.querySelectorAll('*'));
                    for (const el of all) {
                        const text = ((el as HTMLElement).innerText || '').trim();
                        const rect = el.getBoundingClientRect();
                        if (text === '暂存离开' && rect.width > 50 && rect.width < 200) {
                            return { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) };
                        }
                    }
                    return null;
                });

                if (saveBtn) {
                    // 红色发布按钮在"暂存离开"按钮的右边，大约偏移 200px
                    const publishX = saveBtn.x + saveBtn.w + 100; // 暂存按钮右边偏移 100px 到发布按钮中心
                    const publishY = saveBtn.y + saveBtn.h / 2;   // 同一行垂直居中
                    console.log(`👉 通过坐标点击发布按钮: (${publishX}, ${publishY})`);
                    await page.mouse.click(publishX, publishY);
                    clicked = { success: true, method: 'coordinate', tagName: '', className: '', y: publishY };
                }
            }

            // 策略3：最后兜底，直接用截图中观察到的固定坐标
            if (!clicked.success) {
                console.log('⚠️ 坐标定位也失败，使用固定坐标兜底点击...');
                await page.mouse.click(690, 755);
                clicked = { success: true, method: 'fixed-coordinate', tagName: '', className: '', y: 755 };
            }

            if (clicked.success) {
                console.log(`👉 已点击发布按钮 (方法: ${clicked.method}, y=${clicked.y})`);
                console.log('⏱️ 等待发布结果...');

                // 等待并观察页面变化
                await new Promise(r => setTimeout(r, 5000));
                await screenshot(page, '06_after_publish_click');

                // 检查是否有错误提示
                const errorMsg = await page.evaluate(() => {
                    const errorEls = document.querySelectorAll('.toast, .error, .tip, [class*="error"], [class*="toast"], [class*="message"], [class*="alert"]');
                    return Array.from(errorEls)
                        .map(el => (el as HTMLElement).innerText?.trim())
                        .filter(t => t && t.length > 0 && t.length < 200);
                });
                if (errorMsg.length > 0) {
                    console.log('⚠️ 页面提示信息:', errorMsg);
                }

                const finalUrl = page.url();
                console.log(`📍 最终 URL: ${finalUrl}`);

                // 等待更久看看是否会自动跳转
                await new Promise(r => setTimeout(r, 5000));
                const finalUrl2 = page.url();
                if (finalUrl2 !== finalUrl) {
                    console.log(`📍 跳转后 URL: ${finalUrl2}`);
                }
                await screenshot(page, '07_final_state');
            } else {
                console.error('❌ 未找到发布按钮');
            }

            // 保持浏览器打开 30 秒方便观察
            console.log('\n👉 浏览器保持 30 秒，请在屏幕上观察结果...');
            await new Promise(r => setTimeout(r, 30000));
        } else {
            console.log('\n🟢 安全模式，不点击发布。浏览器保持 30 秒...');
            await new Promise(r => setTimeout(r, 30000));
        }

    } catch (e) {
        console.error('\n❌ 错误:', e);
    } finally {
        await browser.close();
        console.log('[结束] 浏览器已关闭。');
        console.log(`\n📁 所有截图保存在: ${CONFIG.screenshotDir}`);
    }
}

main().catch(console.error);
