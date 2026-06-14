"""
CekVPS — Scraper Configuration
"""
import os
from pathlib import Path

# Paths
ROOT = Path(__file__).resolve().parent.parent
LIVE_DATA = Path("/var/www/cekvps/data")
DATA_VPS = LIVE_DATA / "vps"
DATA_DOMAIN = LIVE_DATA / "domains"
DATA_VPS.mkdir(parents=True, exist_ok=True)
DATA_DOMAIN.mkdir(parents=True, exist_ok=True)

# HTTP defaults
TIMEOUT = 30
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/125.0.0.0 Safari/537.36"
)
RETRIES = 3
RETRY_DELAY = 2

# VPS providers (MVP set). `enabled` = scraper module aktif;
# yang masih False memakai seed/fallback price sampai scraper-nya dibuat.
VPS_PROVIDERS = {
    "contabo": {"enabled": True, "priority": 1},
    "hostinger": {"enabled": True, "priority": 4},
    "idcloudhost": {"enabled": True, "priority": 5},
    "biznet_gio": {"enabled": True, "priority": 6},
    "dalang": {"enabled": False, "priority": 9},       # TODO: real data (curated/scrape)
    "sumopod": {"enabled": True, "priority": 11},
    "domainesia": {"enabled": False, "priority": 12},  # TODO: real data (curated/scrape)
    "cloudkilat": {"enabled": False, "priority": 13},  # TODO: real data (curated/scrape)
}

# Domain registrars
DOMAIN_PROVIDERS = {
    "dewaweb": {"enabled": False, "priority": 1},
    "cloudflare": {"enabled": False, "priority": 2},
    "porkbun": {"enabled": False, "priority": 3},
    "namecheap": {"enabled": False, "priority": 4},
}

# Currency display config
CURRENCIES = {
    "IDR": {"symbol": "Rp", "locale": "id-ID", "decimals": 0},
    "USD": {"symbol": "$", "locale": "en-US", "decimals": 2},
    "EUR": {"symbol": "€", "locale": "de-DE", "decimals": 2},
}

