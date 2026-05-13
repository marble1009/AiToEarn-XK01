import axios from 'axios';

async function testBackend() {
  const url = 'https://aitoearn-xk01-production.up.railway.app/login/google';
  console.log(`正在测试后端接口: ${url}`);
  try {
    const res = await axios.post(url, {
      clientId: 'test',
      credential: 'test'
    });
    console.log('响应成功:', res.data);
  } catch (error) {
    if (error.response) {
      console.log('后端响应了错误:', error.response.status, error.response.data);
    } else {
      console.log('无法连接到后端:', error.message);
    }
  }
}

testBackend();
