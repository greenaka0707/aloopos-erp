import { useEffect, useMemo, useState } from "react";

import { ArrowDownLeft, ArrowUpRight, Package, RefreshCcw } from "lucide-react";

import Card from "@/shared/components/Card";
import Button from "@/shared/components/Button";
import Table from "@/shared/components/Table";

import { getMovements } from "../services/movement.service";

/* ===================================================== */
/* STATS CARD */
/* ===================================================== */

function StatsCard({ title, value, icon, iconClassName = "", valueClassName = "" }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        {/* LEFT */}

        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <h3
            className={`
              mt-1
              text-2xl
              font-bold
              ${valueClassName}
            `}
          >
            {value}
          </h3>
        </div>

        {/* RIGHT */}

        <div
          className={`
            rounded-xl
            p-3
            ${iconClassName}
          `}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function InventoryMovementPage() {
  const [loading, setLoading] = useState(true);

  const [movements, setMovements] = useState([]);

  /* ===================================================== */
  /* TABLE COLUMNS */
  /* ===================================================== */

  const columns = [
    {
      key: "date",
      label: "Date",

      render: (row) => (
        <span className="text-slate-500">
          {new Date(row.date || row.created_at).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },

    {
      key: "product",
      label: "Product",

      render: (row) => <span className="font-medium text-slate-900">{row.product || row.product_name || row.name || "-"}</span>,
    },

    {
      key: "type",
      label: "Type",

      render: (row) => (
        <span
          className={`
          inline-flex
          rounded-full
          px-2.5
          py-1
          text-xs
          font-semibold

          ${
            row.type === "IN"
              ? `
                bg-emerald-100
                text-emerald-600
              `
              : `
                bg-red-100
                text-red-500
              `
          }
        `}
        >
          {row.type || "-"}
        </span>
      ),
    },

    {
      key: "qty",
      label: "Qty",

      render: (row) => <span className="font-medium text-slate-700">{Number(row.qty || 0)}</span>,
    },

    {
      key: "reference",
      label: "Reference",

      render: (row) => {
        const reference = row.reference || row.reference_no || row.ref_no;

        if (reference) {
          return <span className="text-slate-500">{reference}</span>;
        }

        return <span className="text-slate-400">{row.type === "IN" ? "Stock In" : "Stock Out"}</span>;
      },
    },
  ];

  /* ===================================================== */
  /* LOAD MOVEMENTS */
  /* ===================================================== */

  async function loadMovements() {
    try {
      setLoading(true);

      const data = await getMovements();

      setMovements(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMovements();
  }, []);

  /* ===================================================== */
  /* SUMMARY */
  /* ===================================================== */

  const summary = useMemo(() => {
    const totalMovement = movements.length;

    const totalIn = movements.filter((item) => item.type === "IN").reduce((acc, item) => acc + Number(item.qty || 0), 0);

    const totalOut = movements.filter((item) => item.type === "OUT").reduce((acc, item) => acc + Number(item.qty || 0), 0);

    return {
      totalMovement,
      totalIn,
      totalOut,
    };
  }, [movements]);

  return (
    <div className="flex flex-col gap-6">
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="flex items-center justify-between">
        {/* LEFT */}

        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory Movements</h1>

          <p className="mt-1 text-sm text-slate-500">Track inventory stock movement and transaction activity</p>
        </div>

        {/* RIGHT */}

        <Button variant="secondary" onClick={loadMovements} loading={loading} className="gap-2">
          <RefreshCcw size={16} />
          Refresh
        </Button>
      </div>

      {/* ===================================================== */}
      {/* SUMMARY */}
      {/* ===================================================== */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* TOTAL */}

        <StatsCard
          title="Total Movements"
          value={summary.totalMovement}
          valueClassName="text-slate-900"
          icon={<Package size={18} />}
          iconClassName="
            bg-slate-100
            text-slate-700
          "
        />

        {/* STOCK IN */}

        <StatsCard
          title="Stock In"
          value={summary.totalIn}
          valueClassName="text-emerald-600"
          icon={<ArrowDownLeft size={18} />}
          iconClassName="
            bg-emerald-100
            text-emerald-600
          "
        />

        {/* STOCK OUT */}

        <StatsCard
          title="Stock Out"
          value={summary.totalOut}
          valueClassName="text-red-500"
          icon={<ArrowUpRight size={18} />}
          iconClassName="
            bg-red-100
            text-red-500
          "
        />
      </div>

      {/* ===================================================== */}
      {/* TABLE */}
      {/* ===================================================== */}

      <Card className="overflow-hidden p-0">
        {/* HEADER */}

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">Movement History</h2>

          <p className="mt-1 text-sm text-slate-500">Inventory stock movement records</p>
        </div>

        {/* TABLE */}

        <Table columns={columns} data={movements} loading={loading} />
      </Card>
    </div>
  );
}
