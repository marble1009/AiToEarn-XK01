const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = 'C:\\Users\\Admin\\Desktop\\github\\AiToEarn-main';

// 递归计算目录大小
function getDirSize(dirPath) {
  let size = 0;
  if (!fs.existsSync(dirPath)) return 0;
  
  try {
    const stats = fs.statSync(dirPath);
    if (stats.isFile()) {
      return stats.size;
    }
    
    const files = fs.readdirSync(dirPath);
    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(dirPath, files[i]);
      const fileStats = fs.statSync(filePath);
      
      if (fileStats.isDirectory()) {
        size += getDirSize(filePath);
      } else {
        size += fileStats.size;
      }
    }
  } catch (e) {
    // 忽略一些系统锁定的临时文件错误
  }
  return size;
}

// 格式化文件大小
function formatSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function run() {
  console.log('==================================================');
  console.log('🔍 AuraString 项目空间占用深度体检报告');
  console.log('==================================================\n');

  const targets = [
    {
      name: 'Next.js 本地构建缓存 (.next)',
      path: path.join(PROJECT_ROOT, 'project', 'aitoearn-web', '.next'),
      desc: '前端开发/生产构建时产生的庞大缓存。部署到云服务器时，完全由云端重新 build 产生，本地缓存无需上传。',
      recommendedAction: '建议清理 🧹'
    },
    {
      name: '前端 node_modules 依赖包',
      path: path.join(PROJECT_ROOT, 'project', 'aitoearn-web', 'node_modules'),
      desc: '本地前端项目依赖。在打包或使用 Docker 镜像部署时，在 Docker 内部会重新安装，本地 node_modules 绝不能打包上传，体积巨大。',
      recommendedAction: '部署时完全排除 ❌'
    },
    {
      name: '后端 node_modules 依赖包',
      path: path.join(PROJECT_ROOT, 'project', 'aitoearn-backend', 'node_modules'),
      desc: '本地后端 Nx 依赖。同理，线上部署由 Docker Compose 在服务器端重新安装构建，本地包不需要打包上传。',
      recommendedAction: '部署时完全排除 ❌'
    },
    {
      name: '后端构建输出目录 (dist)',
      path: path.join(PROJECT_ROOT, 'project', 'aitoearn-backend', 'dist'),
      desc: '后端打包输出的临时 JS 目标代码。上传至服务器后会重新执行 pnpm build 产生。',
      recommendedAction: '建议清理 🧹'
    },
    {
      name: '本地模拟 S3 对象存储缓存 (s3-bucket)',
      path: 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\25092e95-af80-4b57-991a-b2b06a03feb5\\scratch\\s3-bucket',
      desc: '本地测试生成的 MP4 视频、图片缓存文件（包含刚刚测试产生的 30.61 MB 真实视频）。',
      recommendedAction: '可按需清理 🧹'
    },
    {
      name: 'Puppeteer 浏览器缓存 (chrome-debug-profile)',
      path: path.join(PROJECT_ROOT, 'puppeteer_workspace', 'chrome-debug-profile'),
      desc: '本地 Chrome 浏览器会话和缓存。体积很大，仅用于本地 Puppeteer 连接腾讯云登录使用，绝对不需要部署到云服务器。',
      recommendedAction: '部署时完全排除 ❌'
    }
  ];

  let totalSize = 0;
  console.log('⏱️ 正在深度扫描项目文件夹，请稍候...\n');

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    console.log(`📡 正在扫描 Target [${i + 1}/${targets.length}]: ${t.name}...`);
    const size = getDirSize(t.path);
    totalSize += size;
    t.size = size;
  }

  console.log('\n==================================================');
  console.log('📊 体检扫描完成！以下是空间占用精算账单：');
  console.log('==================================================\n');

  targets.forEach((t, idx) => {
    console.log(`${idx + 1}. 【${t.name}】`);
    console.log(`   - 📂 路径: ${t.path}`);
    console.log(`   - 📦 占用大小: ${formatSize(t.size)}`);
    console.log(`   - 💡 详情: ${t.desc}`);
    console.log(`   - 🛡️ 部署建议: ${t.recommendedAction}\n`);
  });

  console.log('--------------------------------------------------');
  console.log(`✨ AuraString 本地非必要文件/排除打包文件总计占用: ${formatSize(totalSize)}`);
  console.log('--------------------------------------------------\n');
  console.log('==================================================');
  console.log('💡 资深架构师精简打包与清理建议：');
  console.log('==================================================');
  console.log('1. 【完全无需上传】: 在上传代码至腾讯云服务器时，必须通过配置 .gitignore 或是打包排除项，');
  console.log('   将所有的 `node_modules` 和 `chrome-debug-profile` 彻底过滤！这可以为您直接节省 95% 以上的上传宽带和云端磁盘！');
  console.log('2. 【建议一键清理】: 本地构建产生的 `.next` 和 `dist` 目录在打包前可以安全清理。');
  console.log('==================================================');
}

run();
