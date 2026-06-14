"""
CekVPS — Scraper Runner

Orchestrates all VPS and domain scrapers, outputs to JSON.
"""
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from config import DATA_VPS, DATA_DOMAIN, LIVE_DATA, VPS_PROVIDERS, DOMAIN_PROVIDERS
from utils import write_json, now_iso

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger("cekvps.runner")


def run_vps_scrapers() -> list[dict]:
    """Run all enabled VPS scrapers, return combined data."""
    all_data = []
    errors = []

    for provider_name, config in sorted(
        VPS_PROVIDERS.items(), key=lambda x: x[1]["priority"]
    ):
        if not config.get("enabled"):
            continue

        try:
            module = __import__(f"providers.{provider_name}", fromlist=["scrape"])
            plans = module.scrape()
            if plans:
                all_data.extend(plans)
                logger.info(f"{provider_name}: {len(plans)} plans collected")
            else:
                errors.append(f"{provider_name}: no plans returned")
        except Exception as e:
            errors.append(f"{provider_name}: {e}")
            logger.error(f"Failed to scrape {provider_name}: {e}")

    if errors:
        logger.warning(f"Scrape errors: {'; '.join(errors)}")

    return all_data


def run_domain_scrapers() -> list[dict]:
    """Run all enabled domain scrapers, return combined data."""
    all_data = []
    errors = []

    for registrar_name, config in sorted(
        DOMAIN_PROVIDERS.items(), key=lambda x: x[1]["priority"]
    ):
        if not config.get("enabled"):
            continue

        try:
            module = __import__(f"domains.{registrar_name}", fromlist=["scrape"])
            prices = module.scrape()
            if prices:
                all_data.extend(prices)
                logger.info(f"{registrar_name}: {len(prices)} TLDs collected")
            else:
                errors.append(f"{registrar_name}: no prices returned")
        except Exception as e:
            errors.append(f"{registrar_name}: {e}")
            logger.error(f"Failed to scrape {registrar_name}: {e}")

    if errors:
        logger.warning(f"Domain scrape errors: {'; '.join(errors)}")

    return all_data


def main():
    logger.info("=" * 50)
    logger.info("CekVPS Scraper — Starting run")
    logger.info("=" * 50)

    # --- VPS ---
    vps_data = run_vps_scrapers()
    if vps_data:
        DATA_VPS.mkdir(parents=True, exist_ok=True)
        write_json(DATA_VPS / "all.json", vps_data)
        # Also write per-provider files
        by_provider = {}
        for plan in vps_data:
            p = plan["provider"]
            by_provider.setdefault(p, []).append(plan)
        for provider, plans in by_provider.items():
            write_json(DATA_VPS / f"{provider}.json", plans)

        logger.info(f"✅ VPS: {len(vps_data)} plans from {len(by_provider)} providers")
    else:
        logger.warning("⚠️ No VPS data collected")

    # --- Domains ---
    domain_data = run_domain_scrapers()
    if domain_data:
        DATA_DOMAIN.mkdir(parents=True, exist_ok=True)
        write_json(DATA_DOMAIN / "all.json", domain_data)
        by_registrar = {}
        for price in domain_data:
            r = price["registrar"]
            by_registrar.setdefault(r, []).append(price)
        for registrar, prices in by_registrar.items():
            write_json(DATA_DOMAIN / f"{registrar}.json", prices)

        logger.info(f"✅ Domains: {len(domain_data)} TLDs from {len(by_registrar)} registrars")
    else:
        logger.warning("⚠️ No domain data collected")

    # --- Summary ---
    summary = {
        "last_run": now_iso(),
        "vps_providers": len(set(p["provider"] for p in vps_data)),
        "vps_plans": len(vps_data),
        "domain_registrars": len(set(d["registrar"] for d in domain_data)),
        "domain_tlds": len(domain_data),
    }
    write_json(LIVE_DATA / "summary.json", summary)
    logger.info(f"Summary: {json.dumps(summary, indent=2)}")
    logger.info("✅ Scrape run complete")


if __name__ == "__main__":
    main()
