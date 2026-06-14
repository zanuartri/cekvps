"""
CekVPS — Scraper utilities: HTTP, caching, error handling
"""
import json
import logging
import time
from datetime import datetime, timezone
from typing import Optional

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from config import USER_AGENT, TIMEOUT, RETRIES, RETRY_DELAY

logger = logging.getLogger("cekvps")

# --- Session management ---

_session: Optional[requests.Session] = None


def get_session() -> requests.Session:
    """Get or create a reusable requests session with retries and browser-like headers."""
    global _session
    if _session is None:
        _session = requests.Session()
        retry = Retry(
            total=RETRIES,
            backoff_factor=RETRY_DELAY,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET"],
        )
        adapter = HTTPAdapter(max_retries=retry)
        _session.mount("https://", adapter)
        _session.mount("http://", adapter)
        _session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
        })
    return _session


def fetch(url: str, parser: str = "html.parser") -> str:
    """Fetch a URL and return raw HTML text."""
    sess = get_session()
    logger.info(f"Fetching: {url}")
    resp = sess.get(url, timeout=TIMEOUT)
    resp.raise_for_status()
    # be polite
    time.sleep(0.5)
    return resp.text


def fetch_json(url: str) -> dict:
    """Fetch a URL and return parsed JSON."""
    sess = get_session()
    logger.info(f"Fetching JSON: {url}")
    resp = sess.get(url, timeout=TIMEOUT)
    resp.raise_for_status()
    time.sleep(0.5)
    return resp.json()


# --- File helpers ---

def write_json(path, data):
    """Write data to JSON file with pretty print."""
    path = str(path)
    with open(path, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    logger.info(f"Wrote {len(data)} items to {path}")


def read_json(path):
    """Read data from JSON file."""
    path = str(path)
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


# --- Timestamp ---

def now_iso():
    return datetime.now(timezone.utc).isoformat()


import os
