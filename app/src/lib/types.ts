export interface VPSPlan {
  provider: string;
  plan: string;
  vcpu: number;
  ram_gb: number;
  storage_gb: number;
  storage_type: string;
  bandwidth_tb: number | null;
  price_monthly: number;
  currency: string;
  url: string;
  scraped_at: string;
}

export interface VPSResponse {
  vps: VPSPlan[];
  summary: {
    last_run: string;
    vps_providers: number;
    vps_plans: number;
  };
}

export type CurrencyCode = 'IDR' | 'USD' | 'EUR';

export const FX: Record<CurrencyCode, { symbol: string; locale: string; decimals: number; toIDR: number }> = {
  IDR: { symbol: 'Rp', locale: 'id-ID', decimals: 0, toIDR: 1 },
  USD: { symbol: '$', locale: 'en-US', decimals: 2, toIDR: 16200 },
  EUR: { symbol: '€', locale: 'de-DE', decimals: 2, toIDR: 17600 },
};

export const PROVIDER_NAMES: Record<string, string> = {
  contabo: 'Contabo',
  hetzner: 'Hetzner',
  digitalocean: 'DigitalOcean',
  hostinger: 'Hostinger',
  idcloudhost: 'IDCloudHost',
  biznet_gio: 'Biznet Gio',
  alibaba: 'Alibaba Cloud',
  tencent: 'Tencent Cloud',
  dalang: 'Dalang.io',
  vultr: 'Vultr',
};

export const PROVIDER_COLORS: Record<string, string> = {
  contabo: 'from-indigo-600 to-indigo-800',
  hetzner: 'from-amber-500 to-orange-600',
  digitalocean: 'from-blue-500 to-blue-700',
  hostinger: 'from-purple-500 to-pink-600',
  idcloudhost: 'from-emerald-500 to-green-700',
  biznet_gio: 'from-cyan-600 to-teal-700',
  alibaba: 'from-orange-500 to-red-600',
  tencent: 'from-sky-500 to-blue-700',
  dalang: 'from-violet-500 to-purple-700',
  vultr: 'from-sky-500 to-indigo-600',
};

export function convertPrice(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return amount;
  const idr = from === 'IDR' ? amount : amount * FX[from].toIDR;
  return to === 'IDR' ? idr : idr / FX[to].toIDR;
}

export function fmtPrice(amount: number, currency: CurrencyCode): string {
  const cfg = FX[currency];
  try {
    return `${cfg.symbol}${new Intl.NumberFormat(cfg.locale, {
      minimumFractionDigits: cfg.decimals,
      maximumFractionDigits: cfg.decimals,
    }).format(amount)}`;
  } catch {
    return `${cfg.symbol}${amount.toFixed(cfg.decimals)}`;
  }
}

export function fmtStorage(gb: number): string {
  if (!gb) return '-';
  return gb >= 1000 ? `${(gb / 1000).toFixed(1)} TB` : `${gb} GB`;
}

export function fmtBandwidth(tb: number | null): string {
  if (tb === null || tb === undefined) return '∞ Unlimited';
  return tb >= 1 ? `${tb} TB` : `${tb * 1000} GB`;
}

export function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
  return `${Math.floor(diff / 86400)}h lalu`;
}
