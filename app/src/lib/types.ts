export interface VPSPlan {
  provider: string;
  plan: string;
  vcpu: number;
  ram_gb: number;
  storage_gb: number | null;
  storage_type: string;
  bandwidth_tb: number | null;
  price_monthly: number;
  currency: string;
  url: string;
  scraped_at: string;
  // Optional pricing detail — populated by scrapers only when found on the
  // provider page, otherwise null. price_original/discount_pct = promo on the
  // monthly price; setup_fee = one-off install cost (0 = explicitly free);
  // price_annual_monthly = effective per-month price when paying annually.
  price_original?: number | null;
  discount_pct?: number | null;
  setup_fee?: number | null;
  price_annual_monthly?: number | null;
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

export interface FxEntry { symbol: string; locale: string; decimals: number; toIDR: number }

const FX_DEFAULTS: Record<CurrencyCode, FxEntry> = {
  IDR: { symbol: 'Rp', locale: 'id-ID', decimals: 0, toIDR: 1 },
  USD: { symbol: '$', locale: 'en-US', decimals: 2, toIDR: 16200 },
  EUR: { symbol: '€', locale: 'de-DE', decimals: 2, toIDR: 17600 },
};

export const FX: Record<CurrencyCode, FxEntry> = { ...FX_DEFAULTS };

export function updateFX(usdToIdr: number, eurToIdr: number) {
  FX.USD = { ...FX_DEFAULTS.USD, toIDR: usdToIdr };
  FX.EUR = { ...FX_DEFAULTS.EUR, toIDR: eurToIdr };
}

export const PROVIDER_NAMES: Record<string, string> = {
  contabo: 'Contabo',
  digitalocean: 'DigitalOcean',
  hostinger: 'Hostinger',
  idcloudhost: 'IDCloudHost',
  biznet_gio: 'Biznet Gio',
  alibaba: 'Alibaba Cloud',
  tencent: 'Tencent Cloud',
  dalang: 'Dalang.io',
  vultr: 'Vultr',
  sumopod: 'Sumopod',
};

export const PROVIDER_COLORS: Record<string, string> = {
  contabo: 'from-indigo-600 to-indigo-800',
  digitalocean: 'from-blue-500 to-blue-700',
  hostinger: 'from-purple-500 to-pink-600',
  idcloudhost: 'from-emerald-500 to-green-700',
  biznet_gio: 'from-cyan-600 to-teal-700',
  alibaba: 'from-orange-500 to-red-600',
  tencent: 'from-sky-500 to-blue-700',
  dalang: 'from-violet-500 to-purple-700',
  vultr: 'from-sky-500 to-indigo-600',
  sumopod: 'from-sky-400 to-blue-600',
};

// --- Provider metadata: region & metode pembayaran ---
// Catatan: metode pembayaran bersifat indikatif. Yang lokal (Indonesia) terima QRIS;
// yang global umumnya kartu kredit/PayPal. Selalu cek final di halaman provider.
export type Region = 'local' | 'global';
export type PaymentMethod = 'qris' | 'transfer' | 'ewallet' | 'cc' | 'retail' | 'paypal' | 'crypto';

export const REGION_LABELS: Record<Region, string> = {
  local: 'Lokal',
  global: 'Global',
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  qris: 'QRIS',
  transfer: 'Transfer Bank',
  ewallet: 'E-wallet',
  cc: 'Kartu Kredit',
  retail: 'Retail (Alfamart)',
  paypal: 'PayPal',
  crypto: 'Crypto',
};

export interface ProviderMeta {
  region: Region;
  payments: PaymentMethod[];
}

export const PROVIDER_META: Record<string, ProviderMeta> = {
  contabo: { region: 'global', payments: ['cc', 'paypal', 'transfer', 'crypto'] },
  digitalocean: { region: 'global', payments: ['cc', 'paypal'] },
  hostinger: { region: 'global', payments: ['cc', 'paypal', 'crypto'] },
  idcloudhost: { region: 'local', payments: ['qris', 'transfer', 'ewallet', 'cc'] },
  biznet_gio: { region: 'local', payments: ['qris', 'transfer', 'ewallet', 'cc'] },
  alibaba: { region: 'global', payments: ['cc', 'paypal'] },
  tencent: { region: 'global', payments: ['cc', 'paypal'] },
  dalang: { region: 'local', payments: ['qris', 'transfer', 'ewallet'] },
  vultr: { region: 'global', payments: ['cc', 'paypal', 'crypto'] },
  sumopod: { region: 'local', payments: ['qris', 'transfer', 'ewallet', 'cc', 'retail'] },
};

export const DEFAULT_META: ProviderMeta = { region: 'global', payments: ['cc'] };

export function providerMeta(provider: string): ProviderMeta {
  return PROVIDER_META[provider] ?? DEFAULT_META;
}

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

export function fmtStorage(gb: number | null): string {
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
