#!/usr/bin/env node
/**
 * aiautoedit 前端 i18n 同步脚本
 *
 * Locize project id / api-key 全部从 .locize.json 读取。
 * 该文件由 .gitignore 排除，每个开发者本地维护。
 *
 * 用法：
 *   pnpm downloadLocales
 *   pnpm syncLocales
 *   pnpm migrateToLocize
 *
 * 第一次使用：
 *   1. cp .locize.json.example .locize.json
 *   2. 在 .locize.json 中填入 locize 控制台的项目凭据
 *   3. 正常使用各 npm script
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const configPath = resolve(__dirname, '..', '.locize.json')

if (!existsSync(configPath)) {
  console.error('❌ 未找到 .locize.json')
  console.error('   请先执行：cp .locize.json.example .locize.json')
  console.error('   并填入 locize 控制台的项目凭据')
  process.exit(1)
}

const config = JSON.parse(readFileSync(configPath, 'utf-8'))
const { projectId, apiKey, version = 'latest', localesPath = './src/app/i18n/locales' } = config

const action = process.argv[2] || 'download'

const args = {
  migrate: [
    'migrate',
    `--project-id=${projectId}`,
    `--api-key=${apiKey}`,
    `--path=${localesPath}`,
  ],
  download: [
    'download',
    `--project-id=${projectId}`,
    `--ver=${version}`,
    '--clean=true',
    `--path=${localesPath}`,
  ],
  sync: [
    'sync',
    `--project-id=${projectId}`,
    `--api-key=${apiKey}`,
    `--ver=${version}`,
    `--path=${localesPath}`,
    '--dry=true',
  ],
}

if (!args[action]) {
  console.error(`未知 action: ${action}（支持 migrate / download / sync）`)
  process.exit(1)
}

const child = spawn('locize', args[action], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

child.on('exit', (code) => process.exit(code ?? 0))
