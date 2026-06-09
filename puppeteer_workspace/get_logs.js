const puppeteer = require('puppeteer-core');

(async () => {
  console.log('🚀 正在连接至 127.0.0.1:9222 查看 aitoearn-ai 容器日志...');
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    
    const pages = await browser.pages();
    const orcaPage = pages.find(p => p.url().includes('orcaterm') || p.url().includes('webshell') || p.url().includes('terminal'));
    
    if (orcaPage) {
      console.log('🎉 找到 OrcaTerm 终端！正在聚焦...');
      await orcaPage.bringToFront();
      
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
      await new Promise(r => setTimeout(r, 1000));
      
      console.log('👉 发送物理点击以激活终端焦点 (400, 300)...');
      await orcaPage.mouse.click(400, 300);
      await new Promise(r => setTimeout(r, 1500));
      
      // 发送 Ctrl + C 中断
      console.log('🛑 发送 Ctrl + C 中断当前可能卡住的输入...');
      await orcaPage.keyboard.down('Control');
      await orcaPage.keyboard.press('KeyC');
      await orcaPage.keyboard.up('Control');
      await new Promise(r => setTimeout(r, 1000));
      await orcaPage.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, 1000));
      
      // 输入 docker logs 命令
      const logCmd = 'sudo docker compose logs -n 100 aitoearn-ai';
      console.log(`🚀 执行命令: ${logCmd}`);
      await orcaPage.keyboard.type(logCmd, { delay: 50 });
      await new Promise(r => setTimeout(r, 500));
      await orcaPage.keyboard.press('Enter');
      
      console.log('等待 8 秒获取日志输出...');
      await new Promise(r => setTimeout(r, 8000));
      
      const screenshotPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\scratch\\container_logs.png';
      await orcaPage.screenshot({ path: screenshotPath });
      console.log(`📸 容器日志截图已保存至: ${screenshotPath}`);
    } else {
      console.log('⚠️ 未在当前浏览器中找到 OrcaTerm 网页终端！');
    }
    
    await browser.disconnect();
  } catch (err) {
    console.error('运行出错:', err);
  }
})();
