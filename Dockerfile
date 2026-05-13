# ============ 阶段1：安装依赖 ============
FROM node:24-slim AS deps

RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app
COPY . .

WORKDIR /app/project/aitoearn-backend
RUN pnpm install --no-frozen-lockfile
RUN pnpm add -D ts-node tsconfig-paths

# ============ 阶段2：精简运行镜像 ============
FROM node:24-slim AS runner

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app/project/aitoearn-backend

# 只复制后端运行所需的文件
COPY --from=deps /app/project/aitoearn-backend/node_modules ./node_modules
COPY --from=deps /app/project/aitoearn-backend/apps ./apps
COPY --from=deps /app/project/aitoearn-backend/libs ./libs
COPY --from=deps /app/project/aitoearn-backend/tsconfig.base.json ./tsconfig.base.json
COPY --from=deps /app/project/aitoearn-backend/package.json ./package.json
COPY --from=deps /app/project/aitoearn-backend/nx.json ./nx.json

EXPOSE 3002

ENV TS_NODE_PROJECT=apps/aitoearn-server/tsconfig.app.json

CMD ["pnpm", "exec", "ts-node", "-r", "tsconfig-paths/register", "apps/aitoearn-server/src/main.ts", "-c", "apps/aitoearn-server/config/prod.config.js"]
