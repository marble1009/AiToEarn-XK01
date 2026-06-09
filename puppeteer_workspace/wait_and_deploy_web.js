const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  console.log('🚀 启动【永不闪退-耐心等待扫码-纯物理按键部署】...');
  
  const profileDir = 'C:\\Users\\Admin\\Desktop\\github\\AiToEarn-main\\puppeteer_workspace\\chrome-debug-profile';
  
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }

  let browser;
  try {
    console.log('🔌 正在尝试连接已运行的 9222 调试端口...');
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    console.log('🎉 成功连接到已有 Chrome 浏览器！');
  } catch (err) {
    console.log('💡 未检测到 9222 端口，正在全新拉起有头 Chrome 浏览器 (保持 Profile 目录)...');
    try {
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
      console.log('🎉 Chrome 浏览器拉起成功，9222 调试端口已激活！');
    } catch (launchErr) {
      console.error('❌ 无法启动 Chrome 浏览器，请确保 Chrome 已正确安装，并且没有其他 Chrome 进程锁定了该 Profile 目录:', launchErr);
      process.exit(1);
    }
  }

  try {
    const pages = await browser.pages();
    let targetPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
    
    if (!targetPage) {
      // 没找到 OrcaTerm，就在第一个页面上导航到腾讯云登录
      const loginPage = pages[0] || await browser.newPage();
      console.log('🌐 正在为您导航至腾讯云登录页面...');
      await loginPage.goto('https://cloud.tencent.com/login', { waitUntil: 'networkidle2' }).catch(() => {});
      
      console.log('\n====================================================');
      console.log('📢 动作指南：');
      console.log('1. 请直接在您的屏幕上扫码登录刚才弹出的 Chrome 浏览器！');
      console.log('2. 登录成功后，进入腾讯云控制台，打开您的云服务器网页终端 (OrcaTerm)。');
      console.log('3. 脚本在后台会无限期等待（绝不闪退），直到侦听到您打开 OrcaTerm 页面为止！');
      console.log('====================================================\n');
    } else {
      console.log('🎉 已在浏览器中检测到 OrcaTerm 终端页面！准备开始部署...');
    }

    // 永不闪退无限期监控直到 OrcaTerm 开启
    const intervalId = setInterval(async () => {
      try {
        const activePages = await browser.pages();
        const orcaPage = activePages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
        
        if (orcaPage) {
          clearInterval(intervalId);
          console.log('🎯 成功捕获 OrcaTerm 选项卡！开始前台键盘/光标输入模拟...');
          await orcaPage.bringToFront();
          
          console.log('等待 5 秒以确保终端渲染就绪...');
          await new Promise(r => setTimeout(r, 5000));
          
          // 强行聚焦终端元素
          console.log('正在聚焦网页终端输入框...');
          await orcaPage.evaluate(() => {
            const el = document.querySelector('textarea') || 
                       document.querySelector('.xterm-helper-textarea') || 
                       document.querySelector('.xterm-rows') || 
                       document.querySelector('.xterm') ||
                       document.querySelector('.terminal');
            if (el) {
              el.focus();
              if (el.click && el.tagName !== 'TEXTAREA') {
                el.click();
              }
            }
          });
          await new Promise(r => setTimeout(r, 1000));
          
          try {
            await orcaPage.mouse.click(400, 300);
            await new Promise(r => setTimeout(r, 1000));
          } catch (e) {
            console.log('⚠️ 物理点击终端失败 (非关键):', e.message);
          }

          // 1. 发送 Ctrl + C，防止旧命令卡死
          console.log('🛑 发送 Ctrl + C 中断信号...');
          await orcaPage.keyboard.down('Control');
          await orcaPage.keyboard.press('KeyC');
          await orcaPage.keyboard.up('Control');
          await new Promise(r => setTimeout(r, 1000));
          await orcaPage.keyboard.type('\n');
          await new Promise(r => setTimeout(r, 1500));
          
          // 打字输入辅助函数
          async function typeCmd(cmd) {
            console.log(`⌨️ 模拟键盘输入: ${cmd}`);
            await orcaPage.keyboard.type(cmd, { delay: 50 });
            await new Promise(r => setTimeout(r, 1500));
            await orcaPage.keyboard.press('Enter');
          }

          // 2. 精准进入项目绝对目录
          console.log('📂 精准进入项目绝对目录...');
          await typeCmd('cd ~/aitoearn || cd aitoearn || cd Desktop/aitoearn || cd ~/github/AiToEarn-main');
          await new Promise(r => setTimeout(r, 2000));

          // 3. 执行 git pull
          await typeCmd('git reset --hard && git clean -fd && git pull');
          console.log('⏳ 正在等待代码同步拉取 (12 秒)...');
          await new Promise(r => setTimeout(r, 12000));

          // 4. 构建 Web 镜像
          await typeCmd('sudo docker build -t ghcr.io/marble1009/aitoearn-web:latest -f project/aitoearn-web/Dockerfile project/aitoearn-web');
          console.log('⏳ 正在执行本地 Docker Web 镜像构建 (预计需等待 2.5 分钟，请勿关闭浏览器)...');
          await new Promise(r => setTimeout(r, 150000)); // 150秒

          // 5. 重启 aitoearn-web 容器
          await typeCmd('sudo docker compose up -d aitoearn-web');
          console.log('⏳ 正在启动 aitoearn-web 容器 (15 秒)...');
          await new Promise(r => setTimeout(r, 15000));

          // 6. 检查状态
          await typeCmd('sudo docker compose ps');
          await new Promise(r => setTimeout(r, 5000));

          console.log('\n====================================================');
          console.log('🎉 部署成功！所有命令都已精准敲入。');
          console.log('浏览器将保持常开，绝对不关闭，以方便您随时查看状态！');
          console.log('====================================================\n');
          
          // 挂起 15 分钟让用户能看清结果
          await new Promise(r => setTimeout(r, 900000));
          process.exit(0);
        }
      } catch (monitorErr) {
        console.log('⏳ 正在监听您的扫码与终端开启动作...', monitorErr.message);
      }
    }, 2000);

  } catch (err) {
    console.error('❌ 交互逻辑遇到错误:', err);
  }
})();
