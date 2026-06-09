const fs = require('fs');
const path = require('path');

function searchDir(dir, searchPattern) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        searchDir(fullPath, searchPattern);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.match(searchPattern)) {
        console.log(`FOUND: ${fullPath}`);
      }
    }
  }
}

const rootDir = 'C:\\Users\\Admin\\Desktop\\github\\aiautoedit\\project\\aitoearn-backend\\apps\\aitoearn-ai\\src';
console.log('Searching for @Post(\'chat\') or @Controller(\'ai\') in aitoearn-ai...');
searchDir(rootDir, /@Controller\(['"]ai['"]\)|@Post\(['"]chat['"]\)|@Post\(['"]\/chat['"]\)|ai\/chat|ai\/image|ai\/video/i);
