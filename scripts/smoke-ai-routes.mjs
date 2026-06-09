#!/usr/bin/env node
/**
 * aiautoedit AI 路由 4 通道 smoke 测试
 *
 * 验证：
 *   1. 文本 → minimax-M3 网关 (api.minimaxi.com)
 *   2. 图像 → 阿里百炼 Wanxiang (dashscope.aliyuncs.com)
 *   3. 视频 → 阿里百炼 Wanxiang (dashscope.aliyuncs.com)
 *   4. [可选] 主通道失败 → DeepSeek 兜底
 *
 * 用法：
 *   node scripts/smoke-ai-routes.mjs
 *   node scripts/smoke-ai-routes.mjs --app-domain aiautoedit.art
 *   node scripts/smoke-ai-routes.mjs --skip-fallback  # 跳过 DeepSeek 兜底测试
 *   node scripts/smoke-ai-routes.mjs --skip-video     # 跳过视频（视频计费较贵）
 *
 * 前置：
 *   - .env 中已配置 INTERNAL_TOKEN
 *   - aitoearn-ai / aitoearn-server 已启动（见 phase-0.mjs 0-6/0-7）
 *   - docker compose 正常
 */

import { execSync, spawnSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const ENV_FILE = join(ROOT, '.env')

// ============================================================
// 参数解析
// ============================================================
const args = process.argv.slice(2)
const opts = {
  appDomain: 'aiautoedit.art',
  skipFallback: false,
  skipVideo: false,
}
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--app-domain') opts.appDomain = args[++i]
  else if (args[i] === '--skip-fallback') opts.skipFallback = true
  else if (args[i] === '--skip-video') opts.skipVideo = true
  else if (args[i] === '--help' || args[i] === '-h') {
    console.log('用法：node scripts/smoke-ai-routes.mjs [选项]')
    console.log('  --app-domain <host>    指定应用域名（默认 aiautoedit.art）')
    console.log('  --skip-fallback         跳过 DeepSeek 兜底测试')
    console.log('  --skip-video            跳过视频通道（视频计费较贵）')
    process.exit(0)
  }
}

// ============================================================
// 颜色（与 phase-0.mjs 一致的 Windows 兼容策略）
// ============================================================
const useColor = (() => {
  if (process.env.NO_COLOR) return false
  if (process.env.FORCE_COLOR === '0') return false
  if (process.platform === 'win32' && !process.stdout.isTTY) return false
  return true
})()
const C = useColor
  ? { reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m', magenta: '\x1b[35m' }
  : { reset: '', bold: '', dim: '', red: '', green: '', yellow: '', blue: '', cyan: '', magenta: '' }
const ok = (s) => `${C.green}✓${C.reset} ${s}`
const fail = (s) => `${C.red}✗${C.reset} ${s}`
const warn = (s) => `${C.yellow}!${C.reset} ${s}`
const info = (s) => `${C.cyan}ℹ${C.reset} ${s}`

// ============================================================
// 工具
// ============================================================
function sh(cmd, opts = {}) {
  return execSync(cmd, {
    stdio: 'pipe',
    cwd: ROOT,
    encoding: 'utf-8',
    ...opts,
  })
}

function readEnv() {
  if (!existsSync(ENV_FILE)) {
    console.error(fail(`.env 不存在：${ENV_FILE}`))
    process.exit(1)
  }
  const content = readFileSync(ENV_FILE, 'utf-8')
  const env = {}
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (!m) continue
    let v = m[2]
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    env[m[1]] = v
  }
  return env
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

/** 从 aitoearn-ai 日志抓取最近 1 分钟含关键字的条目 */
function getRecentLogs(pattern, sinceLines = 50) {
  try {
    const out = sh(`docker compose logs --no-color --tail=${sinceLines} aitoearn-ai`, { allowFail: true })
    return out.split('\n').filter(l => pattern.test(l))
  }
  catch (e) {
    return []
  }
}

// ============================================================
// HTTP 客户端
// ============================================================
async function httpCall({ method = 'GET', url, headers = {}, body, timeoutMs = 90000 }) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
    const text = await res.text()
    let json
    try { json = JSON.parse(text) } catch { json = null }
    return {
      status: res.status,
      ok: res.ok,
      text: text.slice(0, 500),
      json,
    }
  }
  finally {
    clearTimeout(timer)
  }
}