# Fallback prices (used when scrape fails — hardcoded last-known prices)
# These keep the site up even if a provider changes their page
FALLBACK_VPS = {
    "contabo": [
        {"plan": "Cloud VPS 10",      "vcpu": 4,  "ram_gb": 8,   "storage_gb": 75,   "storage_type": "NVMe", "bandwidth_tb": None, "price": 4.40,  "currency": "EUR", "url": "https://contabo.com/en/vps/"},
        {"plan": "Cloud VPS 20",      "vcpu": 6,  "ram_gb": 12,  "storage_gb": 100,  "storage_type": "NVMe", "bandwidth_tb": None, "price": 6.00,  "currency": "EUR", "url": "https://contabo.com/en/vps/"},
        {"plan": "Cloud VPS 30",      "vcpu": 8,  "ram_gb": 24,  "storage_gb": 200,  "storage_type": "NVMe", "bandwidth_tb": None, "price": 11.20, "currency": "EUR", "url": "https://contabo.com/en/vps/"},
        {"plan": "Cloud VPS 40",      "vcpu": 12, "ram_gb": 48,  "storage_gb": 250,  "storage_type": "NVMe", "bandwidth_tb": None, "price": 20.00, "currency": "EUR", "url": "https://contabo.com/en/vps/"},
        {"plan": "Cloud VPS 50",      "vcpu": 16, "ram_gb": 64,  "storage_gb": 300,  "storage_type": "NVMe", "bandwidth_tb": None, "price": 29.60, "currency": "EUR", "url": "https://contabo.com/en/vps/"},
        {"plan": "Cloud VPS 60",      "vcpu": 18, "ram_gb": 96,  "storage_gb": 350,  "storage_type": "NVMe", "bandwidth_tb": None, "price": 39.20, "currency": "EUR", "url": "https://contabo.com/en/vps/"},
    ],
    # Biznet's budget line is "NEO Lite". Plan name = "<SIZE> <RAM_GB>.<vCPU>".
    # All NEO Lite tiers ship 60 GB SSD. Source: www.biznetgio.com/pricelist
    "biznet_gio": [
        {"plan": "NEO Lite XS 1.1",   "vcpu": 1,  "ram_gb": 1,   "storage_gb": 60, "storage_type": "SSD",  "bandwidth_tb": None, "price": 59000,  "currency": "IDR", "url": "https://www.biznetgio.com/pricelist"},
        {"plan": "NEO Lite SS 2.1",   "vcpu": 1,  "ram_gb": 2,   "storage_gb": 60, "storage_type": "SSD",  "bandwidth_tb": None, "price": 80000,  "currency": "IDR", "url": "https://www.biznetgio.com/pricelist"},
        {"plan": "NEO Lite SS 2.2",   "vcpu": 2,  "ram_gb": 2,   "storage_gb": 60, "storage_type": "SSD",  "bandwidth_tb": None, "price": 109000, "currency": "IDR", "url": "https://www.biznetgio.com/pricelist"},
        {"plan": "NEO Lite MS 4.2",   "vcpu": 2,  "ram_gb": 4,   "storage_gb": 60, "storage_type": "SSD",  "bandwidth_tb": None, "price": 139000, "currency": "IDR", "url": "https://www.biznetgio.com/pricelist"},
        {"plan": "NEO Lite MS 4.4",   "vcpu": 4,  "ram_gb": 4,   "storage_gb": 60, "storage_type": "SSD",  "bandwidth_tb": None, "price": 179000, "currency": "IDR", "url": "https://www.biznetgio.com/pricelist"},
        {"plan": "NEO Lite MM 8.4",   "vcpu": 4,  "ram_gb": 8,   "storage_gb": 60, "storage_type": "SSD",  "bandwidth_tb": None, "price": 269000, "currency": "IDR", "url": "https://www.biznetgio.com/pricelist"},
    ],
    # IDCloudHost sits behind a Cloudflare challenge (plain HTTP -> 403), so its
    # data is curated, not scraped. Prices are "simulasi"/indicative per their
    # page. Source: https://idcloudhost.com/pricing/ (Basic Standard tiers).
    "idcloudhost": [
        {"plan": "Basic Standard 2GB/20GB", "vcpu": 2, "ram_gb": 2, "storage_gb": 20, "storage_type": "SSD", "bandwidth_tb": None, "price": 87000,  "currency": "IDR", "url": "https://idcloudhost.com/pricing/"},
        {"plan": "Basic Standard 2GB/40GB", "vcpu": 2, "ram_gb": 2, "storage_gb": 40, "storage_type": "SSD", "bandwidth_tb": None, "price": 100000, "currency": "IDR", "url": "https://idcloudhost.com/pricing/"},
        {"plan": "Basic Standard 4GB/60GB", "vcpu": 2, "ram_gb": 4, "storage_gb": 60, "storage_type": "SSD", "bandwidth_tb": None, "price": 225000, "currency": "IDR", "url": "https://idcloudhost.com/pricing/"},
    ],
    # Sumopod resells Tencent Cloud VPS. The deploy panel is an auth-gated SPA
    # behind Cloudflare (not scrapable), so data is curated. `price` is the
    # 40%-off price; `price_orig` is the normal price. The 40% discount is
    # public AND recurring (applies to renewals) for ALL users — verified via
    # Sumopod's official Threads (@sumopodcloud, "Syukuran Diskon 40% Untuk
    # Semua VPS Tencent"), so `price` is the real ongoing price, not a teaser.
    # Do NOT "correct" it up to price_orig. bandwidth_tb = monthly egress.
    # Hostinger's KVM VPS line. The /id/harga/vps-hosting page is server-rendered
    # but the price reflects whatever subscription term is *default-selected* (it
    # flips between the 24- and 48-month promo on different loads), and the
    # 1-month-term price shown in the cards is computed client-side — so it is not
    # in the static HTML and can't be scraped reliably. We curate the 1-month-term
    # numbers: `price` is the promo /bln, `price_orig` is the renewal (non-promo)
    # /bln, so we surface the advertised discount. All tiers ship NVMe + the listed
    # bandwidth as TB. Update when Hostinger changes the 1-month pricing.
    "hostinger": [
        {"plan": "KVM 1", "vcpu": 1, "ram_gb": 4,  "storage_gb": 50,  "storage_type": "NVMe", "bandwidth_tb": 4,  "price": 193900, "price_orig": 320900,  "currency": "IDR", "url": "https://www.hostinger.com/id/harga/vps-hosting"},
        {"plan": "KVM 2", "vcpu": 2, "ram_gb": 8,  "storage_gb": 100, "storage_type": "NVMe", "bandwidth_tb": 8,  "price": 252900, "price_orig": 407900,  "currency": "IDR", "url": "https://www.hostinger.com/id/harga/vps-hosting"},
        {"plan": "KVM 4", "vcpu": 4, "ram_gb": 16, "storage_gb": 200, "storage_type": "NVMe", "bandwidth_tb": 16, "price": 485900, "price_orig": 679900,  "currency": "IDR", "url": "https://www.hostinger.com/id/harga/vps-hosting"},
        {"plan": "KVM 8", "vcpu": 8, "ram_gb": 32, "storage_gb": 400, "storage_type": "NVMe", "bandwidth_tb": 32, "price": 970900, "price_orig": 1203900, "currency": "IDR", "url": "https://www.hostinger.com/id/harga/vps-hosting"},
    ],
    "sumopod": [
        {"plan": "Cloud 2GB/40GB",  "vcpu": 2, "ram_gb": 2,  "storage_gb": 40,  "storage_type": "SSD", "bandwidth_tb": 0.5,  "price": 36000,  "price_orig": 60000,  "currency": "IDR", "url": "https://sumopod.com/"},
        {"plan": "Cloud 2GB/50GB",  "vcpu": 2, "ram_gb": 2,  "storage_gb": 50,  "storage_type": "SSD", "bandwidth_tb": 1.02, "price": 45000,  "price_orig": 75000,  "currency": "IDR", "url": "https://sumopod.com/"},
        {"plan": "Cloud 4GB/60GB",  "vcpu": 2, "ram_gb": 4,  "storage_gb": 60,  "storage_type": "SSD", "bandwidth_tb": 1.54, "price": 54000,  "price_orig": 90000,  "currency": "IDR", "url": "https://sumopod.com/"},
        {"plan": "Cloud 4GB/70GB",  "vcpu": 2, "ram_gb": 4,  "storage_gb": 70,  "storage_type": "SSD", "bandwidth_tb": 2.05, "price": 75000,  "price_orig": 125000, "currency": "IDR", "url": "https://sumopod.com/"},
        {"plan": "Cloud 8GB/80GB",  "vcpu": 2, "ram_gb": 8,  "storage_gb": 80,  "storage_type": "SSD", "bandwidth_tb": 2.56, "price": 90000,  "price_orig": 150000, "currency": "IDR", "url": "https://sumopod.com/"},
        {"plan": "Cloud 8GB/100GB", "vcpu": 2, "ram_gb": 8,  "storage_gb": 100, "storage_type": "SSD", "bandwidth_tb": 3.07, "price": 111000, "price_orig": 185000, "currency": "IDR", "url": "https://sumopod.com/"},
    ],
}

FALLBACK_DOMAIN = {
    "dewaweb": [
        {"tld": ".com",     "first_year": 185000,  "renewal": 230000, "currency": "IDR", "url": "https://www.dewaweb.com/domain/"},
        {"tld": ".id",      "first_year": 219000,  "renewal": 290000, "currency": "IDR", "url": "https://www.dewaweb.com/domain/"},
        {"tld": ".my.id",   "first_year": 12000,   "renewal": 12000,  "currency": "IDR", "url": "https://www.dewaweb.com/domain/"},
    ],
}
