"""
CekVPS — Contabo VPS Scraper

Contabo renders prices client-side on the /pricing/ page, but each plan's own
page (/en-us/vps/cloud-vps-N/) ships the prices in static HTML inside
`button.periods-selector` blocks — one per contract term (1/3/6/12 months) with
`.old-price` (pre-discount) and `.discount-price` (effective). We scrape those
per-plan pages and fall back to hardcoded data on failure.
"""
import re
import logging
from bs4 import BeautifulSoup

from config import FALLBACK_VPS
from utils import fetch, now_iso

logger = logging.getLogger("cekvps.contabo")
PROVIDER = "contabo"
BASE_URL = "https://contabo.com/en-us/pricing/"

# plan name -> (page slug, specs)
PLAN_SPECS = {
    "Cloud VPS 10": {"slug": "cloud-vps-10", "vcpu": 4, "ram_gb": 8, "storage_gb": 75},
    "Cloud VPS 20": {"slug": "cloud-vps-20", "vcpu": 6, "ram_gb": 12, "storage_gb": 100},
    "Cloud VPS 30": {"slug": "cloud-vps-30", "vcpu": 8, "ram_gb": 24, "storage_gb": 200},
    "Cloud VPS 40": {"slug": "cloud-vps-40", "vcpu": 12, "ram_gb": 48, "storage_gb": 250},
    "Cloud VPS 50": {"slug": "cloud-vps-50", "vcpu": 16, "ram_gb": 64, "storage_gb": 300},
    "Cloud VPS 60": {"slug": "cloud-vps-60", "vcpu": 18, "ram_gb": 96, "storage_gb": 350},
}

PLAN_URL = "https://contabo.com/en-us/vps/{slug}/"
_EUR = re.compile(r"€\s?([0-9]+[.,][0-9]+)")


def scrape() -> list[dict]:
    """Scrape Contabo VPS pricing from per-plan pages."""
    results = []
    for plan_name, specs in PLAN_SPECS.items():
        try:
            url = PLAN_URL.format(slug=specs["slug"])
            html = fetch(url)
            terms = _parse_terms(BeautifulSoup(html, "html.parser"))
            if not terms:
                logger.warning(f"{plan_name}: no term prices parsed")
                continue

            monthly = terms.get(1) or terms[min(terms)]      # 1-month = no-commitment
            annual = terms.get(12)                            # 12-month effective /mo

            price = monthly["eff"]
            original = monthly["orig"] if monthly["orig"] and monthly["orig"] > price else None
            discount_pct = round((original - price) / original * 100) if original else None

            results.append({
                "provider": PROVIDER,
                "plan": plan_name,
                "vcpu": specs["vcpu"],
                "ram_gb": specs["ram_gb"],
                "storage_gb": specs["storage_gb"],
                "storage_type": "NVMe",
                "bandwidth_tb": None,
                "price_monthly": price,
                "price_original": original,
                "discount_pct": discount_pct,
                "setup_fee": monthly["setup"],
                "price_annual_monthly": annual["eff"] if annual else None,
                "currency": "EUR",
                "url": url,
                "scraped_at": now_iso(),
            })
        except Exception as e:
            logger.warning(f"Contabo {plan_name} scrape failed: {e}")

    if results:
        logger.info(f"Scraped {len(results)}/{len(PLAN_SPECS)} Contabo plans")
        return results

    logger.info("Using fallback Contabo data")
    return _fallback()


def _parse_terms(soup) -> dict[int, dict]:
    """Return {term_months: {eff, orig, setup}} parsed from periods-selector buttons."""
    terms: dict[int, dict] = {}
    for btn in soup.select("button.periods-selector"):
        raw = btn.get("data-cy-value")
        if not raw or not raw.isdigit():
            continue
        term = int(raw)

        disc_el = btn.find(class_="discount-price")
        old_el = btn.find(class_="old-price")
        eff = _eur(disc_el.get_text(" ", strip=True)) if disc_el else None
        orig = _eur(old_el.get_text(" ", strip=True)) if old_el else None
        if eff is None:
            # no explicit discount-price; take the first € in the button
            eff = _eur(btn.get_text(" ", strip=True))
        if eff is None:
            continue

        text = btn.get_text(" ", strip=True).lower()
        if "no setup fee" in text:
            setup = 0.0
        else:
            m = re.search(r"setup fee[^€]*€\s?([0-9]+[.,][0-9]+)", text)
            setup = float(m.group(1).replace(",", ".")) if m else None

        terms[term] = {"eff": eff, "orig": orig, "setup": setup}
    return terms


def _eur(text: str) -> float | None:
    m = _EUR.search(text or "")
    return float(m.group(1).replace(",", ".")) if m else None


def _fallback() -> list[dict]:
    """Return hardcoded fallback prices (no discount/term data)."""
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
