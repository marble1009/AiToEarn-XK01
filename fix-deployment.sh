#!/bin/bash
set -e

# Temporarily rename .dockerignore so that compiled dist directories are sent to docker build context
mv ~/aitoearn/.dockerignore ~/aitoearn/.dockerignore.bak || true

echo "=== 1. Repacking aitoearn-ai ==="
cat > /tmp/repack-ai.Dockerfile << 'EOF'
FROM node:20-alpine
RUN sed -i "s/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g" /etc/apk/repositories && apk add --no-cache curl ffmpeg
WORKDIR /app
COPY --from=ghcr.io/marble1009/aitoearn-ai:latest /app /app
COPY project/aitoearn-backend/dist/apps/aitoearn-ai/ /app/apps/aitoearn-ai/
COPY project/aitoearn-backend/dist/libs/ /app/libs/
RUN node -e "const fs = require('fs'); const cp = require('child_process'); cp.execSync('find /app -name package.json -path \"*/@nestjs/swagger/*\"').toString().trim().split('\n').forEach(p => { if(p){const pkg = JSON.parse(fs.readFileSync(p)); delete pkg.exports; fs.writeFileSync(p, JSON.stringify(pkg, null, 2)); console.log('Patched ' + p);} })" || true
ENV NODE_ENV=production
CMD ["sh", "-c", "echo 'nameserver 8.8.8.8' >> /etc/resolv.conf && echo 'nameserver 1.1.1.1' >> /etc/resolv.conf && node apps/aitoearn-ai/src/main.js -c config.js"]
EOF
sudo docker build -f /tmp/repack-ai.Dockerfile -t ghcr.io/marble1009/aitoearn-ai:latest ~/aitoearn/

echo "=== 2. Repacking aitoearn-server ==="
cat > /tmp/repack-server.Dockerfile << 'EOF'
FROM node:20-slim
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources || true
RUN apt-get update && apt-get install -y curl ffmpeg gnupg wget fonts-wqy-zenhei chromium --no-install-recommends && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=ghcr.io/marble1009/aitoearn-server:latest /app /app
COPY project/aitoearn-backend/dist/apps/aitoearn-server/ /app/apps/aitoearn-server/
COPY project/aitoearn-backend/dist/libs/ /app/libs/
RUN node -e "const fs = require('fs'); const cp = require('child_process'); cp.execSync('find /app -name package.json -path \"*/@nestjs/swagger/*\"').toString().trim().split('\n').forEach(p => { if(p){const pkg = JSON.parse(fs.readFileSync(p)); delete pkg.exports; fs.writeFileSync(p, JSON.stringify(pkg, null, 2)); console.log('Patched ' + p);} })" || true
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
CMD ["sh", "-c", "node apps/aitoearn-server/src/main.js -c config.js"]
EOF
sudo docker build -f /tmp/repack-server.Dockerfile -t ghcr.io/marble1009/aitoearn-server:latest ~/aitoearn/

# Restore .dockerignore
mv ~/aitoearn/.dockerignore.bak ~/aitoearn/.dockerignore || true

echo "=== 3. Restarting Services ==="
cd ~/aitoearn && sudo docker compose build aitoearn-web && sudo docker compose up -d && sudo docker compose restart nginx && sudo docker compose ps
echo "=== Done! ==="

