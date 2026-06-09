const { spawnSync } = require('child_process');

console.log('🚀 Starting ultimate slim packing...');

const args = [
  '-czf', 'aitoearn_ultimate.tar.gz',
  '--exclude', '*.git*',
  '--exclude', '*node_modules*',
  '--exclude', '*.next*',
  '--exclude', '*.nx*',
  '--exclude', '*chrome-debug-profile*',
  '--exclude', '*project/aitoearn-backend/dist*',
  '--exclude', '*public/assets*',
  '--exclude', '*.tar.gz*',
  '--exclude', '*.zip*',
  '.'
];

const result = spawnSync('tar', args, { stdio: 'inherit', shell: false });

if (result.status === 0) {
  console.log('✅ Packing successfully completed!');
} else {
  console.error('❌ Packing failed with exit code:', result.status);
}
