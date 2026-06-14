"""
CekVPS — Contabo VPS Scraper

Attempts to scrape from contabo.com/en-us/pricing/ with fallback to hardcoded data.
"""
import re
import logging
from bs4 import BeautifulSoup

from config import FALLBACK_VPS
from utils import fetch, now_iso

logger = logging.getLogger("cekvps.contabo")
PROVIDER = "contabo"
BASE_URL = "https://contabo.com/en-us/pricing/"

PLAN_SPECS = {
    "Cloud VPS 10": {"vcpu": 4, "ram_gb": 8, "storage_nvme": 75, "storage_ssd": 150},
    "Cloud VPS 20": {"vcpu": 6, "ram_gb": 12, "storage_nvme": 100, "storage_ssd": 200},
    "Cloud VPS 30": {"vcpu": 8, "ram_gb": 24, "storage_nvme": 200, "storage_ssd": 400},
    "Cloud VPS 40": {"vcpu": 12, "ram_gb": 48, "storage_nvme": 250, "storage_ssd": 500},
    "Cloud VPS 50": {"vcpu": 16, "ram_gb": 64, "storage_nvme": 300, "storage_ssd": 600},
    "Cloud VPS 60": {"vcpu": 18, "ram_gb": 96, "storage_nvme": 350, "storage_ssd": 700},
}


def scrape() -> list[dict]:
    """Scrape Contabo VPS pricing. Returns list of plan dicts."""
    try:
        html = fetch(BASE_URL)
        soup = BeautifulSoup(html, "html.parser")
        results = []

        for plan_name, specs in PLAN_SPECS.items():
            price = _extract_price(soup, plan_name)
            if price is not None:
                results.append({
                    "provider": PROVIDER,
                    "plan": plan_name,
                    "vcpu": specs["vcpu"],
                    "ram_gb": specs["ram_gb"],
                    "storage_gb": specs["storage_nvme"],
                    "storage_type": "NVMe",
                    "bandwidth_tb": None,
                    "price_monthly": price,
                    "currency": "EUR",
                    "url": BASE_URL,
                    "scraped_at": now_iso(),
                })

        if results:
            logger.info(f"Scraped {len(results)} Contabo plans")
            return results

    except Exception as e:
        logger.warning(f"Contabo scrape failed: {e}")

    logger.info("Using fallback Contabo data")
    return _fallback()


def _extract_price(soup, plan_name) -> float | None:
    """Try to extract price for a given plan from the pricing page HTML."""
    for tag in soup.find_all(["h2", "h3", "h4", "strong", "span"]):
        if plan_name.lower() in tag.get_text(strip=True).lower():
            parent = tag.parent
            for _ in range(6):
                if parent:
                    text = parent.get_text(separator=" ", strip=True)
                    m = re.search(r'€([0-9]+[.,][0-9]+)', text)
                    if m:
                        return float(m.group(1).replace(",", "."))
                    parent = parent.parent
            sibling = tag.find_next_sibling()
            for _ in range(3):
                if sibling:
                    text = sibling.get_text(strip=True)
                    m = re.search(r'€([0-9]+[.,][0-9]+)', text)
                    if m:
                        return float(m.group(1).replace(",", "."))
                    sibling = sibling.find_next_sibling()
    return None


def _fallback() -> list[dict]:
    """Return hardcoded fallback prices."""
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
            "currency": p["currency"],
            "url": p["url"],
            "scraped_at": ts,
        })
    return results
