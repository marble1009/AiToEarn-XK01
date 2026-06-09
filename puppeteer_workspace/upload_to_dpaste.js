const fs = require('fs');
const http = require('https');
const path = require('path');
const querystring = require('querystring');

const filePath = path.join(__dirname, '..', 'scripts', 'deploy_tencent_cloud.sh');
const fileContent = fs.readFileSync(filePath, 'utf8');

// dpaste.com API uses simple POST with Content-Type: application/x-www-form-urlencoded
const postData = querystring.stringify({
  content: fileContent,
  expiry_days: 2
});

const options = {
  hostname: 'dpaste.com',
  path: '/api/v2/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    let link = body.trim();
    // dpaste.com returns the raw link, e.g. "https://dpaste.com/XXXXXX"
    // To get raw text we can append ".txt"
    if (link && !link.endsWith('.txt')) {
      link += '.txt';
    }
    console.log(`LINK_OUTPUT:${link}`);
    fs.writeFileSync(path.join(__dirname, '..', 'dpaste_link_success.txt'), link, 'utf8');
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
});

req.write(postData);
req.end();
