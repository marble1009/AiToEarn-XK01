FROM node:24-slim

# 安装编译原生模块所需的基础工具
RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*

# 强制使用 pnpm 9（避免 pnpm 11 的 onlyBuiltDependencies 问题）
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app
COPY . .

# 进入后端目录，安装依赖并打包
WORKDIR /app/project/aitoearn-backend
RUN pnpm install --no-frozen-lockfile
RUN pnpm nx build aitoearn-server

EXPOSE 3002
CMD ["node", "dist/apps/aitoearn-server/main.js"]
