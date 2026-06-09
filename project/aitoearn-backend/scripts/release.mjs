#!/usr/bin/env node

/**
 * aiautoedit 后端发布脚本
 *
 * 触发场景：
 *   - pnpm nx run aitoearn-ai:release
 *   - pnpm nx run aitoearn-server:release
 *   - pnpm nx run aitoearn-ai:release:build-only
 *   - pnpm nx run aitoearn-ai:release:verbose
 *   - pnpm nx run aitoearn-ai:release:dry-run -- --verbose
 *
 * 行为：
 *   1) 解析 -p/--project 指定的应用
 *   2) 解析 --build-only / --dry-run / --verbose
 *   3) 调用 ./scripts/build-docker.mjs 准备 docker 构建上下文
 *   4) 干跑：仅打印计划
 *   5) 正常：依次执行 build → docker buildx → 推送到 registry.aitoearn.cn
 *
 * NOTE: 真实推送步骤需要登录 registry，
 *       CI 上由 GitHub Actions 的 `backend-build.yml` 完成，
 *       本地默认只生成镜像不会推送。
 */

import { arch } from 'node:os'
import { Command } from 'commander'
import { $, chalk, fs, path } from 'zx'
import { execSync } from 'node:child_process'

const REGISTRY = process.env.DOCKER_REGISTRY || 'registry.aitoearn.cn'
const IMAGE_PREFIX = process.env.IMAGE_PREFIX || 'aiautoedit'

function getDefaultPlatform() {
  const a = arch()
  return `linux/${a === 'x64' ? 'amd64' : a}`
}

function parseCommon(program) {
  return program
    .requiredOption('-p, --project <name>', '应用名，如 aitoearn-ai / aitoearn-server')
    .option('--build-only', '只构建镜像不推送')
    .option('--dry-run', '只打印计划不执行')
    .option('--verbose', '打印详细日志')
}

async function prepareContext(projectName, options) {
  const { output = 'tmp/docker-context', verbose = false, contextOnly = false } = options || {}
  const contextDir = path.resolve(output)
  if (verbose) console.info(chalk.blue(`准备 Docker 构建上下文: ${projectName} -> ${contextDir}`))

  if (await fs.pathExists(contextDir)) {
    if (verbose) console.info(chalk.yellow(`清理输出目录: ${contextDir}`))
    await fs.remove(contextDir)
  }
  await fs.ensureDir(contextDir)

  // 委托 build-docker.mjs 复用其依赖图分析逻辑
  const buildScript = path.resolve('scripts/build-docker.mjs')
  if (!(await fs.pathExists(buildScript))) {
    throw new Error(`未找到 ${buildScript}，请在 aitoearn-backend 根目录执行`)
  }

  await $`node ${buildScript} ${projectName} --context-only`

  return { projectName, contextDir }
}

async function getImageMeta(projectName) {
  const tagBase = `${REGISTRY}/${IMAGE_PREFIX}/${projectName}`
  return {
    tagBase,
    versionTag: `${tagBase}:${process.env.VERSION || 'dev'}`,
    latestTag: `${tagBase}:latest`,
    platform: getDefaultPlatform(),
  }
}

async function dockerBuild(imageMeta, contextDir, opts) {
  const target = opts.dryRun ? 'docker buildx build --dry-run' : 'docker buildx build'
  const pushFlag = opts.buildOnly ? '--load' : '--load --push'
  const cmd = `${target} --platform ${imageMeta.platform} -t ${imageMeta.versionTag} -t ${imageMeta.latestTag} ${pushFlag} ${contextDir}`
  console.info(chalk.cyan(`[release] ${cmd}`))
  if (!opts.dryRun) {
    execSync(cmd, { stdio: 'inherit' })
  }
}

async function main() {
  const program = new Command()
  parseCommon(program)
  program.parse(process.argv)
  const opts = program.opts()

  const { project } = opts
  if (!project) {
    program.error('缺少 -p/--project 参数')
  }

  console.info(chalk.green(`🚀 aiautoedit release: ${project}`))

  // 1. 准备构建上下文
  const { contextDir } = await prepareContext(project, { verbose: opts.verbose })

  // 2. 镜像元数据
  const imageMeta = await getImageMeta(project)

  // 3. 构建
  if (opts.dryRun) {
    console.info(chalk.yellow('[dry-run] 不会真正执行 docker buildx / push'))
  }
  await dockerBuild(imageMeta, contextDir, { dryRun: opts.dryRun, buildOnly: opts.buildOnly })

  // 4. 清理
  if (!opts.dryRun && !opts.verbose) {
    await fs.remove(contextDir)
  }

  console.info(chalk.green(`✅ 完成: ${imageMeta.versionTag}`))
  if (opts.buildOnly) {
    console.info(chalk.yellow('  提示: --build-only 模式不会推送到远端 registry'))
  } else if (!opts.dryRun) {
    console.info(chalk.green(`  已推送: ${imageMeta.latestTag}`))
  }
}

main().catch((err) => {
  console.error(chalk.red(`[release] 失败: ${err.message}`))
  process.exit(1)
})
