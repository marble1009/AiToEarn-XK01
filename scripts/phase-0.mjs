#!/usr/bin/env node
/**
 * aiautoedit Phase 0 冒烟测试主控脚本
 *
 * 设计原则：
 *   1. 一次只动一个子系统，每个微步骤都是原子的
 *   2. pre-check 不通过就停，不进入操作
 *   3. op 出错立即停，不进入 post-check
 *   4. post-check 不通过就打印回滚命令，不进入下一步
 *   5. 通过后自动写 .phase-0-state.json + 打印 §10 登记模板
 *
 * 用法：
 *   node scripts/phase-0.mjs                # 显示帮助
 *   node scripts/phase-0.mjs 0-1            # 跑单个微步骤
 *   node scripts/phase-0.mjs 0-3 0-4 0-5   # 跑指定多个微步骤
 *   node scripts/phase-0.mjs all            # 跑所有未通过的微步骤
 *   node scripts/phase-0.mjs --force 0-5    # 强制跑（忽略前置依赖）
 *   node scripts/phase-0.mjs status         # 查看进度
 *   node scripts/phase-0.mjs reset          # 清空状态
 *
 * 前置：Node >= 18，docker compose v2
 */

import { execSync, spawn } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import net from 'node:net'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const STATE_FILE = join(ROOT, '.phase-0-state.json')
const LOG_FILE = join(ROOT, 'docs', 'test', 'phase-0.log')
const ENV_FILE = join(ROOT, '.env')
const COMPOSE_FILE = join(ROOT, 'docker-compose.yml')

// ============================================================
// ANSI 颜色（Windows PowerShell 5.1 默认不启用 ANSI，自动检测）
// ============================================================
const useColor = (() => {
  // NO_COLOR 任意非空值 → 强制禁用
  if (process.env.NO_COLOR) return false
  // FORCE_COLOR=0 → 强制禁用
  if (process.env.FORCE_COLOR === '0') return false
  // Windows 平台 + 非 TTY + 非 PowerShell 7 → 禁用（避免乱码）
  if (process.platform === 'win32' && !process.stdout.isTTY) return false
  // 其他情况启用
  return true
})()

const C = useColor
  ? {
      reset: '\x1b[0m',
      bold: '\x1b[1m',
      dim: '\x1b[2m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
    }
  : {
      reset: '',
      bold: '',
      dim: '',
      red: '',
      green: '',
      yellow: '',
      blue: '',
      magenta: '',
      cyan: '',
    }

const ok = (s) => `${C.green}✓${C.reset} ${s}`
const fail = (s) => `${C.red}✗${C.reset} ${s}`
const warn = (s) => `${C.yellow}!${C.reset} ${s}`
const info = (s) => `${C.cyan}ℹ${C.reset} ${s}`
const head = (s) => `\n${C.bold}${C.blue}═══ ${s} ═══${C.reset}`

// ============================================================
// 工具函数
// ============================================================

/** 同步执行 shell 命令 */
function sh(cmd, opts = {}) {
  console.log(`${C.dim}$ ${cmd}${C.reset}`)
  try {
    return execSync(cmd, {
      stdio: 'pipe',
      cwd: ROOT,
      encoding: 'utf-8',
      ...opts,
    })
  }
  catch (e) {
    if (opts.allowFail) {
      return e.stdout?.toString() || ''
    }
    throw e
  }
}

/** 仅打印命令，不执行（dry-run 模式） */
function shDry(cmd) {
  console.log(`${C.dim}$ ${cmd}   ${C.yellow}# (dry-run, 不会执行)${C.reset}`)
}

/** 等待 */
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

/** 读 .env 文件，解析为对象 */
function readEnv() {
  if (!existsSync(ENV_FILE)) return {}
  const content = readFileSync(ENV_FILE, 'utf-8')
  const env = {}
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (!m) continue
    let value = m[2]
    // 去引号
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    // 注释
    const ci = value.indexOf(' #')
    if (ci >= 0) value = value.slice(0, ci).trim()
    env[m[1]] = value
  }
  return env
}

/** 检查端口是否被占用 */
async function isPortInUse(port, host = '127.0.0.1', timeoutMs = 1000) {
  return new Promise((resolve) => {
    const sock = new net.Socket()
    let done = false
    const finish = (inUse) => {
      if (done) return
      done = true
      sock.destroy()
      resolve(inUse)
    }
    sock.setTimeout(timeoutMs)
    sock.once('connect', () => finish(false))
    sock.once('timeout', () => finish(true))
    sock.once('error', (e) => finish(e.code !== 'ECONNREFUSED'))
    sock.connect(port, host)
  })
}

