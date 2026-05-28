import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

// 1. MobilePage (Container utama dengan batas lebar max-w-md agar tidak bengkak)
export function MobilePage({ children, className = "" }) {
  return (
    <div className={`w-full max-w-md mx-auto min-h-screen bg-zinc-50 ${className}`}>
      {children}
    </div>
  );
}

// 2. MobileHeader
export function MobileHeader({ title }) {
  return <div className="p-4 text-lg font-bold text-zinc-900">{title}</div>;
}

// 3. MobileSection (Jarak antar judul dan list lebih rapat)
export function MobileSection({ title, children }) {
  return (
    <section className="flex flex-col gap-2 px-4 py-2">
      {title && <h2 className="text-sm font-semibold text-zinc-500 m-0">{title}</h2>}
      {children}
    </section>
  );
}

// 4. MobileList (Gap antar kartu lebih rapat)
export function MobileList({ children }) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

// 5. MobileTransactionCard (Padding dan ukuran font dikurangi agar ringkas)
export function MobileTransactionCard({ icon, title, subtitle, amount, meta }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white border border-zinc-100 rounded-2xl shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-zinc-100 rounded-full text-zinc-600">{icon}</div>
        <div>
          <p className="text-sm font-bold text-zinc-900 m-0">{title}</p>
          <p className="text-[10px] text-zinc-400 m-0">{subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-zinc-900 m-0">{amount}</p>
        <p className="text-[10px] text-zinc-400 m-0">{meta}</p>
      </div>
    </div>
  );
}

// --- HALAMAN UTAMA ---
export default function TestMobile() {
  return (
    <MobilePage>
      <MobileHeader title="Dashboard" />

      <MobileSection title="Aktivitas">
        <MobileList>
          <MobileTransactionCard
            icon={<ArrowUpRight size={16} />}
            title="Penjualan"
            subtitle="12 transaksi"
            amount="Rp 2.500.000"
            meta="Hari ini"
          />

          <MobileTransactionCard
            icon={<ArrowDownLeft size={16} />}
            title="Pembelian"
            subtitle="5 transaksi"
            amount="Rp 850.000"
            meta="Hari ini"
          />
        </MobileList>
      </MobileSection>
    </MobilePage>
  );
}
