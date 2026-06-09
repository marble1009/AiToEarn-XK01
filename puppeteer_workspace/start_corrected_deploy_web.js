const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  console.log('🚀 启动【纯物理按键 - 高容错纠错部署】...');
  
  const profileDir = 'C:\\Users\\Admin\\Desktop\\github\\AiToEarn-main\\puppeteer_workspace\\chrome-debug-profile';
  
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }

  let browser;
  try {
    console.log('🔌 正在尝试连接 9222 调试端口...');
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    console.log('🎉 成功连接到已有 Chrome 浏览器！');
  } catch (err) {
    console.log('💡 未检测到已运行的 9222 Chrome，全新拉起中...');
    browser = await puppeteer.launch({
      headless: false,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      defaultViewport: null,
      args: [
        '--start-maximized', 
        '--remote-debugging-port=9222', 
        `--user-data-dir=${profileDir}`,
        '--no-first-run',
        '--no-default-browser-check'
      ]
    });
  }

  try {
    const pages = await browser.pages();
    const orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
    
    if (!orcaPage) {
      console.error('❌ 未检测到 OrcaTerm 终端页面，请确保云控制台的终端标签已打开。');
      await browser.disconnect();
      return;
    }

    console.log('🎯 已成功捕获您的 OrcaTerm，开始纠正路径执行部署...');
    await orcaPage.bringToFront();
    await new Promise(r => setTimeout(r, 2000));
    
    // 聚焦输入
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
    await new Promise(r => setTimeout(r, 1000));

    // 强行清理提示符
    console.log('🛑 发送 Ctrl + C 清理...');
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 1000));
    await orcaPage.keyboard.type('\n');
    await new Promise(r => setTimeout(r, 1000));

    async function typeCmd(cmd) {
      console.log(`⌨️ 模拟按键打字: ${cmd}`);
      await orcaPage.keyboard.type(cmd, { delay: 40 });
      await new Promise(r => setTimeout(r, 1500));
      await orcaPage.keyboard.type('\n');
    }

    // ⚠️ 精准纠错：之前直接在默认的 ~ (home) 路径下直接跑 docker build 找不到 project！
    // 我们必须先精准进入 aitoearn 的路径！
    console.log('📂 精准进入项目绝对目录...');
    await typeCmd('cd ~/aitoearn || cd aitoearn || cd Desktop/aitoearn || cd ~/github/AiToEarn-main');
    await new Promise(r => setTimeout(r, 2000));

    // 打印当前路径以验证
    await typeCmd('pwd && ls -l project');
    await new Promise(r => setTimeout(r, 3000));

    // 执行代码重置拉取
    await typeCmd('git reset --hard && git clean -fd && git pull');
    console.log('⏳ 等待代码从 Github 同步 (12 秒)...');
    await new Promise(r => setTimeout(r, 12000));

    // 重新运行 Docker Build
    await typeCmd('sudo docker build -t ghcr.io/marble1009/aitoearn-web:latest -f project/aitoearn-web/Dockerfile project/aitoearn-web');
    console.log('⏳ Docker 编译构建已在终端发起！(预计需等待 2.5 分钟，请千万别关闭浏览器)...');
    await new Promise(r => setTimeout(r, 150000)); // 150s

    // 重启容器
    await typeCmd('sudo docker compose up -d aitoearn-web');
    console.log('⏳ 正在拉起 aitoearn-web 容器 (15秒)...');
    await new Promise(r => setTimeout(r, 15000));

    // 打印容器状态
    await typeCmd('sudo docker compose ps');
    await new Promise(r => setTimeout(r, 5000));

    console.log('🎉 纯物理按键纠错式部署已全部顺利注入运行！');
    await browser.disconnect();

  } catch (err) {
    console.error('❌ 脚本异常:', err);
  }
})();
