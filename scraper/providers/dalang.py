"""
CekVPS — Dalang.io VPS data (curated presets)

Dalang.io is an à-la-carte VPS *builder*: you pick cores, RAM, storage and
internet speed, and the price is computed client-side — there are no fixed plans
to scrape. The monthly (pre-tax) price is a clean linear formula, verified
against the builder:

    subtotal = 20_000 + 20_000*vCPU + 5_000*RAM_GB
             + 1_000*(storage_gb - 20) + 20_000*(speed_mbps - 20)/20   (20 GB & 20 Mbps free)
    price    = subtotal * 1.11   (PPN 11%, the "TOTAL" the builder shows)

We store the tax-inclusive TOTAL to match Dalang's prominent headline price
(e.g. "TOTAL Rp 49.950"). So instead of scraping we serve a few sensible presets
from config.FALLBACK_VPS that mirror Dalang's own usage hints. We compute each
price from the formula (authoritative) and assert it matches the curated value,
so specs and price can never drift apart. Bandwidth is a speed cap (20 Mbps), not
a transfer quota, so bandwidth_tb stays None (unmetered). Update the presets in
config when Dalang changes its unit pricing.
"""
import logging

from config import FALLBACK_VPS
from utils import now_iso

logger = logging.getLogger("cekvps.dalang")
PROVIDER = "dalang"

# Per-unit monthly pricing (IDR, pre-tax). 20 GB storage and 20 Mbps are free.
BASE = 20_000
PER_VCPU = 20_000
PER_RAM_GB = 5_000
PER_GB_STORAGE = 1_000          # above the free 20 GB
PER_SPEED_STEP = 20_000         # per +20 Mbps above the free 20 Mbps
FREE_STORAGE_GB = 20
FREE_SPEED_MBPS = 20
TAX = 0.11  # PPN — Dalang's headline price is the tax-inclusive TOTAL
ANNUAL_DISCOUNT = 0.15  # Dalang gives 15% off for annual billing


def monthly_price(vcpu: int, ram_gb: int, storage_gb: int, speed_mbps: int) -> int:
    subtotal = (
        BASE
        + PER_VCPU * vcpu
        + PER_RAM_GB * ram_gb
        + PER_GB_STORAGE * max(0, storage_gb - FREE_STORAGE_GB)
        + PER_SPEED_STEP * max(0, (speed_mbps - FREE_SPEED_MBPS) // 20)
    )
    return round(subtotal * (1 + TAX))


def scrape() -> list[dict]:
    """Return curated Dalang presets (no live scrape — client-side builder)."""
    ts = now_iso()
    results = []
    for p in FALLBACK_VPS[PROVIDER]:
        price = monthly_price(p["vcpu"], p["ram_gb"], p["storage_gb"], p["speed_mbps"])
        if price != p["price"]:
            logger.warning(
                f"Dalang {p['plan']}: formula {price} != curated {p['price']} "
                "— check config pricing"
            )
        results.append({
            "provider": PROVIDER,
            "plan": p["plan"],
            "vcpu": p["vcpu"],
            "ram_gb": p["ram_gb"],
            "storage_gb": p["storage_gb"],
            "storage_type": p["storage_type"],
            "bandwidth_tb": p["bandwidth_tb"],
            "price_monthly": price,
            "price_original": None,
            "discount_pct": None,
            "setup_fee": None,
            "price_annual_monthly": round(price * (1 - ANNUAL_DISCOUNT)),
            "currency": p["currency"],
            "url": p["url"],
            "scraped_at": ts,
        })
    logger.info(f"Loaded {len(results)} curated Dalang presets")
    return results
