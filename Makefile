.PHONY: dev build scrape docker-build docker-run

# Deploy is handled by Coolify (Dockerfile build pack) — see DEPLOY.md.
# This Makefile only covers local dev + testing the production image.

# ── Local development ─────────────────────────────────────
dev:
	cd app && npm run dev

build:
	cd app && npm run build
	@echo "✅ Build done → app/dist"

# Scrape VPS prices. Locally writes into the bundled app/public/data so `npm run
# dev` picks it up; override with CEKVPS_DATA_DIR.
scrape:
	cd scraper && CEKVPS_DATA_DIR=$${CEKVPS_DATA_DIR:-$(CURDIR)/app/public/data} .venv/bin/python run.py
	@echo "✅ Data refreshed"

# ── Test the production image locally (same image Coolify builds) ─────────
docker-build:
	docker build -t cekvps:local .

docker-run: docker-build
	docker run --rm -p 8080:80 cekvps:local
	@echo "🌐 http://localhost:8080"
