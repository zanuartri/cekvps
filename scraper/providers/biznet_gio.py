"""
CekVPS — Biznet Gio VPS Scraper

Scrapes from gio.id/vps with fallback to hardcoded pricing.
NEO Lite is their budget VPS line.
"""
import re
import logging
from bs4 import BeautifulSoup

from config import FALLBACK_VPS
from utils import fetch, now_iso

logger = logging.getLogger("cekvps.biznet_gio")
PROVIDER = "biznet_gio"
BASE_URL = "https://gio.id/vps"

PLAN_SPECS = {
    "GIO VPS 1": {"vcpu": 1, "ram_gb": 1, "storage_gb": 20, "storage_type": "SSD"},
    "GIO VPS 2": {"vcpu": 2, "ram_gb": 2, "storage_gb": 40, "storage_type": "SSD"},
    "GIO VPS 3": {"vcpu": 2, "ram_gb": 4, "storage_gb": 80, "storage_type": "SSD"},
}


def scrape() -> list[dict]:
    """Scrape Biznet Gio VPS pricing."""
    try:
        html = fetch(BASE_URL)
        soup = BeautifulSoup(html, "html.parser")
        results = []

        # Biznet Gio page lists VPS NEO Lite with prices
        # Look for price patterns in IDR
        # Their page uses RpXX.XXX or Rp XXX.XXX format
        price_map = _find_prices(soup)
        if price_map:
            for plan_name, price in price_map.items():
                if plan_name in PLAN_SPECS:
                    specs = PLAN_SPECS[plan_name]
                    results.append({
                        "provider": PROVIDER,
                        "plan": plan_name,
                        "vcpu": specs["vcpu"],
                        "ram_gb": specs["ram_gb"],
                        "storage_gb": specs["storage_gb"],
                        "storage_type": specs["storage_type"],
                        "bandwidth_tb": 0.5 if plan_name == "GIO VPS 1" else (1 if plan_name == "GIO VPS 2" else 2),
                        "price_monthly": price,
                        "currency": "IDR",
                        "url": BASE_URL,
                        "scraped_at": now_iso(),
                    })

        if results:
            logger.info(f"Scraped {len(results)} Biznet Gio plans")
            return results

    except Exception as e:
        logger.warning(f"Biznet Gio scrape failed: {e}")

    logger.info("Using fallback Biznet Gio data")
    return _fallback()


def _find_prices(soup) -> dict[str, float]:
    """Try to extract plan prices from the page."""
    price_map = {}

    # Look for "NEO Lite" or "VPS" text in headings/cards
    page_text = soup.get_text(separator="\n", strip=True)

    # Find price patterns: Rp 50,000 or Rp50.000
    price_pattern = re.compile(r'Rp\s*([0-9]+[.,]?[0-9]*)', re.IGNORECASE)
    prices = price_pattern.findall(page_text)

    if prices:
        # Map first few prices to our plan specs
        sorted_prices = []
        for p in prices:
            num = int(p.replace(".", "").replace(",", ""))
            if 30000 < num < 500000:  # Sanity check: between 30k and 500k IDR
                sorted_prices.append(num)
        sorted_prices.sort()

        # Map smallest 3 prices to VPS 1/2/3
        plan_order = ["GIO VPS 1", "GIO VPS 2", "GIO VPS 3"]
        for i, plan_name in enumerate(plan_order):
            if i < len(sorted_prices):
                price_map[plan_name] = sorted_prices[i]

    return price_map


def _fallback() -> list[dict]:
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
