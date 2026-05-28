export default function MobilePage({
  children,
  className = "",
}) {
  return (
    // Kita gunakan bg-zinc-50 agar lebih bersih, zinc-100 seringkali terlalu gelap untuk background mobile
    <div className="min-h-screen bg-zinc-50">
      <div
        className={`
          mx-auto           // PENTING: Membuat konten ke tengah
          w-full            // Full width di HP
          max-w-sm          // Membatasi lebar agar kartu tidak "bengkak" melebar
          px-4              // Padding lebih rapat (16px) dibanding px-5 (20px)
          py-4              // Padding atas lebih rapat
          pb-24             // Padding bawah lebih proporsional
          space-y-4         // Jarak antar section lebih rapat (16px)
          ${className}
        `}
      >
        {children}
      </div>
    </div>
  );
}