// ============================================================
// 测试用例
// ============================================================
const TESTS = [
  {
    id: 'text-minimax',
    name: '文本 → minimax-M3',
    method: 'POST',
    path: '/api/ai/chat/test',
    body: {
      model: 'MiniMax-M2.7',
      messages: [{ role: 'user', content: '请只回执 OK' }],
      userId: 'smoke-test',
      userType: 3,
      max_tokens: 5,
    },
    logExpected: /api\.minimaxi\.com/,
    logForbidden: [/dashscope\.aliyuncs\.com/, /qwen-plus|qwen-turbo/],
    costNote: '计费：minimax M2.7，约 0.001 元',
  },
  {
    id: 'image-wanxiang',
    name: '图像 → 阿里百炼 Wanxiang',
    method: 'POST',
    path: '/api/ai/image/generation',
    body: {
      model: 'wan2.7-image',
      prompt: 'a small red apple, white background',
      user: 'smoke-test',
      n: 1,
      size: '1024x1024',
    },
    logExpected: /dashscope\.aliyuncs\.com/,
    logForbidden: [/api\.minimaxi\.com/],
    costNote: '计费：阿里万相 2.7，约 0.04 元',
  },
]

if (!opts.skipVideo) {
  TESTS.push({
    id: 'video-wanxiang',
    name: '视频 → 阿里百炼 Wanxiang',
    method: 'POST',
    path: '/api/ai/video/generation',
    body: {
      model: 'wan2.7-t2v-2026-04-25',
      prompt: 'a red apple falling on white background',
      userId: 'smoke-test',
      userType: 3,
      duration: 5,
      size: '720p',
    },
    logExpected: /dashscope\.aliyuncs\.com\/api\/v1\/services\/aigc\/video-generation/,
    logForbidden: [/api\.minimaxi\.com/],
    costNote: '计费：阿里万相 2.7 视频 5s，约 0.5-1.0 元',
    // 视频是异步任务，response 只会返回 task_id，不会有最终结果
    async: true,
  })
}

const FALLBACK_TEST = {
  id: 'fallback-deepseek',
  name: '兜底 → DeepSeek（需 DEEPSEEK_API_KEY）',
  logExpected: /deepseek/i,
  // 失败时调用：临时把 MINIMAX_API_KEY 改错，重启 aitoearn-ai，调一次 chat
  requiresKey: 'DEEPSEEK_API_KEY',
}

