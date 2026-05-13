FROM node:24-slim

# 安装必要依赖
RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*

# 锁定 pnpm 9
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app
COPY . .

# 进入后端目录，安装所有依赖（保留 monorepo 结构）
WORKDIR /app/project/aitoearn-backend
RUN pnpm install --no-frozen-lockfile

# 暴露端口
EXPOSE 3002

# 使用 Nx 官方命令直接启动生产环境（最无脑、最稳妥）
CMD ["pnpm", "nx", "serve", "aitoearn-server", "--configuration=prod"]
