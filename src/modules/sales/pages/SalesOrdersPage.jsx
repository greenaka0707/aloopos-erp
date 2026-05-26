import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Search, 
  Calendar, 
  Download, 
  Plus, 
  ChevronRight,
  FileText
} from "lucide-react";

// Hapus Table import jika memang sudah tidak dipakai untuk mengurangi beban
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
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
  
  // Filter States
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

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

    if (dateFilter) {
      // Asumsi format tanggal YYYY-MM-DD
      data = data.filter((order) => {
        if (!order.created_at) return false;
        return order.created_at.startsWith(dateFilter);
      });
    }

    return data;
  }, [orders, activeTab, search, dateFilter]);

  // ========================================
  // PREPARE & SUMMARY
  // ========================================

  const preparedOrders = useMemo(() => {
    return filteredOrders.map((order) => {
      const totals = calculateOrderTotals(order);
      return { ...order, ...totals };
    });
  }, [filteredOrders]);

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
  // LOADING STATE
  // ========================================

  if (loading) {
    return (
      <div className="min-w-0 space-y-4">
        {/* Mockup Sticky Header Loading */}
        <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
        
        {/* Mockup Summary Loading */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
        
        {/* Mockup List Loading */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="min-w-0 pb-24 lg:pb-8"> {/* pb-24 untuk space FAB mobile */}
      
      {/* ================================================= */}
      {/* STICKY HEADER (Search, Filters, Download, Tabs) */}
      {/* ================================================= */}
      
      <div className="sticky top-0 z-20 -mx-5 px-5 pb-4 pt-2 bg-slate-100 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 md:p-4 border border-slate-200 shadow-sm">
          
          {/* Top Actions: Search & Icon Buttons */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
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

            {/* Date Filter (Native Date Picker Wrapper) */}
            <div className="relative flex-shrink-0">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100">
                <Calendar size={16} />
              </button>
            </div>

            {/* Download Button */}
            <button 
              onClick={() => console.log("Download Data")}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
            >
              <Download size={16} />
            </button>
          </div>

          {/* Tabs */}
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
      {/* SUMMARY CARDS */}
      {/* ================================================= */}
      
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        <SummaryCard title="Total Revenue" value={formatRupiah(summary.revenue)} />
        <SummaryCard title="Total HPP" value={formatRupiah(summary.hpp)} />
        <SummaryCard
          title="Gross Profit"
          value={formatRupiah(summary.profit)}
          valueClass="text-emerald-600"
        />
      </div>

      {/* ================================================= */}
      {/* LIST DATA (MOBILE CARDS) */}
      {/* ================================================= */}
      
      <div className="mt-4 space-y-3">
        {preparedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-4 text-center">
            <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400">
              <FileText size={24} />
            </div>
            <h2 className="text-base font-semibold text-slate-900">No Sales Orders Found</h2>
            <p className="mt-1 text-sm text-slate-500">
              {search || dateFilter ? "Try adjusting your filters" : "Create your first sales order"}
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
                
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-blue-600 md:text-base">
                      {order.so_number}
                    </h3>
                    <p className="mt-0.5 text-xs font-medium text-slate-600 md:text-sm truncate max-w-[180px] md:max-w-xs">
                      {order.customer_name}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] md:text-xs font-semibold uppercase tracking-wide ${getStatusClass(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Card Footer */}
                <div className="flex items-end justify-between pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] md:text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Total Revenue
                    </p>
                    <p className="mt-0.5 text-sm md:text-base font-bold text-slate-900">
                      {formatRupiah(order.revenue)}
                    </p>
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                    <ChevronRight size={16} />
                  </div>
                </div>

              </div>
            </button>
          ))
        )}
      </div>

      {/* ================================================= */}
      {/* FAB: CREATE BUTTON (Mobile Optimized) */}
      {/* ================================================= */}
      
      <div className="fixed bottom-6 right-5 z-40 lg:bottom-8 lg:right-8">
        <button
          onClick={() => navigate("/sales/create")}
          className="flex items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-orange-600 active:scale-95"
        >
          <Plus size={20} strokeWidth={2.5} />
          {/* Teks hanya muncul di tablet/desktop, di HP hanya icon + */}
          <span className="hidden md:block pr-2">Create Order</span>
        </button>
      </div>

    </div>
  );
}

// ========================================
// REUSABLE SUB-COMPONENTS
// ========================================

function SummaryCard({ title, value, valueClass = "" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
      <p className="text-xs font-medium text-slate-500 md:text-sm">
        {title}
      </p>
      <p
        className={`mt-1.5 truncate text-xl font-bold text-slate-900 md:text-2xl ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}