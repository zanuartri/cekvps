# CLAUDE.md

Guidance for AI agents working in this repo. Read this before making changes.

## What this is

**CekVPS** — a VPS price-comparison site for Indonesian developers. Static React
SPA + Python scraper. See [README.md](./README.md) for the user-facing overview.

## Architecture

- `app/` — Vite + React + TS + Tailwind v4 SPA. Entry `app/src/App.tsx`.
  - `app/src/lib/types.ts` — the data model + all provider metadata (`PROVIDER_NAMES`,
    `PROVIDER_COLORS`, `PROVIDER_META` payment methods), currency/FX, formatters,
    and the display caps `MAX_VCPU` (8) / `MAX_RAM_GB` (32).
  - `app/src/lib/site.ts` — site + monetization config (Saweria, affiliate).
  - `app/src/hooks/useVPSData.ts` — fetches `/data/*.json` at runtime.
  - `app/public/data/` — **bundled** snapshot of scraped data (baked into the build
    so the site works before the first live scrape).
- `scraper/` — Python. `run.py` orchestrates; `providers/<name>.py` per provider;
  `config.py` holds `VPS_PROVIDERS` (enabled flags) + `FALLBACK_VPS` (curated/last-known
  prices). Writes JSON to `CEKVPS_DATA_DIR` (env; defaults to a bare-metal path).
- `Dockerfile` + `deploy/` — one image: nginx serves the SPA, in-image cron runs the
  scraper. See [DEPLOY.md](./DEPLOY.md).

## Data flow

`scraper/run.py` → `/data/{vps/all.json, summary.json, fx.json}` → SPA fetches them.
4 providers are scraped live (contabo, biznet_gio, domainesia, cloudkilat); 4 are
curated in `config.py` (hostinger, idcloudhost, sumopod, dalang). FX from
frankfurter.app (no key).

## Conventions / gotchas

- **Price semantics** (`VPSPlan` in types.ts):
  - `price_monthly` = no-commitment **monthly** headline (apples-to-apples across all
    providers — e.g. Contabo's 12-month rate is divided back out to monthly).
  - `price_annual_monthly` = effective /month if paid annually → renders as the
    "…/bln jika tahunan" hint. Only set when a real annual discount exists.
  - `price_original` + `discount_pct` = a promo strike on the monthly price.
  - `bandwidth_tb: null` = **verified unlimited**, NOT "unknown". If a future
    provider's cap is unknown, give it a real number — never null.
- **Display cap**: plans with `vcpu > 8` or `ram_gb > 32` are filtered out in
  `App.tsx` (kept in data, hidden in UI). Don't "fix" the count mismatch with summary.json.
- **Build**: vite `outDir` is the default `dist`. Don't hardcode absolute server
  paths. The Docker build copies `dist` into the nginx web root.
- **Line endings**: shell/infra files (`deploy/*.sh`, `crontab`, `nginx.conf`,
  `Dockerfile`) are forced LF via `.gitattributes` — keep them LF or the container breaks.
- **Data is regenerated**, not hand-edited in `all.json`. Change `config.py` /
  the provider module, then re-run the scraper to refresh `app/public/data/`.

## Commands

```sh
cd app && npm run dev        # dev server
cd app && npm run build      # tsc -b && vite build → app/dist
cd app && npx tsc -p tsconfig.app.json --noEmit   # typecheck
make scrape                  # run scraper → app/public/data
make docker-run              # build + run the production image locally
```

Always typecheck after touching `app/`.

## ⚠️ Security — this repo is PUBLIC

The repository is open source and **auto-deploys on push to `main`** (Coolify
webhook). Treat that accordingly:

- **Never commit secrets** — no `.env`, API keys, passwords, tokens, the VPS IP, or
  SSH keys. There are none today; keep it that way. Scraper needs no keys
  (frankfurter is keyless). Use Coolify env vars / server-side config for anything
  sensitive, never the repo.
- **Donation destination is trust-sensitive.** `saweriaUsername` in
  `app/src/lib/site.ts` and `app/public/saweria-qr.svg` (a QR encoding the Saweria
  URL) decide where money goes. Any change there redirects donations — treat edits
  to these (and to the affiliate config) as security-sensitive and call them out
  explicitly. Be suspicious of outside PRs touching them.
- **Affiliate config** in `site.ts` is intentionally **disabled** (`enabled: false`,
  placeholder `ref`s). Don't enable or fill it without the owner's explicit say-so.
- A push to `main` goes live within minutes. Don't push experimental/unverified
  changes to `main`; build + typecheck first.
