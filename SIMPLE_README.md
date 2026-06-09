# AiToEarn

一站式 AI 内容营销智能体平台，帮助 OPC（一人公司）、创作者与品牌在多个主流社媒平台上自动化创作、发布、互动与变现。

支持渠道：抖音、小红书、快手、哔哩哔哩、视频号、TikTok、YouTube、Facebook、Instagram、Threads、Twitter(X)、Pinterest、LinkedIn。

## 仓库结构

```
.
├── project/
│   ├── aitoearn-backend/    # Nx + pnpm 后端（Nest、MCP、libs 复用）
│   ├── aitoearn-web/        # Next.js + pnpm 前端
│   └── aitoearn-electron/   # Electron 桌面端（含 Nest server）
├── demo/                    # 平台演示页面
├── nginx/                   # 反向代理配置
├── presentation/            # 展示资源
├── docker-compose.yml       # 一键部署
└── Dockerfile               # 镜像构建
```

## 快速开始

| 方式 | 适用人群 | 部署 |
|---|---|---|
| 直接使用官网 | 所有用户 | 否 |
| OpenClaw 龙虾 | 龙虾用户 | 否 |
| Claude / Cursor 等 MCP Agent | AI 工具用户 | 否 |
| Docker 一键部署 | 私有化团队 | 需要服务器 |
| 源码开发 | 开发者 | 需要本地环境 |

## 本地开发

- 后端：`cd project/aitoearn-backend && pnpm install && pnpm nx ...`（详见 `aitoearn-backend/CLAUDE.md`）
- 前端：`cd project/aitoearn-web && pnpm install && pnpm run type-check && pnpm build`
- 桌面端：`cd project/aitoearn-electron && pnpm install`

根目录无统一 `package.json`，请勿在根目录执行 `install` / `build`。

## 环境

| 区域 | 服务地址 |
|---|---|
| 中国版 | `*.aitoearn.cn` |
| 国际版 | `*.aitoearn.ai` |

API Key 与环境必须匹配（中国版 Key 配 `aitoearn.cn`，国际版 Key 配 `aitoearn.ai`），否则会出现 401。

## 文档

- 详细说明：`README.md` / `README_EN.md` / `README_JA.md`
- Docker 部署：`DOCKER_DEPLOYMENT_CN.md` / `DOCKER_DEPLOYMENT_EN.md`
- 贡献指南：`CONTRIBUTING.md` / `CONTRIBUTING_CN.md`
- 工作区规则：`AGENTS.md`

## License

MIT
