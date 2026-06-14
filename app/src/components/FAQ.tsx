import { Card, CardContent } from '@/components/ui/card'

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
    a: 'Sebagian tombol "Lihat di provider" memakai link affiliate. Kalau kamu daftar lewat link itu, ' +
      'kami bisa dapat komisi kecil tanpa biaya tambahan untukmu. Urutan & harga yang ditampilkan tidak terpengaruh.',
  },
  {
    q: 'Kenapa harganya beda dengan situs provider?',
    a: 'Harga bisa berubah sewaktu-waktu, ada promo, pajak (PPN), atau perbedaan kurs. ' +
      'Selalu cek harga final di halaman provider sebelum membeli.',
  },
  {
    q: 'Provider saya belum ada. Bisa ditambah?',
    a: 'Bisa! Kirim masukan lewat email atau GitHub dan kami usahakan tambahkan.',
  },
]

export default function FAQ() {
  return (
    <section id="faq">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">❓</span>
        <h2 className="text-2xl font-bold">Pertanyaan Umum</h2>
      </div>
      <p className="text-muted-foreground mb-6 max-w-2xl">
        Hal-hal yang sering ditanyakan soal data, harga, dan cara kerja CekVPS.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FAQS.map(item => (
          <Card key={item.q} className="border shadow-sm">
            <CardContent className="p-5 space-y-2">
              <h3 className="font-semibold text-foreground">{item.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
