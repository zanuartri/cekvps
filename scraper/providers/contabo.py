"""
CekVPS — Contabo VPS Scraper

The pricing page (contabo.com/en/pricing/) ships the full Cloud VPS table in
static HTML — Model, CPU, RAM, Storage (NVMe/SSD), Port, Data Transfer, Price,
plus the "No Setup Fee" badge. (It only decodes correctly without brotli in the
Accept-Encoding header; see utils.fetch.) The table is a Svelte CSS grid where
cells are flat siblings in document order, so we split the table text on the
"Cloud VPS N" model boundaries and read each plan's fields by regex.

Prices are the advertised 12-month-term rate (EUR), matching what the page shows.
Falls back to hardcoded data on failure.
"""
import re
import logging
from bs4 import BeautifulSoup

from config import FALLBACK_VPS
from utils import fetch, now_iso

logger = logging.getLogger("cekvps.contabo")
PROVIDER = "contabo"
BASE_URL = "https://contabo.com/en/pricing/"


def scrape() -> list[dict]:
    """Scrape Contabo Cloud VPS pricing from the pricing-page table."""
    try:
        soup = BeautifulSoup(fetch(BASE_URL), "html.parser")
        # the regular VPS table — exclude the separate "storage-vps" table
        table = soup.find(
            "div",
            class_=lambda c: c and "pricing-table" in c and "vps" in c and "storage-vps" not in c,
        )
        if table is None:
            raise ValueError("VPS pricing table not found")

        full = table.get_text(" ", strip=True)
        segments = re.split(r"(Cloud VPS \d+)", full)
        ts = now_iso()
        results = []
        # segments: ['', 'Cloud VPS 10', '<body>', 'Cloud VPS 20', '<body>', ...]
        for i in range(1, len(segments), 2):
            model = segments[i]
            body = segments[i + 1] if i + 1 < len(segments) else ""
            plan = _parse_plan(model, body, ts)
            if plan:
                results.append(plan)

        if results:
            logger.info(f"Scraped {len(results)} Contabo plans")
            return results
        logger.warning("Contabo: table found but no plans parsed")

    except Exception as e:
        logger.warning(f"Contabo scrape failed: {e}")

    logger.info("Using fallback Contabo data")
    return _fallback()


def _parse_plan(model: str, body: str, ts: str) -> dict | None:
    vcpu = re.search(r"(\d+)\s*vCPU", body)
    ram = re.search(r"(\d+)\s*GB RAM", body)
    nvme = re.search(r"(\d+)\s*GB NVMe", body)
    price = re.search(r"€\s?([\d.,]+)", body)
    if not (vcpu and ram and price):
        return None
    # "Unlimited Traffic" -> null (UI renders null as unlimited); "N TB" -> N
    tb = re.search(r"(\d+)\s*TB", body)
    bandwidth = float(tb.group(1)) if tb and "Unlimited" not in body else None
    return {
        "provider": PROVIDER,
        "plan": model,
        "vcpu": int(vcpu.group(1)),
        "ram_gb": int(ram.group(1)),
        "storage_gb": int(nvme.group(1)) if nvme else None,
        "storage_type": "NVMe",
        "bandwidth_tb": bandwidth,
        "price_monthly": float(price.group(1).replace(",", ".")),
        "price_original": None,        # canonical table shows no promo strike
        "discount_pct": None,
        "setup_fee": 0.0 if "No Setup Fee" in body else None,
        "price_annual_monthly": None,
        "currency": "EUR",
        "url": BASE_URL,
        "scraped_at": ts,
    }


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
            "price_original": None,
            "discount_pct": None,
            "setup_fee": None,
            "price_annual_monthly": None,
            "currency": p["currency"],
            "url": p["url"],
            "scraped_at": ts,
        })
    return results
