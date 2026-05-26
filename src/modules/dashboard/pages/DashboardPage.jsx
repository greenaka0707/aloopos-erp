import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Boxes,
  Factory,
  Package,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

// PASTIKAN PATH INI SESUAI DENGAN FILE SUPABASE CLIENT ANDA
import { supabase } from "@/lib/supabase"; 
import Card from "@/shared/components/Card";

/* ===================================================== */
/* STATS CARD COMPONENT */
/* ===================================================== */

function StatsCard({ title, value, icon, growth, iconClassName = "", linkTo }) {
  return (
    <Link
      to={linkTo}
      className="block transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
    >
      <Card
        className="
          relative
          overflow-hidden
          px-4
          py-4
          md:px-5
          md:py-5
          hover:border-blue-200
          hover:shadow-md
          transition-all
        "
      >
        <div className="flex items-start justify-between">
          {/* LEFT */}
          <div>
            <p className="text-xs md:text-sm font-medium text-slate-500">
              {title}
            </p>

            <h2 className="mt-2 md:mt-3 text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              {value}
            </h2>

            <div className="mt-3 md:mt-4 inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] md:text-xs font-semibold text-emerald-600">
              <TrendingUp size={12} />
              {growth}
            </div>
          </div>

          {/* RIGHT */}
          <div className={`rounded-xl md:rounded-2xl p-2.5 md:p-3 ${iconClassName}`}>
            {icon}
          </div>
        </div>
      </Card>
    </Link>
  );
}

/* ===================================================== */
/* MAIN DASHBOARD PAGE */
/* ===================================================== */

