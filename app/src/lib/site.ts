/**
 * Central site & monetization config.
 *
 * Saweria sudah diset. AFFILIATES[provider].ref masih placeholder & affiliate
 * di-disable untuk MVP — isi ref + set enabled:true kalau program-nya sudah ada.
 *
 * Semua monetisasi bersifat sukarela & transparan (lihat AFFILIATE_DISCLOSURE).
 */

export const SITE = {
  name: 'CekVPS',
  tagline: 'Cek & bandingkan harga VPS untuk developer Indonesia',
  url: 'https://cekvps.com',
  // Voluntary donation (Saweria).
  saweriaUsername: 'zanuartri',
  social: {
    github: 'https://github.com/zanuartri/cekvps',
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
  hostinger: { enabled: false, ref: 'YOUR_HOSTINGER_REF', param: 'REFERRALCODE' },
  // idcloudhost, biznet_gio, dalang, sumopod, domainesia, cloudkilat: belum ada
  // kode ref affiliate — tampil dengan link langsung ke halaman provider.
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
