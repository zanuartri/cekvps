"""
CekVPS — Dewaweb Domain Scraper

Scrapes domain pricing from dewaweb.com/domain.
Falls back to hardcoded data for the key TLDs.
"""
import re
import logging
from bs4 import BeautifulSoup

from config import FALLBACK_DOMAIN
from utils import fetch, now_iso

logger = logging.getLogger("cekvps.dewaweb")
PROVIDER = "dewaweb"
BASE_URL = "https://www.dewaweb.com/domain"

# TLDs that matter for vibe coders (Indonesia focus)
KEY_TLDS = {".com", ".id", ".my.id", ".co.id", ".web.id", ".biz.id", ".dev", ".app", ".net", ".org", ".io", ".me"}


def scrape() -> list[dict]:
    """Scrape Dewaweb domain pricing."""
    try:
        html = fetch(BASE_URL)
        soup = BeautifulSoup(html, "html.parser")
        results = []

        # Dewaweb has a pricing table with TLD, new price, renewal
        # Try to extract from their table structure
        extracted = _extract_table(soup)
        if extracted:
            results = extracted

        if results:
            # Filter to our key TLDs
            filtered = [r for r in results if r["tld"] in KEY_TLDS]
            if not filtered:
                filtered = results[:10]  # Take top 10 if no key TLDs found
            logger.info(f"Scraped {len(filtered)} Dewaweb domain prices")
            return filtered

    except Exception as e:
        logger.warning(f"Dewaweb domain scrape failed: {e}")

    logger.info("Using fallback Dewaweb domain data")
    return _fallback()


def _extract_table(soup) -> list[dict] | None:
    """Extract domain pricing from Dewaweb's pricing table."""
    results = []

    # Look for table rows with TLD and price info
    # The page has a table with structure: TLD | New | Transfer/Renewal
    for row in soup.find_all("tr"):
        cells = row.find_all("td")
        if len(cells) >= 3:
            tld_text = cells[0].get_text(strip=True)
            # Try to extract TLD from text (like ".com", ".id")
            m = re.search(r'(\.\w+)', tld_text)
            if not m:
                continue
            tld = m.group(1).lower()

            # Extract prices from remaining cells
            prices = []
            for cell in cells[1:4]:
                cell_text = cell.get_text(strip=True)
                pm = re.search(r'([0-9]+[.,]?[0-9]*)', cell_text.replace(".", ""))
                if pm:
                    try:
                        prices.append(int(pm.group(1)))
                    except ValueError:
                        pass

            if len(prices) >= 2:
                results.append({
                    "registrar": PROVIDER,
                    "tld": tld,
                    "first_year": prices[0],
                    "renewal": prices[1] if len(prices) > 1 else prices[0],
                    "currency": "IDR",
                    "url": BASE_URL,
                })

    return results if results else None


def _fallback() -> list[dict]:
    ts = now_iso()
    return [
        {
            "registrar": PROVIDER,
            "tld": p["tld"],
            "first_year": p["first_year"],
            "renewal": p["renewal"],
            "currency": p["currency"],
            "url": p["url"],
        }
        for p in FALLBACK_DOMAIN.get(PROVIDER, [])
    ]
