const FAQS: { q: string; a: string }[] = [
  {
    q: 'Dari mana datanya?',
    a: 'Sebagian besar harga diambil otomatis dari halaman resmi provider; sebagian dikurasi ' +
      'manual untuk provider yang halamannya tidak bisa di-scrape. Diperbarui berkala, dan kalau ' +
      'scraping gagal kami pakai harga terakhir yang diketahui agar situs tetap akurat.',
  },
  {
    q: 'Apakah CekVPS berbayar?',
    a: 'Tidak. CekVPS gratis dan tanpa iklan. Kamu bisa mendukung lewat donasi sukarela (Saweria).',
  },
  {
    q: 'Kenapa harganya beda dengan situs provider?',
    a: 'Harga bisa berubah sewaktu-waktu, ada promo, pajak (PPN), atau perbedaan kurs. ' +
      'Selalu cek harga final di halaman provider sebelum membeli.',
  },
  {
    q: 'Metode pembayaran yang ditampilkan akurat?',
    a: 'Diverifikasi dari halaman/checkout resmi tiap provider (per Juni 2026). Provider lokal ' +
      'umumnya QRIS, transfer/VA, e-wallet, dan kartu kredit; yang global pakai kartu kredit / ' +
      'PayPal. Tetap bisa berubah — cek final di checkout sebelum bayar.',
  },
  {
    q: 'Provider saya belum ada. Bisa ditambah?',
    a: 'Bisa! Kirim masukan lewat Threads dan kami usahakan tambahkan.',
  },
]

export default function FAQ() {
  return (
    <div className="divide-y rounded-2xl border bg-card shadow-sm">
      {FAQS.map(item => (
        <details key={item.q} className="group px-5 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
            {item.q}
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-muted-foreground transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="pb-4 -mt-1 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
        </details>
      ))}
    </div>
  )
}
