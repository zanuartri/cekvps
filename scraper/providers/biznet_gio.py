"""
CekVPS — Biznet Gio VPS Scraper

Biznet's budget VPS line is "NEO Lite". The cleanest source is the pricelist:
www.biznetgio.com/pricelist (note the www host — gio.id/* redirects to the
homepage). Its Nuxt SSR payload (`<script id="__NUXT_DATA__">`) is devalue-
serialised (a flat array where ints are pointers into the same array). Inside it,
each product carries a `pricing_table` whose `table` field is an HTML table with
explicit columns: Paket | vCPU | RAM | Storage | Harga/Bulan. Discounted rows put
the original price in a line-through span and the current price in <b>.

Falls back to hardcoded pricing on failure.
"""
import re
import json
import logging
from bs4 import BeautifulSoup

from config import FALLBACK_VPS
from utils import fetch, now_iso

logger = logging.getLogger("cekvps.biznet_gio")
PROVIDER = "biznet_gio"
BASE_URL = "https://www.biznetgio.com/pricelist"
PRODUCT_NAME = "VPS NEO Lite"

_NUXT_RE = re.compile(r'<script[^>]*id="__NUXT_DATA__"[^>]*>(.*?)</script>', re.S)
_INT = re.compile(r"\d+")


def scrape() -> list[dict]:
    """Scrape Biznet Gio NEO Lite VPS pricing from the pricelist payload."""
    try:
        html = fetch(BASE_URL)
        m = _NUXT_RE.search(html)
        if not m:
            raise ValueError("__NUXT_DATA__ payload not found")
        arr = json.loads(m.group(1))

        def deref(v, depth=0):
            if isinstance(v, int) and 0 <= v < len(arr) and depth < 8:
                return deref(arr[v], depth + 1)
            if isinstance(v, dict) and depth < 8:
                return {k: deref(x, depth + 1) for k, x in v.items()}
            if isinstance(v, list) and depth < 8:
                return [deref(x, depth + 1) for x in v]
            return v

        table_html = None
        for node in arr:
            if isinstance(node, dict) and "product_name" in node and "pricing_table" in node:
                name = deref(node["product_name"])
                if name == PRODUCT_NAME:
                    pt = deref(node["pricing_table"])
                    if pt and isinstance(pt, list) and pt[0].get("table"):
                        table_html = pt[0]["table"]
                        break
        if not table_html:
            raise ValueError(f"pricing_table for {PRODUCT_NAME!r} not found")

        results = _parse_table(table_html)
        if results:
            results.sort(key=lambda p: p["price_monthly"])
            logger.info(f"Scraped {len(results)} Biznet NEO Lite plans")
            return results
        logger.warning("Biznet: pricing table parsed but no rows matched")

    except Exception as e:
        logger.warning(f"Biznet Gio scrape failed: {e}")

    logger.info("Using fallback Biznet Gio data")
    return _fallback()


def _parse_table(table_html: str) -> list[dict]:
    """Parse the NEO Lite HTML pricing table into plan dicts."""
    soup = BeautifulSoup(table_html, "html.parser")
    ts = now_iso()
    results = []
    for tr in soup.find_all("tr"):
        cells = tr.find_all(["td", "th"])
        if len(cells) < 5:
            continue
        paket = cells[0].get_text(" ", strip=True)
        if not paket or paket.lower() == "paket":      # skip header
            continue
        vcpu = _first_int(cells[1].get_text(" ", strip=True))
        ram = _first_int(cells[2].get_text(" ", strip=True))
        storage = _first_int(cells[3].get_text(" ", strip=True))
        price, original = _parse_price(cells[4])
        if vcpu is None or ram is None or price is None:
            continue
        discount_pct = (
            round((original - price) / original * 100)
            if original and original > price else None
        )
        results.append({
            "provider": PROVIDER,
            "plan": f"NEO Lite {paket}",
            "vcpu": vcpu,
            "ram_gb": ram,
            "storage_gb": storage,
            "storage_type": "SSD",
            "bandwidth_tb": None,
            "price_monthly": price,
            "price_original": original,
            "discount_pct": discount_pct,
            "setup_fee": None,
            "price_annual_monthly": None,
            "currency": "IDR",
            "url": BASE_URL,
            "scraped_at": ts,
        })
    return results


def _parse_price(cell) -> tuple[int | None, int | None]:
    """Return (current_price, original_price). Discounted cells carry the
    original in a line-through span and the current in <b>. The CMS stores the
    cell's rich text HTML-escaped, so re-parse its text content first."""
    inner = BeautifulSoup(cell.get_text(" "), "html.parser")
    strike = inner.find(
        lambda t: t.name in ("s", "strike", "del")
        or (t.has_attr("style") and "line-through" in t["style"])
    )
    original = _rupiah(strike.get_text()) if strike else None
    nums = [_rupiah(x) for x in re.findall(r"Rp\s?[\d.]+", inner.get_text(" "))]
    nums = [n for n in nums if n is not None]
    if not nums:
        return None, None
    current = nums[-1]              # the <b> current price comes after the strike
    if original is None or original <= current:
        original = None
    return current, original


def _first_int(text: str) -> int | None:
    m = _INT.search(text or "")
    return int(m.group()) if m else None


def _rupiah(text) -> int | None:
    if not isinstance(text, str):
        return None
    digits = re.sub(r"[^0-9]", "", text)
    return int(digits) if digits else None


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
            "price_original": None,
            "discount_pct": None,
            "setup_fee": None,
            "price_annual_monthly": None,
            "currency": p["currency"],
            "url": p["url"],
            "scraped_at": ts,
        })
    return results
