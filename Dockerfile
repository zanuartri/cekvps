# syntax=docker/dockerfile:1

# ── Stage 1: build the SPA ────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY app/package*.json ./
RUN npm ci
COPY app/ ./
RUN npm run build          # → /app/dist (bundled data baked into dist/data)

# ── Stage 2: runtime — nginx serves the SPA, cron refreshes the data ──────
FROM nginx:1.27-alpine

# Python scraper + cron (busybox crond ships with alpine)
RUN apk add --no-cache python3 py3-pip tzdata
ENV TZ=Asia/Jakarta

WORKDIR /scraper
COPY scraper/requirements.txt ./
RUN pip install --no-cache-dir --break-system-packages -r requirements.txt
COPY scraper/ ./

# SPA (includes the bundled /data so the site works before the first scrape)
COPY --from=build /app/dist /usr/share/nginx/html

# nginx config, cron schedule, entrypoint
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/crontab /etc/crontabs/root
COPY deploy/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Scraper writes JSON straight into the web root's /data dir
ENV CEKVPS_DATA_DIR=/usr/share/nginx/html/data

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
