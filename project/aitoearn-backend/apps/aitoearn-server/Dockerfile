FROM node:24-slim AS deps

RUN npm install -g pnpm@9.15.9

WORKDIR /app

COPY deps/ ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

FROM node:24-slim AS production

ARG APP_NAME

# Install Chromium, ffmpeg, curl and Chinese fonts for Puppeteer (supports both amd64 and arm64)
RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    gnupg \
    wget \
    fonts-wqy-zenhei \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY assets/ ./
COPY --from=deps /app/ ./

COPY apps/ ./apps/
COPY libs/ ./libs/

ENV NODE_ENV=production
ENV APP_NAME=$APP_NAME
# Set Puppeteer to avoid downloading Chrome again and use the installed one
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

CMD ["sh", "-c", "node apps/${APP_NAME}/src/main.js -c config.js"]
