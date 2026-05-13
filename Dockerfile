FROM node:24-slim

# 安装必要的基础依赖并启用 pnpm
RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 设定工作目录
WORKDIR /app

# 复制整个仓库
COPY . .

# 进入后端目录，安装依赖并打包
WORKDIR /app/project/aitoearn-backend
RUN pnpm install --no-frozen-lockfile
RUN pnpm nx build aitoearn-server

# 暴露后端端口
EXPOSE 3002

# 启动编译后的文件
CMD ["node", "dist/apps/aitoearn-server/main.js"]
