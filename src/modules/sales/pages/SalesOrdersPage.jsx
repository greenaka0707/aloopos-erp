import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  Search,
  Download,
  Plus,
} from "lucide-react";

import DataTable from "@/shared/components/desktop/DataTable";
import PageHeader from "@/shared/components/desktop/PageHeader";
import Toolbar from "@/shared/components/desktop/Toolbar";
import StatCard from "@/shared/components/desktop/StatCard";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import DesktopTabs from "@/shared/components/desktop/DesktopTabs";

import { getSalesOrders } from "../services/sales.service";

/* ===================================================== */
/* CONSTANTS */
/* ===================================================== */

const TABS = [
  "All",
  "Pending",
  "Dikemas",
  "Dikirim",
  "Completed",
  "Void",
];

/* ===================================================== */
/* HELPERS */
/* ===================================================== */

function formatRupiah(value = 0) {
  return `Rp ${Math.round(value).toLocaleString(
    "id-ID",
  )}`;
}

function calculateOrderTotals(order) {
  const revenue =
    order.items?.reduce(
      (sum, item) =>
        sum +
        Number(item.subtotal || 0),
      0,
    ) || 0;

  const hpp =
    order.items?.reduce(
      (sum, item) =>
        sum +
        Number(item.total_hpp || 0),
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

/* ===================================================== */
/* COMPONENT */
/* ===================================================== */

export default function SalesOrdersPage() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const [loading, setLoading] =
    useState(true);

  const [orders, setOrders] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [activeTab, setActiveTab] =
    useState(
      searchParams.get("tab") || "All",
    );

  /* ===================================================== */
  /* LOAD DATA */
  /* ===================================================== */

  async function loadOrders() {
    try {
      setLoading(true);

      const data =
        await getSalesOrders();

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

  /* ===================================================== */
  /* FILTERED DATA */
  /* ===================================================== */

  const filteredOrders = useMemo(() => {
    let data = [...orders];

    if (activeTab !== "All") {
      data = data.filter(
        (order) =>
          order.status ===
          activeTab.toUpperCase(),
      );
    }

    if (search.trim()) {
      const keyword =
        search.toLowerCase();

      data = data.filter(
        (order) =>
          String(order.so_number || "")
            .toLowerCase()
            .includes(keyword) ||
          String(
            order.customer_name || "",
          )
            .toLowerCase()
            .includes(keyword),
      );
    }

    return data;
  }, [orders, activeTab, search]);

  /* ===================================================== */
  /* PREPARED DATA */
  /* ===================================================== */

  const preparedOrders = useMemo(() => {
    return filteredOrders.map(
      (order) => {
        const totals =
          calculateOrderTotals(order);

        return {
          ...order,
          ...totals,
        };
      },
    );
  }, [filteredOrders]);

  /* ===================================================== */
  /* SUMMARY */
  /* ===================================================== */

  const summary = useMemo(() => {
    return preparedOrders.reduce(
      (acc, order) => {
        acc.revenue +=
          order.revenue;

        acc.hpp += order.hpp;

        acc.profit +=
          order.profit;

        return acc;
      },
      {
        revenue: 0,
        hpp: 0,
        profit: 0,
      },
    );
  }, [preparedOrders]);

  /* ===================================================== */
  /* TAB COUNTS */
  /* ===================================================== */

  const tabCounts = useMemo(() => {
    return {
      All: orders.length,

      Pending: orders.filter(
        (o) =>
          o.status === "PENDING",
      ).length,

      Dikemas: orders.filter(
        (o) =>
          o.status === "DIKEMAS",
      ).length,

      Dikirim: orders.filter(
        (o) =>
          o.status === "DIKIRIM",
      ).length,

      Completed: orders.filter(
        (o) =>
          o.status === "COMPLETED",
      ).length,

      Void: orders.filter(
        (o) => o.status === "VOID",
      ).length,
    };
  }, [orders]);


  const columns = [
  {
    key: "so_number",
    label: "SO Number",
  },

  {
    key: "customer_name",
    label: "Customer",
  },

  {
    key: "status",
    label: "Status",

    render: (row) => (
      <span
        className={`
          inline-flex
          rounded-full
          px-2 py-1
          text-xs
          font-semibold
          ${getStatusClass(row.status)}
        `}
      >
        {row.status}
      </span>
    ),
  },

  {
    key: "revenue",
    label: "Revenue",

    render: (row) =>
      formatRupiah(row.revenue),
  },

  {
    key: "profit",
    label: "Profit",

    render: (row) => (
      <span
        className={
          row.profit >= 0
            ? "font-semibold text-emerald-600"
            : "font-semibold text-red-600"
        }
      >
        {formatRupiah(row.profit)}
      </span>
    ),
  },

  {
    key: "detail",
    label: "Action",

    render: (row) => (
      <button
        onClick={() =>
          navigate(
            `/sales/orders/${row.id}`,
          )
        }
        className="
          text-blue-600
          font-medium
        "
      >
        Detail
      </button>
    ),
  },
];
  /* ===================================================== */
  /* DOWNLOAD PDF */
  /* ===================================================== */

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);

      doc.text(
        "Sales Orders Report",
        14,
        22,
      );

      doc.setFontSize(11);

      doc.setTextColor(100);

      doc.text(
        `Status: ${activeTab}`,
        14,
        30,
      );

      const tableColumn = [
        "SO Number",
        "Customer",
        "Date",
        "Status",
        "Revenue",
        "Profit",
      ];

      const tableRows = [];

      preparedOrders.forEach(
        (order) => {
          const orderDate =
            order.created_at
              ? order.created_at.split(
                  "T",
                )[0]
              : "-";

          tableRows.push([
            order.so_number,
            order.customer_name,
            orderDate,
            order.status,
            formatRupiah(
              order.revenue,
            ),
            formatRupiah(
              order.profit,
            ),
          ]);
        },
      );

      tableRows.push([
        "",
        "",
        "",
        "TOTAL",
        formatRupiah(
          summary.revenue,
        ),
        formatRupiah(
          summary.profit,
        ),
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
          fillColor: [
            41, 128, 185,
          ],
        },

        columnStyles: {
          4: {
            halign: "right",
          },

          5: {
            halign: "right",
          },
        },
      });

      doc.save(
        `SO_Report_${activeTab}.pdf`,
      );
    } catch (error) {
      console.error(error);

      alert(
        "Sedang memuat sistem PDF, silakan coba lagi.",
      );
    }
  };

  /* ===================================================== */
  /* LOADING */
  /* ===================================================== */

  if (loading) {
    return (
      <div className="space-y-3 pb-32">
        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="
                h-[120px]
                animate-pulse
                rounded-2xl
                bg-slate-200
              "
            />
          ),
        )}
      </div>
    );
  }

  /* ===================================================== */
  /* RENDER */
  /* ===================================================== */

 return (
  <div className="space-y-6">

    <PageHeader
      title="Sales Orders"
      description="Manage sales order transactions"
      actions={
        <button
          onClick={() =>
            navigate("/sales/create")
          }
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            bg-blue-600
            px-4
            py-2
            text-sm
            font-medium
            text-white
          "
        >
          <Plus size={16} />
          Tambah Order
        </button>
      }
    />

    <div className="grid gap-4 lg:grid-cols-3">

      <StatCard
        title="Revenue"
        value={formatRupiah(summary.revenue)}
      />

      <StatCard
        title="HPP"
        value={formatRupiah(summary.hpp)}
      />

      <StatCard
        title="Profit"
        value={formatRupiah(summary.profit)}
      />

    </div>

    <DesktopTabs
      tabs={TABS.map(
        (tab) =>
          `${tab} (${tabCounts[tab]})`,
      )}
      value={`${activeTab} (${tabCounts[activeTab]})`}
      onChange={(value) => {
        const cleanValue =
          value.replace(
            /\s\(\d+\)$/,
            "",
          );

        setActiveTab(cleanValue);
      }}
    />

    <Toolbar
      left={
        <div className="relative">
          <Search
            size={16}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            type="text"
            value={search}
            placeholder="Cari SO atau Customer..."
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              h-10
              w-[320px]
              rounded-lg
              border
              border-slate-300
              pl-10
              pr-3
              text-sm
            "
          />
        </div>
      }

      right={
        <button
          onClick={handleDownloadPDF}
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            border
            border-slate-300
            px-4
            py-2
            text-sm
          "
        >
          <Download size={16} />
          Export PDF
        </button>
      }
    />

    <DataTable
      columns={columns}
      data={preparedOrders}
      emptyMessage="Belum ada Sales Order"
    />

  </div>
);

      {/* ======================================== */}
      {/* TABS */}
      {/* ======================================== */}

      <div className="mb-3 overflow-x-auto no-scrollbar">

        <div className="min-w-max">

          <DesktopTabs
            tabs={TABS.map(
              (tab) =>
                `${tab} (${tabCounts[tab]})`,
            )}

            value={`${activeTab} (${tabCounts[activeTab]})`}

            onChange={(value) => {
              const cleanValue =
                value.replace(
                  /\s\(\d+\)$/,
                  "",
                );

              setActiveTab(
                cleanValue,
              );
            }}
          />
        </div>
      </div>

     

    
