import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// ==================== 抖音测试配置 ====================
const CONFIG = {
    commitPublish: true, // 默认为 false (安全预览模式)。修改为 true 进行真实发布！
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'AiToEarn 自动化发布测试 (抖音)',
    desc: '这是一条由 AiToEarn 智能分发引擎自动分发至抖音平台的测试视频内容。',
    topics: ['AiToEarn', '智能分发', '短视频运营'],
    isPrivate: true, // 测试时设为 true (仅自己可见) 以防封号
    cookiePath: path.join(__dirname, 'dy_cookies.json'),
    screenshotDir: path.join(__dirname, 'screenshots_dy'),
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

// 诊断页面上所有可见的输入控件
async function diagnosInputs(page: puppeteer.Page) {
    const inputs = await page.evaluate(() => {
        const allInputs = Array.from(document.querySelectorAll('input, textarea, [contenteditable="true"], div[class*="editor"], div[class*="title"], div[class*="desc"]'));
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
    console.log('  抖音 (Douyin) 自动化发布 - 交互式诊断版 v1');
    console.log('==================================================');
    console.log(`- 模式: ${CONFIG.commitPublish ? '🔴 真实发布' : '🟢 仅填充不发布 (安全预览)'}`);
    console.log(`- 标题: ${CONFIG.title}`);
    console.log('==================================================\n');

    const localVideoPath = path.join(__dirname, 'temp', 'test_dy.mp4');
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

        // ===== 1. 登录检测 =====
        console.log('\n===== 阶段1: 登录检测 =====');
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

        // 前往抖音创作者服务平台
        await page.goto('https://creator.douyin.com/creator-micro/content/upload', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await new Promise(r => setTimeout(r, 4000));

        const checkLogin = async () => {
            // 检查是否已包含上传文件控件，如果有则代表成功登录并加载了组件
            const fileInput = await page.$('input[type="file"]');
            if (fileInput) return true;

            // 检查是否显示了包含 "login" 或 "qrcode" 类的登录容器
            const loginPanel = await page.$('.login, [class*="login"], [class*="qrcode"]');
            if (loginPanel) return false;

            const url = page.url();
            // 备用：判断 URL 是否包含创作者后台的 creator-micro 且未包含 login
            return url.includes('/creator-micro/') && !url.includes('login');
        };

        let loggedIn = await checkLogin();
        if (!loggedIn) {
            console.log('\n🔵 尚未登录。请在弹出的浏览器中完成扫码登录（最长等待 5 分钟）...');
            // 如果未登录，直接前往登录首页
            await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded' });
            
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
            console.log('🎉 Cookie 有效，已成功登录');
        }

        // ===== 2. 进入发布页 =====
        console.log('\n===== 阶段2: 进入发布页 =====');
        if (!page.url().includes('/creator-micro/content/upload')) {
            await page.goto('https://creator.douyin.com/creator-micro/content/upload', { waitUntil: 'domcontentloaded', timeout: 60000 });
        }
        await new Promise(r => setTimeout(r, 3000));
        await screenshot(page, '01_upload_page');

        // ===== 3. 上传视频 =====
        console.log('\n===== 阶段3: 上传视频 =====');
        await page.waitForSelector('input[type="file"]', { timeout: 20000 });
        const fileInput = await page.$('input[type="file"]');
        if (!fileInput) throw new Error('找不到文件上传控件');

        await fileInput.uploadFile(localVideoPath);
        console.log('👉 视频文件已投递，等待上传及转码处理...');

        // 抖音视频上传和处理需要较长时间，等待 45 秒以确保完全上传和服务端处理完成，否则点击发布会被拦截
        await new Promise(r => setTimeout(r, 45000));
        await screenshot(page, '02_after_upload');

        // 诊断当前页面上的所有输入控件
        console.log('\n===== 阶段4: 诊断页面输入控件 =====');
        const visibleInputs = await diagnosInputs(page);
        console.log('📋 页面上所有可见的输入控件:');
        for (const inp of visibleInputs) {
            console.log(`  - <${inp.tagName}> class="${inp.className}" placeholder="${inp.placeholder}" editable=${inp.contentEditable} size=${inp.size.w}x${inp.size.h} text="${inp.text}"`);
        }

        // ===== 5. 填写标题 & 描述内容 =====
        console.log('\n===== 阶段5: 填写内容与话题标签 =====');
        
        // 抖音的发布页面里通常有一个大输入框，用于填写视频描述和话题
        // 我们会尝试查找 class 中含有 editor, contenteditable 的元素，或者 textarea
        let textFilled = false;
        const descWithTopics = `${CONFIG.title}\n${CONFIG.desc} ${CONFIG.topics.map(t => `#${t}`).join(' ')}`;
        
        const editorSelectors = [
            'div[contenteditable="true"]',
            '.editor-content',
            '[class*="editor"]',
            'textarea',
        ];

        for (const sel of editorSelectors) {
            const els = await page.$$(sel);
            for (const el of els) {
                const isVisible = await el.evaluate((e: Element) => {
                    const rect = e.getBoundingClientRect();
                    return rect.width > 150 && rect.height > 40;
                });
                if (isVisible) {
                    console.log(`👉 使用选择器 "${sel}" 找到内容输入区域`);
                    await el.click();
                    await new Promise(r => setTimeout(r, 300));
                    
                    // 清空已有内容并填入新内容
                    await page.keyboard.down('Control');
                    await page.keyboard.press('KeyA');
                    await page.keyboard.up('Control');
                    await page.keyboard.press('Backspace');
                    
                    await el.type(descWithTopics, { delay: 20 });
                    textFilled = true;
                    break;
                }
            }
            if (textFilled) break;
        }

        if (!textFilled) {
            console.warn('⚠️ 所有内容输入框选择器未匹配！尝试用 XPath 寻找可能的内容框...');
            const editorByXpath = await page.$x('//div[@contenteditable="true"]');
            if (editorByXpath.length > 0) {
                console.log(`👉 通过 XPath 找到内容输入区域`);
                await (editorByXpath[0] as puppeteer.ElementHandle).click();
                await page.keyboard.down('Control');
                await page.keyboard.press('KeyA');
                await page.keyboard.up('Control');
                await page.keyboard.press('Backspace');
                await (editorByXpath[0] as puppeteer.ElementHandle).type(descWithTopics, { delay: 20 });
                textFilled = true;
            }
        }

        if (!textFilled) {
            console.error('❌ 无法定位标题/内容输入区域');
        }

        await screenshot(page, '03_after_content_filled');

        // ===== 6. 关闭可能出现的联想浮层与引导弹窗 =====
        console.log('\n===== 阶段6: 清理弹框和关闭话题推荐浮层 =====');
        
        // 点击所有包含 "我知道了" 的引导弹窗按钮
        await page.evaluate(() => {
            const allElements = Array.from(document.querySelectorAll('*'));
            for (const el of allElements) {
                const text = ((el as HTMLElement).innerText || '').trim();
                if (text === '我知道了' && (el as HTMLElement).offsetWidth > 0) {
                    (el as HTMLElement).click();
                }
            }
        });
        await new Promise(r => setTimeout(r, 800));

        await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 500));
        await page.mouse.click(10, 400); // 点击左侧空白处
        await new Promise(r => setTimeout(r, 500));
        
        // 滚动到页面底部以展示发布按钮和隐私选项
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(r => setTimeout(r, 2000));

        // ===== 6.5. 设置隐私选项为“仅自己可见” =====
        if (CONFIG.isPrivate) {
            console.log('\n===== 阶段6.5: 设置隐私选项为“仅自己可见” =====');
            const privateOptionClicked = await page.evaluate(() => {
                const allElements = Array.from(document.querySelectorAll('*'));
                for (const el of allElements) {
                    const text = ((el as HTMLElement).innerText || '').trim();
                    // 寻找文本刚好是“仅自己可见”的可见元素
                    if (text === '仅自己可见' && (el as HTMLElement).offsetWidth > 0) {
                        (el as HTMLElement).click();
                        return true;
                    }
                }
                return false;
            });

            if (privateOptionClicked) {
                console.log('👉 已成功选择【仅自己可见】（私密发布）');
            } else {
                console.warn('⚠️ 未找到【仅自己可见】选项，尝试使用 XPath 进行点击定位...');
                const privateBtnXpath = await page.$x("//span[contains(text(), '仅自己可见')] | //div[contains(text(), '仅自己可见')]");
                if (privateBtnXpath.length > 0) {
                    await (privateBtnXpath[0] as puppeteer.ElementHandle).click();
                    console.log('👉 已通过 XPath 成功选择【仅自己可见】');
                }
            }
            await new Promise(r => setTimeout(r, 1000));
            await screenshot(page, '04_before_publish');
        }

        // ===== 7. 发布决策 =====
        console.log('\n===== 阶段7: 发布决策 =====');
        
        // 无论是否真正发布，都先检测页面上所有相关的按钮，方便诊断
        const buttonDiag = await page.evaluate(() => {
            const all = Array.from(document.querySelectorAll('*'));
            return all
                .filter(el => {
                    const text = ((el as HTMLElement).innerText || '').trim();
                    const rect = el.getBoundingClientRect();
                    return (text === '发布' || text === '存草稿' || text === '存为草稿' || text.includes('发布')) && rect.width > 20 && rect.height > 10;
                })
                .map(el => {
                    const rect = el.getBoundingClientRect();
                    return {
                        tagName: el.tagName.toLowerCase(),
                        innerText: ((el as HTMLElement).innerText || '').trim(),
                        className: el.className?.toString?.() || '',
                        rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
                    };
                });
        });
        console.log('📋 所有可见的“发布/草稿”相关按钮:\n', JSON.stringify(buttonDiag, null, 2));

        if (CONFIG.commitPublish) {
            console.log('🔴 [正在执行真实发布]');

            // 策略1: 寻找精确文本是“发布”的按钮并点击
            let clicked = await page.evaluate(() => {
                const all = Array.from(document.querySelectorAll('*'));
                // 寻找文本是“发布”二字，并且位于页面下半部分的最小元素
                const candidates = all.filter(el => {
                    const text = ((el as HTMLElement).innerText || '').trim();
                    const rect = el.getBoundingClientRect();
                    return text === '发布' && rect.width > 30 && rect.height > 15 && rect.y > 400;
                });
                
                if (candidates.length > 0) {
                    candidates.sort((a, b) => {
                        const ra = a.getBoundingClientRect();
                        const rb = b.getBoundingClientRect();
                        return (ra.width * ra.height) - (rb.width * rb.height);
                    });
                    const target = candidates[0] as HTMLElement;
                    const rect = target.getBoundingClientRect();
                    return { success: true, method: 'text-match', tagName: target.tagName, className: target.className?.toString?.() || '', rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height } };
                }
                return { success: false, method: '', rect: null };
            });

            if (clicked.success && clicked.rect) {
                console.log(`👉 找到发布按钮，执行物理鼠标点击: (${clicked.rect.x + clicked.rect.w/2}, ${clicked.rect.y + clicked.rect.h/2})`);
                await page.mouse.click(clicked.rect.x + clicked.rect.w/2, clicked.rect.y + clicked.rect.h/2);
            }

            // 策略2: 如果精确匹配失败，根据“存草稿”按钮坐标推算“发布”按钮
            if (!clicked.success) {
                console.log('⚠️ 精确文本匹配失败，尝试寻找“存草稿”按钮坐标定位发布按钮...');
                const draftBtn = await page.evaluate(() => {
                    const all = Array.from(document.querySelectorAll('*'));
                    for (const el of all) {
                        const text = ((el as HTMLElement).innerText || '').trim();
                        const rect = el.getBoundingClientRect();
                        if ((text === '存草稿' || text === '存为草稿') && rect.width > 30) {
                            return { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) };
                        }
                    }
                    return null;
                });

                if (draftBtn) {
                    // 抖音发布按钮通常在“存草稿”按钮的右侧，间距大约 120px
                    const publishX = draftBtn.x + draftBtn.w + 100;
                    const publishY = draftBtn.y + draftBtn.h / 2;
                    console.log(`👉 通过坐标推算点击发布按钮: (${publishX}, ${publishY})`);
                    await page.mouse.click(publishX, publishY);
                    clicked = { success: true, method: 'relative-coordinate', tagName: '', className: '' };
                }
            }

            // 策略3: 终极固定坐标兜底（在 1280x800 分辨率下，底部按钮栏的发布按钮通常位置相对固定）
            if (!clicked.success) {
                console.log('⚠️ 坐标推算也失败，使用固定坐标兜底点击 (发布按钮)...');
                // 在常规滚动到底部后，发布按钮大约在 x=680, y=745 的位置
                await page.mouse.click(680, 745);
                clicked = { success: true, method: 'fixed-coordinate', tagName: '', className: '' };
            }

            if (clicked.success) {
                console.log(`👉 发布按钮已点击 (方法: ${clicked.method})，正在等待跳转结果...`);
                await new Promise(r => setTimeout(r, 8000)); // 等待 8 秒观察变化
                await screenshot(page, '05_after_publish_clicked');

                const finalUrl = page.url();
                console.log(`📍 最终页面 URL: ${finalUrl}`);
            } else {
                console.error('❌ 无法定位并点击发布按钮');
            }

            // 保持浏览器打开 30 秒以供用户在屏幕上确认发布成功
            console.log('\n👉 浏览器保持 30 秒，方便您在屏幕上进行人工观察和确认...');
            await new Promise(r => setTimeout(r, 30000));

        } else {
            console.log('\n🟢 安全模式下，不进行真实发布。浏览器将保持 30 秒以供您预览画面...');
            await new Promise(r => setTimeout(r, 30000));
        }

    } catch (e) {
        console.error('\n❌ 运行错误:', e);
    } finally {
        await browser.close();
        console.log('[结束] 浏览器已安全关闭。');
        console.log(`📁 所有的过程截图均已保存在: ${CONFIG.screenshotDir}`);
    }
}

main().catch(console.error);
