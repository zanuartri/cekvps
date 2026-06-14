"""
CekVPS — Hostinger KVM VPS data (curated)

Hostinger's /id/harga/vps-hosting page is server-rendered, but the displayed
price reflects whichever subscription term happens to be default-selected — it
flips between the 24- and 48-month promo across loads — and the 1-month-term
price shown in the cards is computed client-side, so it is absent from the
static HTML and can't be scraped reliably. We serve a curated dataset from
config.FALLBACK_VPS using the 1-month-term numbers: `price` is the promo /bln,
`price_orig` is the renewal (non-promo) /bln, so we surface the discount. Update
the "hostinger" entry there when pricing changes.
"""
import logging

from config import FALLBACK_VPS
from utils import now_iso

logger = logging.getLogger("cekvps.hostinger")
PROVIDER = "hostinger"


def scrape() -> list[dict]:
    """Return curated Hostinger KVM plans (no live scrape — client-side pricing)."""
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
            "price_annual_monthly": p.get("price_annual"),
            "currency": p["currency"],
            "url": p["url"],
            "scraped_at": ts,
        })
    logger.info(f"Loaded {len(results)} curated Hostinger plans")
    return results
