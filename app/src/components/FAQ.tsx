const FAQS: { q: string; a: string }[] = [
  {
    q: 'Dari mana datanya?',
    a: 'Harga diambil otomatis dari halaman resmi tiap provider dan diperbarui secara berkala. ' +
      'Kalau scraping gagal, kami pakai harga terakhir yang diketahui agar situs tetap akurat.',
  },
  {
    q: 'Apakah CekVPS berbayar?',
    a: 'Tidak. CekVPS gratis dan tanpa iklan. Kamu bisa mendukung lewat donasi sukarela (Saweria) ' +
      'atau dengan mendaftar provider lewat link affiliate kami.',
  },
  {
    q: 'Apa itu link affiliate di sini?',
    a: 'Sebagian tombol "Deploy" memakai link affiliate. Kalau kamu daftar lewat link itu, kami bisa ' +
      'dapat komisi kecil tanpa biaya tambahan untukmu. Urutan & harga yang ditampilkan tidak terpengaruh.',
  },
  {
    q: 'Kenapa harganya beda dengan situs provider?',
    a: 'Harga bisa berubah sewaktu-waktu, ada promo, pajak (PPN), atau perbedaan kurs. ' +
      'Selalu cek harga final di halaman provider sebelum membeli.',
  },
  {
    q: 'Metode pembayaran yang ditampilkan akurat?',
    a: 'Bersifat indikatif. Provider lokal (Biznet Gio, IDCloudHost, Dalang.io) umumnya menerima QRIS, ' +
      'transfer bank, dan e-wallet; provider global biasanya kartu kredit atau PayPal. ' +
      'Cek metode final di halaman checkout provider sebelum bayar.',
  },
  {
    q: 'Provider saya belum ada. Bisa ditambah?',
    a: 'Bisa! Kirim masukan lewat email atau GitHub dan kami usahakan tambahkan.',
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
