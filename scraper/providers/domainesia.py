"""
CekVPS — DomaiNesia Cirrus Cloud Hosting scraper

DomaiNesia's /cloud-hosting/ page ships the full Cirrus lineup in static,
server-rendered HTML, so we scrape it live. The "Cirrus" tier is managed cloud
hosting (dedicated CPU/RAM, NVMe, SSH access) — VPS-adjacent and a fit for the
vibe-coder catalog. Each card renders as a flat run of text:

    Cirrus 2GB Rp 225.000 Diskon 50% Rp 112.500 PER BULAN
    Harga perpanjangan Rp112.500/bulan Beli 2 Core CPU 2 GB RAM 40 GB ...

so we flatten the page text and regex each plan out. Cards repeat across the
Rekomendasi/Semua tabs, so we dedupe by plan name. `price_monthly` is the promo
/bln; the struck-through price + "Diskon N%" become price_original/discount_pct
(the discount is recurring — renewal equals the promo). Bandwidth is
"Unlimited" → null. Falls back to curated data on failure.
"""
import re
import logging
from bs4 import BeautifulSoup

from config import FALLBACK_VPS
from utils import fetch, now_iso

logger = logging.getLogger("cekvps.domainesia")
PROVIDER = "domainesia"
BASE_URL = "https://www.domainesia.com/cloud-hosting/"

_CARD = re.compile(
    r"Cirrus (\w+) Rp ?([\d.]+)(?: Diskon (\d+)%)? Rp ?([\d.]+) PER BULAN "
    r"Harga perpanjangan Rp ?[\d.]+/bulan Beli (\d+) Core CPU (\d+) GB RAM (\d+) GB"
)


def _rp(s: str) -> int:
    """'225.000' -> 225000."""
    return int(s.replace(".", ""))


def scrape() -> list[dict]:
    """Scrape DomaiNesia Cirrus plans from the cloud-hosting page."""
    try:
        text = BeautifulSoup(fetch(BASE_URL), "html.parser").get_text(" ", strip=True)
        text = re.sub(r"\s+", " ", text)
        ts = now_iso()
        results, seen = [], set()
        for m in _CARD.finditer(text):
            name, orig, disc, promo, cores, ram, storage = m.groups()
            if name in seen:
                continue
            seen.add(name)
            original = _rp(orig)
            price = _rp(promo)
            results.append({
                "provider": PROVIDER,
                "plan": f"Cirrus {name}",
                "vcpu": int(cores),
                "ram_gb": int(ram),
                "storage_gb": int(storage),
                "storage_type": "NVMe",
                "bandwidth_tb": None,   # "Unlimited Bandwidth"
                "price_monthly": price,
                "price_original": original if original > price else None,
                "discount_pct": int(disc) if disc else None,
                "setup_fee": None,
                "price_annual_monthly": None,
                "currency": "IDR",
                "url": BASE_URL,
                "scraped_at": ts,
            })
        if results:
            logger.info(f"Scraped {len(results)} DomaiNesia plans")
            return results
        logger.warning("DomaiNesia: page fetched but no plans parsed")

    except Exception as e:
        logger.warning(f"DomaiNesia scrape failed: {e}")

    logger.info("Using fallback DomaiNesia data")
    return _fallback()


def _fallback() -> list[dict]:
    """Return curated fallback prices."""
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
    return results
