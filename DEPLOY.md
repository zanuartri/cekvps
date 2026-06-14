# Deploy — Coolify

CekVPS ships as a single Docker image: **nginx serves the SPA** and an in-image
**cron runs the Python scraper** to refresh `/data` (prices + FX). No external
database, no shared volumes — the data is regenerated from the scrape.

## How the image works

- Multi-stage [`Dockerfile`](./Dockerfile): stage 1 builds the Vite SPA → `dist`
  (with the bundled `app/public/data` baked in), stage 2 = nginx + Python.
- On boot, [`deploy/entrypoint.sh`](./deploy/entrypoint.sh) runs one scrape in
  the background, starts `crond`, then nginx (port **80**).
- The site is usable immediately on the bundled data; the scrape and the cron
  ([`deploy/crontab`](./deploy/crontab), 2x/day at 06:10 & 18:10 WIB) overwrite it
  with fresh data.
- Scraper writes to `CEKVPS_DATA_DIR` (`/usr/share/nginx/html/data` in the
  image), which nginx serves at `/data/…`.

## Coolify setup (one-time)

1. **Server**: a VPS with ≥4 GB RAM (Coolify itself uses ~1 GB). Install Coolify:
   `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`
2. **New Resource → Application → Public/Private Repository** → point at this repo,
   branch `main`.
3. **Build Pack: Dockerfile** (Coolify auto-detects the root `Dockerfile`).
4. **Port**: `80`.
5. **Domain**: set `https://cekvps.com` — Coolify provisions SSL (Let's Encrypt)
   automatically. Point the domain's DNS A record at the VPS first.
6. **Deploy**. Enable *auto-deploy on push* so every `git push` to `main` redeploys.

That's it — no env vars required (`CEKVPS_DATA_DIR`/`TZ` are set in the image).

## Test the image locally

```sh
make docker-run      # builds + runs on http://localhost:8080
```

## Notes

- **Timezone** is `Asia/Jakarta` (cron fires 06:10 & 18:10 WIB).
- **Data is ephemeral** by design — on redeploy the fresh image re-bakes the
  committed `app/public/data` and the scraper refreshes it. If you want data to
  survive restarts without waiting for a scrape, mount a Coolify persistent
  volume at `/usr/share/nginx/html/data`.
- **Scrape logs**: `/var/log/cekvps-scrape.log` inside the container.
