import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Search, 
  Calendar, 
  Download, 
  Plus, 
  FileText
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import Tabs from "@/shared/components/Tabs";
import { getSalesOrders } from "../services/sales.service";

const TABS = ["All", "Pending", "Dikemas", "Dikirim", "Completed", "Void"];

function formatRupiah(value = 0) {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}

function calculateOrderTotals(order) {
  const revenue = order.items?.reduce((sum, item) => sum + Number(item.subtotal || 0), 0) || 0;
  const hpp = order.items?.reduce((sum, item) => sum + Number(item.total_hpp || 0), 0) || 0;
  return { revenue, hpp, profit: revenue - hpp };
}

function getStatusClass(status) {
  switch (status) {
    case "COMPLETED": return "bg-emerald-100 text-emerald-700";
    case "DIKEMAS": return "bg-orange-100 text-orange-700";
    case "DIKIRIM": return "bg-blue-100 text-blue-700";
    case "VOID": return "bg-red-100 text-red-700";
    default: return "bg-yellow-100 text-yellow-700";
  }
}

export default function SalesOrdersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "All");
  
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

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
      data = data.filter((order) => {
        if (!order.created_at) return false;
        return order.created_at.startsWith(dateFilter);
      });
    }

    return data;
  }, [orders, activeTab, search, dateFilter]);

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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text("SALES ORDERS REPORT", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Filter Date: ${dateFilter || "All"} | Status Tab: ${activeTab}`, 14, 27);

    const tableColumn = ["SO Number", "Customer Name", "Status", "Revenue", "Gross Profit"];
    const tableRows = [];

    preparedOrders.forEach((order) => {
      tableRows.push([
        order.so_number || "-",
        order.customer_name || "-",
        order.status || "-",
        formatRupiah(order.revenue),
        formatRupiah(order.profit),
      ]);
    });

    tableRows.push(["TOTAL", "", "", formatRupiah(summary.revenue), formatRupiah(summary.profit)]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 33,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
      columnStyles: { 3: { halign: "right" }, 4: { halign: "right" } },
      didParseCell: (data) => {
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    doc.save(`Sales_Report_${dateFilter || "All"}_${activeTab}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-w-0 space-y-4 p-4">
        <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-200" />)}
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-200" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 pb-24 lg:pb-8 relative">
      
      <div className="sticky top-[75px] z-20 -mx-5 px-5 pb-3 pt-2 bg-slate-100 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 border border-slate-200 shadow-sm">
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search Customer or SO..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="relative flex-shrink-0">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <button 
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                  dateFilter ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <Calendar size={16} />
              </button>
            </div>

            <button 
              onClick={handleDownloadPDF}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition active:bg-slate-200"
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

      <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-3 md:gap-4 px-1">
        <SummaryCard title="Total Revenue" value={formatRupiah(summary.revenue)} />
        <SummaryCard title="Total HPP" value={formatRupiah(summary.hpp)} />
        <SummaryCard
          title="Gross Profit"
          value={formatRupiah(summary.profit)}
          valueClass="text-emerald-600"
        />
      </div>

      <div className="mt-4 space-y-2 px-1">
        {preparedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-14 px-4 text-center">
            <FileText size={24} className="text-slate-400 mb-2" />
            <h2 className="text-sm font-semibold text-slate-900">No Sales Orders Found</h2>
            <p className="text-xs text-slate-500 mt-0.5">Try adjusting your filters</p>
          </div>
        ) : (
          preparedOrders.map((order) => (
            <button
              key={order.id}
              onClick={() => navigate(`/sales/orders/${order.id}`)}
              className="w-full text-left transition-transform duration-150 active:scale-[0.99]"
            >
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm flex flex-col gap-1">
                
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 text-sm md:text-base truncate pr-2">
                    {order.customer_name || "Unknown Customer"}
                  </h3>
                  <span className="font-bold text-slate-900 text-sm md:text-base flex-shrink-0">
                    {formatRupiah(order.revenue)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-blue-600 truncate">
                    {order.so_number}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getStatusClass(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>

              </div>
            </button>
          ))
        )}
      </div>

      <div className="fixed bottom-6 right-5 z-40 lg:bottom-8 lg:right-8">
        <button
          onClick={() => navigate("/sales/create")}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-transform active:scale-95 md:h-auto md:w-auto md:px-5 md:py-3.5 md:rounded-xl"
        >
          <Plus size={22} strokeWidth={2.5} />
          <span className="hidden md:block md:ml-2 text-sm font-semibold">Create Order</span>
        </button>
      </div>

    </div>
  );
}

function SummaryCard({ title, value, valueClass = "" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <p className="text-[11px] font-medium text-slate-500">
        {title}
      </p>
      <p className={`mt-0.5 truncate text-base font-bold text-slate-900 md:text-xl ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}