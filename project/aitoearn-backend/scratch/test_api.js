async function testBackend() {
  const url = 'https://aitoearn-xk01-production.up.railway.app/login/google';
  console.log(`正在直连后端接口进行诊断: ${url}`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: 'test', credential: 'test' })
    });
    
    console.log(`HTTP 状态码: ${response.status}`);
    const text = await response.text();
    console.log(`原始响应内容: ${text}`);
  } catch (error) {
    console.log(`连接失败，错误详情: ${error.message}`);
  }
}

testBackend();
