const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\7c16e4e3-439e-4dd6-b1e6-a7b47ace866d\\.system_generated\\logs\\transcript.jsonl';

async function search() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let index = 0;
  for await (const line of rl) {
    index++;
    if (line.includes('2026-05-21')) {
      try {
        const obj = JSON.parse(line);
        // Look for tool calls that launched browsers or executed commands
        if (obj.tool_calls) {
          const hasInterestingTool = obj.tool_calls.some(tc => 
            tc.name === 'run_command' || 
            tc.name === 'browser_subagent' || 
            tc.name.includes('browser') ||
            tc.name.includes('command')
          );
          if (hasInterestingTool) {
            console.log(`[Line ${index}] Type: ${obj.type}, Source: ${obj.source}, Created At: ${obj.created_at}`);
            console.log(`Tool calls: ${JSON.stringify(obj.tool_calls, null, 2)}`);
          }
        }
      } catch (e) {
        // ignore JSON parse errors
      }
    }
  }
}

search();
