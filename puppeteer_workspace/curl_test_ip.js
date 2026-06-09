const http = require('http');

http.get('http://111.229.159.100/', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);
  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    console.log(`BODY SNIPPET: ${rawData.substring(0, 500)}`);
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
