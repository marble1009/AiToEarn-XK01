const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, '../project/aitoearn-web/src');

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // Exclude node_modules or .next if any
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        walkDir(filePath);
      }
    } else {
      const ext = path.extname(file);
      if (ext === '.json' || ext === '.ts' || ext === '.tsx') {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // Perform case-insensitive replaces or specific ones
        // Replace different casing patterns
        content = content.replace(/AiToEarn/g, 'aiautoedit');
        content = content.replace(/Aitoearn/g, 'aiautoedit');
        content = content.replace(/Aitorarn/g, 'aiautoedit');
        content = content.replace(/aitoearn\.ai/g, 'aiautoedit.art');
        content = content.replace(/aitoearn/g, 'aiautoedit');

        if (content !== original) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`Updated: ${path.relative(targetDir, filePath)}`);
        }
      }
    }
  }
}

console.log('Scanning src directory for Aitoearn references...');
walkDir(targetDir);
console.log('Scan completed successfully!');
