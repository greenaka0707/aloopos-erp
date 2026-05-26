import { useEffect, useMemo, useState } from "react";

import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCcw,
} from "lucide-react";

import Card from "@/shared/components/Card";
import Button from "@/shared/components/Button";
import Table from "@/shared/components/Table";

import { getMovements } from "../services/movement.service";

/* ===================================================== */
/* STATS CARD */
/* ===================================================== */

function StatsCard({
  title,
  value,
  icon,
  iconClassName = "",
  valueClassName = "",
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">

        {/* LEFT */}

        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h3
            className={`
              mt-2
              text-3xl
              font-bold
              tracking-tight
              ${valueClassName}
            `}
          >
            {value}
          </h3>
        </div>

        {/* RIGHT */}

        <div
          className={`
            rounded-2xl
            p-4
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
          {new Date(
            row.date || row.created_at,
          ).toLocaleString("id-ID", {
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

      render: (row) => (
        <span className="font-medium text-slate-900">
          {row.product ||
            row.product_name ||
            row.name ||
            "-"}
        </span>
      ),
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

      render: (row) => (
        <span className="font-medium text-slate-700">
          {Number(row.qty || 0)}
        </span>
      ),
    },

    {
      key: "reference",
      label: "Reference",

      render: (row) => {
        const reference =
          row.reference ||
          row.reference_no ||
          row.ref_no;

        if (reference) {
          return (
            <span className="text-slate-500">
              {reference}
            </span>
          );
        }

        return (
          <span className="text-slate-400">
            {row.type === "IN"
              ? "Stock In"
              : "Stock Out"}
          </span>
        );
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
    const totalIn = movements
      .filter((item) => item.type === "IN")
      .reduce(
        (acc, item) =>
          acc + Number(item.qty || 0),
        0,
      );

    const totalOut = movements
      .filter((item) => item.type === "OUT")
      .reduce(
        (acc, item) =>
          acc + Number(item.qty || 0),
        0,
      );

    return {
      totalIn,
      totalOut,
    };
  }, [movements]);

  return (
    <div className="relative min-w-0 pb-10">

      {/* ===================================================== */}
      {/* REFRESH */}
      {/* ===================================================== */}

      <div className="mb-4">
        <Button
          variant="secondary"
          onClick={loadMovements}
          loading={loading}
          className="
            h-14
            w-full
            rounded-2xl
            text-lg
            font-semibold
            shadow-sm
            lg:h-auto
            lg:w-auto
            lg:px-4
            lg:text-sm
          "
        >
          <RefreshCcw size={18} />
          Refresh
        </Button>
      </div>

      {/* ===================================================== */}
      {/* SUMMARY */}
      {/* ===================================================== */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* STOCK IN */}

        <StatsCard
          title="Stock In"
          value={summary.totalIn}
          valueClassName="text-emerald-600"
          icon={<ArrowDownLeft size={22} />}
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
          icon={<ArrowUpRight size={22} />}
          iconClassName="
            bg-red-100
            text-red-500
          "
        />
      </div>

      {/* ===================================================== */}
      {/* MOBILE CARD LIST */}
      {/* ===================================================== */}

      <div className="mt-6 space-y-3 md:hidden">

        {loading &&
          [1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="
                h-[120px]
                animate-pulse
                rounded-2xl
                bg-slate-200
              "
            />
          ))}

        {!loading &&
          movements.map((row, index) => (
            <div
              key={index}
              className="
                rounded-2xl
                border border-slate-200
                bg-white
                p-4
                shadow-sm
              "
            >

              {/* TOP */}
              <div className="flex items-start justify-between gap-3">

                {/* LEFT */}
                <div className="min-w-0 flex-1">

                  <h3 className="truncate text-sm font-bold text-slate-900">
                    {row.product ||
                      row.product_name ||
                      row.name ||
                      "-"}
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
                    {new Date(
                      row.date || row.created_at,
                    ).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* TYPE */}
                <span
                  className={`
                    inline-flex items-center
                    rounded-full
                    px-2.5 py-1
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wide
                    whitespace-nowrap

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
              </div>

              {/* FOOTER */}
              <div
                className="
                  mt-4
                  flex items-end justify-between
                  border-t border-slate-100
                  pt-4
                "
              >

                {/* QTY */}
                <div className="flex flex-col">

                  <span
                    className="
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-wide
                      text-slate-400
                    "
                  >
                    Quantity
                  </span>

                  <span
                    className={`
                      mt-1
                      text-lg
                      font-bold

                      ${
                        row.type === "IN"
                          ? "text-emerald-600"
                          : "text-red-500"
                      }
                    `}
                  >
                    {Number(row.qty || 0)}
                  </span>
                </div>

                {/* REFERENCE */}
                <div className="flex flex-col text-right">

                  <span
                    className="
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-wide
                      text-slate-400
                    "
                  >
                    Reference
                  </span>

                  <span
                    className="
                      mt-1
                      text-xs
                      font-medium
                      text-slate-600
                    "
                  >
                    {row.reference ||
                      row.reference_no ||
                      row.ref_no ||
                      (row.type === "IN"
                        ? "Stock In"
                        : "Stock Out")}
                  </span>
                </div>
              </div>
            </div>
          ))}

        {!loading && movements.length === 0 && (
          <div
            className="
              rounded-2xl
              border border-slate-200
              bg-white
              px-4 py-16
              text-center
              text-sm
              text-slate-500
              shadow-sm
            "
          >
            No movement history found.
          </div>
        )}
      </div>

      {/* ===================================================== */}
      {/* DESKTOP TABLE */}
      {/* ===================================================== */}

      <div className="mt-6 hidden md:block">
        <Card className="overflow-hidden p-0">

          {/* HEADER */}

          <div className="border-b border-slate-200 px-6 py-6">

            <h2 className="text-2xl font-bold text-slate-900 lg:text-lg">
              Movement History
            </h2>

            <p className="mt-2 text-base text-slate-500 lg:mt-1 lg:text-sm">
              Inventory stock movement records
            </p>
          </div>

          {/* TABLE */}

          <Table
            columns={columns}
            data={movements}
            loading={loading}
          />
        </Card>
      </div>
    </div>
  );
}