export default function DashboardPage() {
  // 1. STATE UNTUK MENAMPUNG DATA ASLI DARI SUPABASE
  const [stats, setStats] = useState({
    totalProducts: 0,
    salesOrders: 0,
    manufacturingOrders: 0,
    inventoryValue: 0,
  });
  
  // State untuk menangani loading
  const [loading, setLoading] = useState(true);

  // 2. FUNGSI UNTUK MENGAMBIL DATA DARI SUPABASE
  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      
      try {
        // Mengambil data secara paralel agar lebih cepat
        const [
          { count: productsCount, error: errProd },
          { count: salesCount, error: errSales },
          { count: manufacturingCount, error: errMfg },
          { data: accountsData, error: errAcc }
        ] = await Promise.all([
          // Ganti 'produk' dengan nama tabel produk Anda yang sebenarnya jika berbeda
          supabase.from('produk').select('*', { count: 'exact', head: true }),
          // Ganti 'sales_orders' dengan nama tabel sales Anda yang sebenarnya
          supabase.from('sales_orders').select('*', { count: 'exact', head: true }),
          // Ganti 'manufacturing_orders' dengan nama tabel manufacturing Anda
          supabase.from('manufacturing_orders').select('*', { count: 'exact', head: true }),
          // Ganti 'accounts' dengan nama tabel keuangan Anda
          supabase.from('accounts').select('balance') 
        ]);

        // Cek jika ada error dari Supabase (Opsional: bisa di log ke console)
        if (errProd) console.error("Error fetch produk:", errProd);
        
        // Update state dengan data yang berhasil diambil
        setStats({
          totalProducts: productsCount || 0,
          salesOrders: salesCount || 0,
          manufacturingOrders: manufacturingCount || 0,
          inventoryValue: accountsData?.reduce((acc, cur) => acc + (cur.balance || 0), 0) || 0,
        });

      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Helper untuk memformat angka menjadi Rupiah (misal: Rp 248.000.000)
  const formatRupiah = (val) => {
    if (val === 0) return "Rp 0";
    // Jika angkanya dalam jutaan, Anda bisa memodifikasi format ini (misal Rp 248JT)
    if (val >= 1000000) {
      return `Rp ${(val / 1000000).toFixed(0)}JT`;
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="flex flex-col gap-5 md:gap-8">
      {/* ===================================================== */}
      {/* STATS */}
      {/* ===================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 md:gap-5">
        <StatsCard
          title="Total Products"
          value={loading ? "..." : stats.totalProducts}
          growth="+12.5%"
          icon={<Package className="h-5 w-5 md:h-[22px] md:w-[22px]" />}
          iconClassName="bg-blue-50 text-blue-600"
          linkTo="/inventory"
        />

        <StatsCard
          title="Sales Orders"
          value={loading ? "..." : stats.salesOrders}
          growth="+8.2%"
          icon={<ShoppingCart className="h-5 w-5 md:h-[22px] md:w-[22px]" />}
          iconClassName="bg-emerald-50 text-emerald-600"
          linkTo="/sales"
        />

        <StatsCard
          title="Manufacturing Orders"
          value={loading ? "..." : stats.manufacturingOrders}
          growth="+4.8%"
          icon={<Factory className="h-5 w-5 md:h-[22px] md:w-[22px]" />}
          iconClassName="bg-orange-50 text-orange-600"
          linkTo="/manufacturing"
        />

        <StatsCard
          title="Inventory Value"
          value={loading ? "..." : formatRupiah(stats.inventoryValue)}
          growth="+18.1%"
          icon={<Boxes className="h-5 w-5 md:h-[22px] md:w-[22px]" />}
          iconClassName="bg-purple-50 text-purple-600"
          linkTo="/finance"
        />
      </div>

      {/* ===================================================== */}
      {/* DASHBOARD CONTENT (Recent Activities & Quick Summary) */}
      {/* ===================================================== */}

      <div className="grid grid-cols-1 gap-5 md:gap-6 xl:grid-cols-3">
        {/* ===================================================== */}
        {/* ACTIVITY */}
        {/* ===================================================== */}

        <Card className="xl:col-span-2">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 md:px-6 md:py-5">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-slate-900">
                Recent Activities
              </h2>
              <p className="mt-0.5 md:mt-1 text-xs md:text-sm text-slate-500">
                Latest manufacturing & inventory updates
              </p>
            </div>

            <button className="flex items-center gap-1.5 md:gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              View All
              <ArrowUpRight size={16} />
            </button>
          </div>

          {/* LIST */}
          <div className="divide-y divide-slate-100">
            {[
              {
                title: "Production completed",
                desc: "RB Robusta Dampit Grade A",
                time: "2 minutes ago",
              },
              {
                title: "New sales order created",
                desc: "SO-1779702973432",
                time: "15 minutes ago",
              },
              {
                title: "Stock updated",
                desc: "GB Dampit Rjiect (Pixel)",
                time: "32 minutes ago",
              },
              {
                title: "Purchase order received",
                desc: "PO-1779702709961",
                time: "1 hour ago",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-3.5 md:px-6 md:py-5 transition hover:bg-slate-50"
              >
                <div>
                  <h3 className="text-sm md:text-base font-medium text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-xs md:text-sm text-slate-500">
                    {item.desc}
                  </p>
                </div>

                <span className="text-xs md:text-sm text-slate-400">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* ===================================================== */}
        {/* QUICK SUMMARY */}
        {/* ===================================================== */}

        <Card>
          {/* HEADER */}
          <div className="border-b border-slate-200 px-4 py-4 md:px-6 md:py-5">
            <h2 className="text-base md:text-lg font-semibold text-slate-900">
              Quick Summary
            </h2>
            <p className="mt-0.5 md:mt-1 text-xs md:text-sm text-slate-500">
              Operational overview
            </p>
          </div>

          {/* CONTENT */}
          <div className="space-y-4 md:space-y-5 p-4 md:p-6">
            {[
              { label: "Stock Availability", value: "98%" },
              { label: "Production Efficiency", value: "92%" },
              { label: "Order Completion", value: "87%" },
              { label: "Warehouse Capacity", value: "68%" },
            ].map((item, index) => (
              <div key={index}>
                <div className="mb-1.5 md:mb-2 flex items-center justify-between">
                  <span className="text-xs md:text-sm text-slate-600">
                    {item.label}
                  </span>
                  <span className="text-xs md:text-sm font-semibold text-slate-900">
                    {item.value}
                  </span>
                </div>

                <div className="h-1.5 md:h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: item.value }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}