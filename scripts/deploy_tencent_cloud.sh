#!/bin/bash

# AiToEarn Tencent Cloud One-Click Deployment Script
# Target: Ubuntu 22.04+ (Lighthouse Instance)

set -e

echo "🚀 Starting AiToEarn Deployment on Tencent Cloud..."

# 1. Install Docker if not exists
if ! [ -x "$(command -v docker)" ]; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com | bash
    sudo usermod -aG docker $USER
fi

# 2. Install Docker Compose if not exists
if ! [ -x "$(command -v docker-compose)" ]; then
    echo "📦 Installing Docker Compose..."
    sudo apt-get update
    sudo apt-get install -y docker-compose
fi

# 3. Create Project Directory
mkdir -p ~/aitoearn
cd ~/aitoearn

# 4. Clone or Update Repo
if [ -d ".git" ]; then
    echo "🔄 Updating repository..."
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone https://github.com/marble1009/AiToEarn-XK01.git .
fi

# 5. Setup Environment Variables
echo "⚙️ Configuring environment (XiaoZhi AI Compatibility Mode)..."
# Note: Using the NVIDIA Key provided by the user
# Adjusted ports: Nginx 8080 -> 8081, RustFS 9000 -> 9010
cat <<EOF > .env
NODE_ENV=production
PROJECT_NAME=aitoearn
DOMAIN=aurastring.cloud
AI_NVIDIA_API_KEY=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
MONGODB_URI=mongodb://admin:password@mongodb:27018/aitoearn
REDIS_URL=redis://redis:6380
ASSETS_CONFIG='{"provider":"s3","region":"us-east-1","bucketName":"aitoearn","endpoint":"http://rustfs.local:9000","publicEndpoint":"http://111.229.159.100:9010","cdnEndpoint":"http://111.229.159.100:8081/oss","accessKeyId":"rustfsadmin","secretAccessKey":"rustfsadmin","forcePathStyle":true}'
EOF

# 6. Start Services
echo "🏗️ Launching containers (XiaoZhi-Safe Mode)..."
# We will use the modified docker-compose below
sudo docker-compose up -d

echo "✅ Deployment Successful!"
echo "🌐 Your app will be available at: http://aurastring.cloud (after DNS propagates)"
echo "📡 Current IP access: http://111.229.159.100"
