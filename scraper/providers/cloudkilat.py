"""
CekVPS — CloudKilat "Kilat VPS" scraper (hybrid)

CloudKilat's /id/kilat-vps/ page is a Nuxt/Strapi app. The monthly price for
each tier lives in a schema.org JSON-LD <Product>/<Offer> block and is easy to
read reliably:

    "name":"XXS (Bulanan)" ... "price":90000

The hardware specs, though, are rendered from a separate embedded structure not
keyed to the plan name, so they aren't cleanly scrapable. They're also static
(Full SSD; no bandwidth cap advertised), so we keep them in SPECS and attach the
live price by plan. If the JSON-LD is missing/changed we fall back to curated
config. No promo/discount is shown, so price_original/discount stay null.
"""
import re
import logging

from config import FALLBACK_VPS
from utils import fetch, now_iso

logger = logging.getLogger("cekvps.cloudkilat")
PROVIDER = "cloudkilat"
BASE_URL = "https://www.cloudkilat.com/id/kilat-vps/"

# Static hardware per tier (Full SSD). bandwidth_tb = None means UNLIMITED here:
# CloudKilat advertises "unlimited high-speed data transfer" for Kilat VPS
# (cloudkilat.com), confirmed June 2026 — not "unknown".
# Order here = display order on the page (XXS -> XL).
SPECS = {
    "XXS": {"vcpu": 1,  "ram_gb": 1,  "storage_gb": 20},
    "XS":  {"vcpu": 2,  "ram_gb": 2,  "storage_gb": 40},
    "S":   {"vcpu": 4,  "ram_gb": 4,  "storage_gb": 70},
    "M":   {"vcpu": 8,  "ram_gb": 8,  "storage_gb": 120},
    "L":   {"vcpu": 16, "ram_gb": 16, "storage_gb": 200},
    "XL":  {"vcpu": 32, "ram_gb": 32, "storage_gb": 320},
}

# JSON-LD carries two offers per tier: "<size> (Bulanan)" with the monthly price,
# and "<size> (Tahunan)" with the *annual total*. We read both and derive the
# annual effective /month as total / 12 (≈22% off, confirmed on the page toggle).
# (The page also runs time-limited code promos like VPSJUNI2026 −30%, but those
# are applied client-side and absent from the static HTML, so not scrapable.)
_MONTHLY = re.compile(r'"name":"(XXS|XS|S|M|L|XL) \(Bulanan\)"[^}]*?"price":(\d+)')
_ANNUAL = re.compile(r'"name":"(XXS|XS|S|M|L|XL) \(Tahunan\)"[^}]*?"price":(\d+)')

ANNUAL_DISCOUNT = 0.22  # fallback estimate if the (Tahunan) offer is missing


def _annual_monthly(monthly: int) -> int:
    """Estimated annual /month — only used when the real annual offer is absent."""
    return round(monthly * (1 - ANNUAL_DISCOUNT))


def scrape() -> list[dict]:
    """Scrape CloudKilat Kilat VPS monthly + annual prices from the page's JSON-LD."""
    try:
        html = fetch(BASE_URL)
        monthly, annual = {}, {}
        for name, price in _MONTHLY.findall(html):
            monthly.setdefault(name, int(price))
        for name, total in _ANNUAL.findall(html):
            annual.setdefault(name, int(total))  # annual TOTAL (per year)

        ts = now_iso()
        results = []
        for name, spec in SPECS.items():
            if name not in monthly:
                continue
            results.append(_row(name, spec, monthly[name], annual.get(name), ts))

        if results:
            logger.info(f"Scraped {len(results)} CloudKilat plans")
            return results
        logger.warning("CloudKilat: page fetched but no JSON-LD offers parsed")

    except Exception as e:
        logger.warning(f"CloudKilat scrape failed: {e}")

    logger.info("Using fallback CloudKilat data")
    return _fallback()


def _row(name: str, spec: dict, price: int, annual_total: int | None, ts: str) -> dict:
    return {
        "provider": PROVIDER,
        "plan": f"Kilat VPS {name}",
        "vcpu": spec["vcpu"],
        "ram_gb": spec["ram_gb"],
        "storage_gb": spec["storage_gb"],
        "storage_type": "SSD",
        "bandwidth_tb": None,
        "price_monthly": price,
        "price_original": None,
        "discount_pct": None,
        "setup_fee": None,
        # real annual /month (total / 12) when available, else the 22% estimate
        "price_annual_monthly": round(annual_total / 12) if annual_total else _annual_monthly(price),
        "currency": "IDR",
        "url": BASE_URL,
        "scraped_at": ts,
    }


def _fallback() -> list[dict]:
    """Return curated fallback prices."""
    ts = now_iso()
    return [
        {
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
            "price_annual_monthly": _annual_monthly(p["price"]),
            "currency": p["currency"],
            "url": p["url"],
            "scraped_at": ts,
        }
        for p in FALLBACK_VPS[PROVIDER]
    ]
