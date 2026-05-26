import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Search, 
  Download, 
  Plus, 
  ChevronRight,
  FileText
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import Tabs from "@/shared/components/Tabs";
import { getSalesOrders } from "../services/sales.service";

// ========================================
// CONSTANTS
// ========================================

const TABS = ["All", "Pending", "Dikemas", "Dikirim", "Completed", "Void"];

// ========================================
// HELPERS
// ========================================

function formatRupiah(value = 0) {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}

function calculateOrderTotals(order) {
  const revenue =
    order.items?.reduce(
      (sum, item) => sum + Number(item.subtotal || 0),
      0,
    ) || 0;

  const hpp =
    order.items?.reduce(
      (sum, item) => sum + Number(item.total_hpp || 0),
      0,
    ) || 0;

  return {
    revenue,
    hpp,
    profit: revenue - hpp,
  };
}

function getStatusClass(status) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700";
    case "DIKEMAS":
      return "bg-orange-100 text-orange-700";
    case "DIKIRIM":
      return "bg-blue-100 text-blue-700";
    case "VOID":
      return "bg-red-100 text-red-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

// ========================================
// COMPONENT
// ========================================

export default function SalesOrdersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "All");
  
  const [search, setSearch] = useState("");

  // ========================================
  // LOAD DATA
  // ========================================

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await getSalesOrders();
      setOrders(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // ========================================
  // FILTERED
  // ========================================

  const filteredOrders = useMemo(() => {
    let data = [...orders];

    if (activeTab !== "All") {
      data = data.filter((order) => order.status === activeTab.toUpperCase());
    }

    if (search.trim()) {
      const keyword = search.toLowerCase();
      data = data.filter(
        (order) =>
          String(order.so_number || "").toLowerCase().includes(keyword) ||
          String(order.customer_name || "").toLowerCase().includes(keyword),
      );
    }

    return data;
  }, [orders, activeTab, search]);

  // ========================================
  // PREPARE & SUMMARY
  // ========================================

  const preparedOrders = useMemo(() => {
    return filteredOrders.map((order) => {
      const totals = calculateOrderTotals(order);
      return { ...order, ...totals };
    });
  }, [filteredOrders]);

  // Summary dipertahankan hanya untuk kalkulasi PDF
  const summary = useMemo(() => {
    return preparedOrders.reduce(
      (acc, order) => {
        acc.revenue += order.revenue;
        acc.hpp += order.hpp;
        acc.profit += order.profit;
        return acc;
      },
      { revenue: 0, hpp: 0, profit: 0 },
    );
  }, [preparedOrders]);

  const tabCounts = useMemo(() => {
    return {
      All: orders.length,
      Pending: orders.filter((o) => o.status === "PENDING").length,
      Dikemas: orders.filter((o) => o.status === "DIKEMAS").length,
      Dikirim: orders.filter((o) => o.status === "DIKIRIM").length,
      Completed: orders.filter((o) => o.status === "COMPLETED").length,
      Void: orders.filter((o) => o.status === "VOID").length,
    };
  }, [orders]);

  // ========================================
  // DOWNLOAD PDF
  // ========================================

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("Sales Orders Report", 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      const filterInfo = `Status: ${activeTab}`;
      doc.text(filterInfo, 14, 30);

      const tableColumn = ["SO Number", "Customer", "Date", "Status", "Revenue", "Profit"];
      const tableRows = [];

      preparedOrders.forEach(order => {
        const orderDate = order.created_at ? order.created_at.split("T")[0] : "-";
        const orderData = [
          order.so_number,
          order.customer_name,
          orderDate,
          order.status,
          formatRupiah(order.revenue),
          formatRupiah(order.profit)
        ];
        tableRows.push(orderData);
      });

      // Baris Total
      tableRows.push(["", "", "", "TOTAL:", formatRupiah(summary.revenue), formatRupiah(summary.profit)]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: {
          4: { halign: 'right' },
          5: { halign: 'right' }
        }
      });

      const fileName = `SO_Report_${activeTab}.pdf`;
      doc.save(fileName);
    } catch (err) {
      alert("Sedang memuat sistem PDF, silakan coba beberapa detik lagi.");
      console.error(err);
    }
  };

  // ========================================
  // LOADING STATE
  // ========================================

  if (loading) {
    return (
      <div className="min-w-0 space-y-4 p-4">
        <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 pb-24 lg:pb-8 relative">
      
      {/* ================================================= */}
      {/* STICKY HEADER */}
      {/* ================================================= */}
      
      <div className="sticky top-[75px] z-20 -mx-5 px-5 pb-4 pt-2 bg-slate-100 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 md:p-4 border border-slate-200 shadow-sm">
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search SO or Customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button 
              onClick={handleDownloadPDF}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 active:bg-slate-200"
              title="Download PDF"
            >
              <Download size={16} />
            </button>
          </div>

          <div className="-mx-1 overflow-x-auto no-scrollbar">
            <div className="min-w-max px-1">
              <Tabs
                tabs={TABS.map((tab) => `${tab} (${tabCounts[tab]})`)}
                value={`${activeTab} (${tabCounts[activeTab]})`}
                onChange={(value) => {
                  const cleanValue = value.replace(/\s\(\d+\)/, "");
                  setActiveTab(cleanValue);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* LIST DATA */}
      {/* ================================================= */}
      
      <div className="mt-4 space-y-3 px-1">
        {preparedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-4 text-center">
            <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400">
              <FileText size={24} />
            </div>
            <h2 className="text-base font-semibold text-slate-900">No Sales Orders Found</h2>
            <p className="mt-1 text-sm text-slate-500">
              {search ? "Try adjusting your filters" : "Create your first sales order"}
            </p>
          </div>
        ) : (
          preparedOrders.map((order) => (
            <button
              key={order.id}
              onClick={() => navigate(`/sales/orders/${order.id}`)}
              className="w-full text-left transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-blue-600 md:text-lg truncate">
                    {order.so_number}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] md:text-xs font-semibold uppercase tracking-wide ${getStatusClass(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
                
                <p className="mt-1 text-sm text-slate-600 md:text-base">
                  {order.customer_name || "Unknown Customer"}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <p className="text-xs font-medium text-slate-500 md:text-sm">
                    TOTAL REVENUE
                  </p>
                  <div className="flex items-center gap-1 text-slate-900">
                    <p className="font-bold md:text-lg">
                      {formatRupiah(order.revenue)}
                    </p>
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* ================================================= */}
      {/* FAB: FIXED CREATE BUTTON */}
      {/* ================================================= */}
      
      <div className="fixed bottom-6 right-6 z-50 lg:bottom-8 lg:right-8">
        <button
          onClick={() => navigate("/sales/create")}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] transition-transform hover:scale-105 hover:bg-orange-600 active:scale-95 md:h-auto md:w-auto md:px-5 md:py-3.5 md:rounded-2xl"
        >
          <Plus size={24} strokeWidth={2.5} className="md:h-5 md:w-5" />
          <span className="hidden md:block md:ml-2 text-sm font-semibold">Create Order</span>
        </button>
      </div>

    </div>
  );
}