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
echo "⚙️ Configuring environment..."
# Note: Using the NVIDIA Key provided by the user
cat <<EOF > .env
NODE_ENV=production
PROJECT_NAME=aitoearn
DOMAIN=aurastring.cloud
AI_NVIDIA_API_KEY=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
MONGODB_URI=mongodb://mongo:27014/aitoearn
REDIS_URL=redis://redis:6379
ASSETS_CONFIG='{"provider":"local","root":"/app/assets","baseUrl":"https://aurastring.cloud/assets"}'
EOF

# 6. Start Services
echo "🏗️ Launching containers (this may take a few minutes)..."
sudo docker-compose -f docker-compose.yml up -d

echo "✅ Deployment Successful!"
echo "🌐 Your app will be available at: http://aurastring.cloud (after DNS propagates)"
echo "📡 Current IP access: http://111.229.159.100"
