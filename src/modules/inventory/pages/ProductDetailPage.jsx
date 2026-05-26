import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { supabase } from "@/lib/supabase";

export default function ProductDetailPage() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);

  const [movements, setMovements] = useState([]);

  // =====================================
  // LOAD
  // =====================================

  useEffect(() => {
    loadProduct();
  }, [id]);

  async function loadProduct() {
    // PRODUCT

    const { data: productData } = await supabase.from("products").select("*").eq("id", id).single();

    setProduct(productData);

    // MOVEMENTS

    const { data: movementData } = await supabase.from("inventory_movements").select("*").eq("product_id", id).order("created_at", {
      ascending: false,
    });

    setMovements(movementData || []);
  }

  // =====================================
  // LOADING
  // =====================================

  if (!product) {
    return <div className="p-6">Loading...</div>;
  }

  const inventoryValue = Number(product.stock || 0) * Number(product.average_cost || 0);

  // =====================================
  // RENDER
  // =====================================

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}

      <div
        className="
          rounded-2xl
          border
          border-slate-800
          bg-slate-900
          p-6
        "
      >
        <h1 className="text-3xl font-bold">{product.name}</h1>

        <p className="mt-2 text-slate-400">SKU: {product.sku}</p>
      </div>

      {/* SUMMARY */}

      <div
        className="
          grid
          gap-4
          md:grid-cols-3
        "
      >
        <div
          className="
            rounded-2xl
            border
            border-slate-800
            bg-slate-900
            p-5
          "
        >
          <p className="text-sm text-slate-400">Current Stock</p>

          <h2 className="mt-2 text-3xl font-bold">{Number(product.stock || 0).toFixed(2)}</h2>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-slate-800
            bg-slate-900
            p-5
          "
        >
          <p className="text-sm text-slate-400">Average Cost</p>

          <h2
            className="
              mt-2
              text-3xl
              font-bold
              text-cyan-400
            "
          >
            Rp {Math.round(Number(product.average_cost || 0)).toLocaleString()}
          </h2>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-slate-800
            bg-slate-900
            p-5
          "
        >
          <p className="text-sm text-slate-400">Inventory Value</p>

          <h2
            className="
              mt-2
              text-3xl
              font-bold
              text-emerald-400
            "
          >
            Rp {Math.round(inventoryValue).toLocaleString()}
          </h2>
        </div>
      </div>

      {/* MOVEMENTS */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-800
          bg-slate-900
        "
      >
        <div className="border-b border-slate-800 p-4">
          <h2 className="font-semibold">Inventory Movements</h2>
        </div>

        <table className="w-full">
          <thead
            className="
              bg-slate-950
              text-sm
            "
          >
            <tr>
              <th className="p-4 text-left">Type</th>

              <th className="p-4 text-right">Qty</th>

              <th className="p-4 text-right">Unit Cost</th>

              <th className="p-4 text-right">Total Cost</th>

              <th className="p-4 text-left">Note</th>
            </tr>
          </thead>

          <tbody>
            {movements.map((movement) => (
              <tr
                key={movement.id}
                className="
                    border-t
                    border-slate-800
                  "
              >
                <td className="p-4">
                  <span
                    className={`
                        rounded-lg
                        px-2
                        py-1
                        text-xs
                        font-semibold

                        ${movement.type === "IN" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}
                      `}
                  >
                    {movement.type}
                  </span>
                </td>

                <td className="p-4 text-right">{Number(movement.qty || 0).toFixed(2)}</td>

                <td className="p-4 text-right">Rp {Math.round(Number(movement.unit_cost || 0)).toLocaleString()}</td>

                <td
                  className="
                      p-4
                      text-right
                      font-medium
                    "
                >
                  Rp {Math.round(Number(movement.total_cost || 0)).toLocaleString()}
                </td>

                <td className="p-4 text-slate-400">{movement.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
