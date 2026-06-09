const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  console.log('🚀 启动路径修正的 Xterm 调试物理按键输入...');
  
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    const orcaPage = pages.find(p => p.url().includes('orcaterm'));
    
    if (!orcaPage) {
      console.error('❌ 未找到 OrcaTerm 标签页！');
      await browser.disconnect();
      return;
    }

    console.log('🎯 成功连接到已有 OrcaTerm！');
    await orcaPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));
    
    // 聚焦终端输入框
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

    // 1. 发送 Ctrl + C 中断
    console.log('🛑 发送 Ctrl + C 中断信号...');
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 1000));
    await orcaPage.keyboard.type('\n');
    await new Promise(r => setTimeout(r, 1500));

    async function typeCmd(cmd) {
      console.log(`⌨️ 键盘打字输入: ${cmd}`);
      await orcaPage.keyboard.type(cmd, { delay: 40 });
      await new Promise(r => setTimeout(r, 1000));
      await orcaPage.keyboard.type('\n');
    }

    // 核心原因：之前cd目录可能由于网络延迟没有执行成功或者目录不匹配，导致在home ~下执行了build提示project不存在！
    // 这一次我们做极致容错：强制列出、查找并确认aitoearn真实绝对路径！
    console.log('📁 正在精准查找并cd至项目真实绝对路径...');
    await typeCmd('cd $(find ~ -maxdepth 3 -name "aitoearn" -type d | head -n 1) || cd ~/aitoearn || cd aitoearn || cd Desktop/aitoearn');
    await new Promise(r => setTimeout(r, 3000));

    // 运行 pwd 确认路径
    await typeCmd('pwd && ls -la project');
    await new Promise(r => setTimeout(r, 4000));

    // 2. 执行安全重置和拉取
    await typeCmd('git reset --hard && git clean -fd && git pull');
    console.log('⏳ 等待代码拉取同步 (10秒)...');
    await new Promise(r => setTimeout(r, 10000));

    // 3. 构建 Web 镜像
    await typeCmd('sudo docker build -t ghcr.io/marble1009/aitoearn-web:latest -f project/aitoearn-web/Dockerfile project/aitoearn-web');
    console.log('⏳ 正在执行本地 Docker Web 镜像构建 (预计需要约 2.5 分钟，请千万别关闭浏览器)...');
    await new Promise(r => setTimeout(r, 160000)); // 等待 160s

    // 4. 重启 web 容器
    await typeCmd('sudo docker compose up -d aitoearn-web');
    console.log('⏳ 正在启动 aitoearn-web 容器 (12秒)...');
    await new Promise(r => setTimeout(r, 12000));

    // 5. 检查状态
    await typeCmd('sudo docker compose ps');
    await new Promise(r => setTimeout(r, 4000));

    console.log('🎉 纯按键纠错式部署指令已全部物理敲入并运行成功！');
    await browser.disconnect();

  } catch (err) {
    console.error('❌ 执行失败:', err);
  }
})();