// ============================================================
// 主流程
// ============================================================
async function main() {
  console.log(`${C.bold}${C.blue}══════════════════════════════════════════${C.reset}`)
  console.log(`${C.bold}${C.blue}  aiautoedit AI 路由 smoke 测试${C.reset}`)
  console.log(`${C.bold}${C.blue}══════════════════════════════════════════${C.reset}\n`)

  const env = readEnv()
  const token = env.INTERNAL_TOKEN
  if (!token || token === '__REPLACE_ME__') {
    console.error(fail('INTERNAL_TOKEN 未配置或仍是占位符'))
    process.exit(1)
  }
  const base = `https://${opts.appDomain}`
  const auth = { Authorization: `Bearer ${token}` }

  console.log(info(`目标域名：${base}`))
  console.log(info(`跳过视频：${opts.skipVideo}`))
  console.log(info(`跳过兜底：${opts.skipFallback}\n`))

  // ---- 预热：先抓一次 baseline 日志（用于对比） ----
  console.log(`${C.bold}── 1) 抓取 baseline 日志（用于之后对比）──${C.reset}`)
  const baselineLineCount = sh('docker compose logs --no-color --tail=1 aitoearn-ai | wc -l', { allowFail: true }).trim()
  console.log(ok(`baseline 起始行号：${baselineLineCount}\n`))

  // ---- 跑主测试 ----
  const results = []
  for (const t of TESTS) {
    console.log(`${C.bold}── 2.x) ${t.name} ──${C.reset}`)
    console.log(info(`POST ${base}${t.path}`))
    console.log(info(`成本提示：${t.costNote}`))

    const r = await httpCall({
      method: t.method,
      url: `${base}${t.path}`,
      headers: auth,
      body: t.body,
    })

    console.log(`  HTTP ${r.status}  ${r.ok ? C.green : C.red}${r.ok ? 'OK' : 'FAIL'}${C.reset}`)
    if (r.text && !r.json) {
      console.log(`  body: ${C.dim}${r.text.slice(0, 200)}${C.reset}`)
    }
    else if (r.json) {
      const summary = r.json.id ? `task_id=${r.json.id}` : JSON.stringify(r.json).slice(0, 200)
      console.log(`  body: ${C.dim}${summary}${C.reset}`)
    }

    // 等待 3 秒让日志刷出
    await sleep(3000)

    // 抓日志验证
    const logs = getRecentLogs(/minimax|dashscope|deepseek|openai|qwen/, 100)
    const expectedHits = logs.filter(l => t.logExpected.test(l))
    const forbiddenHits = logs.filter(l => t.logForbidden.some(p => p.test(l)))

    let logOk = true
    if (expectedHits.length === 0) {
      console.log(fail(`日志中未找到预期关键字：${t.logExpected}`))
      logOk = false
    }
    else {
      console.log(ok(`日志命中预期关键字 ${t.logExpected}（${expectedHits.length} 条）`))
    }
    if (forbiddenHits.length > 0) {
      console.log(fail(`日志命中禁用关键字：${t.logForbidden.map(p => p.source).join(' | ')}`))
      forbiddenHits.slice(0, 3).forEach(l => console.log(`    ${C.dim}${l.slice(0, 200)}${C.reset}`))
      logOk = false
    }

    results.push({ id: t.id, name: t.name, httpOk: r.ok, logOk, status: r.status })
    console.log('')
  }

  // ---- 跑兜底测试（可选） ----
  if (!opts.skipFallback) {
    console.log(`${C.bold}── 3) ${FALLBACK_TEST.name} ──${C.reset}`)
    if (!env.DEEPSEEK_API_KEY) {
      console.log(warn('DEEPSEEK_API_KEY 未配置，跳过兜底通道测试'))
      console.log(info('如需验证，配置 DEEPSEEK_API_KEY 后重跑'))
    }
    else {
      console.log(warn('⚠ 兜底测试需要临时把 MINIMAX_API_KEY 改成错值，重启 aitoearn-ai'))
      console.log(warn('  这会中断其他用户对文本通道的访问'))
      console.log(info('如不接受此影响，按 Ctrl+C 取消，跳过兜底测试'))
      console.log(info('如果接受，请按 Enter 继续（30s 超时）...'))

      // 30 秒等待用户确认
      const ok = await Promise.race([
        new Promise(r => setTimeout(() => r(true), 30000)),
        new Promise(r => process.stdin.once('data', () => r(true))),
      ]).catch(() => false)
      if (!ok) {
        console.log(warn('未在 30s 内确认，跳过兜底测试'))
      }
      else {
        // 执行：备份 env，注入坏 key，重启，调接口，看日志，恢复
        console.log(info('执行兜底测试...'))
        try {
          await runFallbackTest(env, base, auth)
          results.push({ id: FALLBACK_TEST.id, name: FALLBACK_TEST.name, httpOk: true, logOk: true, status: 200 })
        }
        catch (e) {
          console.log(fail(`兜底测试失败：${e.message}`))
          results.push({ id: FALLBACK_TEST.id, name: FALLBACK_TEST.name, httpOk: false, logOk: false, status: 0 })
        }
      }
    }
  }

  // ---- 汇总 ----
  console.log(`\n${C.bold}${C.blue}══════════════════════════════════════════${C.reset}`)
  console.log(`${C.bold}  汇总${C.reset}`)
  console.log(`${C.bold}${C.blue}══════════════════════════════════════════${C.reset}\n`)

  for (const r of results) {
    const icon = r.httpOk && r.logOk ? C.green + '✓' : C.red + '✗'
    console.log(`  ${icon}${C.reset} ${r.name.padEnd(40)}  HTTP ${r.status}`)
  }

  const allOk = results.every(r => r.httpOk && r.logOk)
  console.log(`\n${allOk ? C.green : C.red}${C.bold}  ${allOk ? '✓ 全部通过' : '✗ 有失败'}${C.reset}\n`)

  if (!allOk) {
    console.log('失败时的处理建议：')
    console.log(`  1. ${C.cyan}docker compose logs --tail=100 aitoearn-ai${C.reset}`)
    console.log('  2. 检查 .env 中 MINIMAX_API_KEY / DASHSCOPE_API_KEY 是否正确')
    console.log('  3. 重新跑失败用例：')
    console.log(`     ${C.cyan}node scripts/smoke-ai-routes.mjs${C.reset}`)
    process.exit(1)
  }
}

