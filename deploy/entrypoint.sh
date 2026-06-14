#!/bin/sh
set -e

# The web root already ships the bundled /data (baked at build), so the site is
# usable immediately. Kick off a fresh scrape in the background, then start cron
# for the recurring refresh, and finally hand the foreground to nginx.

mkdir -p "$CEKVPS_DATA_DIR"

echo "[entrypoint] initial scrape (background)…"
( CEKVPS_DATA_DIR="$CEKVPS_DATA_DIR" python3 /scraper/run.py \
    >> /var/log/cekvps-scrape.log 2>&1 || echo "[entrypoint] initial scrape failed (serving bundled data)" ) &

echo "[entrypoint] starting cron…"
crond -b -l 8

echo "[entrypoint] starting nginx…"
exec nginx -g 'daemon off;'
