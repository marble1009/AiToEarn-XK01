const apiKey = 'sk-6701b98283b145a19cc64c2712b83f67';

async function testSiliconFlow() {
  console.log('Testing SiliconFlow...');
  try {
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'vendor/model',
        messages: [{ role: 'user', content: 'hi' }]
      })
    });
    console.log('SiliconFlow Status:', response.status);
    const text = await response.text();
    console.log('SiliconFlow Response:', text);
  } catch (e) {
    console.error('SiliconFlow Error:', e);
  }
}

async function testDashScope() {
  console.log('Testing DashScope...');
  try {
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [{ role: 'user', content: 'hi' }]
      })
    });
    console.log('DashScope Status:', response.status);
    const text = await response.text();
    console.log('DashScope Response:', text);
  } catch (e) {
    console.error('DashScope Error:', e);
  }
}

async function run() {
  await testSiliconFlow();
  await testDashScope();
}

run();
