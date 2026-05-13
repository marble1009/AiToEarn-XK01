FROM node:24-slim

# 安装必要依赖
RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*

# 锁定 pnpm 9
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app
COPY . .

# 进入后端目录
WORKDIR /app/project/aitoearn-backend
RUN pnpm install --no-frozen-lockfile

# 执行打包
RUN pnpm nx build aitoearn-server

# 暴露端口
EXPOSE 3002

# 动态查找 main.js 并启动（这样最稳，不管它打到哪个目录都能找到）
CMD ["/bin/sh", "-c", "find dist -name main.js | xargs node"]
