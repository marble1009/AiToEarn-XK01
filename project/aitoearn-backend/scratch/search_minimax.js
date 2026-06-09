const fs = require('fs');
const path = require('path');

const rootDir = 'c:/Users/Admin/Desktop/github/aiautoedit/project';

function searchInDir(dir, query) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        searchInDir(fullPath, query);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.json') || file.endsWith('.js') || file.endsWith('.yaml')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(query)) {
          console.log(`Found "${query}" in: ${fullPath}`);
        }
      }
    }
  }
}

searchInDir(rootDir, 'MiniMax rendering failed');
