# aiautoedit STAGING 环境搭建手册

> 适用场景：Phase 0 冒烟测试、Phase 1~6 全流程测试
> 与生产环境（`https://aiautoedit.art`）完全隔离

## 0. 为什么需要 staging

1. **测试不会污染生产数据**：避免把测试数据写进生产 MongoDB
2. **API Key 独立**：minimax / 阿里百炼 / 抖音等可以申请 staging 专用 key，避免消耗生产配额
3. **可以随便改 nginx / compose 配置**：不影响真实用户
4. **测试失败时**没有业务影响

## 1. 准备工作

### 1.1 申请 staging 子域

在腾讯云 DNS 控制台（`https://console.cloud.tencent.com/`）：

1. 进入 aiautoedit.art 域名解析
2. 添加 A 记录：
   - 主机记录：`staging`
   - 记录类型：A
   - 记录值：你的 staging 服务器公网 IP（**和 aiautoedit.art 不同的服务器**）
3. 等待 DNS 生效（约 1-5 分钟）

### 1.2 申请 staging SSL 证书

**推荐：用 staging 自己的证书**

1. 在 staging 服务器上执行（如果用 `certbot`）：
   ```bash
   certbot certonly --nginx -d staging.aiautoedit.art -d www.staging.aiautoedit.art
   ```
2. 证书会放在 `/etc/letsencrypt/live/staging.aiautoedit.art/`

**或者用同一张证书**：如果 `aiautoedit.art` 证书是 wildcard（`*.aiautoedit.art`），可以直接复用。检查命令：
```bash
openssl x509 -in /etc/letsencrypt/live/aiautoedit.art/fullchain.pem -text -noout | grep -A1 "Subject Alternative Name"
```

### 1.3 准备 staging 服务器

最小配置：
- 2 vCPU / 4GB RAM（生产是 4 vCPU / 8GB）
- 操作系统：Ubuntu 22.04 LTS（和腾讯云生产一致）
- 已装：docker、docker compose v2、Node.js 18+
- 开放端口：80 / 443 / 9010（rustfs 直传）

```bash
# Ubuntu 22.04 一键安装
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
sudo apt install -y nodejs npm
sudo npm install -g n
sudo n 18
```

### 1.4 申请 staging 专用 API Key

| 平台 | 申请地址 | Key 名（建议） |
|---|---|---|
| minimax-M3 | https://api.minimaxi.com 控制台 | `aiautoedit-staging` |
| 阿里百炼 | https://dashscope.console.aliyun.com | 子账号 `aiautoedit-staging` |
| 抖音开放平台 | https://open.douyin.com | 单独申请 staging 应用 |
| 阿里云短信 | （可选） | staging 模板 |

> 注意：minimax 和阿里百炼都支持子账号/独立 key，**强烈建议**用独立 key。
> 如果某些平台没有 staging key，可以用生产 key 但**严格控制用量**（< 10 元/天）。

## 2. 部署 staging

### 2.1 拉取代码

```bash
cd /opt
git clone <你的仓库地址> aiautoedit-staging
cd aiautoedit-staging
# 切到要测试的分支
git checkout <branch>
```

### 2.2 填 .env

```bash
cp .env.staging.example .env
nano .env   # 或 vim / VSCode Remote
```

**必填项**：
- `JWT_SECRET` / `INTERNAL_TOKEN`（**与生产完全不同**）
- `MONGO_INITDB_ROOT_PASSWORD` / `REDIS_PASSWORD` / `RUSTFS_*`（staging 独立密码）
- `MINIMAX_API_KEY` / `DASHSCOPE_API_KEY` / `ANTHROPIC_API_KEY`（staging 独立 key）
- `DOYIN_CLIENT_ID` / `DOYIN_CLIENT_SECRET`（staging 抖音应用）
- `MAIL_USER` / `MAIL_PASS`（推荐 Mailtrap 等测试 SMTP）

### 2.3 切换 nginx 配置

仓库已自带 `nginx/nginx.staging.conf`，deploy 脚本会自动切换。

如果你手动部署：
```bash
cp nginx/nginx.conf nginx/nginx.conf.bak
cp nginx/nginx.staging.conf nginx/nginx.conf
```

### 2.4 一键部署（推荐）

在 **staging 服务器的 PowerShell 或 WSL** 中：

```bash
# 完整流程：切换 nginx + 拉起容器 + 等 healthy + 跑 Phase 0-9
./scripts/deploy-staging.ps1
```

或者用 bash 版本（如果用 WSL/Linux）：

```bash
bash scripts/deploy-staging.sh  # 后续提供
```

### 2.5 手动部署（不推荐）

```bash
cp .env.staging.example .env
# 编辑 .env
docker compose up -d
# 等所有容器 healthy
```

## 3. 验证 staging

### 3.1 边缘探活

```bash
curl -I https://staging.aiautoedit.art/_nhealth
# 预期：HTTP/2 200
```

### 3.2 跑 Phase 0 全部 12 步

```bash
# 顺序跑（推荐）
node scripts/phase-0.mjs 0-1
node scripts/phase-0.mjs 0-2
node scripts/phase-0.mjs 0-3
node scripts/phase-0.mjs 0-4
node scripts/phase-0.mjs 0-5
node scripts/phase-0.mjs 0-6
node scripts/phase-0.mjs 0-7
node scripts/phase-0.mjs 0-8
node scripts/phase-0.mjs 0-9
node scripts/phase-0.mjs 0-10
node scripts/phase-0.mjs 0-11   # AI 路由 4 通道 smoke
node scripts/phase-0.mjs 0-12   # 收尾 + git tag
```

或一条命令：
```bash
node scripts/phase-0.mjs all
```

### 3.3 人工对照清单

打开 [phase-0-checklist.md](file:///c:/Users/Admin/Desktop/github/aiautoedit/docs/test/phase-0-checklist.md)，按表打勾。

## 4. 常见问题

### Q1: 80 端口被生产 server 占用
A: staging 用不同服务器（或同一服务器不同 IP）。本机不能同时跑生产和 staging。

### Q2: staging 证书申请失败
A: 检查域名解析是否生效：`dig staging.aiautoedit.art` 应返回 staging 服务器 IP。

### Q3: 启动时提示 "INTERNAL_TOKEN must be set"
A: `.env` 中该变量未填写或仍是 `__REPLACE_ME__`。检查并重新填。

### Q4: AI 路由 smoke 报错 "fetch failed"
A: 检查 `APP_DOMAIN` 是否为 `staging.aiautoedit.art`，且 443 端口外网可访问。

### Q5: 跑完 0-12 后想回滚到生产
A:
```bash
docker compose down
# 恢复生产 .env
# 恢复 nginx.conf
cp nginx/nginx.conf.bak nginx/nginx.conf
docker compose up -d
```

## 5. 性能 / 配额建议

- staging 容器可以少开：`aitoearn-init` / `mongodb-rs-init` 是一次性容器，平时保持 exited
- 阿里百炼 staging 子账号建议设置**月度限额**（10 元）
- minimax-M3 staging key 建议设置**每日限额**（1000 次请求）

## 6. 清理

测试完成后，staging 不需要常驻。可以：

```bash
# 保留数据但停止服务
docker compose stop

# 完全清理（删除 staging 服务器）
# 在腾讯云控制台销毁 CVM
# 删除 DNS 解析记录
# 撤销所有 staging API key
```
