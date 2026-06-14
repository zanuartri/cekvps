/**
 * Central site & monetization config.
 *
 * ⚠️ Ganti placeholder di bawah dengan akun kamu yang asli:
 *   - SAWERIA_USERNAME → username Saweria kamu
 *   - AFFILIATES[provider].ref → kode/ID affiliate dari masing-masing provider
 *
 * Semua monetisasi bersifat sukarela & transparan (lihat AFFILIATE_DISCLOSURE).
 */

export const SITE = {
  name: 'CekVPS',
  tagline: 'Cek & bandingkan harga VPS untuk developer Indonesia',
  url: 'https://cekvps.com',
  // Voluntary donation (Saweria). Ganti dengan username kamu.
  saweriaUsername: 'cekvps',
  social: {
    github: 'https://github.com/zanuartri',
    threads: 'https://www.threads.com/@zanuar.tri',
  },
} as const

export const SAWERIA_URL = `https://saweria.co/${SITE.saweriaUsername}`

/**
 * Affiliate config per provider.
 * - `enabled`: tampilkan badge "Partner" + bangun link affiliate
 * - `ref`: kode affiliate yang disisipkan ke URL
 * - `param`: nama query param affiliate (default: 'ref')
 *
 * Provider yang tidak ada di sini tetap tampil, hanya tanpa link affiliate.
 */
interface AffiliateConfig {
  enabled: boolean
  ref: string
  param?: string
}

export const AFFILIATES: Record<string, AffiliateConfig> = {
  // Provider dengan program affiliate. Isi `ref` dengan kode kamu lalu set enabled: true.
  contabo: { enabled: false, ref: 'YOUR_CONTABO_REF', param: 'aff' },
  hetzner: { enabled: false, ref: 'YOUR_HETZNER_REF', param: 'ref' },
  digitalocean: { enabled: false, ref: 'YOUR_DO_REF', param: 'refcode' },
  hostinger: { enabled: false, ref: 'YOUR_HOSTINGER_REF', param: 'REFERRALCODE' },
  vultr: { enabled: false, ref: 'YOUR_VULTR_REF', param: 'ref' },
  alibaba: { enabled: false, ref: 'YOUR_ALIBABA_REF', param: 'utm_source' },
  tencent: { enabled: false, ref: 'YOUR_TENCENT_REF', param: 'from' },
  // idcloudhost, biznet_gio, dalang: belum/ tidak ada program affiliate publik —
  // tetap tampil dengan link langsung ke halaman provider (tanpa kode ref).
}

/** Apakah provider ini partner affiliate aktif. */
export function isAffiliate(provider: string): boolean {
  return AFFILIATES[provider]?.enabled ?? false
}

/**
 * Bangun URL keluar untuk sebuah plan.
 * Kalau provider adalah affiliate aktif, sisipkan kode ref ke URL aslinya.
 */
export function buildAffiliateUrl(provider: string, baseUrl: string): string {
  const cfg = AFFILIATES[provider]
  if (!cfg?.enabled || !cfg.ref || !baseUrl) return baseUrl
  try {
    const u = new URL(baseUrl)
    u.searchParams.set(cfg.param ?? 'ref', cfg.ref)
    return u.toString()
  } catch {
    return baseUrl
  }
}

export const AFFILIATE_DISCLOSURE =
  'Beberapa tautan ke provider adalah link affiliate. Kalau kamu daftar lewat link tersebut, ' +
  'CekVPS bisa dapat komisi kecil tanpa biaya tambahan untukmu. Ini membantu biaya server & ' +
  'tidak memengaruhi urutan atau harga yang ditampilkan.'
