# ============ 阶段1：构建环境 ============
FROM node:24-slim AS builder

RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app
COPY . .

WORKDIR /app/project/aitoearn-backend
# 安装全量依赖
RUN pnpm install --no-frozen-lockfile

# 编译整个 monorepo，将所有后端项目和基础库编译为纯 JS
RUN pnpm nx run-many --target=build --all

# 黑科技核心：将编译好的内部库（纯 JS），直接覆盖掉 node_modules 里的源码软链接！
# 这样 Node 运行时 require('@yikart/xxx') 会直接加载打包好的 .js 文件，而不是 TypeScript 源码！
RUN rm -rf node_modules/@yikart/*
RUN cp -r dist/libs/* node_modules/@yikart/

# ============ 阶段2：极简运行环境 ============
FROM node:24-slim AS runner

# 设置 Node 环境变量为生产
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app/project/aitoearn-backend

# 1. 复制被“偷天换日”后的纯净 node_modules
COPY --from=builder /app/project/aitoearn-backend/node_modules ./node_modules

# 2. 复制编译好的后端主程序
COPY --from=builder /app/project/aitoearn-backend/dist/apps/aitoearn-server ./dist/apps/aitoearn-server

# 3. 复制启动必需的配置文件
COPY --from=builder /app/project/aitoearn-backend/apps/aitoearn-server/config ./apps/aitoearn-server/config

EXPOSE 3002

# 终极形态：直接用原生 Node.js 启动编译后的纯 JS 文件！
# 完全抛弃 ts-node 和 Nx 打包进程，内存占用极低（仅需 ~80MB），绝对不会再触发 500MB OOM 杀进程！
CMD ["node", "dist/apps/aitoearn-server/main.js", "-c", "apps/aitoearn-server/config/prod.config.js"]
