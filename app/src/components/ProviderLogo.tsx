import { useState } from 'react'
import { PROVIDER_NAMES, PROVIDER_COLORS } from '@/lib/types'

interface ProviderLogoProps {
  provider: string
  /** tile size in px */
  size?: number
  /** rounded-* class for the tile */
  rounded?: string
  className?: string
}

// Logo files may be any of these formats (we try them in order).
const EXTS = ['svg', 'png', 'webp', 'jpg', 'jpeg', 'avif'] as const

// Logos that already fill their own canvas (a colored circle/badge).
// These are shown edge-to-edge, without a white tile or padding.
const BLEED = new Set(['vultr', 'alibaba', 'digitalocean', 'hostinger'])

/**
 * Logo provider. Logo "bleed" tampil penuh (tanpa tile), sisanya di atas
 * tile putih ber-border. Coba beberapa ekstensi file `/logos/<provider>.<ext>`;
 * kalau semua gagal, fallback ke inisial dengan gradient brand.
 */
export default function ProviderLogo({
  provider,
  size = 36,
  rounded = 'rounded-xl',
  className = '',
}: ProviderLogoProps) {
  const [extIdx, setExtIdx] = useState(0)
  const name = PROVIDER_NAMES[provider] || provider
  const gradient = PROVIDER_COLORS[provider] || 'from-slate-500 to-slate-700'
  const bleed = BLEED.has(provider)

  if (extIdx >= EXTS.length) {
    return (
      <span
        style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
        className={`flex shrink-0 items-center justify-center ${rounded} bg-gradient-to-br ${gradient} font-bold leading-none text-white ${className}`}
      >
        {name.charAt(0)}
      </span>
    )
  }

  return (
    <span
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center overflow-hidden ${rounded} ${
        bleed ? '' : 'border bg-white'
      } ${className}`}
    >
      <img
        key={EXTS[extIdx]}
        src={`/logos/${provider}.${EXTS[extIdx]}`}
        alt={name}
        loading="lazy"
        onError={() => setExtIdx(i => i + 1)}
        className={bleed ? 'h-full w-full object-cover' : 'h-full w-full object-contain p-0.5'}
      />
    </span>
  )
}
