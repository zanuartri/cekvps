"""
CekVPS — Scraper Configuration
"""
import os
from pathlib import Path

# Paths
ROOT = Path(__file__).resolve().parent.parent
# Where scraped JSON is written. In the container this is the nginx web root's
# /data dir (set via CEKVPS_DATA_DIR); defaults to the legacy bare-metal path.
LIVE_DATA = Path(os.environ.get("CEKVPS_DATA_DIR", "/var/www/cekvps/data"))
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
    "dalang": {"enabled": True, "priority": 9},
    "sumopod": {"enabled": True, "priority": 11},
    "domainesia": {"enabled": True, "priority": 12},
    "cloudkilat": {"enabled": True, "priority": 13},
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
    # Contabo: `price` here is the advertised 12-month rate (EUR). The provider
    # derives the no-commitment monthly headline as price / 0.8 (flat 20% term
    # discount) and keeps this value as price_annual_monthly. See providers/contabo.py.
    "contabo": [
        {"plan": "Cloud VPS 10",      "vcpu": 4,  "ram_gb": 8,   "storage_gb": 75,   "storage_type": "NVMe", "bandwidth_tb": None, "price": 4.40,  "currency": "EUR", "url": "https://contabo.com/en/vps/"},
        {"plan": "Cloud VPS 20",      "vcpu": 6,  "ram_gb": 12,  "storage_gb": 100,  "storage_type": "NVMe", "bandwidth_tb": None, "price": 6.00,  "currency": "EUR", "url": "https://contabo.com/en/vps/"},
        {"plan": "Cloud VPS 30",      "vcpu": 8,  "ram_gb": 24,  "storage_gb": 200,  "storage_type": "NVMe", "bandwidth_tb": None, "price": 11.20, "currency": "EUR", "url": "https://contabo.com/en/vps/"},
        {"plan": "Cloud VPS 40",      "vcpu": 12, "ram_gb": 48,  "storage_gb": 250,  "storage_type": "NVMe", "bandwidth_tb": None, "price": 20.00, "currency": "EUR", "url": "https://contabo.com/en/vps/"},
        {"plan": "Cloud VPS 50",      "vcpu": 16, "ram_gb": 64,  "storage_gb": 300,  "storage_type": "NVMe", "bandwidth_tb": None, "price": 29.60, "currency": "EUR", "url": "https://contabo.com/en/vps/"},
        {"plan": "Cloud VPS 60",      "vcpu": 18, "ram_gb": 96,  "storage_gb": 350,  "storage_type": "NVMe", "bandwidth_tb": None, "price": 39.20, "currency": "EUR", "url": "https://contabo.com/en/vps/"},
    ],
    # Biznet's budget line is "NEO Lite". Plan name = "<SIZE> <RAM_GB>.<vCPU>".
    # All NEO Lite tiers ship 60 GB SSD. bandwidth_tb = None = UNLIMITED:
    # NEO Lite advertises unlimited data transfer (free bandwidth up to 10 Gbps),
    # confirmed June 2026. Source: www.biznetgio.com/product/neo-lite + /pricelist
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
    # page. bandwidth_tb = None = UNLIMITED: Cloud VPS ships unmetered/unlimited
    # premium bandwidth, confirmed June 2026 (idcloudhost.com/blog/vps-unlimited-
    # bandwidth). Source: https://idcloudhost.com/pricing/ (Basic Standard tiers).
    "idcloudhost": [
        {"plan": "Basic Standard 2GB/20GB", "vcpu": 2, "ram_gb": 2, "storage_gb": 20, "storage_type": "SSD", "bandwidth_tb": None, "price": 87000,  "currency": "IDR", "url": "https://idcloudhost.com/pricing/"},
        {"plan": "Basic Standard 2GB/40GB", "vcpu": 2, "ram_gb": 2, "storage_gb": 40, "storage_type": "SSD", "bandwidth_tb": None, "price": 100000, "currency": "IDR", "url": "https://idcloudhost.com/pricing/"},
        {"plan": "Basic Standard 4GB/60GB", "vcpu": 2, "ram_gb": 4, "storage_gb": 60, "storage_type": "SSD", "bandwidth_tb": None, "price": 225000, "currency": "IDR", "url": "https://idcloudhost.com/pricing/"},
    ],
    # Sumopod resells Tencent Cloud VPS. The deploy panel is an auth-gated SPA
    # behind Cloudflare (not scrapable), so data is curated. The 40%-off
    # "Syukuran Diskon" promo has ended, so `price` is now the normal ongoing
    # price (no `price_orig` strike). bandwidth_tb = monthly egress.
    # Hostinger's KVM VPS line. The /id/harga/vps-hosting page is server-rendered
    # but the price reflects whatever subscription term is *default-selected* (it
    # flips between the 24- and 48-month promo on different loads), and the
    # 1-month-term price shown in the cards is computed client-side — so it is not
    # in the static HTML and can't be scraped reliably. We curate the 1-month-term
    # numbers: `price` is the promo /bln, `price_orig` is the renewal (non-promo)
    # /bln, so we surface the advertised discount. `price_annual` is the cheaper
    # long-term promo /bln (24-month tier) shown as the "jika tahunan" hint — note
    # Hostinger's term discount isn't flat (KVM 1/2 ~30%, KVM 4/8 ~50%), so it's
    # explicit per tier. All tiers ship NVMe + the listed bandwidth as TB.
    # Update when Hostinger changes the 1-month pricing.
    "hostinger": [
        {"plan": "KVM 1", "vcpu": 1, "ram_gb": 4,  "storage_gb": 50,  "storage_type": "NVMe", "bandwidth_tb": 4,  "price": 193900, "price_orig": 320900,  "price_annual": 135900, "currency": "IDR", "url": "https://www.hostinger.com/id/harga/vps-hosting"},
        {"plan": "KVM 2", "vcpu": 2, "ram_gb": 8,  "storage_gb": 100, "storage_type": "NVMe", "bandwidth_tb": 8,  "price": 252900, "price_orig": 407900,  "price_annual": 180900, "currency": "IDR", "url": "https://www.hostinger.com/id/harga/vps-hosting"},
        {"plan": "KVM 4", "vcpu": 4, "ram_gb": 16, "storage_gb": 200, "storage_type": "NVMe", "bandwidth_tb": 16, "price": 485900, "price_orig": 679900,  "price_annual": 244900, "currency": "IDR", "url": "https://www.hostinger.com/id/harga/vps-hosting"},
        {"plan": "KVM 8", "vcpu": 8, "ram_gb": 32, "storage_gb": 400, "storage_type": "NVMe", "bandwidth_tb": 32, "price": 970900, "price_orig": 1203900, "price_annual": 488900, "currency": "IDR", "url": "https://www.hostinger.com/id/harga/vps-hosting"},
    ],
    # DomaiNesia "Cirrus" Cloud Hosting (managed, but dedicated CPU/RAM + NVMe +
    # SSH, so VPS-adjacent). The /cloud-hosting/ page is scrapable; this is the
    # last-known snapshot used if the scrape fails. `price` is the promo /bln,
    # `price_orig` the struck-through reference; the discount is recurring
    # (renewal == promo). Bandwidth is "Unlimited" -> None.
    # Source: https://www.domainesia.com/cloud-hosting/
    "domainesia": [
        {"plan": "Cirrus 2GB",  "vcpu": 2,  "ram_gb": 2,  "storage_gb": 40,   "storage_type": "NVMe", "bandwidth_tb": None, "price": 112500,  "price_orig": 225000,  "currency": "IDR", "url": "https://www.domainesia.com/cloud-hosting/"},
        {"plan": "Cirrus 4GB",  "vcpu": 3,  "ram_gb": 4,  "storage_gb": 80,   "storage_type": "NVMe", "bandwidth_tb": None, "price": 210000,  "price_orig": 336000,  "currency": "IDR", "url": "https://www.domainesia.com/cloud-hosting/"},
        {"plan": "Cirrus 8GB",  "vcpu": 4,  "ram_gb": 8,  "storage_gb": 160,  "storage_type": "NVMe", "bandwidth_tb": None, "price": 390000,  "price_orig": 624000,  "currency": "IDR", "url": "https://www.domainesia.com/cloud-hosting/"},
        {"plan": "Cirrus 12GB", "vcpu": 6,  "ram_gb": 12, "storage_gb": 320,  "storage_type": "NVMe", "bandwidth_tb": None, "price": 705000,  "price_orig": 1128000, "currency": "IDR", "url": "https://www.domainesia.com/cloud-hosting/"},
        {"plan": "Cirrus 16GB", "vcpu": 8,  "ram_gb": 16, "storage_gb": 640,  "storage_type": "NVMe", "bandwidth_tb": None, "price": 1260000, "price_orig": 2016000, "currency": "IDR", "url": "https://www.domainesia.com/cloud-hosting/"},
        {"plan": "Cirrus 24GB", "vcpu": 12, "ram_gb": 24, "storage_gb": 1200, "storage_type": "NVMe", "bandwidth_tb": None, "price": 2250000, "price_orig": 3600000, "currency": "IDR", "url": "https://www.domainesia.com/cloud-hosting/"},
    ],
    # CloudKilat "Kilat VPS". Monthly price is scraped live from the page's
    # JSON-LD; this is the last-known snapshot used if that fails. Full SSD, no
    # advertised bandwidth cap (-> None), no promo. Source:
    # https://www.cloudkilat.com/id/kilat-vps/
    "cloudkilat": [
        {"plan": "Kilat VPS XXS", "vcpu": 1,  "ram_gb": 1,  "storage_gb": 20,  "storage_type": "SSD", "bandwidth_tb": None, "price": 90000,   "currency": "IDR", "url": "https://www.cloudkilat.com/id/kilat-vps/"},
        {"plan": "Kilat VPS XS",  "vcpu": 2,  "ram_gb": 2,  "storage_gb": 40,  "storage_type": "SSD", "bandwidth_tb": None, "price": 180000,  "currency": "IDR", "url": "https://www.cloudkilat.com/id/kilat-vps/"},
        {"plan": "Kilat VPS S",   "vcpu": 4,  "ram_gb": 4,  "storage_gb": 70,  "storage_type": "SSD", "bandwidth_tb": None, "price": 360000,  "currency": "IDR", "url": "https://www.cloudkilat.com/id/kilat-vps/"},
        {"plan": "Kilat VPS M",   "vcpu": 8,  "ram_gb": 8,  "storage_gb": 120, "storage_type": "SSD", "bandwidth_tb": None, "price": 720000,  "currency": "IDR", "url": "https://www.cloudkilat.com/id/kilat-vps/"},
        {"plan": "Kilat VPS L",   "vcpu": 16, "ram_gb": 16, "storage_gb": 200, "storage_type": "SSD", "bandwidth_tb": None, "price": 1440000, "currency": "IDR", "url": "https://www.cloudkilat.com/id/kilat-vps/"},
        {"plan": "Kilat VPS XL",  "vcpu": 32, "ram_gb": 32, "storage_gb": 320, "storage_type": "SSD", "bandwidth_tb": None, "price": 2880000, "currency": "IDR", "url": "https://www.cloudkilat.com/id/kilat-vps/"},
    ],
    # Dalang.io is an à-la-carte VPS *builder* (pick cores × RAM × storage ×
    # speed), not fixed plans, and the price is computed client-side — nothing to
    # scrape. The monthly TOTAL (tax-inclusive, the builder's headline price) is
    #   (20000 + 20000*vCPU + 5000*RAM_GB + 1000*(storage_gb-20)
    #          + 20000*(speed_mbps-20)/20) * 1.11      (PPN 11%; 20 GB & 20 Mbps free)
    # verified against the builder for all five presets. We curate sensible
    # presets mirroring Dalang's usage hints, scaling storage/speed by tier; the
    # small (1-core) tiers stay at Dalang's default 20 GB / 20 Mbps. Internet is a
    # speed cap (Mbps), not a transfer quota, so it lives in the plan name and
    # bandwidth_tb = None (unmetered transfer). Source: https://dalang.io/products/vps
    "dalang": [
        {"plan": "Basic",       "vcpu": 1, "ram_gb": 1,  "storage_gb": 20,  "speed_mbps": 20,  "storage_type": "NVMe", "bandwidth_tb": None, "price": 49950,  "currency": "IDR", "url": "https://dalang.io/products/vps"},
        {"plan": "Small Apps",  "vcpu": 1, "ram_gb": 2,  "storage_gb": 20,  "speed_mbps": 20,  "storage_type": "NVMe", "bandwidth_tb": None, "price": 55500,  "currency": "IDR", "url": "https://dalang.io/products/vps"},
        {"plan": "Standard",    "vcpu": 2, "ram_gb": 4,  "storage_gb": 60,  "speed_mbps": 40,  "storage_type": "NVMe", "bandwidth_tb": None, "price": 155400, "currency": "IDR", "url": "https://dalang.io/products/vps"},
        {"plan": "Business",    "vcpu": 4, "ram_gb": 8,  "storage_gb": 80,  "speed_mbps": 60,  "storage_type": "NVMe", "bandwidth_tb": None, "price": 266400, "currency": "IDR", "url": "https://dalang.io/products/vps"},
        {"plan": "Performance", "vcpu": 8, "ram_gb": 16, "storage_gb": 100, "speed_mbps": 100, "storage_type": "NVMe", "bandwidth_tb": None, "price": 466200, "currency": "IDR", "url": "https://dalang.io/products/vps"},
    ],
    "sumopod": [
        {"plan": "Cloud 2GB/40GB",  "vcpu": 2, "ram_gb": 2,  "storage_gb": 40,  "storage_type": "SSD", "bandwidth_tb": 0.5,  "speed_mbps": 20, "price": 60000,  "currency": "IDR", "url": "https://sumopod.com/"},
        {"plan": "Cloud 2GB/50GB",  "vcpu": 2, "ram_gb": 2,  "storage_gb": 50,  "storage_type": "SSD", "bandwidth_tb": 1.02, "speed_mbps": 30, "price": 75000,  "currency": "IDR", "url": "https://sumopod.com/"},
        {"plan": "Cloud 4GB/60GB",  "vcpu": 2, "ram_gb": 4,  "storage_gb": 60,  "storage_type": "SSD", "bandwidth_tb": 1.54, "speed_mbps": 30, "price": 90000,  "currency": "IDR", "url": "https://sumopod.com/"},
        {"plan": "Cloud 4GB/70GB",  "vcpu": 2, "ram_gb": 4,  "storage_gb": 70,  "storage_type": "SSD", "bandwidth_tb": 2.05, "speed_mbps": 30, "price": 125000, "currency": "IDR", "url": "https://sumopod.com/"},
        {"plan": "Cloud 8GB/80GB",  "vcpu": 2, "ram_gb": 8,  "storage_gb": 80,  "storage_type": "SSD", "bandwidth_tb": 2.56, "speed_mbps": 30, "price": 150000, "currency": "IDR", "url": "https://sumopod.com/"},
        {"plan": "Cloud 8GB/100GB", "vcpu": 2, "ram_gb": 8,  "storage_gb": 100, "storage_type": "SSD", "bandwidth_tb": 3.07, "speed_mbps": 30, "price": 185000, "currency": "IDR", "url": "https://sumopod.com/"},
    ],
}

FALLBACK_DOMAIN = {
    "dewaweb": [
        {"tld": ".com",     "first_year": 185000,  "renewal": 230000, "currency": "IDR", "url": "https://www.dewaweb.com/domain/"},
        {"tld": ".id",      "first_year": 219000,  "renewal": 290000, "currency": "IDR", "url": "https://www.dewaweb.com/domain/"},
        {"tld": ".my.id",   "first_year": 12000,   "renewal": 12000,  "currency": "IDR", "url": "https://www.dewaweb.com/domain/"},
    ],
}
