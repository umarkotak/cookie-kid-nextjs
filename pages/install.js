export default function InstallPage() {
  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cara Instal CaBocil</h1>

      {/* iOS Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">📱 iPhone atau iPad (Safari)</h2>
        <p>Ikuti langkah-langkah berikut untuk menambahkan CaBocil ke layar utama:</p>
        <ol className="list-decimal list-inside mt-2 space-y-2">
          <li>Ketuk tombol <strong>Bagikan/Share</strong> (ikon kotak dengan panah ke atas).</li>
          <li>Pilih <strong>Tambahkan ke Layar Utama</strong>.</li>
        </ol>
        <p className="mt-3">Sekarang CaBocil bisa dibuka langsung dari layar utama iPhone/iPad Anda!</p>
      </section>

      {/* Android Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">🤖 Android (Google Chrome)</h2>
        <p>Ikuti langkah-langkah berikut untuk menambahkan CaBocil ke layar utama:</p>
        <ol className="list-decimal list-inside mt-2 space-y-2">
          <li>Ketuk ikon <strong>tiga titik</strong> di pojok kanan atas.</li>
          <li>Pilih <strong>Tambahkan ke Layar Utama</strong>.</li>
        </ol>
        <p className="mt-3">Sekarang CaBocil tersedia di layar utama Android Anda!</p>
      </section>
    </main>
  )
}
