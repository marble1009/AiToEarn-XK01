# ============ 阶段1：构建环境 ============
FROM node:24-slim AS builder

RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app
COPY . .

WORKDIR /app/project/aitoearn-backend
RUN pnpm install --no-frozen-lockfile

# 编译所有项目
RUN pnpm nx run-many --target=build --all

# 把编译好的内部库覆盖 node_modules 里的源码链接
RUN for lib in dist/libs/*/; do name=$(basename "$lib"); rm -rf "node_modules/@yikart/$name"; cp -r "$lib" "node_modules/@yikart/$name"; done

# ============ 阶段2：精简运行镜像 ============
FROM node:24-slim AS runner

WORKDIR /app/project/aitoearn-backend

COPY --from=builder /app/project/aitoearn-backend/node_modules ./node_modules
COPY --from=builder /app/project/aitoearn-backend/dist/apps/aitoearn-server ./dist/apps/aitoearn-server
COPY --from=builder /app/project/aitoearn-backend/apps/aitoearn-server/config ./apps/aitoearn-server/config

EXPOSE 3002
ENV NODE_ENV=production

CMD ["node", "dist/apps/aitoearn-server/src/main.js", "-c", "apps/aitoearn-server/config/config.js"]
