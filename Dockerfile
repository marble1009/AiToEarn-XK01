FROM node:24-slim

# 安装编译原生模块所需的工具
RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*

# 锁定 pnpm 9
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

# ========== 阶段1：在完整的 monorepo 中编译 ==========
WORKDIR /app
COPY . .

WORKDIR /app/project/aitoearn-backend
RUN pnpm install --no-frozen-lockfile
RUN pnpm nx build aitoearn-server

# ========== 阶段2：进入编译产物目录，安装生产依赖 ==========
WORKDIR /app/project/aitoearn-backend/dist/apps/aitoearn-server
RUN pnpm install --prod --no-frozen-lockfile

# 把配置文件也复制到产物目录
RUN cp -r /app/project/aitoearn-backend/apps/aitoearn-server/config ./config

EXPOSE 3002

# 从 dist 目录启动（这里的 main.js 能正确找到所有依赖）
CMD ["node", "main.js"]
