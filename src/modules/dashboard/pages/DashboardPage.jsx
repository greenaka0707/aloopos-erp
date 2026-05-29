import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Boxes,
  Factory,
  Package,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  AlertTriangle
} from "lucide-react";

// SESUAIKAN JIKA IMPORT DEFAULT: import supabase from "@/lib/supabase";
import { supabase } from "@/lib/supabase"; 
import Card from "@/shared/components/common/Card";

function StatsCard({ title, value, icon, growth, iconClassName = "", linkTo }) {
  return (
    <Link to={linkTo} className="block transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
      <Card className="relative overflow-hidden px-4 py-4 md:px-5 md:py-5 hover:border-blue-200 hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-slate-500">{title}</p>
            <h2 className="mt-2 md:mt-3 text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{value}</h2>
            <div className="mt-3 md:mt-4 inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] md:text-xs font-semibold text-emerald-600">
              <TrendingUp size={12} /> {growth}
            </div>
          </div>
          <div className={`rounded-xl md:rounded-2xl p-2.5 md:p-3 ${iconClassName}`}>
            {icon}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    salesOrders: 0,
    manufacturingOrders: 0,
    inventoryValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null); // State untuk menangkap error

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setErrorMsg(null);

        if (!supabase) {
           throw new Error("Supabase client belum terinisialisasi. Cek file lib/supabase.js");
        }

        // Jalankan query satu per satu agar jika satu gagal, kita tahu yang mana
        
        let pCount = 0;
        let sCount = 0;
        let mCount = 0;

        // 1. Produk
        try {
           const { count, error } = await supabase.from('produk').select('*', { count: 'exact', head: true });
           if(error) throw error;
           pCount = count || 0;
        } catch (e) {
           console.error("Gagal ambil produk:", e);
        }

        // 2. Sales Orders (berdasarkan screenshot, tabelnya 'sales_orders')
        try {
           const { count, error } = await supabase.from('sales_orders').select('*', { count: 'exact', head: true });
           if(error) throw error;
           sCount = count || 0;
        } catch (e) {
           console.error("Gagal ambil sales_orders:", e);
        }

        // 3. Manufacturing Orders (berdasarkan screenshot, tabelnya 'manufacturing_orders')
        try {
           const { count, error } = await supabase.from('manufacturing_orders').select('*', { count: 'exact', head: true });
           if(error) throw error;
           mCount = count || 0;
        } catch (e) {
           console.error("Gagal ambil manufacturing_orders:", e);
        }

        // KARENA SAYA TIDAK MELIHAT TABEL 'accounts' DI SCREENSHOT, 
        // SAYA SET INVENTORY VALUE JADI 0 SEMENTARA AGAR TIDAK CRASH.
        // Nanti sesuaikan dengan tabel yang benar untuk nilai inventory.
        
        setStats({
          totalProducts: pCount,
          salesOrders: sCount,
          manufacturingOrders: mCount,
          inventoryValue: 0, 
        });

      } catch (error) {
        console.error("Fatal error:", error);
        setErrorMsg(error.message); // Tampilkan error di layar
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const formatRupiah = (val) => {
    if (val === 0) return "Rp 0";
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(0)}JT`;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Jika ada error fatal, tampilkan pesan ini alih-alih layar blank
  if (errorMsg) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-200">
         <AlertTriangle className="mx-auto mb-2" size={32} />
         <h2 className="font-bold text-lg">Gagal Memuat Dashboard</h2>
         <p className="text-sm mt-1">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 md:gap-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 md:gap-5">
        <StatsCard
          title="Total Products"
          value={loading ? "..." : stats.totalProducts}
          growth="+0%"
          icon={<Package className="h-5 w-5 md:h-[22px] md:w-[22px]" />}
          iconClassName="bg-blue-50 text-blue-600"
          linkTo="/inventory"
        />
        <StatsCard
          title="Sales Orders"
          value={loading ? "..." : stats.salesOrders}
          growth="+0%"
          icon={<ShoppingCart className="h-5 w-5 md:h-[22px] md:w-[22px]" />}
          iconClassName="bg-emerald-50 text-emerald-600"
          linkTo="/sales"
        />
        <StatsCard
          title="Manufacturing Orders"
          value={loading ? "..." : stats.manufacturingOrders}
          growth="+0%"
          icon={<Factory className="h-5 w-5 md:h-[22px] md:w-[22px]" />}
          iconClassName="bg-orange-50 text-orange-600"
          linkTo="/manufacturing"
        />
        <StatsCard
          title="Inventory Value"
          value={loading ? "..." : formatRupiah(stats.inventoryValue)}
          growth="+0%"
          icon={<Boxes className="h-5 w-5 md:h-[22px] md:w-[22px]" />}
          iconClassName="bg-purple-50 text-purple-600"
          linkTo="/finance"
        />
      </div>

      {/* SISA KONTEN DASHBOARD SAMA SEPERTI SEBELUMNYA */}
       <div className="grid grid-cols-1 gap-5 md:gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 md:px-6 md:py-5">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-slate-900">Recent Activities</h2>
              <p className="mt-0.5 md:mt-1 text-xs md:text-sm text-slate-500">Latest updates</p>
            </div>
            <button className="flex items-center gap-1.5 md:gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              View All <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between px-4 py-3.5 md:px-6 md:py-5">
              <div>
                <h3 className="text-sm md:text-base font-medium text-slate-900">System Ready</h3>
                <p className="mt-0.5 text-xs md:text-sm text-slate-500">Menunggu aktivitas</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="border-b border-slate-200 px-4 py-4 md:px-6 md:py-5">
            <h2 className="text-base md:text-lg font-semibold text-slate-900">Quick Summary</h2>
            <p className="mt-0.5 md:mt-1 text-xs md:text-sm text-slate-500">Overview</p>
          </div>
          <div className="space-y-4 md:space-y-5 p-4 md:p-6">
             <div className="flex items-center justify-between mb-1.5 md:mb-2">
                  <span className="text-xs md:text-sm text-slate-600">Stock Availability</span>
                  <span className="text-xs md:text-sm font-semibold text-slate-900">100%</span>
             </div>
             <div className="h-1.5 md:h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: "100%" }} />
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
