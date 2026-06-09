const puppeteer = require('puppeteer-core');

(async () => {
  console.log('正在尝试直接连接到您桌面上已有的调试浏览器 (9222端口)...');
  
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    console.log(`已成功连接！当前浏览器中共有 ${pages.length} 个标签页。`);
    
    const orcaPage = pages.find(p => p.url().includes('orcaterm'));
    
    if (!orcaPage) {
      console.error('❌ 未在当前浏览器中找到 OrcaTerm 终端页面！请确保您已经在弹出的浏览器里打开了服务器终端。');
      await browser.disconnect();
      process.exit(1);
    }
    
    console.log('🎉 成功定位到 OrcaTerm 终端页面！开始接管...');
    
    // 等待 3 秒确保稳定
    console.log('等待 3 秒以确保终端渲染完成...');
    await new Promise(r => setTimeout(r, 3000));
    
    // 聚焦终端 - 尝试多种定位方式
    console.log('正在聚焦终端区域...');
    let focused = false;
    
    // 方式 1: 尝试通用的 textarea
    try {
      await orcaPage.focus('textarea');
      await orcaPage.click('textarea');
      console.log('已聚焦于 textarea');
      focused = true;
    } catch(e) {
      console.log('无法聚焦于 textarea，尝试其他方式...');
    }
    
    // 方式 2: 尝试点击 xterm 的辅助区域
    if (!focused) {
      try {
        await orcaPage.click('.xterm-helper-textarea');
        console.log('已点击 .xterm-helper-textarea');
        focused = true;
      } catch(e) {
        console.log('无法点击 .xterm-helper-textarea，尝试物理点击...');
      }
    }
    
    // 方式 3: 直接物理点击页面中央，确保绝对能激活终端焦点
    if (!focused) {
      try {
        console.log('发送物理点击以激活焦点 (点击坐标: 400, 300)...');
        await orcaPage.mouse.click(400, 300);
      } catch(e) {
        console.log('物理点击失败，继续尝试打字...');
      }
    }

    // 强行清理当前提示符 (Ctrl + C)
    console.log('发送 Ctrl + C 清理行提示符...');
    await orcaPage.keyboard.down('Control');
    await orcaPage.keyboard.press('KeyC');
    await orcaPage.keyboard.up('Control');
    await orcaPage.keyboard.type('\n');
    await new Promise(r => setTimeout(r, 2000));
    
    // 1. 进入项目根目录
    console.log('正在发送指令: cd aitoearn');
    await orcaPage.keyboard.type('cd aitoearn\n');
    await new Promise(r => setTimeout(r, 2000));
    
    // 2. 拉取最新代码与配置
    console.log('正在发送指令: git pull');
    await orcaPage.keyboard.type('git pull\n');
    await new Promise(r => setTimeout(r, 10000)); // 给 git pull 留足 10 秒时间
    
    // 3. 重启后台服务
    console.log('正在发送指令: sudo docker compose up -d aitoearn-server');
    await orcaPage.keyboard.type('sudo docker compose up -d aitoearn-server\n');
    await new Promise(r => setTimeout(r, 15000)); // 给重启留足 15 秒时间
    
    // 截图保存结果
    const screenshotPath = `C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\interactive_deploy_result.png`;
    await orcaPage.screenshot({ path: screenshotPath });
    console.log(`🎉 部署完成！截图已保存至: ${screenshotPath}`);
    
    console.log('任务全部完成，正在断开连接...');
    await browser.disconnect();
    process.exit(0);

  } catch (err) {
    console.error('❌ 执行过程中发生异常:', err);
    process.exit(1);
  }
})();