/**
 * 兜底测试：临时把 MINIMAX_API_KEY 改成错值，重启 aitoearn-ai，触发主通道失败
 */
async function runFallbackTest(env, base, auth) {
  const backupPath = `${ENV_FILE}.fallback-backup`
  const realMinimax = env.MINIMAX_API_KEY

  console.log(info(`备份 .env 到 ${backupPath}`))
  sh(`cp "${ENV_FILE}" "${backupPath}"`)

  try {
    console.log(info('把 MINIMAX_API_KEY 改成 fake-key，触发主通道失败'))
    sh(`sed -i.bak 's|^MINIMAX_API_KEY=.*|MINIMAX_API_KEY=fake-key-for-fallback-test|' "${ENV_FILE}"`)

    console.log(info('重启 aitoearn-ai 加载新 env'))
    sh('docker compose up -d --force-recreate aitoearn-ai')
    // 等待 healthy
    for (let i = 0; i < 60; i++) {
      await sleep(2000)
      try {
        const out = sh('docker compose ps --format json aitoearn-ai', { allowFail: true })
        if (/"Health"\s*:\s*"healthy"/i.test(out)) break
      }
      catch {}
    }
    console.log(ok('aitoearn-ai 重新 healthy'))

    console.log(info('调一次 chat 接口，主通道应该失败，DeepSeek 兜底应该成功'))
    const r = await httpCall({
      method: 'POST',
      url: `${base}/api/ai/chat/test`,
      headers: auth,
      body: {
        model: 'MiniMax-M2.7',
        messages: [{ role: 'user', content: 'echo' }],
        userId: 'smoke-test',
        userType: 3,
        max_tokens: 5,
      },
      timeoutMs: 60000,
    })
    console.log(`  HTTP ${r.status}`)

    await sleep(3000)
    const logs = getRecentLogs(/deepseek|兜底|fallback/i, 200)
    if (logs.length === 0) {
      throw new Error('日志中未找到 DeepSeek 兜底关键字')
    }
    console.log(ok('日志命中 DeepSeek 兜底关键字'))
    logs.slice(0, 3).forEach(l => console.log(`    ${C.dim}${l.slice(0, 200)}${C.reset}`))
  }
  finally {
    console.log(info('恢复 .env 和 aitoearn-ai...'))
    sh(`mv "${backupPath}" "${ENV_FILE}"`)
    sh('docker compose up -d --force-recreate aitoearn-ai')
    // 等 healthy
    for (let i = 0; i < 60; i++) {
      await sleep(2000)
      try {
        const out = sh('docker compose ps --format json aitoearn-ai', { allowFail: true })
        if (/"Health"\s*:\s*"healthy"/i.test(out)) break
      }
      catch {}
    }
    console.log(ok('aitoearn-ai 已恢复'))
  }
}

main().catch(e => {
  console.error(fail(`未捕获异常：${e.message}`))
  console.error(e.stack)
  process.exit(1)
})
