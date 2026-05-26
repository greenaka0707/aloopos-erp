import { useEffect, useMemo, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import Table from "@/shared/components/Table";
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
  const revenue = order.items?.reduce((sum, item) => sum + Number(item.subtotal || 0), 0) || 0;

  const hpp = order.items?.reduce((sum, item) => sum + Number(item.total_hpp || 0), 0) || 0;

  return {
    revenue,
    hpp,
    profit: revenue - hpp,
  };
}

function getStatusClass(status) {
  switch (status) {
    case "COMPLETED":
      return `
        bg-emerald-100
        text-emerald-700
      `;

    case "DIKEMAS":
      return `
        bg-orange-100
        text-orange-700
      `;

    case "DIKIRIM":
      return `
        bg-blue-100
        text-blue-700
      `;

    case "VOID":
      return `
        bg-red-100
        text-red-700
      `;

    default:
      return `
        bg-yellow-100
        text-yellow-700
      `;
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
  // PREPARE
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
  // TABLE COLUMNS
  // ========================================

  const columns = useMemo(
    () => [
      {
        key: "so_number",

        label: "SO Number",

        render: (row) => (
          <button
            onClick={() => navigate(`/sales/orders/${row.id}`)}
            className="
              font-semibold
              text-blue-600
              transition
              hover:text-blue-700
            "
          >
            {row.so_number}
          </button>
        ),
      },

      {
        key: "customer_name",

        label: "Customer",

        render: (row) => <span className="text-slate-700">{row.customer_name}</span>,
      },

      {
        key: "revenue",

        label: "Revenue",

        render: (row) => <span className="font-medium text-slate-800">{formatRupiah(row.revenue)}</span>,
      },

      {
        key: "status",

        label: "Status",

        render: (row) => (
          <span
            className={`
              inline-flex
              items-center
              rounded-full
              px-3
              py-1
              text-xs
              font-semibold

              ${getStatusClass(row.status)}
            `}
          >
            {row.status}
          </span>
        ),
      },
    ],
    [navigate],
  );

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200" />

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="
                h-32
                animate-pulse
                rounded-2xl
                bg-slate-200
              "
            />
          ))}
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sales Orders</h1>

          <p className="mt-1 text-sm text-slate-500">Revenue and profit tracking</p>
        </div>

        <Button onClick={() => navigate("/sales/create")}>+ Create Sales Order</Button>
      </div>

      {/* SUMMARY */}

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Total Revenue" value={formatRupiah(summary.revenue)} />

        <SummaryCard title="Total HPP" value={formatRupiah(summary.hpp)} />

        <SummaryCard title="Gross Profit" value={formatRupiah(summary.profit)} valueClass="text-emerald-600" />
      </div>

      {/* FILTER */}

      <div
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
        "
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-sm">
            <Input placeholder="Search SO Number or Customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

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

      {/* TABLE */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
        "
      >
        {preparedOrders.length === 0 ? (
          <div className="py-24 text-center">
            <h2 className="text-xl font-semibold text-slate-900">No sales orders</h2>

            <p className="mt-2 text-slate-500">Create your first sales order</p>
          </div>
        ) : (
          <Table columns={columns} data={preparedOrders} />
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, valueClass = "" }) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-6
      "
    >
      <p className="text-sm text-slate-500">{title}</p>

      <p
        className={`
          mt-3
          text-3xl
          font-bold
          text-slate-900

          ${valueClass}
        `}
      >
        {value}
      </p>
    </div>
  );
}
