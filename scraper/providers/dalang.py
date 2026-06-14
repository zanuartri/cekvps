"""
CekVPS — Dalang.io VPS data (curated presets)

Dalang.io is an à-la-carte VPS *builder*: you pick cores, RAM, storage and
internet speed, and the price is computed client-side — there are no fixed plans
to scrape. The monthly (pre-tax) price is a clean linear formula, verified
against the builder:

    subtotal = 20_000 + 20_000 * vCPU + 5_000 * RAM_GB   (at 20 GB NVMe, free 20 Mbps)
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

# Per-unit monthly pricing (IDR, pre-tax), at the 20 GB / 20 Mbps base.
BASE = 20_000
PER_VCPU = 20_000
PER_RAM_GB = 5_000
TAX = 0.11  # PPN — Dalang's headline price is the tax-inclusive TOTAL


def monthly_price(vcpu: int, ram_gb: int) -> int:
    subtotal = BASE + PER_VCPU * vcpu + PER_RAM_GB * ram_gb
    return round(subtotal * (1 + TAX))


def scrape() -> list[dict]:
    """Return curated Dalang presets (no live scrape — client-side builder)."""
    ts = now_iso()
    results = []
    for p in FALLBACK_VPS[PROVIDER]:
        price = monthly_price(p["vcpu"], p["ram_gb"])
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
            "price_annual_monthly": None,
            "currency": p["currency"],
            "url": p["url"],
            "scraped_at": ts,
        })
    logger.info(f"Loaded {len(results)} curated Dalang presets")
    return results
