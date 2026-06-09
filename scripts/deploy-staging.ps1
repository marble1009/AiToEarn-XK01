# =============================================================
# aiautoedit STAGING 一键部署脚本 (PowerShell)
#
# 前置：
#   - staging 服务器已装 docker + docker compose v2
#   - 已 cp .env.staging.example .env 并填好凭据
#   - 已准备好 /etc/letsencrypt/live/staging.aiautoedit.art/ 证书
#
# 用法（在 staging 服务器 PowerShell 中）：
#   .\scripts\deploy-staging.ps1
#   .\scripts\deploy-staging.ps1 -SkipBuild   # 跳过本地构建（用预拉镜像）
#   .\scripts\deploy-staging.ps1 -ReCreate    # 强制重建所有容器
#
# 行为：
#   1. 用 nginx.staging.conf 替换 nginx.conf
#   2. 校验 .env 完整性
#   3. 校验 staging 证书存在
#   4. docker compose up -d（按依赖顺序）
#   5. 等待所有容器 healthy
#   6. 调用 phase-0.mjs 跑 0-9（启动边缘代理）
# =============================================================

[CmdletBinding()]
param(
    [switch]$SkipBuild,
    [switch]$ReCreate,
    [switch]$SkipPhase0
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "==> aiautoedit STAGING 部署" -ForegroundColor Cyan
Write-Host "    Root: $Root"

# --- 1. 检查 .env ---
$envFile = Join-Path $Root '.env'
if (-not (Test-Path $envFile)) {
    Write-Host "✗ .env 不存在，请先 cp .env.staging.example .env 并填好" -ForegroundColor Red
    exit 1
}
Write-Host "✓ .env 存在" -ForegroundColor Green

# 检查 .env 中所有 __REPLACE_ME_STAGING__ 已替换
$replaceCount = (Select-String -Path $envFile -Pattern '__REPLACE_ME_STAGING__' -ErrorAction SilentlyContinue).Count
if ($replaceCount -gt 0) {
    Write-Host "✗ .env 中还有 $replaceCount 个 __REPLACE_ME_STAGING__ 占位符未替换" -ForegroundColor Red
    exit 1
}
Write-Host "✓ .env 无占位符" -ForegroundColor Green

# 检查 APP_DOMAIN 必须为 staging
$appDomain = (Select-String -Path $envFile -Pattern '^APP_DOMAIN=(.+)$').Matches[0].Groups[1].Value
if ($appDomain -ne 'staging.aiautoedit.art') {
    Write-Host "✗ APP_DOMAIN=$appDomain，不是 staging.aiautoedit.art" -ForegroundColor Red
    exit 1
}
Write-Host "✓ APP_DOMAIN=staging.aiautoedit.art" -ForegroundColor Green

# --- 2. 切换 nginx 配置 ---
$nginxConf = Join-Path $Root 'nginx/nginx.conf'
$nginxStaging = Join-Path $Root 'nginx/nginx.staging.conf'
if (-not (Test-Path $nginxStaging)) {
    Write-Host "✗ nginx.staging.conf 不存在" -ForegroundColor Red
    exit 1
}
Copy-Item -Path $nginxConf -Destination "$nginxConf.bak" -Force
Copy-Item -Path $nginxStaging -Destination $nginxConf -Force
Write-Host "✓ nginx.conf 已切换为 staging 版本（备份到 .bak）" -ForegroundColor Green

# --- 3. 校验证书 ---
$certPath = '/etc/letsencrypt/live/staging.aiautoedit.art/fullchain.pem'
if (-not (Test-Path $certPath)) {
    Write-Host "! staging 证书 $certPath 不存在" -ForegroundColor Yellow
    Write-Host "  443 端口将启动失败，请先申请 staging 证书" -ForegroundColor Yellow
    $certConfirm = Read-Host "  继续吗？(y/N)"
    if ($certConfirm -ne 'y') { exit 1 }
}

# --- 4. 拉起容器 ---
Write-Host "`n==> 拉起容器" -ForegroundColor Cyan
$upArgs = @('up', '-d')
if ($ReCreate) { $upArgs += '--force-recreate' }
& docker compose @upArgs
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ docker compose up 失败" -ForegroundColor Red
    # 恢复 nginx.conf
    Copy-Item -Path "$nginxConf.bak" -Destination $nginxConf -Force
    exit 1
}

# --- 5. 等待 healthy ---
Write-Host "`n==> 等待 10 个容器 healthy" -ForegroundColor Cyan
$services = @('mongodb', 'redis', 'rustfs', 'aitoearn-ai', 'aitoearn-server', 'aitoearn-web', 'nginx')
$maxWaitSec = 120
$startTime = Get-Date
while (((Get-Date) - $startTime).TotalSeconds -lt $maxWaitSec) {
    $unhealthy = & docker compose ps --format json | Where-Object {
        $_.Health -and $_.Health -ne 'healthy' -and $_.Service -in $services
    }
    if (-not $unhealthy) { break }
    Start-Sleep -Seconds 3
}
$finalStatus = & docker compose ps --format json
$allHealthy = $true
foreach ($svc in $services) {
    $state = $finalStatus | Where-Object { $_.Service -eq $svc } | Select-Object -First 1
    if ($state.Health -eq 'healthy') {
        Write-Host "  ✓ $svc healthy" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $svc 不 healthy: $state" -ForegroundColor Red
        $allHealthy = $false
    }
}
if (-not $allHealthy) {
    Write-Host "`n! 有容器未 healthy，请人工排查" -ForegroundColor Yellow
    & docker compose ps
    exit 1
}

# --- 6. 跑 Phase 0-9 ---
if (-not $SkipPhase0) {
    Write-Host "`n==> 跑 Phase 0 0-9（启动边缘代理）" -ForegroundColor Cyan
    & node scripts/phase-0.mjs 0-9
    if ($LASTEXITCODE -ne 0) {
        Write-Host "! Phase 0 0-9 失败" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "`n══════════════════════════════════════" -ForegroundColor Green
Write-Host "  STAGING 部署完成" -ForegroundColor Green
Write-Host "══════════════════════════════════════" -ForegroundColor Green
Write-Host "  访问: https://staging.aiautoedit.art"
Write-Host "  下一步: 跑剩余 Phase 0 微步骤 + 0-11 AI 路由 smoke"
Write-Host ""
Write-Host "  手动命令:"
Write-Host "    node scripts/phase-0.mjs 0-10"
Write-Host "    node scripts/phase-0.mjs 0-11"
Write-Host "    node scripts/phase-0.mjs 0-12"
