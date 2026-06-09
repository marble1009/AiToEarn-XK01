const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5\\.system_generated\\logs\\transcript.jsonl';

async function searchLog() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let index = 0;
  for await (const line of rl) {
    index++;
    if (line.includes('vVYM7B')) {
      console.log(`Line ${index} matches vVYM7B`);
      // print first 500 chars of line
      console.log(line.substring(0, 500));
    }
  }
  console.log('Search finished.');
}

searchLog().catch(console.error);