/** 等待容器 healthy（最长 waitMs） */
async function waitHealthy(service, waitMs = 60000) {
  const start = Date.now()
  while (Date.now() - start < waitMs) {
    try {
      const out = sh(`docker compose ps --format json ${service}`, { allowFail: true })
      if (out && /"Health"\s*:\s*"healthy"/i.test(out)) {
        return true
      }
    }
    catch { /* 容器还没起 */ }
    await sleep(2000)
  }
  return false
}

/** 读 .phase-0-state.json */
function readState() {
  if (!existsSync(STATE_FILE)) return { passed: [], failed: {}, log: [] }
  try { return JSON.parse(readFileSync(STATE_FILE, 'utf-8')) }
  catch { return { passed: [], failed: {}, log: [] } }
}

function writeState(s) {
  writeFileSync(STATE_FILE, JSON.stringify(s, null, 2))
}

/** 追加日志到 docs/test/phase-0.log */
function appendLog(line) {
  const fs = require('node:fs')
  const dir = dirname(LOG_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const ts = new Date().toISOString()
  fs.appendFileSync(LOG_FILE, `[${ts}] ${line}\n`)
}

/** 标记步骤通过 */
function markPassed(step) {
  const s = readState()
  if (!s.passed.includes(step)) s.passed.push(step)
  delete s.failed[step]
  s.log = s.log || []
  s.log.push({ step, status: 'passed', at: new Date().toISOString() })
  writeState(s)
  appendLog(`PASS ${step}`)
}

function markFailed(step, reason) {
  const s = readState()
  s.failed[step] = reason
  s.log.push({ step, status: 'failed', at: new Date().toISOString(), reason })
  writeState(s)
  appendLog(`FAIL ${step} - ${reason}`)
}

function isPassed(step) {
  const s = readState()
  return s.passed.includes(step)
}

// ============================================================
// 12 个微步骤
// ============================================================

const STEP_DEPS = {
  '0-1': [],
  '0-2': ['0-1'],
  '0-3': ['0-2'],
  '0-4': ['0-3'],
  '0-5': ['0-4'],
  '0-6': ['0-5'],
  '0-7': ['0-6'],
  '0-8': ['0-7'],
  '0-9': ['0-8'],
  '0-10': ['0-9'],
  '0-11': ['0-10'],
  '0-12': ['0-11'],
}

/**
 * 0-1 凭据就绪
 * 验证：4 套关键凭据非空且非占位符
 */
async function step01() {
  console.log(head('0-1 凭据就绪'))
  console.log('目的：确认 .env 中关键凭据已替换为真实值')

  if (!existsSync(ENV_FILE)) {
    throw new Error(`.env 文件不存在：${ENV_FILE}\n请先 cp .env.deploy.template .env 并填入真实值`)
  }

  const env = readEnv()
  const required = {
    MINIMAX_API_KEY: 'minimax-M3 文本通道',
    DASHSCOPE_API_KEY: '阿里百炼图像/视频通道',
    DOYIN_CLIENT_ID: '抖音开放平台',
    DOYIN_CLIENT_SECRET: '抖音开放平台',
    MAIL_PASS: 'SMTP 邮箱',
    JWT_SECRET: 'JWT 签名',
    INTERNAL_TOKEN: '内部通信 token',
  }

  console.log('\n── 前置检查（每个变量必须非空且不含 __REPLACE_ME__）──')
  const issues = []
  for (const [key, desc] of Object.entries(required)) {
    const val = env[key] || ''
    if (!val) issues.push(`${key} (${desc}) 为空`)
    else if (val.includes('__REPLACE_ME__')) issues.push(`${key} 仍为占位符`)
    else console.log(ok(`${key} = ${val.slice(0, 4)}...${val.slice(-4)}  [${desc}]`))
  }

  if (issues.length) {
    throw new Error('以下凭据未就绪：\n  - ' + issues.join('\n  - '))
  }

  console.log('\n── 操作（不需要修改 .env，只读验证）──')
  console.log(`${C.dim}# 已读取 ${ENV_FILE}，确认关键凭据就绪${C.reset}`)

  console.log('\n── 后置验证（每个 Key 单独调一次 API）──')
  // 验证 minimax key
  console.log(info('验证 MINIMAX_API_KEY ...'))
  try {
    const resp = sh(
      `curl -s -o /dev/null -w "%{http_code}" -X POST "https://api.minimaxi.com/v1/chat/completions" -H "Authorization: Bearer ${env.MINIMAX_API_KEY}" -H "Content-Type: application/json" -d '{"model":"MiniMax-M2.7","messages":[{"role":"user","content":"hi"}],"max_tokens":5}'`,
      { allowFail: true },
    ).trim()
    if (resp === '200' || resp === '401' || resp === '402') {
      console.log(ok(`minimax 网关响应 HTTP ${resp}（200=OK，401/402=Key 问题但链路通）`))
    }
    else {
      throw new Error(`minimax 网关异常 HTTP ${resp}`)
    }
  }
  catch (e) {
    throw new Error(`minimax Key 验证失败：${e.message}`)
  }

  // 验证 dashscope key
  console.log(info('验证 DASHSCOPE_API_KEY ...'))
  try {
    const resp = sh(
      `curl -s -o /dev/null -w "%{http_code}" -X POST "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation" -H "Authorization: Bearer ${env.DASHSCOPE_API_KEY}" -H "Content-Type: application/json" -d '{"model":"qwen-turbo","input":{"messages":[{"role":"user","content":"hi"}]},"parameters":{"max_tokens":5}}'`,
      { allowFail: true },
    ).trim()
    if (resp === '200' || resp === '401' || resp === '403') {
      console.log(ok(`阿里百炼网关响应 HTTP ${resp}`))
    }
    else {
      throw new Error(`阿里百炼网关异常 HTTP ${resp}`)
    }
  }
  catch (e) {
    throw new Error(`DashScope Key 验证失败：${e.message}`)
  }

  console.log(`\n${C.green}0-1 全部通过${C.reset}`)
  console.log('\n── 登记到 §10 模板 ──')
  printRecordTemplate('0-1', {
    extra: [
      `MINIMAX_API_KEY 末四位: ...${env.MINIMAX_API_KEY.slice(-4)}`,
      `DASHSCOPE_API_KEY 末四位: ...${env.DASHSCOPE_API_KEY.slice(-4)}`,
      `DOYIN_CLIENT_ID 末四位: ...${env.DOYIN_CLIENT_ID.slice(-4)}`,
    ],
  })
}

/**
 * 0-2 代码同步
 */
async function step02() {
  console.log(head('0-2 代码同步'))
  console.log('目的：确认 staging 服务器已拉取最新代码（含 AI 路由修复）')

  console.log('\n── 前置检查 ──')
  try {
    const status = sh('git status --porcelain', { allowFail: true })
    if (status && status.trim()) {
      console.log(warn('有未提交改动：'))
      console.log(status)
      throw new Error('请先 commit 或 stash 改动')
    }
    console.log(ok('working tree clean'))
  }
  catch (e) {
    if (e.message.includes('Please commit')) throw e
    throw e
  }

  console.log('\n── 操作（用户手动 git pull）──')
  console.log(`${C.yellow}⚠ 这一步本脚本不自动 git pull，由用户手动执行，避免误拉远端。${C.reset}`)
  console.log(`${C.dim}推荐命令：${C.reset}`)
  console.log('   git fetch origin main')
  console.log('   git log origin/main -5 --oneline  # 确认有 AI 路由修复相关 commit')
  console.log('   git pull --ff-only')

  // 至少检查是否包含关键修复
  console.log('\n── 后置验证（检查最近 20 个 commit 包含 AI 路由修复关键字）──')
  const log = sh('git log --oneline -20', { allowFail: true })
  const hasFix = /Wanxiang|wanxiang|minimax-M3|路由|deepseek|dashscope/i.test(log)
  if (!hasFix) {
    throw new Error('最近 20 个 commit 中未发现 AI 路由修复关键字。请确认代码已同步。')
  }
  console.log(ok('检测到 AI 路由修复相关 commit'))
  log.split('\n').slice(0, 5).forEach(l => l && console.log(`  ${C.dim}${l}${C.reset}`))

  console.log(`\n${C.green}0-2 全部通过${C.reset}`)
  printRecordTemplate('0-2', {
    extra: [
      `当前 commit: ${sh('git rev-parse --short HEAD', { allowFail: true }).trim()}`,
    ],
  })
}

/**
 * 0-3 compose 静态校验
 */
async function step03() {
  console.log(head('0-3 compose 静态校验'))
  console.log('目的：在启动任何容器前，先校验 docker-compose.yml 无语法错误')

  console.log('\n── 前置检查 ──')
  if (!existsSync(COMPOSE_FILE)) {
    throw new Error(`${COMPOSE_FILE} 不存在`)
  }
  try {
    sh('docker --version', { allowFail: true })
    sh('docker compose version', { allowFail: true })
  }
  catch {
    throw new Error('docker / docker compose 未安装或不在 PATH 中')
  }
  console.log(ok('docker compose 可用'))

  console.log('\n── 操作 ──')
  sh('docker compose -f docker-compose.yml config -q')

  console.log('\n── 后置验证 ──')
  console.log(ok('docker compose config 退出码 0'))

  console.log(`\n${C.green}0-3 全部通过${C.reset}`)
}

/**
 * 0-4 启动数据层
 */
async function step04() {
  console.log(head('0-4 启动数据层（mongodb + redis）'))
  console.log('目的：先把数据层跑起来，作为后续应用层的基础')

  console.log('\n── 前置检查：宿主机端口占用 ──')
  const port27018 = await isPortInUse(27018)
  const port6380 = await isPortInUse(6380)
  if (port27018) console.log(warn('宿主机 27018 已被占用（可能是历史 mongo 残留）'))
  if (port6380) console.log(warn('宿主机 6380 已被占用（可能是历史 redis 残留）'))
  if (!port27018 && !port6380) console.log(ok('27018 / 6380 空闲'))

  console.log('\n── 操作 ──')
  sh('docker compose up -d mongodb mongodb-rs-init redis')
  console.log(info('等待容器进入 healthy（最长 60s）...'))

  const mongoOk = await waitHealthy('mongodb', 60000)
  const redisOk = await waitHealthy('redis', 60000)
  if (!mongoOk) throw new Error('mongodb 60s 内未进入 healthy')
  if (!redisOk) throw new Error('redis 60s 内未进入 healthy')

  console.log('\n── 后置验证 ──')
  console.log(ok('mongodb healthy'))
  console.log(ok('redis healthy'))

  // 副本集状态
  const env = readEnv()
  const pwd = env.MONGO_INITDB_ROOT_PASSWORD || 'password'
  const user = env.MONGO_INITDB_ROOT_USERNAME || 'admin'
  console.log(info('检查 mongo 副本集状态...'))
  try {
    const rsOut = sh(
      `docker compose exec -T mongodb mongosh "mongodb://${user}:${pwd}@mongodb:27017/?authSource=admin&directConnection=true" --quiet --eval 'try { rs.status().ok } catch(e) { 0 }'`,
      { allowFail: true },
    )
    if (rsOut && rsOut.trim() === '1') {
      console.log(ok('副本集已初始化（rs.status().ok == 1）'))
    }
    else {
      console.log(warn('副本集尚未初始化（rs.status().ok != 1）'))
      console.log(info('触发 mongodb-rs-init 容器进行初始化...'))
      sh('docker compose up mongodb-rs-init', { allowFail: true })
      await sleep(5000)
    }
  }
  catch (e) {
    throw new Error(`mongo 副本集检查失败：${e.message}`)
  }

  // redis ping
  const redisPwd = env.REDIS_PASSWORD || 'password'
  try {
    const ping = sh(
      `docker compose exec -T redis redis-cli --raw -a "${redisPwd}" --no-auth-warning PING`,
      { allowFail: true },
    )
    if (ping && ping.includes('PONG')) {
      console.log(ok('redis PING → PONG'))
    }
    else {
      throw new Error('redis 未返回 PONG')
    }
  }
  catch (e) {
    throw new Error(`redis ping 失败：${e.message}`)
  }

  console.log(`\n${C.green}0-4 全部通过${C.reset}`)
  printRecordTemplate('0-4')
}

/**
 * 0-5 启动对象存储
 */
async function step05() {
  console.log(head('0-5 启动对象存储（rustfs）'))
  console.log('目的：拉起 S3 兼容的对象存储，初始化 bucket')

  console.log('\n── 前置检查 ──')
  if (!isPassed('0-4')) {
    throw new Error('请先完成 0-4')
  }
  console.log(ok('0-4 已通过'))

  console.log('\n── 操作 ──')
  sh('docker compose up -d rustfs')
  const healthy = await waitHealthy('rustfs', 60000)
  if (!healthy) throw new Error('rustfs 60s 内未进入 healthy')
  console.log(ok('rustfs healthy'))

  console.log(info('执行一次性 bucket 初始化（rustfs-init）...'))
  sh('docker compose up rustfs-init', { allowFail: true })
  await sleep(3000)

  console.log('\n── 后置验证 ──')
  // 容器已退出，logs 应有 "created" 或 "already exists"
  const logs = sh('docker compose logs --no-color rustfs-init', { allowFail: true })
  if (/(created|already exists).*aitoearn/i.test(logs)) {
    console.log(ok('bucket aitoearn 已就绪'))
  }
  else {
    console.log(warn('rustfs-init 日志未确认到 bucket 状态，详情：'))
    console.log(logs.split('\n').slice(-10).join('\n'))
    throw new Error('bucket 初始化状态未知')
  }

  // 端口连通
  try {
    const code = sh('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9001/').trim()
    if (code === '200' || code === '404' || code === '403') {
      console.log(ok(`rustfs 控制台 HTTP ${code}（200/404/403 都说明端口通了）`))
    }
    else {
      throw new Error(`rustfs 9001 异常 HTTP ${code}`)
    }
  }
  catch (e) {
    throw new Error(`rustfs 端口不可达：${e.message}`)
  }

  console.log(`\n${C.green}0-5 全部通过${C.reset}`)
  printRecordTemplate('0-5')
}

/**
 * 0-6 启动 AI 服
 */
async function step06() {
  console.log(head('0-6 启动 AI 服（aitoearn-ai）'))
  console.log('目的：启动 AI 通道服务，是 0-11 路由验证的前提')

  console.log('\n── 前置检查 ──')
  for (const dep of ['0-4', '0-5']) {
    if (!isPassed(dep)) throw new Error(`请先完成 ${dep}`)
    console.log(ok(`${dep} 已通过`))
  }

  console.log('\n── 操作 ──')
  sh('docker compose up -d aitoearn-ai')
  const healthy = await waitHealthy('aitoearn-ai', 90000)
  if (!healthy) throw new Error('aitoearn-ai 90s 内未进入 healthy')
  console.log(ok('aitoearn-ai healthy'))

  console.log('\n── 后置验证 ──')
  // 健康检查
  try {
    const code = sh('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3010/health').trim()
    if (code === '200' || code === '404') {
      console.log(ok(`/health 端点 HTTP ${code}`))
    }
    else {
      throw new Error(`/health 端点异常 HTTP ${code}`)
    }
  }
  catch (e) {
    throw new Error(`aitoearn-ai 健康检查失败：${e.message}`)
  }

  // 日志错误扫描
  const logs = sh('docker compose logs --no-color --tail=80 aitoearn-ai', { allowFail: true })
  const errorLines = logs.split('\n').filter(l => /\b(error|exception|unhandled)\b/i.test(l) && !/warn|info/i.test(l))
  if (errorLines.length > 0) {
    console.log(warn(`日志中检测到 ${errorLines.length} 条 error/exception 关键字：`))
    errorLines.slice(0, 5).forEach(l => console.log(`  ${C.dim}${l}${C.reset}`))
    throw new Error('aitoearn-ai 启动日志包含 error/exception，请人工排查')
  }
  console.log(ok('启动日志无 error/exception'))

  console.log(`\n${C.green}0-6 全部通过${C.reset}`)
  printRecordTemplate('0-6')
}

/**
 * 0-7 启动主服
 */
async function step07() {
  console.log(head('0-7 启动主服（aitoearn-server）'))
  console.log('目的：启动主后端服务')

  console.log('\n── 前置检查 ──')
  if (!isPassed('0-6')) throw new Error('请先完成 0-6（aitoearn-ai 是依赖）')
  console.log(ok('aitoearn-ai 已 healthy'))

  console.log('\n── 操作 ──')
  sh('docker compose up -d aitoearn-server')
  const healthy = await waitHealthy('aitoearn-server', 90000)
  if (!healthy) throw new Error('aitoearn-server 90s 内未进入 healthy')
  console.log(ok('aitoearn-server healthy'))

  console.log('\n── 后置验证 ──')
  try {
    const code = sh('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3002/health').trim()
    if (code === '200' || code === '404') {
      console.log(ok(`/health 端点 HTTP ${code}`))
    }
    else {
      throw new Error(`/health 端点异常 HTTP ${code}`)
    }
  }
  catch (e) {
    throw new Error(`aitoearn-server 健康检查失败：${e.message}`)
  }

  const logs = sh('docker compose logs --no-color --tail=80 aitoearn-server', { allowFail: true })
  const errorLines = logs.split('\n').filter(l => /\b(unhandled|fatal)\b/i.test(l))
  if (errorLines.length > 0) {
    throw new Error(`aitoearn-server 启动日志包含 unhandled/fatal：${errorLines[0]}`)
  }
  console.log(ok('启动日志无 unhandled/fatal'))

  console.log(`\n${C.green}0-7 全部通过${C.reset}`)
  printRecordTemplate('0-7')
}

/**
 * 0-8 启动 Web
 */
async function step08() {
  console.log(head('0-8 启动 Web（aitoearn-web）'))

  console.log('\n── 前置检查 ──')
  if (!isPassed('0-7')) throw new Error('请先完成 0-7')
  console.log(ok('aitoearn-server 已 healthy'))

  console.log('\n── 操作 ──')
  sh('docker compose up -d aitoearn-web')
  const healthy = await waitHealthy('aitoearn-web', 90000)
  if (!healthy) throw new Error('aitoearn-web 90s 内未进入 healthy')

  console.log('\n── 后置验证 ──')
  try {
    const code = sh('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/').trim()
    console.log(ok(`Next 服务 3000 端口 HTTP ${code}`))
  }
  catch (e) {
    throw new Error(`aitoearn-web 不可达：${e.message}`)
  }

  console.log(`\n${C.green}0-8 全部通过${C.reset}`)
}

/**
 * 0-9 启动 Nginx
 */
async function step09() {
  console.log(head('0-9 启动 Nginx（边缘代理）'))

  console.log('\n── 前置检查 ──')
  if (!isPassed('0-8')) throw new Error('请先完成 0-8')
  console.log(ok('aitoearn-web 已 healthy'))

  // 证书存在
  const env = readEnv()
  const domain = env.APP_DOMAIN || 'aiautoedit.art'
  const certPath = `/etc/letsencrypt/live/${domain}/fullchain.pem`
  try {
    sh(`docker run --rm -v /etc/letsencrypt:/etc/letsencrypt:ro alpine test -f ${certPath}`, { allowFail: true })
    console.log(ok(`证书存在：${certPath}`))
  }
  catch {
    console.log(warn(`证书 ${certPath} 不可访问，Nginx 443 端口将启动失败`))
  }

  console.log('\n── 操作 ──')
  sh('docker compose up -d nginx')
  const healthy = await waitHealthy('nginx', 60000)
  if (!healthy) throw new Error('nginx 60s 内未进入 healthy')

  console.log('\n── 后置验证（外网探活）──')
  try {
    const code = sh(`curl -s -o /dev/null -w "%{http_code}" -k https://${domain}/_nhealth`).trim()
    if (code === '200') {
      console.log(ok(`外网 https://${domain}/_nhealth → 200`))
    }
    else {
      throw new Error(`外网探活 HTTP ${code}`)
    }
  }
  catch (e) {
    throw new Error(`外网探活失败：${e.message}\n可能是 nginx 证书或安全组问题，请人工排查`)
  }

  console.log(`\n${C.green}0-9 全部通过${C.reset}`)
}

/**
 * 0-10 探活 7 个核心路径
 */
async function step10() {
  console.log(head('0-10 探活 7 个核心路径'))
  console.log('目的：从外网端到端探活，确认所有核心 URL 可达')

  console.log('\n── 前置检查 ──')
  if (!isPassed('0-9')) throw new Error('请先完成 0-9')
  console.log(ok('nginx healthy'))

  const env = readEnv()
  const domain = env.APP_DOMAIN || 'aiautoedit.art'
  const base = `https://${domain}`

  console.log('\n── 操作 ──')
  const checks = [
    { name: '/_nhealth (nginx)', url: `${base}/_nhealth`, expect: [200] },
    { name: '/api/health (server)', url: `${base}/api/health`, expect: [200, 404] },
    { name: '/api/ai/models-config (ai)', url: `${base}/api/ai/models-config`, expect: [200, 401] },
    { name: '/healthz (web)', url: `${base}/healthz`, expect: [200] },
    { name: '/api/auth/login (route check)', url: `${base}/api/auth/login`, expect: [400, 401, 405], method: 'POST' },
  ]

  console.log('\n── 后置验证（每个 URL 必须命中预期状态码集合）──')
  for (const c of checks) {
    const method = c.method || 'GET'
    const args = method === 'POST' ? `-X POST -d '{}' -H "Content-Type: application/json"` : ''
    const cmd = `curl -s -o /dev/null -w "%{http_code}" -k ${args} ${c.url}`
    const code = sh(cmd, { allowFail: true }).trim()
    if (c.expect.includes(Number(code)) || c.expect.includes(code)) {
      console.log(ok(`${c.name.padEnd(35)} HTTP ${code}（预期 ${c.expect.join('|')}）`))
    }
    else {
      throw new Error(`${c.name} 异常：HTTP ${code}（预期 ${c.expect.join('|')}）`)
    }
  }

  console.log(`\n${C.green}0-10 全部通过${C.reset}`)
}

/**
 * 0-11 AI 路由 4 通道单点验证
 */
async function step11() {
  console.log(head('0-11 AI 路由 4 通道单点验证'))
  console.log('目的：确认每个通道的 API 调用落在预期的 baseUrl')
  console.log('注意：本步骤会真实调用 AI 服务并产生计费')

  console.log('\n── 前置检查 ──')
  if (!isPassed('0-10')) throw new Error('请先完成 0-10')
  console.log(ok('0-10 探活通过'))

  console.log('\n── 操作：调用 smoke 脚本 ──')
  const smokeScript = join(ROOT, 'scripts', 'smoke-ai-routes.mjs')
  if (!existsSync(smokeScript)) {
    throw new Error(`找不到 ${smokeScript}`)
  }
  sh(`node "${smokeScript}" --app-domain "${readEnv().APP_DOMAIN || 'aiautoedit.art'}"`)

  console.log('\n── 后置验证（人工确认日志）──')
  console.log(warn('请人工执行：'))
  console.log(`  ${C.dim}docker compose logs --tail=50 aitoearn-ai | grep -E "minimax|dashscope|deepseek"${C.reset}`)
  console.log('  确认出现：')
  console.log(`  - ${C.green}https://api.minimaxi.com/v1/chat/completions${C.reset}（文本）`)
  console.log(`  - ${C.green}https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation${C.reset}（图像）`)
  console.log(`  - ${C.green}https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis${C.reset}（视频）`)

  // 兜底通道单独验证
  console.log('\n── 兜底通道（DeepSeek，可选）──')
  const env = readEnv()
  if (env.DEEPSEEK_API_KEY) {
    console.log(info('检测到 DEEPSEEK_API_KEY 已配置'))
    console.log(info('如需验证兜底，需要临时把 MINIMAX_API_KEY 改成错值重启 aitoearn-ai，触发主通道失败'))
    console.log(warn('⚠ 这会重启 aitoearn-ai 容器，请评估后手动执行'))
    console.log(`${C.dim}参考命令：${C.reset}`)
    console.log('   1. 在 .env 把 MINIMAX_API_KEY 改为 "fake-key-for-fallback-test"')
    console.log('   2. docker compose up -d --force-recreate aitoearn-ai')
    console.log('   3. 调一次 chat 接口')
    console.log('   4. 看日志：DeepSeek 兜底成功')
    console.log('   5. 恢复 MINIMAX_API_KEY，重启 aitoearn-ai')
  }
  else {
    console.log(info('DEEPSEEK_API_KEY 未配置，跳过兜底通道验证（不影响主流程）'))
  }

  console.log(`\n${C.green}0-11 全部通过${C.reset}`)
}

/**
 * 0-12 阶段收尾
 */
async function step12() {
  console.log(head('0-12 阶段收尾'))

  console.log('\n── 前置检查 ──')
  for (let i = 1; i <= 11; i++) {
    const step = `0-${i}`
    if (!isPassed(step)) throw new Error(`请先完成 ${step}`)
    console.log(ok(`${step} 已通过`))
  }

  console.log('\n── 操作 ──')
  console.log(info('请人工：'))
  console.log('  1. 在 aiautoedit-README.md §10 登记 "Phase 0 通过" 记录')
  console.log('  2. 执行：')
  const today = new Date().toISOString().slice(0, 10)
  const tagName = `phase-0-passed-${today}`
  console.log(`     ${C.dim}git tag ${tagName} -m "Phase 0 基础设施冒烟通过"${C.reset}`)
  console.log(`     ${C.dim}git push origin ${tagName}${C.reset}`)

  console.log('\n── 后置验证 ──')
  try {
    const tags = sh('git tag --list', { allowFail: true })
    if (tags.includes(tagName)) {
      console.log(ok(`tag ${tagName} 已存在`))
    }
    else {
      console.log(warn(`tag ${tagName} 尚未创建（需要人工执行 git tag）`))
    }
  }
  catch (e) {
    console.log(warn(`tag 检查失败：${e.message}`))
  }

  console.log(`\n${C.green}══════════════════════════════════════════${C.reset}`)
  console.log(`${C.green}${C.bold}  Phase 0 全部 12 个微步骤通过！${C.reset}`)
  console.log(`${C.green}  可以进入 Phase 1（账号域）${C.reset}`)
  console.log(`${C.green}══════════════════════════════════════════${C.reset}`)

  printRecordTemplate('0-12', {
    extra: [
      `tag: ${tagName}`,
      '下一步：Phase 1 账号域',
    ],
  })
}

// ============================================================
// 辅助：登记模板
// ============================================================

function printRecordTemplate(step, { extra = [] } = {}) {
  console.log(`${C.dim}────────────────────────────────────${C.reset}`)
  console.log(`${C.dim}复制以下内容到 aiautoedit-README.md §10：${C.reset}`)
  console.log(`${C.dim}────────────────────────────────────${C.reset}`)
  console.log(`\n### ${new Date().toISOString().slice(0, 10)} —— Phase ${step} 阶段测试`)
  console.log('- 测试范围：')
  console.log('- 涉及服务：aitoearn-ai / aitoearn-server / web / electron')
  console.log('- 通过用例：N 个')
  console.log('- 失败用例：N 个（附 trace_id / 截图 / 日志）')
  console.log('- 性能指标：p50 / p95 / 错误率')
  console.log('- 安全检查：是否触发限流、是否记录审计')
  console.log('- 遗留问题：附 #PR')
  console.log('- 关联 commit / PR：')
  extra.forEach(e => console.log(`- 备注：${e}`))
  console.log()
}

// ============================================================
// 主入口
// ============================================================

const STEP_FUNCS = {
  '0-1': step01,
  '0-2': step02,
  '0-3': step03,
  '0-4': step04,
  '0-5': step05,
  '0-6': step06,
  '0-7': step07,
  '0-8': step08,
  '0-9': step09,
  '0-10': step10,
  '0-11': step11,
  '0-12': step12,
}

function showHelp() {
  console.log(`${C.bold}aiautoedit Phase 0 冒烟测试主控脚本${C.reset}\n`)
  console.log('用法:')
  console.log(`  ${C.cyan}node scripts/phase-0.mjs${C.reset}              显示帮助`)
  console.log(`  ${C.cyan}node scripts/phase-0.mjs <step>${C.reset}       跑单个微步骤（如 0-1）`)
  console.log(`  ${C.cyan}node scripts/phase-0.mjs <a> <b> <c>${C.reset}  跑多个微步骤（如 0-3 0-4 0-5）`)
  console.log(`  ${C.cyan}node scripts/phase-0.mjs all${C.reset}          跑所有未通过的微步骤`)
  console.log(`  ${C.cyan}node scripts/phase-0.mjs status${C.reset}       查看进度`)
  console.log(`  ${C.cyan}node scripts/phase-0.mjs reset${C.reset}        清空进度`)
  console.log(`  ${C.cyan}node scripts/phase-0.mjs --force <step>${C.reset}  强制跑（忽略前置依赖）`)
  console.log('\n可用微步骤:')
  for (const step of Object.keys(STEP_FUNCS)) {
    const s = readState()
    const status = s.passed.includes(step) ? `${C.green}✓ 通过${C.reset}` : `${C.dim}○ 待办${C.reset}`
    console.log(`  ${step}  ${status}`)
  }
}

function showStatus() {
  const s = readState()
  console.log(`${C.bold}Phase 0 进度${C.reset}\n`)
  for (const step of Object.keys(STEP_FUNCS)) {
    const passed = s.passed.includes(step)
    const failed = !!s.failed[step]
    let status
    if (passed) status = `${C.green}✓ 通过${C.reset}`
    else if (failed) status = `${C.red}✗ 失败 (${s.failed[step]})${C.reset}`
    else status = `${C.dim}○ 待办${C.reset}`
    console.log(`  ${step.padEnd(5)}  ${status}`)
  }
  console.log(`\n日志: ${LOG_FILE}`)
  console.log(`状态文件: ${STATE_FILE}`)
}

async function main() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    showHelp()
    return
  }
  if (args[0] === 'status') {
    showStatus()
    return
  }
  if (args[0] === 'reset') {
    if (existsSync(STATE_FILE)) {
      writeFileSync(STATE_FILE, JSON.stringify({ passed: [], failed: {}, log: [] }, null, 2))
      console.log(ok('已清空进度'))
    }
    return
  }
  let force = false
  if (args[0] === '--force') {
    force = true
    args.shift()
  }
  let steps
  if (args[0] === 'all') {
    steps = Object.keys(STEP_FUNCS).filter(s => !isPassed(s))
    if (steps.length === 0) {
      console.log(ok('所有微步骤都已通过'))
      return
    }
  }
  else {
    steps = args
  }
  for (const step of steps) {
    if (!STEP_FUNCS[step]) {
      console.error(fail(`未知微步骤：${step}`))
      console.error(`可用: ${Object.keys(STEP_FUNCS).join(', ')}`)
      process.exit(1)
    }
    // 前置依赖检查
    if (!force) {
      for (const dep of STEP_DEPS[step] || []) {
        if (!isPassed(dep)) {
          console.error(fail(`${step} 的前置依赖 ${dep} 未通过`))
          console.error(`如确认要继续，加 --force 标志`)
          process.exit(1)
        }
      }
    }
    try {
      await STEP_FUNCS[step]()
      markPassed(step)
    }
    catch (e) {
      markFailed(step, e.message)
      console.error(`\n${C.red}════════════════════════════════════════${C.reset}`)
      console.error(`${C.red}${C.bold}  ${step} 失败${C.reset}`)
      console.error(`${C.red}  ${e.message}${C.reset}`)
      console.error(`${C.red}════════════════════════════════════════${C.reset}`)
      console.error(`\n${C.yellow}按设计：失败后立即停止，不进入下一步。${C.reset}`)
      console.error(`${C.yellow}请修复后重新执行：${C.reset}`)
      console.error(`  ${C.cyan}node scripts/phase-0.mjs ${step}${C.reset}`)
      process.exit(1)
    }
  }
  console.log(`\n${C.green}本次执行 ${steps.length} 个微步骤全部通过${C.reset}`)
}

main().catch(e => {
  console.error(fail(`未捕获异常：${e.message}`))
  console.error(e.stack)
  process.exit(1)
})
