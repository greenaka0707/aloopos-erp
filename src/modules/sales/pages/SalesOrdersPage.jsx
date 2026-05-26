import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Search,
  Download,
  Plus,
  ChevronRight,
  FileText,
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import Tabs from "@/shared/components/Tabs";
import { getSalesOrders } from "../services/sales.service";

// ========================================
// CONSTANTS
// ========================================

const TABS = [
  "All",
  "Pending",
  "Dikemas",
  "Dikirim",
  "Completed",
  "Void",
];

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

  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "All",
  );

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
      data = data.filter(
        (order) => order.status === activeTab.toUpperCase(),
      );
    }

    if (search.trim()) {
      const keyword = search.toLowerCase();

      data = data.filter(
        (order) =>
          String(order.so_number || "")
            .toLowerCase()
            .includes(keyword) ||
          String(order.customer_name || "")
            .toLowerCase()
            .includes(keyword),
      );
    }

    return data;
  }, [orders, activeTab, search]);

  // ========================================
  // PREPARE DATA
  // ========================================

  const preparedOrders = useMemo(() => {
    return filteredOrders.map((order) => {
      const totals = calculateOrderTotals(order);

      return {
        ...order,
        ...totals,
      };
    });
  }, [filteredOrders]);

  // ========================================
  // SUMMARY
  // ========================================

  const summary = useMemo(() => {
    return preparedOrders.reduce(
      (acc, order) => {
        acc.revenue += order.revenue;
        acc.hpp += order.hpp;
        acc.profit += order.profit;

        return acc;
      },
      {
        revenue: 0,
        hpp: 0,
        profit: 0,
      },
    );
  }, [preparedOrders]);

  // ========================================
  // TAB COUNTS
  // ========================================

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

      const tableColumn = [
        "SO Number",
        "Customer",
        "Date",
        "Status",
        "Revenue",
        "Profit",
      ];

      const tableRows = [];

      preparedOrders.forEach((order) => {
        const orderDate = order.created_at
          ? order.created_at.split("T")[0]
          : "-";

        tableRows.push([
          order.so_number,
          order.customer_name,
          orderDate,
          order.status,
          formatRupiah(order.revenue),
          formatRupiah(order.profit),
        ]);
      });

      tableRows.push([
        "",
        "",
        "",
        "TOTAL:",
        formatRupiah(summary.revenue),
        formatRupiah(summary.profit),
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: "grid",

        styles: {
          fontSize: 9,
        },

        headStyles: {
          fillColor: [41, 128, 185],
        },

        columnStyles: {
          4: { halign: "right" },
          5: { halign: "right" },
        },
      });

      doc.save(`SO_Report_${activeTab}.pdf`);
    } catch (err) {
      alert(
        "Sedang memuat sistem PDF, silakan coba beberapa detik lagi.",
      );

      console.error(err);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="min-w-0 space-y-4 p-4">
        <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />

        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-w-0 pb-40">

      {/* ======================================== */}
      {/* TABS */}
      {/* ======================================== */}

      <div className="mb-4 overflow-x-auto no-scrollbar px-1">
        <div className="min-w-max">
          <Tabs
            tabs={TABS.map(
              (tab) => `${tab} (${tabCounts[tab]})`,
            )}

            value={`${activeTab} (${tabCounts[activeTab]})`}

            onChange={(value) => {
              const cleanValue = value.replace(
                /\s\(\d+\)/,
                "",
              );

              setActiveTab(cleanValue);
            }}
          />
        </div>
      </div>

      {/* ======================================== */}
      {/* LIST */}
      {/* ======================================== */}

      <div className="space-y-3 px-1">

        {preparedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-16 text-center">

            <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400">
              <FileText size={24} />
            </div>

            <h2 className="text-base font-semibold text-slate-900">
              No Sales Orders Found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {search
                ? "Try adjusting your filters"
                : "Create your first sales order"}
            </p>
          </div>
        ) : (
          preparedOrders.map((order) => (
            <button
              key={order.id}
              onClick={() =>
                navigate(`/sales/orders/${order.id}`)
              }
              className="
                w-full text-left
                transition-transform duration-200
                active:scale-[0.99]
              "
            >
              {/* ======================================== */}
              {/* CARD BASELINE */}
              {/* ======================================== */}

              <div
                className="
                  rounded-2xl
                  border border-slate-200
                  bg-white
                  p-3.5
                  shadow-sm
                "
              >

                {/* HEADER */}
                <div className="flex items-start justify-between gap-3">

                  {/* LEFT */}
                  <div className="min-w-0 flex-1">

                    <h3
                      className="
                        truncate
                        text-sm
                        font-bold
                        text-blue-600
                      "
                    >
                      {order.so_number}
                    </h3>

                    <p
                      className="
                        mt-0.5
                        text-[11px]
                        font-medium
                        uppercase
                        tracking-wider
                        text-slate-500
                      "
                    >
                      {order.customer_name || "Unknown Customer"}
                    </p>
                  </div>

                  {/* STATUS */}
                  <span
                    className={`
                      inline-flex items-center
                      rounded-full
                      px-2.5 py-1
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wide
                      ${getStatusClass(order.status)}
                    `}
                  >
                    {order.status}
                  </span>
                </div>

                {/* FOOTER */}
                <div
                  className="
                    mt-3
                    flex items-center justify-between
                    border-t border-slate-100
                    pt-3
                  "
                >

                  {/* LABEL */}
                  <div className="flex flex-col">

                    <span
                      className="
                        text-[10px]
                        font-medium
                        uppercase
                        text-slate-400
                      "
                    >
                      Total Revenue
                    </span>

                    <span
                      className="
                        mt-0.5
                        text-sm
                        font-bold
                        text-slate-900
                      "
                    >
                      {formatRupiah(order.revenue)}
                    </span>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-1">

                    <span
                      className={`
                        rounded-full
                        px-2 py-1
                        text-[10px]
                        font-semibold
                        ${
                          order.profit >= 0
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }
                      `}
                    >
                      {formatRupiah(order.profit)}
                    </span>

                    <ChevronRight
                      size={16}
                      className="text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* ======================================== */}
      {/* FLOATING SEARCH + ACTION */}
      {/* ======================================== */}

      <div
        className="
          fixed inset-x-0 bottom-0
          z-[9999]
          px-4
          pb-6
          md:px-6
        "
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3">

          {/* SEARCH */}
          <div className="relative flex-1">

            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
              <Search size={18} strokeWidth={2.5} />
            </div>

            <input
              type="text"
              placeholder="Search SO or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                h-14 w-full rounded-full
                border border-white/70
                bg-white
                pl-11 pr-4
                text-base
                shadow-[0_10px_35px_rgba(0,0,0,0.18)]
                focus:outline-none
                focus:ring-2
                focus:ring-orange-500/20
              "
            />
          </div>

          {/* PDF */}
          <button
            onClick={handleDownloadPDF}
            className="
              flex h-14 w-14 flex-shrink-0
              items-center justify-center
              rounded-full
              bg-white
              text-slate-700
              shadow-[0_10px_35px_rgba(0,0,0,0.15)]
              transition-all
              active:scale-95
            "
          >
            <Download size={22} strokeWidth={2.2} />
          </button>

          {/* FAB */}
          <button
            onClick={() => navigate("/sales/create")}
            className="
              flex h-14 w-14 flex-shrink-0
              items-center justify-center
              rounded-full
              bg-orange-500
              text-white
              shadow-[0_12px_30px_rgba(249,115,22,0.45)]
              transition-all
              active:scale-95
            "
          >
            <Plus size={28} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}