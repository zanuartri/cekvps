"""
CekVPS — Hetzner Cloud VPS Scraper (official API)

Hetzner's pricing page is JS-rendered (no static prices), but the Cloud API
exposes everything. GET /v1/server_types returns each type's specs AND prices
per location in one call. It needs a free read-only token from the Hetzner Cloud
Console (Security -> API Tokens), provided via the HETZNER_API_TOKEN env var.

Prices are EUR, net (excl. VAT) — the base server price (IPv6-only; IPv4 is a
small add-on Hetzner bills separately). Without a token we skip Hetzner rather
than guess prices.
"""
import os
import logging

import requests

from config import TIMEOUT, USER_AGENT
from utils import now_iso

logger = logging.getLogger("cekvps.hetzner")
PROVIDER = "hetzner"
API_URL = "https://api.hetzner.cloud/v1/server_types"
TOKEN_ENV = "HETZNER_API_TOKEN"


def scrape() -> list[dict]:
    """Scrape Hetzner Cloud server types via the official API."""
    token = os.environ.get(TOKEN_ENV)
    if not token:
        logger.warning(f"{TOKEN_ENV} not set — skipping Hetzner (set it for live data)")
        return []

    try:
        resp = requests.get(
            API_URL,
            headers={"Authorization": f"Bearer {token}", "User-Agent": USER_AGENT},
            timeout=TIMEOUT,
        )
        resp.raise_for_status()
        types = resp.json().get("server_types", [])
    except Exception as e:
        logger.warning(f"Hetzner API failed: {e}")
        return []

    ts = now_iso()
    results = []
    for st in types:
        if st.get("deprecated"):
            continue
        price, traffic_bytes = _cheapest_price(st)
        if price is None:
            continue
        mem = st.get("memory")
        results.append({
            "provider": PROVIDER,
            "plan": str(st.get("name", "")).upper(),
            "vcpu": st.get("cores"),
            "ram_gb": int(mem) if mem is not None and float(mem).is_integer() else mem,
            "storage_gb": st.get("disk"),
            "storage_type": "NVMe",
            "bandwidth_tb": round(traffic_bytes / 1e12, 1) if traffic_bytes else None,
            "price_monthly": round(price, 2),
            "price_original": None,
            "discount_pct": None,
            "setup_fee": None,
            "price_annual_monthly": None,
            "currency": "EUR",
            "url": "https://www.hetzner.com/cloud",
            "scraped_at": ts,
        })

    results.sort(key=lambda p: p["price_monthly"])
    logger.info(f"Scraped {len(results)} Hetzner server types")
    return results


def _cheapest_price(st: dict) -> tuple[float | None, int | None]:
    """Lowest monthly net price across locations, with its included traffic."""
    best = None
    traffic = st.get("included_traffic")  # older API: on the server type
    for pr in st.get("prices") or []:
        net = (pr.get("price_monthly") or {}).get("net")
        if net is None:
            continue
        val = float(net)
        if best is None or val < best:
            best = val
            if pr.get("included_traffic") is not None:  # newer API: per location
                traffic = pr["included_traffic"]
    return best, int(traffic) if traffic else None
