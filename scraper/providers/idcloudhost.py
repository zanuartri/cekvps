"""
CekVPS — IDCloudHost VPS data (curated)

idcloudhost.com/pricing/ sits behind a Cloudflare "Just a moment..." JS
challenge, so plain HTTP requests return 403 — it can't be scraped without a
headless browser. Their prices are also labelled "simulasi" (indicative). So we
serve a curated dataset from config.FALLBACK_VPS instead of scraping. Update the
"idcloudhost" entry there when pricing changes.
"""
import logging

from config import FALLBACK_VPS
from utils import now_iso

logger = logging.getLogger("cekvps.idcloudhost")
PROVIDER = "idcloudhost"


def scrape() -> list[dict]:
    """Return curated IDCloudHost plans (no live scrape — Cloudflare-blocked)."""
    ts = now_iso()
    results = []
    for p in FALLBACK_VPS[PROVIDER]:
        results.append({
            "provider": PROVIDER,
            "plan": p["plan"],
            "vcpu": p["vcpu"],
            "ram_gb": p["ram_gb"],
            "storage_gb": p["storage_gb"],
            "storage_type": p["storage_type"],
            "bandwidth_tb": p["bandwidth_tb"],
            "price_monthly": p["price"],
            "price_original": None,
            "discount_pct": None,
            "setup_fee": None,
            "price_annual_monthly": None,
            "currency": p["currency"],
            "url": p["url"],
            "scraped_at": ts,
        })
    logger.info(f"Loaded {len(results)} curated IDCloudHost plans")
    return results
