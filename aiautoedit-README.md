# aiautoedit

> 本 README 是 `aiautoedit` 仓库**唯一对外的项目说明与补充材料存放处**。后续任何项目介绍、环境变更、修改记录、问题修复等说明，全部追加到本文件，不在其他位置维护项目副本说明。

aiautoedit 是一站式 AI 内容营销智能体平台（基于 [AiToEarn](https://github.com/yikart/AiToEarn) 的深度二次定制变体），围绕"内容生成 → 多平台适配 → 自动发布 → 数据回收 → 商业化"的完整链路展开。

- 主域：`aiautoedit.art`
- 兼容域（保留 CORS / 跳转）：`aitoearn.cn`（中国版）、`aitoearn.ai`（国际版）
- 内部包命名空间仍为 `@yikart/*`（暂未跟随品牌重命名，是已知遗留问题，见末尾"待修复"）

---

## 1. 仓库结构

```
aiautoedit/
├── project/
│   ├── aitoearn-backend/      # Nx + pnpm monorepo（双 NestJS 应用 + 14 个 libs）
│   ├── aitoearn-web/          # Next.js 14 (App Router) 前端
│   └── aitoearn-electron/     # Electron 桌面端（内置 NestJS 子服务）
├── demo/                      # 第三方平台开放能力 demo（小红书 / 快手）
├── nginx/nginx.conf           # 反向代理 + CORS + TLS
├── scripts/                   # docker-compose 初始化与构建脚本
├── docker-compose.yml         # 10 个服务的本地/自托管部署
├── Dockerfile                 # 根级单服务构建（aitoearn-server，备用）
├── DOCKER_DEPLOYMENT_*.md     # Docker 部署文档（中/英）
├── README*.md                 # 上游 AiToEarn 文档（保留参考）
└── AGENTS.md                  # 工作区规则（待按 aiautoedit 重写）
```

子项目命名（`aitoearn-*`）作为代码工程目录名保留，与品牌名 `aiautoedit` 解耦，避免大量重命名风险。

---

## 2. 子项目速览

### 2.1 aitoearn-backend（[project/aitoearn-backend](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-backend)）

| 项 | 说明 |
|---|---|
| 构建 | Nx 22.4.4 + pnpm 10 + TypeScript 5.9 |
| 入口 | `pnpm ai:serve`（AI 服）/ `pnpm server:serve`（主服） |
| 应用 1 | `apps/aitoearn-ai`（端口 3010）—— AI/Agent 服务 |
| 应用 2 | `apps/aitoearn-server`（端口 3002）—— 主后端服务 |
| 数据库 | MongoDB（启用 replica set） |
| 缓存/队列 | Redis + BullMQ（`{bull}` 前缀） |
| 分布式锁 | Redlock（共享 redis 配置） |
| 鉴权 | `@yikart/aitoearn-auth`（JWT + 内部 token） |
| 存储 | S3 兼容（生产指向 rustfs，对外走 CDN） |
| 邮件 | nodemailer（hbs 模板，腾讯企业邮箱默认） |
| 短信 | 阿里云 SMS（中国版登录） |
| 限流 | `common/guards/rate-limit.guard.ts` |
| 队列消费者 | BullMQ + 自定义 `@QueueProcessor` 装饰器（`aitoearn-queue`） |

**libs 清单**（位于 `libs/`）：

| 包名 | 作用 |
|---|---|
| `@yikart/aitoearn-auth` | JWT 守卫、装饰器、token 工具 |
| `@yikart/aitoearn-queue` | BullMQ 队列封装、遥测 |
| `@yikart/aitoearn-ai-client` | aitoearn-server → aitoearn-ai 的内部 HTTP 客户端 |
| `@yikart/aitoearn-server-client` | 同应用间服务调用客户端 |
| `@yikart/ali-oss` / `@yikart/ali-sms` | 阿里云对象存储 / 短信 |
| `@yikart/assets` | 资产抽象（ali-oss / s3 适配器） |
| `@yikart/aws-s3` | S3 兼容实现（含签名 URL、并发上传） |
| `@yikart/channel-db` | 平台相关 Mongoose 仓储 + 事务注入 |
| `@yikart/common` | 通用装饰器、DTO、错误码 |
| `@yikart/helpers` | 通用工具 |
| `@yikart/mail` | 邮件模块 |
| `@yikart/mongodb` | MongoDB 模块（仓储模式） |
| `@yikart/nest-mcp` | MCP 协议 Nest 集成（仅 README 存在，见待修复 #9） |
| `@yikart/redis` | Redis Pub/Sub 与连接管理 |
| `@yikart/redlock` | 分布式锁 |

**AI 提供方**（`apps/aitoearn-ai/src/core/ai/libs/`）：
- `openai`（OpenAI 兼容，可指向任意 baseUrl）
- `gemini`（Google GenAI + LangChain，支持多 key 轮询）
- `grok`（x.ai）
- `nvidia`（integrate.api.nvidia.com）
- `volcengine`（火山方舟 + 媒资 VOD）
- `claude-code-router`（`@musistudio/claude-code-router` v2.0.0 嵌入到 aitoearn-ai 中）

**Agent 能力**（`apps/aitoearn-ai/src/core/agent/`）：
- Skills（13 个，位于 `skills/`）：`analyzing-videos`、`composing-videos`、`crawling-social-media`、`editing-images`、`editing-videos`、`extracting-thumbnails`、`generating-drama-recaps`、`generating-images`、`generating-videos`、`managing-content`、`removing-subtitles`、`transferring-video-styles`、`translating-videos`
- MCP Server（9 个）：`image-edit`、`media`、`subtitle`、`util`、`video-utils`、以及 volcengine 专属的 `aideo` / `video-edit` / `drama-recap` / `style-transfer`
- `AgentRuntimeService`：封装 `@anthropic-ai/claude-agent-sdk` 的 query 流
- `agent-task-timeout.scheduler`：定时清理超时任务

**平台通道**（`apps/aitoearn-server/src/core/channel/platforms/`）：
抖音、小红书、B 站、快手、微信视频号、微信公众号、Facebook、Instagram、Threads、LinkedIn、Twitter(X)、TikTok、YouTube、Pinterest、Google Business。

**统一 MCP**（`core/unified-mcp`）：把账号、发布、内容三个域以 MCP 协议暴露给外部 Agent/工具。

**Relay**（`core/relay`）：作为 OAuth 中转层，处理跨域第三方授权回调（已为 aiautoedit.art 配置 `RELAY_CALLBACK_URL`）。

**内部入口（用于应用间通信）**：
- `aitoearn-server` ← `aitoearn-ai`：`http://aitoearn-ai:3010`
- 反向：`aitoearn-ai` 通过 `@yikart/aitoearn-server-client` 调 `http://aitoearn-server:3002`
- 走 `INTERNAL_TOKEN`（compose 默认 `change-this-secret-token`）

### 2.2 aitoearn-web（[project/aitoearn-web](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-web)）

| 项 | 说明 |
|---|---|
| 框架 | Next.js 14.2.35（App Router、standalone 输出） |
| 语言 | TypeScript 5.9 + React 18 |
| 端口 | 3000（容器内） |
| UI | antd 5 + Radix UI + Tailwind 4 + framer-motion |
| 状态 | Zustand |
| 表单 | react-hook-form + zod |
| 编辑器 | Lexical + lexical-beautiful-mentions |
| i18n | i18next + locize（远程同步，已硬编码 project id） |
| 媒体 | sharp、html2canvas-pro、qrcode、cropperjs、jszip |
| E2E | Playwright |
| Lint | ESLint 9 + @antfu/eslint-config + Prettier |

**关键页面**（[src/app/](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-web/src/app)）：
`(public)/login`、`(public)` 落地、 `[lng]`（国际化根）
`/[lng]/welcome`（首页）、`/[lng]/hub`（内容中台）、`/[lng]/accounts`（账号管理）、`/[lng]/chat`、`/[lng]/chat/[taskId]`、`/[lng]/agent-assets`、`/[lng]/ai-social`、`/[lng]/mission-square`、`/[lng]/revenue`、`/[lng]/brand-promotion`、`/[lng]/vip`、`/[lng]/academy`、`/[lng]/ecommerce-studio`、`/[lng]/draft-box`、`/[lng]/tasks-history`、`/[lng]/admin/audit`
`/shortLink`（短链落地）、`/healthz`（健康检查）
`/[lng]/[userId]`（创作者主页）、`/[lng]/auth`、`/[lng]/auth/login`
`/[lng]/websit/*`（服务条款、隐私、数据删除等合规页）

**开发代理**（[next.config.mjs](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-web/next.config.mjs)）：开发态下 `/api/ai/*` → `localhost:3010`，`/api/agent/*` → `localhost:3010`，`/api/*` → `localhost:3002`。

**生产配置**（`.env.production`）：`NEXT_PUBLIC_API_URL=/api`（相对路径走 nginx 反代）。

### 2.3 aitoearn-electron（[project/aitoearn-electron](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-electron)）

| 项 | 说明 |
|---|---|
| 类型 | Electron + Vite + React 18 |
| 端口/形态 | Windows NSIS / macOS (x64, arm64) 桌面安装包 |
| 包名 | `aiToEarn`（遗留，productName 仍为「哎哟赚AiToEarn」） |
| appId | `cn.aitoearn.pc` |
| 签名/公证 | 预留 `scripts/notarize.cjs` |
| 自更新 | electron-updater，发布通道 `https://ylzsfile.yikart.cn/att/` |
| 内嵌服务 | `server/`（独立 NestJS 应用，端口 7000，连接 Mongo/Redis/BullMQ） |
| 平台支持 | 抖音、小红书、快手、微信视频号、B 站（`electron/plat/*`） |
| 存储 | better-sqlite3 + typeorm（本地账号缓存） |
| 二维码 | 内置 `xhs_sign_*.js` 系列注入脚本（公开 js） |
| 主进程 | `electron/main/`（app/views/splash/update/comment/service） |
| 渲染 | `src/`（React 路由、ICP 平台交互模块） |

**注意**：[src/config/index.ts](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-electron/src/config/index.ts) 仍指向旧部署 `https://ttgufwxxqyow.sealosbja.site/api` 与 `yika-bj.oss-cn-beijing.aliyuncs.com`，**迁移到 aiautoedit.art 时需同步修改**。

---

## 3. 环境与域名

| 区域 | 域名 | 备注 |
|---|---|---|
| 主域（自部署） | `aiautoedit.art` | nginx.conf server_name |
| 中国版（保留兼容） | `aitoearn.cn` | 仅在 CORS / 文档中保留 |
| 国际版（保留兼容） | `aitoearn.ai` | 仅在 CORS / 文档中保留 |

- **API Key 与环境必须匹配**：中国版 Key 配 `aitoearn.cn`，国际版 Key 配 `aitoearn.ai`，否则会 401。
- **统一 MCP**：`/api/unified/mcp` 与 `/api/unified/sse` 在两个域下均可用，配置时按 Key 所在环境选择域名。
- **Relay**：`RELAY_SERVER_URL` 中国版为 `https://aitoearn.cn/api`，国际版为 `https://aitoearn.ai/api`。

---

## 4. Docker 部署

10 个服务（[docker-compose.yml](file:///c:/Users/Admin/Desktop/github/aiautoedit/docker-compose.yml)）：

| 服务 | 角色 | 对外端口 |
|---|---|---|
| `mongodb` | 主数据库（replica set） | 27018→27017 |
| `mongodb-rs-init` | 一次性副本集初始化 | — |
| `redis` | 缓存 + 队列 | 6380→6379 |
| `rustfs` | S3 兼容对象存储 | 9001（控制台） |
| `rustfs-init` | 创建 `aitoearn` bucket 并开公开下载 | — |
| `aitoearn-init` | 创建默认管理员 + 自动登录 token | — |
| `aitoearn-ai` | AI / Agent 服务 | 内网 3010 |
| `aitoearn-server` | 主后端 | 内网 3002 |
| `aitoearn-web` | Next.js 站点 | 内网 3000 |
| `nginx` | 反向代理 + TLS + rustfs 公网 | 80 / 443 / 9010 |

**网络**：所有服务加入 `aitoearn-network`（bridge），rustfs 有额外 alias `rustfs.local` 用于 S3 客户端寻址。

**nginx 路由**（[nginx.conf](file:///c:/Users/Admin/Desktop/github/aiautoedit/nginx/nginx.conf)）：
- `/api/ai/*` 和 `/api/agent/*` → `aitoearn-ai:3010`
- `/api/*` → `aitoearn-server:3002`
- `/oss/*` → `aitoearn-rustfs:9000/aitoearn/`
- `/` → `aitoearn-web:3000`
- 9000 端口单独暴露为浏览器 → rustfs 直传通道
- 80 端口强制 301 → HTTPS

**启动前**：
1. `cp .env.deploy.template .env` 并填入真实凭据
2. 确认 `APP_DOMAIN` 与证书路径（`/etc/letsencrypt/live/<APP_DOMAIN>/`）一致
3. `docker compose up -d`
4. 等待 `aitoearn-init` 完成（生成 `init-data` volume 里的 token.txt）
5. 第一次登录使用 `init` 容器输出的自动登录 token 绑定默认管理员 `admin@aitoearn.local`

---

## 5. 关键环境变量

> 全部以环境变量注入，不在代码里硬编码。生产部署前请按本节核对。

### 5.1 aitoearn-server
- 域：`APP_DOMAIN`（默认 `aiautoedit.art`）
- 数据库：`MONGODB_HOST/PORT/USERNAME/PASSWORD` 或 `MONGODB_URI`（生产建议 URI）
- 缓存/队列：`REDIS_HOST/PORT/PASSWORD`
- AI 内部地址：`AI_URL=http://aitoearn-ai:3010`
- 鉴权：`JWT_SECRET`、`INTERNAL_TOKEN`
- 资产：`ASSETS_CONFIG`（JSON，详见后端 `config/config.js`）
- 邮件：`MAIL_HOST/PORT/USER/PASS/SECURE`
- 第三方 OAuth：`BILIBILI_CLIENT_ID/SECRET`、`GOOGLE_CLIENT_ID/SECRET`、`KWAI_*`、`PINTEREST_*`、`TIKTOK_*`、`TWITTER_*`、`FACEBOOK_*`（含 `FACEBOOK_CONFIG_ID`）、`THREADS_*`、`INSTAGRAM_*`、`LINKEDIN_*`、`YOUTUBE_*`、`WXPLAT_APP_ID/SECRET/ENCODING_AES_KEY`
- 抖音：`DOYIN_CLIENT_ID` / `DOYIN_CLIENT_SECRET`（生产必须替换 compose 中的默认值）
- 阿里云短信：`ALI_SMS_*`
- Relay：`RELAY_SERVER_URL` / `RELAY_API_KEY` / `RELAY_CALLBACK_URL`

### 5.2 aitoearn-ai
- 同上的 Mongo/Redis/Auth
- AI 密钥：`OPENAI_API_KEY/BASE_URL`、`ANTHROPIC_API_KEY/BASE_URL`、`GEMINI_API_KEY/BASE_URL`、`GEMINI_KEY_PAIRS`（JSON 数组，支持多 key 轮询）、`GEMINI_LOCATION`、`GROK_API_KEY`、`AI_NVIDIA_API_KEY`
- 火山引擎：`VOLCENGINE_API_KEY` / `ACCESS_KEY_ID` / `SECRET_ACCESS_KEY` / `VOD_SPACE_NAME`
- 资产：`ASSETS_CONFIG`（与 server 共享同一 bucket）

### 5.3 aitoearn-web
- `NEXT_PUBLIC_API_URL=/api`（生产）/ `http://localhost:7001/api`（local 调试走 server 的 7000 端口转发，注意非默认）

### 5.4 aitoearn-electron
- 内嵌服务：`server/.env`（`MONGO_*`、`REDIS_*`、阿里云短信、微信支付、OSS 等）
- 渲染端：构建期 Vite 注入 `VITE_DEV_SERVER_URL`
- 主进程：`APP_ROOT` 运行时自动注入
- 发布：`https://ylzsfile.yikart.cn/att/`（暂沿用上游通道，迁移至 aiautoedit 通道需替换）

---

## 6. 本地开发

### 6.1 后端
```bash
cd project/aitoearn-backend
pnpm install
pnpm ai:serve      # 启动 aitoearn-ai（http://localhost:3010）
pnpm server:serve  # 启动 aitoearn-server（http://localhost:3002）
# 或：pnpm nx run-many --target=serve --all
```

> 提示：`aitoearn-ai` / `aitoearn-server` 的 `serve` 配置（local/dev/prod）需要在 `apps/<name>/config/` 下补 `local.config.js` / `dev.config.js` / `prod.config.js`，目前仅有 `config.js`（见待修复 #5）。

### 6.2 前端
```bash
cd project/aitoearn-web
pnpm install
pnpm dev:local     # 走 dev 反代到后端
pnpm dev           # 默认端口 6060
pnpm type-check
pnpm build
pnpm test:home     # Playwright E2E
```

### 6.3 桌面端
```bash
cd project/aitoearn-electron
pnpm install
pnpm dev           # Windows：chcp 65001 后跑 vite
pnpm build         # 输出 release/${version} 下的安装包
```

> 桌面端内置 `server/`（NestJS）使用单独的 `pnpm install` 和 `pnpm dev`。

### 6.4 根目录规则
- 根目录**没有**统一 `package.json`，不要在根目录执行 `pnpm install` / `pnpm build`。
- 所有 install/build 必须在对应 `project/aitoearn-*` 子目录执行。
- 文档改动至少跑 `git diff --check`。
- 后端改动优先用 `pnpm nx ...` 验证；前端改动优先用 `pnpm run type-check` + `pnpm build` 验证。

---

## 7. CI

| 工作流 | 文件 | 触发 | 范围 |
|---|---|---|---|
| `backen-check.yml` | [.github/workflows/backen-check.yml](file:///c:/Users/Admin/Desktop/github/aiautoedit/.github/workflows/backen-check.yml) | PR | 后端 lint + build（仅当 `project/aitoearn-backend/` 有变更） |
| `backend-build.yml` | [.github/workflows/backend-build.yml](file:///c:/Users/Admin/Desktop/github/aiautoedit/.github/workflows/backend-build.yml) | push / manual | 后端镜像构建并推送到 `registry.aitoearn.cn` |
| `web-check.yml` | [.github/workflows/web-check.yml](file:///c:/Users/Admin/Desktop/github/aiautoedit/.github/workflows/web-check.yml) | PR | 前端 build（lint 已注释掉） |
| `web-build.yml` | [.github/workflows/web-build.yml](file:///c:/Users/Admin/Desktop/github/aiautoedit/.github/workflows/web-build.yml) | push / manual | 前端镜像构建 |
| `pr-issue-check.yml` | [.github/workflows/pr-issue-check.yml](file:///c:/Users/Admin/Desktop/github/aiautoedit/.github/workflows/pr-issue-check.yml) | PR | PR 描述/链接检查 |
| `pr-to-feishu.yml` | [.github/workflows/pr-to-feishu.yml](file:///c:/Users/Admin/Desktop/github/aiautoedit/.github/workflows/pr-to-feishu.yml) | PR | 飞书通知 |

镜像注册中心：`registry.aitoearn.cn`（backend）、`ghcr.io/marble1009/aitoearn-*`（compose 拉取默认）。

---

## 8. 演示与三方集成

`demo/` 下的 HTML 演示文件**包含真实生产凭据**，仅作离线演示使用，**严禁部署到公网**：

- [demo/kwai/index.html](file:///c:/Users/Admin/Desktop/github/aiautoedit/demo/kwai/index.html) —— 快手开放能力 OAuth 示例
- [demo/xhs/index.html](file:///c:/Users/Admin/Desktop/github/aiautoedit/demo/xhs/index.html) —— 小红书 `xhs.share` 调用示例
- [demo/xhs/signature.js](file:///c:/Users/Admin/Desktop/github/aiautoedit/demo/xhs/signature.js) —— 小红书签名辅助
- 前端公开签名资源：[project/aitoearn-web/public/js/xhs_sign_*.js](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-web/public/js)

---

## 9. 待修复（已知问题清单）

按"优先级 + 是否阻塞"排序，**所有后续补充材料会持续追加到本节**。

> ⚠️ **本节是首次深度检查（2026-06-07）的问题清单快照。**
> 每一项的当前处理状态请见 [§11 问题汇总与解决方案](#11-问题汇总与解决方案2026-06-07-落地)。
> 后续追加问题请直接登记到 [§10 补充材料登记](#10-补充材料登记)。

### P0 安全 / 凭据

1. **[硬编码密钥]** [docker-compose.yml](file:///c:/Users/Admin/Desktop/github/aiautoedit/docker-compose.yml) 中：
   - `aitoearn-ai`：`OPENAI_API_KEY`（line 122）、`ANTHROPIC_API_KEY`（line 127）、`ANTHROPIC_BASE_URL=https://api.minimaxi.com/anthropic`
   - `aitoearn-server`：`MAIL_USER=aitoearn@aiautoedit.art` / `MAIL_PASS=109911lZ`、`DOYIN_CLIENT_ID=awssuej5w6ocwfos` / `DOYIN_CLIENT_SECRET=b37c8afab40d7bdfade00d878e081245`
   - 公共 IP `124.221.103.86` 出现在 `ASSETS_CONFIG.publicEndpoint` / `cdnEndpoint`
   - 必须改为 `${VAR:-}` 形式并由 `.env` 注入；其中 `ANTHROPIC_API_KEY` 看起来是真实生产密钥，**建议立即吊销并重新签发**。

2. **[.env.example 泄露]** [project/aitoearn-backend/.env.example](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-backend/.env.example) 中包含真实 MongoDB Atlas 连接串（含 `marble109911_db_user` + 密码 `109911lZ`）和 `appName=Cluster0`。请替换为占位符并吊销该凭据。

3. **[demo 凭据]** [demo/kwai/index.html](file:///c:/Users/Admin/Desktop/github/aiautoedit/demo/kwai/index.html) 与 [demo/xhs/index.html](file:///c:/Users/Admin/Desktop/github/aiautoedit/demo/xhs/index.html) 硬编码了 `appId/appSecret/appKey/signature` 等真实生产凭据。建议改为占位符 + 单独 `.env.local` 注入。

4. **[i18n Key]** [project/aitoearn-web/package.json](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-web/package.json) 暴露了 locize `project-id=01b2e5e8-6243-47d1-b36f-963dbb8bcae3` 和多个 `api-key`。建议在脚本中改用环境变量。

### P0 启动阻塞

5. **[pnpm-workspace.yaml 格式]** [project/aitoearn-backend/pnpm-workspace.yaml](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-backend/pnpm-workspace.yaml) 的 `allowBuilds` 列表写成了 `"set this to true or false"` 字符串，pnpm 10 会直接报错。需改为布尔值或删除整段。

6. **[缺 release 脚本]** [project/aitoearn-backend/nx.json](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-backend/nx.json) 引用了 `scripts/release.mjs`，但 [project/aitoearn-backend/scripts/](file:///c:/Users/Admin/Desktop/github/aiaiautoedit/project/aitoearn-backend/scripts) 目录里只有 `build-docker.mjs`。`release` / `release:build-only` / `release:verbose` / `release:dry-run` 四个 target 在 nx 中无法执行。

7. **[缺环境配置]** 两个 app 的 `serve` target 引用 `local.config.js` / `dev.config.js` / `prod.config.js`，目录里目前只有 `config.js`。需补齐。

8. **[libs/nest-mcp]** ⚠️ **首次误判**：[tsconfig.base.json](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-backend/tsconfig.base.json) 引用 `@yikart/nest-mcp` 路径，初次 LS 输出只看到 `README.md` 因此被列入 P0。重新核对后确认 [libs/nest-mcp/](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-backend/libs/nest-mcp) 实际有完整源码（`src/`、`package.json`、`project.json`、`tsconfig.*.json`），与 `tsconfig.base.json` 的 alias 一致，**该项实际不存在**。本节保留作为勘误记录。

### P1 部署一致性

9. **[nginx 域不匹配]** [docker-compose.yml](file:///c:/Users/Admin/Desktop/github/aiautoedit/docker-compose.yml) 中 `APP_DOMAIN` 默认 `aiautoedit.art`，但 [.env.deploy.template](file:///c:/Users/Admin/Desktop/github/aiautoedit/.env.deploy.template) 写的 `APP_DOMAIN=aurastring.cloud`。两处不一致会导致 80→443 重定向跳到不存在的域。

10. **[nginx CORS 白名单]** [nginx/nginx.conf](file:///c:/Users/Admin/Desktop/github/aiautoedit/nginx/nginx.conf) 的 `cors_origin` 已加入 `aiautoedit.art` 与 `aitoearn.cn/ai`，但**没有**加入 `aurastring.cloud`，需同步。

11. **[Electron 旧部署]** [project/aitoearn-electron/src/config/index.ts](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-electron/src/config/index.ts) 仍指向 `ttgufwxxqyow.sealosbja.site` 和 `yika-bj.oss-cn-beijing.aliyuncs.com`，需要切到 `aiautoedit.art`。

### P1 品牌统一

12. **根 [AGENTS.md](file:///c:/Users/Admin/Desktop/github/aiautoedit/AGENTS.md) 仍以 `AiToEarn` 命名**，需要整段重写为 aiautoedit 语境。
13. **后端 [CLAUDE.md](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-backend/CLAUDE.md)** 仍是 Nx 通用模板，需要补充 aiautoedit 特有约束。
14. **Electron 包名** `name=aiToEarn`、`productName=哎哟赚AiToEarn`、`appId=cn.aitoearn.pc` 全部需要随品牌变更（注意：变更 appId 会导致已安装用户无法自动升级）。
15. **Docker 镜像名** 当前使用 `ghcr.io/marble1009/aitoearn-*:latest` 与 `registry.aitoearn.cn`，建议同步换成 aiautoedit 命名空间。

### P2 工程清理

16. **遗留部署文件**：`deploy_patch.ps1`、`fix-deployment.sh`、`dpaste_link.txt`、`dpaste_link_success.txt`、`aitoearn*.zip`、`aitoearn_*.tar.gz` 出现在根目录，应清理或移入 `scripts/` 归档。
17. **`.npmrc` + `pnpm-workspace.yaml` 双重存在**：根目录有 `.npmrc`，backend 子目录也有 `.npmrc`，需要确认不会冲突。
18. **scratch 目录**：[project/aitoearn-backend/scratch/](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-backend/scratch) 留有大量测试脚本与 `*_cookies.json`，建议加 `.gitignore` 或迁出仓库。

---

## 10. 补充材料登记

> 本节是 aiautoedit 项目所有补充说明、变更记录、运行笔记的集中登记区。后续每次修改完任何子项目，请按以下格式追加：

### YYYY-MM-DD —— 标题
- 涉及文件：
- 变更摘要：
- 影响范围：
- 验证步骤：
- 关联 Issue / PR：

（首次登记留空，添加时请按上面格式写在最上方）

---

### 2026-06-07 —— Phase 0 冒烟测试三件套交付

- **涉及文件**：
  - 新增 [scripts/phase-0.mjs](file:///c:/Users/Admin/Desktop/github/aiautoedit/scripts/phase-0.mjs) — 12 个微步骤主控脚本
  - 新增 [scripts/smoke-ai-routes.mjs](file:///c:/Users/Admin/Desktop/github/aiautoedit/scripts/smoke-ai-routes.mjs) — AI 路由 4 通道 smoke
  - 新增 [docs/test/phase-0-checklist.md](file:///c:/Users/Admin/Desktop/github/aiautoedit/docs/test/phase-0-checklist.md) — 人工对照清单
- **变更摘要**：
  - 12 个微步骤全部按「前置检查 → 操作 → 后置验证 → 回滚命令 → 登记模板」固定结构实现
  - 状态持久化到 `.phase-0-state.json`，跨步骤依赖自动校验
  - 失败立即停止，不进入下一步
  - Windows / Mac / Linux 跨平台（纯 Node，无外部依赖）
- **影响范围**：仅新增文件，不影响运行时；为 Phase 0 执行提供工具链
- **验证步骤**：
  ```bash
  node scripts/phase-0.mjs            # 看帮助
  node scripts/phase-0.mjs status     # 初始 0/12
  # 预期看到 0/12 全部 "○ 待办"
  ```
- **关联 commit / PR**：（待提交）

### 2026-06-07 —— Staging 环境搭建文件交付

- **涉及文件**：
  - 新增 [nginx/nginx.staging.conf](file:///c:/Users/Admin/Desktop/github/aiautoedit/nginx/nginx.staging.conf) — staging 专用 nginx，server_name 替换为 `staging.aiautoedit.art`
  - 新增 [.env.staging.example](file:///c:/Users/Admin/Desktop/github/aiautoedit/.env.staging.example) — staging 专用 .env 模板，所有 Key 与生产隔离
  - 新增 [scripts/deploy-staging.ps1](file:///c:/Users/Admin/Desktop/github/aiautoedit/scripts/deploy-staging.ps1) — PowerShell 一键部署脚本
  - 新增 [docs/test/staging-setup.md](file:///c:/Users/Admin/Desktop/github/aiautoedit/docs/test/staging-setup.md) — staging 搭建完整手册
- **变更摘要**：
  - staging nginx 强制加 `X-Environment: staging` 响应头，避免误传生产数据
  - staging env 模板中所有 __REPLACE_ME_STAGING__ 占位符与生产 .env 的 __REPLACE_ME__ 区分
  - deploy 脚本校验 5 项前置条件：.env 存在 / 无占位符 / APP_DOMAIN 正确 / nginx 配置 / 证书
  - deploy 脚本拉起后自动等所有容器 healthy，再调用 phase-0.mjs 0-9
- **影响范围**：仅新增文件，不影响现有生产部署
- **下一步**：在 staging 服务器上跑 `.\scripts\deploy-staging.ps1`，然后按 `node scripts/phase-0.mjs all` 走完 12 步

---

## 11. 问题汇总与解决方案（2026-06-07 落地）

本节一次性汇总首次深度检查发现的全部问题与对应修复方案，按严重程度排序，**已落地的修改在「落地状态」列打 ✅**。

### 11.1 P0 安全 / 凭据泄露

| # | 问题 | 落地状态 |
|---|---|---|
| S-1 | [docker-compose.yml](file:///c:/Users/Admin/Desktop/github/aiautoedit/docker-compose.yml) 硬编码 `OPENAI_API_KEY=sk-6701...`、`ANTHROPIC_API_KEY=sk-cp-vVYM...`、`MAIL_PASS=109911lZ`、`DOYIN_CLIENT_ID/SECRET`、公网 IP `124.221.103.86` | ✅ 全部改为 `${VAR:?must be set in .env}` 形式，凭据必须从 `.env` 注入；公网 IP 改为 `${PUBLIC_ASSETS_HOST}` / `${PUBLIC_CDN_HOST}` |
| S-2 | [.env.example](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-backend/.env.example) 包含真实 MongoDB Atlas 连接串（含密码 `109911lZ`） | ✅ 已替换为占位符 `__REPLACE_ME__` 与文档化样例；**请立即在 MongoDB Atlas 控制台撤销 `marble109911_db_user` 凭据** |
| S-3 | [demo/kwai/index.html](file:///c:/Users/Admin/Desktop/github/aiautoedit/demo/kwai/index.html) 硬编码快手 `appId/appSecret` | ✅ 已替换为占位符 `YOUR_KWAI_APP_ID/SECRET`，从 `window.__KWAI_CONFIG__` 注入 |
| S-4 | [demo/xhs/index.html](file:///c:/Users/Admin/Desktop/github/aiautoedit/demo/xhs/index.html) 硬编码小红书 `appKey/nonce/timestamp/signature` | ✅ 已替换为占位符，强调真实值必须由后端实时签名 |
| S-5 | [web/package.json](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-web/package.json) 暴露 locize `project-id` + 两个 `api-key` | ✅ 改为 `node scripts/i18n-with-config.mjs <action>` 形式，凭据放在 [.locize.json.example](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-web/.locize.json.example) 模板 + 本地 `.locize.json`（已加 gitignore） |
| S-6 | [aitoearn-server/src/main.ts](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-backend/apps/aitoearn-server/src/main.ts) 硬编码 `xiaok.up.railway.app` / `aitoearn-xk01-production.up.railway.app` CORS 来源 | ✅ 改为基于 `config.appDomain` + 内置白名单 + `CORS_EXTRA_ORIGINS` 环境变量动态生成 |

### 11.2 P0 启动 / 编译阻塞

| # | 问题 | 落地状态 |
|---|---|---|
| B-1 | [pnpm-workspace.yaml](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-backend/pnpm-workspace.yaml) 的 `allowBuilds` 列表写成 `"set this to true or false"` 字符串，pnpm 10 报错 | ✅ 已删除并改回标准 `onlyBuiltDependencies` 列表 |
| B-2 | [nx.json](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-backend/nx.json) 引用 `scripts/release.mjs`，目录里只有 `build-docker.mjs` | ✅ 已新增 [release.mjs](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-backend/scripts/release.mjs)：支持 `-p/--project`、`--build-only/--dry-run/--verbose`，复用 `build-docker.mjs` 准备 docker 上下文 |
| B-3 | 两个 app 的 `serve` 配置（local/dev/prod）需要 `local.config.js` / `dev.config.js` / `prod.config.js`，目录里只有 `config.js` | ✅ 已为 `aitoearn-ai` 与 `aitoearn-server` 各补齐 3 份配置，继承 `config.js` 并按场景调整 `port` / `logger.level` |

### 11.3 P1 部署一致性

| # | 问题 | 落地状态 |
|---|---|---|
| D-1 | [docker-compose.yml](file:///c:/Users/Admin/Desktop/github/aiautoedit/docker-compose.yml) 默认 `APP_DOMAIN=aiautoedit.art` 与 [.env.deploy.template](file:///c:/Users/Admin/Desktop/github/aiautoedit/.env.deploy.template) 旧值 `aurastring.cloud` 不一致 | ✅ `.env.deploy.template` 已统一为 `aiautoedit.art` |
| D-2 | [nginx.conf](file:///c:/Users/Admin/Desktop/github/aiautoedit/nginx/nginx.conf) CORS 白名单缺 `aurastring.cloud`，且没有 server 块处理 | ✅ CORS map 已加入 `aurastring.cloud`；新增 80 端口 server 块 301 → `aiautoedit.art`；HTTPS 块以注释形式保留，证书就绪时启用 |
| D-3 | [aitoearn-electron/src/config/index.ts](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-electron/src/config/index.ts) 仍指向 `ttgufwxxqyow.sealosbja.site` + `yika-bj.oss-cn-beijing.aliyuncs.com` | ✅ 已改为 Vite 环境变量注入，默认 `https://aiautoedit.art/api` 与 `https://aiautoedit.art/oss` |
| D-4 | [aitoearn-server/config/config.js](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-backend/apps/aitoearn-server/config/config.js) 含 `https://platapi.yikart.cn` / `http://39.106.41.190:7008` 旧地址 | ✅ 改为 `${PLAT_API_URI}` / `${XHS_CREATOR_URI}` 环境变量（默认值仍是旧地址，提示用户覆盖） |
| D-5 | rustfs 容器硬编码 `rustfsadmin/rustfsadmin` 与 `RUSTFS_ALLOW_INSECURE_DEFAULT_CREDENTIALS: "true"` | ✅ 凭据改为 `${RUSTFS_ACCESS_KEY}` / `${RUSTFS_SECRET_KEY}` 强制注入；`rustfs-init` 同步用 env 注入 |

### 11.4 P1 容器网络重命名

| # | 问题 | 落地状态 |
|---|---|---|
| N-1 | compose 中 7 个容器仍使用 `aitoearn-*` 容器名，桥接网络也叫 `aitoearn-network` | ✅ 已统一重命名为 `aiautoedit-*` / `aiautoedit-network`（与项目名一致） |
| N-2 | compose 镜像名仍为 `ghcr.io/marble1009/aitoearn-*` | ✅ 改为 `${IMAGE_REGISTRY:-ghcr.io/marble1009}/aiautoedit-*`（默认保留 ghcr.io 兼容既有 CI 推送） |

### 11.5 P1 模板补齐

| # | 文件 | 状态 |
|---|---|---|
| T-1 | [.env.example](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-backend/.env.example) | ✅ 全新整理，按区域分组，全部 `__REPLACE_ME__` 占位 |
| T-2 | [.env.template](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-backend/.env.template) | ✅ 全新本地开发模板 |
| T-3 | [.env.deploy.template](file:///c:/Users/Admin/Desktop/github/aiautoedit/.env.deploy.template) | ✅ 全新整理，域名 / 凭据 / AI 密钥全占位 |
| T-4 | [.locize.json.example](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-web/.locize.json.example) | ✅ 全新创建，对应 npm script 改动 |

### 11.6 P2 仍需用户手动操作（机器人不可执行）

以下问题**需要你本人手动处理**，本工具无法代为执行：

| # | 操作 | 原因 |
|---|---|---|
| M-1 | **立即撤销** `marble109911_db_user` MongoDB 凭据 | 数据库已泄露 |
| M-2 | **立即重新签发** `sk-cp-vVYM7B9nZ...` Anthropic API Key | 看起来是生产密钥 |
| M-3 | **重新签发**抖音开放平台 `awssuej5w6ocwfos` / `b37c8afab40d7bdfade00d878e081245` 凭据 | 已硬编码在公开仓库 |
| M-4 | **重新签发**腾讯企业邮箱 `aitoearn@aiautoedit.art` 密码 `109911lZ` | 已硬编码在公开仓库 |
| M-5 | **重新签发** locize `api-key`（`c9805cd1-...` 与 `bd8cb856-...`） | 已硬编码在 package.json |
| M-6 | **品牌深度重命名**：`@yikart/*` 包名空间、Electron `appId=cn.aitoearn.pc`、productName 「哎哟赚AiToEarn」、根 AGENTS.md / CLAUDE.md 称呼 | 涉及发布兼容性与大量文本重写，需逐项评估 |
| M-7 | **清理根目录遗留文件**：`aitoearn*.zip`、`aitoearn_*.tar.gz`、`dpaste_link*.txt`、`deploy_patch.ps1`、`fix-deployment.sh` | 不可逆删除 |
| M-8 | **scratch 目录** 加 gitignore 或迁出 | 包含 cookies / 测试脚本 |
| M-9 | **Electron `appId`** 变更 | 改 `appId` 会让已安装用户无法自动升级，需要发版公告 |

### 11.7 变更影响范围

执行本轮修复后，**你需要重新执行以下操作**才能让环境完全跑通：

1. **生成新凭据**（M-1~M-5）并填入 `.env`
2. **拉取新代码后** 第一次启动：
   ```bash
   cd project/aitoearn-backend
   pnpm install
   pnpm nx run-many --target=build --all
   ```
3. **验证 release 脚本**：
   ```bash
   pnpm nx run aitoearn-ai:release:dry-run -- --verbose
   pnpm nx run aitoearn-server:release:dry-run -- --verbose
   ```
4. **验证 serve**：
   ```bash
   pnpm nx serve aitoearn-ai:local
   pnpm nx serve aitoearn-server:local
   ```
5. **前端 i18n**（如果还在维护翻译）：
   ```bash
   cd ../aitoearn-web
   cp .locize.json.example .locize.json
   # 编辑 .locize.json 填入新凭据
   pnpm downloadLocales
   ```
6. **Electron 重新打包**（在变更完 VITE_API_BASE_URL 之后）：
   ```bash
   cd ../aitoearn-electron
   pnpm build
   ```

---

## 12. AI 通道路由（2026-06-07 重构）

### 12.1 通道职责划分

| 通道 | 用途 | 服务类 | 环境变量 | 默认 baseUrl |
|---|---|---|---|---|
| **minimax-M3**（主） | 文本生成 / 关键词 / 文案 / 推理 | `openaiService` | `MINIMAX_API_KEY` / `MINIMAX_BASE_URL` | `https://api.minimaxi.com/v1` |
| **阿里百炼 Wanxiang** | 图片 / 视频（wanx、wan2.7-*、wanx2.1-*、virtualmodel） | `WanxiangService` | `DASHSCOPE_API_KEY` / `DASHSCOPE_BASE_URL` | `https://dashscope.aliyuncs.com/api/v1` |
| **OpenAI 兼容**（可选） | gpt-image-1 / dall-e-* / sora-* | `openaiService` | `OPENAI_API_KEY` / `OPENAI_BASE_URL` | `https://api.openai.com/v1` |
| **Volcengine** | 视频编辑 / 短剧解说 / Aideo | `volcengineService` | `VOLCENGINE_API_KEY/ACCESS_KEY_ID/SECRET_ACCESS_KEY` | `https://ark.cn-beijing.volces.com/` |
| **Anthropic**（Claude Agent） | 旧 Anthropic SDK 通道 | `Anthropic` | `ANTHROPIC_API_KEY` / `ANTHROPIC_BASE_URL` | `https://api.anthropic.com` |
| **Gemini** | 图像生成（gemini-3.1-flash-image-preview） | `geminiService` | `GEMINI_API_KEY` / `GEMINI_KEY_PAIRS` / `GEMINI_BASE_URL` | Google GenAI |
| **Grok** | 视频生成 | `grokVideoService` | `GROK_API_KEY` | `https://api.x.ai` |
| **NVIDIA** | 文本（llama 等） | `nvidiaService` | `AI_NVIDIA_API_KEY` | `https://integrate.api.nvidia.com/v1` |
| **DeepSeek**（兜底） | 文本兜底（主通道失败时启用） | `openaiService` 内部 | `DEEPSEEK_API_KEY` / `DEEPSEEK_BASE_URL` | `https://api.deepseek.com/v1` |

### 12.2 路由决策表

调用方在以下入口决定走哪条通道：

| 入口 | 模型名前缀 / 名称 | 走的通道 |
|---|---|---|
| `chat.service.ts` (text) | `MiniMax-M*` / `gpt-5*` | openaiService → MINIMAX 网关 |
| `chat.service.ts` (text) | `nvidia/*` / `meta/llama-*` | nvidiaService |
| `image.service.ts` (generation) | `wan2.7-image*` / `wanx-*` | WanxiangService |
| `image.service.ts` (generation) | `gpt-image-1` / `dall-e-*` | openaiService |
| `image.service.ts` (edit) | `wanx-background-generation-v2` / `virtualmodel-v2` | WanxiangService（异步轮询） |
| `image.service.ts` (edit) | `gpt-image-1` | openaiService |
| `image.service.ts` (gemini) | `gemini-3.1-flash-image-preview` | geminiService；失败兜底走 WanxiangService |
| `video.service.ts` | `wan2.7-*` / `wanx2.1-*` | WanxiangService（`channel: 'dashscope'`） |
| `video.service.ts` | `volcengine*` | volcengineService |
| `video.service.ts` | `grok-*` | grokVideoService |
| `video.service.ts` | `gemini-veo-*` | geminiVideoService |
| `video.service.ts` | `sora-*` | openaiService |
| `aideo.service.ts` | Aideo 短剧 / 高光 / 翻译 / 擦除 / 风格转换 | volcengineService |
| `draft-generation.service.ts` | 草稿生成 | 默认走 openaiService → MINIMAX 网关 |

### 12.3 修复历程（重要历史）

| 日期 | 改动 | 影响 |
|---|---|---|
| 修复前 | `OPENAI_BASE_URL=https://dashscope.aliyuncs.com/...` + `openai.service.ts` 强改 `qwen-plus` | **文本生成被路由到阿里 Qwen**（用户报告的现象） |
| 修复前 | `openai.service.ts` 用 `this.config.apiKey`（OpenAI Key）调 DashScope 视频/图像 | Key 错用，可能导致单 Key 限流或 401 |
| 修复前 | `openai.service.ts` 硬编码 `sk-0158c32f62b7489c9c6550695c159b3f` 做 DeepSeek 兜底 | **生产密钥泄露** |
| 修复前 | `config.js` 中 `wan2.7-*` / `wanx2.1-*` 模型 `channel: 'openai'` | 视频模型错路由 |
| 2026-06-07 | 拆分为 `minimax` / `dashscope` / `deepseek` 三个独立 env | 文本/图像/视频通道 Key 完全分离 |
| 2026-06-07 | 新增 [WanxiangService](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-backend/apps/aitoearn-ai/src/core/ai/libs/wanxiang/wanxiang.service.ts)，封装 DashScope 全部图像/视频 API | 取代原 openai.service.ts 里的硬编码分支 |
| 2026-06-07 | 移除 `openai.service.ts` 中 dashscope / minimax 的所有 baseUrl 分支、模型重写、硬编码 deepseek | openaiService 退回到纯 OpenAI 兼容职责 |
| 2026-06-07 | `image.service.ts` / `video.service.ts` 显式按模型名前缀路由到 WanxiangService | 路由决策明确化、可观测 |
| 2026-06-07 | `AiLogChannel.Dashscope` 解除 `@deprecated` 标记 | 用于视频模型 channel 字段 |
| 2026-06-07 | `.env.example` / `.env.deploy.template` / `docker-compose.yml` 新增 `MINIMAX_*` / `DASHSCOPE_*` / `DEEPSEEK_*` | 与代码对齐 |

### 12.4 验证清单（部署后必跑）

```bash
# 1. 文本通道：确认 chat 接口走的是 minimax
curl -X POST http://aitoearn-ai:3010/ai/chat/test \
  -H "Authorization: Bearer $INTERNAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"model":"MiniMax-M2.7","messages":[{"role":"user","content":"echo"}],"userId":"smoke-test","userType":3}'
# 日志中应出现：POST https://api.minimaxi.com/v1/chat/completions

# 2. 图像通道：确认图片生成走的是阿里百炼
curl -X POST http://aitoearn-ai:3010/ai/image/generation \
  -H "Authorization: Bearer $INTERNAL_TOKEN" \
  -d '{"model":"wan2.7-image","prompt":"test","user":"smoke-test"}'
# 日志中应出现：POST https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation

# 3. 视频通道：确认 wan2.7 走阿里百炼
curl -X POST http://aitoearn-ai:3010/ai/video/generation \
  -H "Authorization: Bearer $INTERNAL_TOKEN" \
  -d '{"model":"wan2.7-t2v-2026-04-25","prompt":"test","userId":"smoke-test","userType":3}'
# 日志中应出现：POST https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis

# 4. 兜底通道：模拟主通道失败，确认 DeepSeek 兜底
# 故意把 MINIMAX_API_KEY 改错，触发 createChatCompletion 异常路径
# 日志中应出现：DeepSeek 兜底成功
```

---

## 13. 关键路径索引

- 根 README（待重写）：[README.md](file:///c:/Users/Admin/Desktop/github/aiautoedit/README.md)
- 根 AGENTS（待重写）：[AGENTS.md](file:///c:/Users/Admin/Desktop/github/aiautoedit/AGENTS.md)
- 部署文档：[DOCKER_DEPLOYMENT_CN.md](file:///c:/Users/Admin/Desktop/github/aiautoedit/DOCKER_DEPLOYMENT_CN.md) / [DOCKER_DEPLOYMENT_EN.md](file:///c:/Users/Admin/Desktop/github/aiautoedit/DOCKER_DEPLOYMENT_EN.md)
- 反向代理：[nginx/nginx.conf](file:///c:/Users/Admin/Desktop/github/aiautoedit/nginx/nginx.conf)
- Compose：[docker-compose.yml](file:///c:/Users/Admin/Desktop/github/aiautoedit/docker-compose.yml)
- 后端 Nx 配置：[project/aitoearn-backend/nx.json](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-backend/nx.json)
- 后端构建脚本：[project/aitoearn-backend/scripts/build-docker.mjs](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-backend/scripts/build-docker.mjs)
- 前端 Next 配置：[project/aitoearn-web/next.config.mjs](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-web/next.config.mjs)
- 前端环境：[project/aitoearn-web/.env.production](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-web/.env.production)
- Electron 渲染配置：[project/aitoearn-electron/src/config/index.ts](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-electron/src/config/index.ts)
- Electron 打包配置：[project/aitoearn-electron/electron-builder.json](file:///c:/Users/Admin/Desktop/github/aiautoedit/project/aitoearn-electron/electron-builder.json)
