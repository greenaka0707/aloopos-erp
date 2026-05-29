import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Download, Plus } from "lucide-react";

import DataTable from "@/shared/components/desktop/DataTable";
import PageHeader from "@/shared/components/desktop/PageHeader";
import Toolbar from "@/shared/components/desktop/Toolbar";
import StatCard from "@/shared/components/desktop/StatCard";
import DesktopTabs from "@/shared/components/desktop/DesktopTabs";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { getSalesOrders } from "../services/sales.service";

/* ===================================================== */
/* CONSTANTS & HELPERS */
/* ===================================================== */

const TABS = ["All", "Pending", "Dikemas", "Dikirim", "Completed", "Void"];

function formatRupiah(value = 0) {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}

function calculateOrderTotals(order) {
  const revenue = order.items?.reduce((sum, item) => sum + Number(item.subtotal || 0), 0) || 0;
  const hpp = order.items?.reduce((sum, item) => sum + Number(item.total_hpp || 0), 0) || 0;

  return {
    revenue,
    hpp,
    profit: revenue - hpp,
  };
}

function getStatusClass(status) {
  switch (status?.toUpperCase()) {
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

/* ===================================================== */
/* COMPONENT */
/* ===================================================== */

export default function SalesOrdersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "All"
  );

  /* ===================================================== */
  /* LOAD DATA */
  /* ===================================================== */
  
  async function loadOrders() {
    try {
      setLoading(true);
      const data = await getSalesOrders();
      setOrders(data || []);
    } catch (error) {
      console.error("Error loading sales orders:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  /* ===================================================== */
  /* PREPARED & FILTERED DATA */
  /* ===================================================== */

  // Hitung total nilai di awal agar tidak dihitung ulang di fungsi filter maupun summary
  const processedOrders = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      ...calculateOrderTotals(order),
    }));
  }, [orders]);

 const filteredOrders = useMemo(() => {
  const keyword = search.trim().toLowerCase();
  const tabUpper = activeTab.toUpperCase();

  return processedOrders.filter((order) => {
    const orderDate = order.created_at
      ? new Date(order.created_at)
      : null;

    const matchTab =
      activeTab === "All" ||
      order.status === tabUpper;

    const matchSearch =
      !keyword ||
      String(order.so_number || "")
        .toLowerCase()
        .includes(keyword) ||
      String(order.customer_name || "")
        .toLowerCase()
        .includes(keyword);

    const matchFrom =
      !dateFrom ||
      (orderDate &&
        orderDate >= new Date(dateFrom));

    const matchTo =
      !dateTo ||
      (orderDate &&
        orderDate <= new Date(`${dateTo}T23:59:59`));

    return (
      matchTab &&
      matchSearch &&
      matchFrom &&
      matchTo
    );
  });
}, [
  processedOrders,
  activeTab,
  search,
  dateFrom,
  dateTo,
]);

  /* ===================================================== */
  /* SUMMARY & COUNTS */
  /* ===================================================== */

  const summary = useMemo(() => {
    return filteredOrders.reduce(
      (acc, order) => {
        acc.revenue += order.revenue;
        acc.hpp += order.hpp;
        acc.profit += order.profit;
        return acc;
      },
      { revenue: 0, hpp: 0, profit: 0 }
    );
  }, [filteredOrders]);

  // Optimalisasi kalkulasi jumlah tab menggunakan single pass .reduce()
  const tabCounts = useMemo(() => {
    const counts = TABS.reduce((acc, tab) => ({ ...acc, [tab]: 0 }), { All: orders.length });
    
    orders.forEach((order) => {
      // Menyesuaikan format status database ke format capitalized array TABS
      const currentStatus = order.status?.charAt(0) + order.status?.slice(1).toLowerCase();
      if (currentStatus in counts) {
        counts[currentStatus] += 1;
      }
    });
    
    return counts;
  }, [orders]);

  /* ===================================================== */
  /* COLUMNS DEFINITION */
  /* ===================================================== */

  const columns = useMemo(() => [
    { key: "so_number", label: "SO Number" },
    { key: "customer_name", label: "Customer" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusClass(row.status)}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: "revenue",
      label: "Revenue",
      render: (row) => formatRupiah(row.revenue),
    },
    {
      key: "profit",
      label: "Profit",
      render: (row) => (
        <span className={row.profit >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-red-600"}>
          {formatRupiah(row.profit)}
        </span>
      ),
    },
  ], []);

  /* ===================================================== */
  /* EXPORT PDF */
  /* ===================================================== */

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Sales Orders Report", 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Status: ${activeTab}`, 14, 30);

      doc.text(
  `Periode: ${dateFrom || "-"} s/d ${dateTo || "-"}`,
  14,
  36
);

      const tableColumn = ["SO Number", "Customer", "Date", "Status", "Revenue", "Profit"];
      console.log("PDF DATA", filteredOrders);
      const tableRows = filteredOrders.map((order) => [
        order.so_number,
        order.customer_name,
        order.created_at ? order.created_at.split("T")[0] : "-",
        order.status,
        formatRupiah(order.revenue),
        formatRupiah(order.profit),
      ]);

      // Baris total akumulasi di bagian bawah
      tableRows.push([
        "", "", "", "TOTAL",
        formatRupiah(summary.revenue),
        formatRupiah(summary.profit),
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 42,
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: { 4: { halign: "right" }, 5: { halign: "right" } },
      });

      doc.save(`SO_Report_${activeTab}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Sedang memuat sistem PDF, silakan coba lagi.");
    }
  };

  /* ===================================================== */
  /* RENDERING VIEW */
  /* ===================================================== */

  if (loading) {
    return (
      <div className="space-y-3 pb-32">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-[120px] animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        description="Manage sales order transactions"
        actions={
          <button
            onClick={() => navigate("/sales/create")}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            <Plus size={16} />
            Tambah Order
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard title="Revenue" value={formatRupiah(summary.revenue)} />
        <StatCard title="HPP" value={formatRupiah(summary.hpp)} />
        <StatCard title="Profit" value={formatRupiah(summary.profit)} />
      </div>

      <DesktopTabs
        tabs={TABS.map((tab) => `${tab} (${tabCounts[tab] || 0})`)}
        value={`${activeTab} (${tabCounts[activeTab] || 0})`}
        onChange={(value) => {
          const cleanValue = value.replace(/\s\(\d+\)$/, "");
          setActiveTab(cleanValue);
        }}
      />

    <Toolbar
  left={
    <div className="flex items-center gap-3">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={search}
          placeholder="Cari SO atau Customer..."
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-[260px] rounded-lg border border-slate-300 pl-10 pr-3 text-sm"
        />
      </div>

      <input
        type="date"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
        className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
      />

      <input
        type="date"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
      />

      <button
        onClick={() => {
          setSearch("");
          setDateFrom("");
          setDateTo("");
          setActiveTab("All");
        }}
        className="h-10 rounded-lg border border-slate-300 px-4 text-sm hover:bg-slate-50"
      >
        Reset
      </button>
    </div>
  }
  right={
    <button
      onClick={handleDownloadPDF}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm"
    >
      <Download size={16} />
      Export PDF
    </button>
  }
/>
      <DataTable
  columns={columns}
  data={filteredOrders}
  emptyMessage="Belum ada Sales Order"
  onRowClick={(row) => {
    console.log("ROW:", row);
    navigate(`/sales/orders/${row.id}`);
  }}
/>
    </div>
  );
}
