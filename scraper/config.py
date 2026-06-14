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
    "hetzner": {"enabled": False, "priority": 2},
    "digitalocean": {"enabled": False, "priority": 3},
    "hostinger": {"enabled": False, "priority": 4},
    "idcloudhost": {"enabled": False, "priority": 5},
    "biznet_gio": {"enabled": True, "priority": 6},
    "alibaba": {"enabled": False, "priority": 7},
    "tencent": {"enabled": False, "priority": 8},
    "dalang": {"enabled": False, "priority": 9},
    "vultr": {"enabled": False, "priority": 10},
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
}

FALLBACK_DOMAIN = {
    "dewaweb": [
        {"tld": ".com",     "first_year": 185000,  "renewal": 230000, "currency": "IDR", "url": "https://www.dewaweb.com/domain/"},
        {"tld": ".id",      "first_year": 219000,  "renewal": 290000, "currency": "IDR", "url": "https://www.dewaweb.com/domain/"},
        {"tld": ".my.id",   "first_year": 12000,   "renewal": 12000,  "currency": "IDR", "url": "https://www.dewaweb.com/domain/"},
    ],
}
