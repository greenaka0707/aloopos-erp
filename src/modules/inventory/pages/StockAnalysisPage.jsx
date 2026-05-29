import { Calendar, Download, Filter, Search, ShoppingCart } from "lucide-react";

import Card from "@/shared/components/common/Card";
import Button from "@/shared/components/common/Button";
import Input from "@/shared/components/common/Input";

/* ===================================================== */
/* DUMMY DATA */
/* ===================================================== */

const data = [
  {
    code: "001007",
    name: "GB Robusta Grade A",
    soldTotal: 2500,
    soldDaily: 80.65,
    needed: 2500,
    stock: 1863.1,
    recommendation: 636.9,
    unit: "KG",
  },

  {
    code: "001008",
    name: "GB Robusta Grade B",
    soldTotal: 800,
    soldDaily: 25.81,
    needed: 800,
    stock: 3997,
    recommendation: 0,
    unit: "KG",
  },

  {
    code: "001009",
    name: "GB Robusta Grade C",
    soldTotal: 200,
    soldDaily: 6.45,
    needed: 200,
    stock: 5613.2,
    recommendation: 0,
    unit: "KG",
  },
];

export default function StockAnalysisPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div>
        <h1
          className="
            text-3xl
            font-bold
            tracking-tight
            text-slate-900
          "
        >
          Analisa Stok
        </h1>

        <p
          className="
            mt-2
            text-sm
            text-slate-500
          "
        >
          Monitor stock requirement and reorder recommendation
        </p>
      </div>

      {/* ===================================================== */}
      {/* FILTER */}
      {/* ===================================================== */}

      <Card className="p-5">
        <div
          className="
            flex
            flex-col
            gap-4
            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >
          {/* LEFT */}

          <div className="flex flex-1 items-center gap-3">
            <div className="relative w-full max-w-md">
              <Search
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <Input placeholder="Search product..." className="pl-11" />
            </div>

            <Button variant="secondary" className="gap-2">
              <Filter size={16} />
              Filter
            </Button>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-3">
            {/* DATE */}

            <div
              className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-2.5
              "
            >
              <Calendar size={16} className="text-slate-400" />

              <span
                className="
                  text-sm
                  text-slate-600
                "
              >
                26/04/2026 — 26/05/2026
              </span>
            </div>

            {/* BUTTON */}

            <Button className="gap-2">
              <ShoppingCart size={16} />
              Buat Order
            </Button>

            <Button variant="secondary" className="gap-2">
              <Download size={16} />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* ===================================================== */}
      {/* TABLE */}
      {/* ===================================================== */}

      <Card className="overflow-hidden p-0">
        {/* TABLE */}

        <div className="overflow-x-auto">
          <table className="w-full">
            {/* ===================================================== */}
            {/* HEAD */}
            {/* ===================================================== */}

            <thead
              className="
                border-b
                border-slate-200
                bg-slate-50
              "
            >
              <tr>
                <th
                  className="
                    px-6
                    py-4
                    text-left
                    text-sm
                    font-semibold
                    text-slate-600
                  "
                >
                  No
                </th>

                <th
                  className="
                    px-6
                    py-4
                    text-left
                    text-sm
                    font-semibold
                    text-slate-600
                  "
                >
                  Kode
                </th>

                <th
                  className="
                    px-6
                    py-4
                    text-left
                    text-sm
                    font-semibold
                    text-slate-600
                  "
                >
                  Nama Produk
                </th>

                <th
                  className="
                    px-6
                    py-4
                    text-right
                    text-sm
                    font-semibold
                    text-slate-600
                  "
                >
                  Qty Terjual
                </th>

                <th
                  className="
                    px-6
                    py-4
                    text-right
                    text-sm
                    font-semibold
                    text-slate-600
                  "
                >
                  Avg / Hari
                </th>

                <th
                  className="
                    px-6
                    py-4
                    text-right
                    text-sm
                    font-semibold
                    text-slate-600
                  "
                >
                  Qty Dibutuhkan
                </th>

                <th
                  className="
                    px-6
                    py-4
                    text-right
                    text-sm
                    font-semibold
                    text-slate-600
                  "
                >
                  Sisa Stok
                </th>

                <th
                  className="
                    px-6
                    py-4
                    text-right
                    text-sm
                    font-semibold
                    text-slate-600
                  "
                >
                  Rekom. Order
                </th>

                <th
                  className="
                    px-6
                    py-4
                    text-center
                    text-sm
                    font-semibold
                    text-slate-600
                  "
                >
                  Satuan
                </th>

                <th
                  className="
                    px-6
                    py-4
                    text-right
                    text-sm
                    font-semibold
                    text-slate-600
                  "
                >
                  Qty Order
                </th>
              </tr>
            </thead>

            {/* ===================================================== */}
            {/* BODY */}
            {/* ===================================================== */}

            <tbody>
              {data.map((item, index) => (
                <tr
                  key={index}
                  className="
                    border-b
                    border-slate-100
                    transition
                    hover:bg-slate-50
                  "
                >
                  <td
                    className="
                      px-6
                      py-5
                      text-sm
                      text-slate-500
                    "
                  >
                    {index + 1}
                  </td>

                  <td
                    className="
                      px-6
                      py-5
                      text-sm
                      text-slate-700
                    "
                  >
                    {item.code}
                  </td>

                  <td className="px-6 py-5">
                    <p
                      className="
                        font-semibold
                        text-slate-900
                      "
                    >
                      {item.name}
                    </p>
                  </td>

                  <td
                    className="
                      px-6
                      py-5
                      text-right
                      text-sm
                      font-medium
                      text-slate-700
                    "
                  >
                    {item.soldTotal} KG
                  </td>

                  <td
                    className="
                      px-6
                      py-5
                      text-right
                      text-sm
                      text-slate-600
                    "
                  >
                    {item.soldDaily} KG
                  </td>

                  <td
                    className="
                      px-6
                      py-5
                      text-right
                      text-sm
                      text-slate-700
                    "
                  >
                    {item.needed} KG
                  </td>

                  <td
                    className="
                      px-6
                      py-5
                      text-right
                      text-sm
                      text-slate-700
                    "
                  >
                    {item.stock} KG
                  </td>

                  <td
                    className="
                      px-6
                      py-5
                      text-right
                    "
                  >
                    <span
                      className={`
                        rounded-xl
                        px-3
                        py-1.5
                        text-sm
                        font-semibold

                        ${
                          item.recommendation > 0
                            ? `
                              bg-orange-100
                              text-orange-600
                            `
                            : `
                              bg-emerald-100
                              text-emerald-600
                            `
                        }
                      `}
                    >
                      {item.recommendation}
                    </span>
                  </td>

                  <td
                    className="
                      px-6
                      py-5
                      text-center
                      text-sm
                      text-slate-600
                    "
                  >
                    {item.unit}
                  </td>

                  <td className="px-6 py-5">
                    <Input
                      defaultValue={item.recommendation}
                      className="
                        h-10
                        text-right
                      "
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
