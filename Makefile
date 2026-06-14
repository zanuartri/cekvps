.PHONY: deploy deploy-full scrape build

# ── Quick deploy ──────────────────────────────────────────
# Pull latest, install deps, build frontend
deploy:
	@echo "🔄 Pulling latest..."
	git pull
	@echo "📦 Installing deps..."
	cd app && npm install
	@echo "🔨 Building frontend..."
	cd app && npm run build
	@echo "✅ Deploy done. Site: http://localhost:8888"

# ── Full deploy (scrape + build) ─────────────────────────
deploy-full: scrape deploy
	@echo "✅ Full deploy & scrape done"

# ── Scrape VPS prices ─────────────────────────────────────
scrape:
	@echo "🕷️  Scraping VPS prices..."
	cd scraper && .venv/bin/python run.py
	@echo "✅ Data refreshed"

# ── Build only ────────────────────────────────────────────
build:
	cd app && npm run build
	@echo "✅ Build done"
