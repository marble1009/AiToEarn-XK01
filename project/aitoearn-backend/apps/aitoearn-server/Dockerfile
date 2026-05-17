FROM node:24-slim AS deps

RUN npm install -g pnpm

WORKDIR /app

COPY deps/ ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

FROM node:24-slim AS production

ARG APP_NAME

# Install Google Chrome, ffmpeg, curl and Chinese fonts for Puppeteer
RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    gnupg \
    wget \
    fonts-wqy-zenhei \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
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
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

CMD ["sh", "-c", "node apps/${APP_NAME}/src/main.js -c config.js"]
