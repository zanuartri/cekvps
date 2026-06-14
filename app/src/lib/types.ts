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

// Target audience = vibe coders, so cap the catalog to small/mid plans and hide
// enterprise tiers. The grid/finder filter on these and the Cari sliders use them.
export const MAX_VCPU = 8;
export const MAX_RAM_GB = 32;

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
  hostinger: 'Hostinger',
  idcloudhost: 'IDCloudHost',
  biznet_gio: 'Biznet Gio',
  dalang: 'Dalang.io',
  sumopod: 'Sumopod',
  domainesia: 'DomaiNesia',
  cloudkilat: 'CloudKilat',
};

export const PROVIDER_COLORS: Record<string, string> = {
  contabo: 'from-indigo-600 to-indigo-800',
  hostinger: 'from-purple-500 to-pink-600',
  idcloudhost: 'from-emerald-500 to-green-700',
  biznet_gio: 'from-cyan-600 to-teal-700',
  dalang: 'from-violet-500 to-purple-700',
  sumopod: 'from-sky-400 to-blue-600',
  domainesia: 'from-green-500 to-emerald-600',
  cloudkilat: 'from-blue-500 to-indigo-600',
};

// --- Provider metadata: region & metode pembayaran ---
// Metode pembayaran diverifikasi dari halaman/KB resmi tiap provider (Juni 2026).
// Pengecualian: Sumopod & Dalang belum bisa dikonfirmasi dari sumber publik
// (checkout di balik login/SPA), jadi nilainya konservatif — cek lagi nanti.
// Tetap saran ke user: konfirmasi final di halaman checkout provider.
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
  // help.contabo.com: Credit Card, PayPal, Bank Transfer (+ Skrill, Direct Debit). Crypto TIDAK diterima.
  contabo: { region: 'global', payments: ['cc', 'paypal', 'transfer'] },
  // hostinger.com/support: Credit Card + PayPal; ID menambah QRIS, e-wallet (OVO), transfer bank.
  hostinger: { region: 'local', payments: ['qris', 'transfer', 'ewallet', 'cc', 'paypal'] },
  // idcloudhost.com/panduan: Transfer/VA, e-wallet, QRIS, Kartu Kredit, PayPal, Alfamart/Indomaret/Lawson.
  idcloudhost: { region: 'local', payments: ['qris', 'transfer', 'ewallet', 'cc', 'paypal', 'retail'] },
  // kb.biznetgio.com (NEO Cloud): Kartu Kredit (Visa/MC/JCB), Transfer Bank/VA, e-Wallet, QRIS.
  biznet_gio: { region: 'local', payments: ['qris', 'transfer', 'ewallet', 'cc'] },
  // BELUM terkonfirmasi (checkout di balik CRM/login) — nilai konservatif.
  dalang: { region: 'local', payments: ['qris', 'transfer', 'ewallet'] },
  // BELUM terkonfirmasi (model topup, dashboard auth-gated) — nilai konservatif.
  sumopod: { region: 'local', payments: ['qris', 'transfer', 'ewallet'] },
  // domainesia.com/pembayaran: VA, e-wallet (GoPay/OVO/DANA/LinkAja/ShopeePay), QRIS, Kartu Kredit, PayPal, Indomaret/Alfamart.
  domainesia: { region: 'local', payments: ['qris', 'transfer', 'ewallet', 'cc', 'paypal', 'retail'] },
  // kb.cloudkilat.id: Virtual Account (8 bank), QRIS (OVO/GoPay/ShopeePay), Kartu Kredit.
  cloudkilat: { region: 'local', payments: ['qris', 'transfer', 'ewallet', 'cc'] },
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
