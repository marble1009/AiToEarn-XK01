const https = require('https');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMTlhMzZlYzIwNWM2N2U4NWY2MTgwYyIsIm1haWwiOiJhZG1pbkBhaXRvZWFybi5sb2NhbCIsIm5hbWUiOiJBZG1pbiIsImlhdCI6MTc4MDcwODczMSwiZXhwIjo0OTM2NDY4NzMxfQ.TwjQ2lgIdDRhgbYNsA7SIEXQw5n7LzvUrzW1T1UnNrY";
const taskIds = ["6a238ccc5daf533ed2b38880", "6a238ccf5daf533ed2b38884"];

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      rejectUnauthorized: false
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
  });
}

(async () => {
  console.log('Polling image generation tasks...');
  for (const taskId of taskIds) {
    try {
      const statusRes = await get(`https://124.221.103.86/api/ai/draft-generation/${taskId}`);
      console.log(`Task: ${taskId} Status ->`, statusRes.data.status, statusRes.data.errorMessage || '');
      if (statusRes.data.response) {
        console.log(`Task ${taskId} Response ->`, JSON.stringify(statusRes.data.response));
      }
    } catch (e) {
      console.error(`Error polling ${taskId}:`, e.message);
    }
  }
})();
