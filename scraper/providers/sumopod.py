"""
CekVPS — Sumopod VPS data (curated)

Sumopod resells Tencent Cloud VPS. Its deploy panel is an auth-gated SPA behind
Cloudflare (sumopod.com returns a ~2 KB shell with no pricing), so it can't be
scraped. We serve a curated dataset from config.FALLBACK_VPS. Prices there are
the promo price with `price_orig` (pre-discount) alongside, so we surface the
discount. Update the "sumopod" entry there when pricing changes.
"""
import logging

from config import FALLBACK_VPS
from utils import now_iso

logger = logging.getLogger("cekvps.sumopod")
PROVIDER = "sumopod"


def scrape() -> list[dict]:
    """Return curated Sumopod plans (no live scrape — Cloudflare/auth-gated)."""
    ts = now_iso()
    results = []
    for p in FALLBACK_VPS[PROVIDER]:
        price = p["price"]
        original = p.get("price_orig")
        discount_pct = (
            round((original - price) / original * 100)
            if original and original > price else None
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
            "price_original": original,
            "discount_pct": discount_pct,
            "setup_fee": None,
            "price_annual_monthly": None,
            "currency": p["currency"],
            "url": p["url"],
            "scraped_at": ts,
        })
    logger.info(f"Loaded {len(results)} curated Sumopod plans")
    return results
