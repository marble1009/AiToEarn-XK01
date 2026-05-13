FROM node:24-slim

# 安装必要依赖
RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*

# 锁定 pnpm 9
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app
COPY . .

# 进入后端目录，安装所有依赖
WORKDIR /app/project/aitoearn-backend
RUN pnpm install --no-frozen-lockfile

# 安装轻量级 TypeScript 运行环境 tsx
RUN npm install -g tsx

# 暴露端口
EXPOSE 3002

# 使用 tsx 直接启动源码（内存占用极低，完美解析 monorepo 路径，避免 OOM）
CMD ["tsx", "apps/aitoearn-server/src/main.ts", "-c", "apps/aitoearn-server/config/prod.config.js"]
