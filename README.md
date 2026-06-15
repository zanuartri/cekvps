# CekVPS

**Cari VPS termurah, tanpa buka banyak tab.** — bandingkan harga VPS dari provider
lokal Indonesia & global dalam satu daftar. Gratis, tanpa iklan, dibuat untuk
developer / vibe coder Indonesia.

🔗 **[cekvps.com](https://cekvps.com)**

## Fitur

- Banding harga **8 provider** (lokal & global) dalam satu tabel — sortir, cari, filter.
- Konversi mata uang **IDR / USD / EUR** dengan kurs harian.
- Kalkulator: tentukan vCPU/RAM yang kamu butuh → lihat opsi termurah.
- Metode pembayaran per provider (QRIS, transfer/VA, e-wallet, kartu kredit, dll) —
  diverifikasi dari halaman resmi.
- Harga bulanan no-commitment sebagai headline + hint "lebih murah jika tahunan".

## Tech stack

- **Frontend** (`app/`): Vite + React + TypeScript + Tailwind CSS v4 + shadcn-style UI.
- **Scraper** (`scraper/`): Python (requests + BeautifulSoup) → menulis JSON statis.
- **Deploy**: satu Docker image — nginx serve SPA + cron menjalankan scraper.

## Cara kerja

```
scraper/run.py ──> /data/{vps/all.json, summary.json, fx.json} ──> SPA fetch saat runtime
```

Harga **8 provider**: sebagian di-scrape live dari halaman resmi
(Contabo, Biznet Gio, DomaiNesia, CloudKilat), sebagian **dikurasi manual** untuk
provider yang halamannya tidak bisa di-scrape (Hostinger, IDCloudHost, Sumopod,
Dalang.io). Kalau scrape gagal, dipakai harga terakhir yang diketahui (fallback di
`scraper/config.py`). Kurs diambil dari [frankfurter.app](https://frankfurter.app)
(tanpa API key).

Katalog difokuskan ke plan kecil–menengah: plan dengan **> 8 vCPU** atau **> 32 GB
RAM** disembunyikan dari tampilan (`MAX_VCPU` / `MAX_RAM_GB` di `app/src/lib/types.ts`).

## Development

Butuh Node 22+ dan Python 3.11+.

```sh
# Frontend
cd app && npm install && npm run dev      # http://localhost:5173

# Scraper (sekali setup venv + install deps)
cd scraper && python -m venv .venv && .venv/bin/pip install -r requirements.txt
```

Atau via `Makefile` dari root:

```sh
make dev          # jalankan frontend
make scrape       # scrape → tulis ke app/public/data (dipakai dev)
make build        # build SPA → app/dist
make docker-run   # build + run image produksi di http://localhost:8080
```

## Deploy

Self-hosted via **Coolify** (Dockerfile build pack). Lihat **[DEPLOY.md](./DEPLOY.md)**.

## Monetisasi

Sukarela lewat **Saweria** ([saweria.co/zanuartri](https://saweria.co/zanuartri)).
Tanpa iklan. Config affiliate ada di `app/src/lib/site.ts` tapi **dinonaktifkan**
(placeholder) untuk MVP.

## Kontribusi

Repo ini open source. Issue & PR diterima — terutama untuk **menambah/memperbaiki
data provider** (`scraper/`) atau perbaikan UI. Untuk menambah provider: buat modul
di `scraper/providers/`, daftarkan di `scraper/config.py`, lalu tambahkan metadata
di `app/src/lib/types.ts` (`PROVIDER_NAMES`, `PROVIDER_COLORS`, `PROVIDER_META`).

> Harga bisa berubah sewaktu-waktu — selalu cek harga final di halaman provider.
