const https = require('https');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMTlhMzZlYzIwNWM2N2U4NWY2MTgwYyIsIm1haWwiOiJhZG1pbkBhaXRvZWFybi5sb2NhbCIsIm5hbWUiOiJBZG1pbiIsImlhdCI6MTc4MDcwODczMSwiZXhwIjo0OTM2NDY4NzMxfQ.TwjQ2lgIdDRhgbYNsA7SIEXQw5n7LzvUrzW1T1UnNrY";
const groupId = "6a2385a7647e51dfc769e4e7";

const imageModels = [
  "wan2.7-image",
  "wan2.7-image-pro"
];

function post(url, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(payload)
      },
      rejectUnauthorized: false
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

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
  console.log('Testing image model activations...');
  for (const model of imageModels) {
    try {
      const res = await post('https://124.221.103.86/api/ai/draft-generation/image-text', {
        quantity: 1,
        groupId,
        prompt: "一只可爱的小猫",
        imageModel: model,
        imageCount: 1,
        aspectRatio: "1:1",
        imageSize: "1K",
        platforms: ["douyin"],
        draftType: "draft"
      });
      
      if (res?.data?.taskIds?.[0]) {
        const taskId = res.data.taskIds[0];
        console.log(`Image Model: ${model} -> Created Task: ${taskId}`);
        
        // Wait 3 seconds to check task status
        await new Promise(r => setTimeout(r, 3000));
        const statusRes = await get(`https://124.221.103.86/api/ai/draft-generation/${taskId}`);
        console.log(`Image Model: ${model} Status ->`, statusRes.data.status, statusRes.data.errorMessage || '');
      } else {
        console.log(`Image Model: ${model} -> Failed to create task:`, JSON.stringify(res));
      }
    } catch (e) {
      console.error(`Error testing ${model}:`, e.message);
    }
  }
})();
