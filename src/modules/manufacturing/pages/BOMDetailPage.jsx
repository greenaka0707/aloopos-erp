import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { cloneBOM, deleteBOM, getBOMById } from "../services/bom.service";

export default function BOMDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [bom, setBom] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadBOM() {
    try {
      setLoading(true);

      const result = await getBOMById(id);

      if (result.error) {
        console.error(result.error);
        return;
      }

      setBom(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBOM();
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading BOM...</div>;
  }

  if (!bom) {
    return <div className="p-6">BOM not found</div>;
  }
  async function handleDelete() {
    const confirmDelete = window.confirm("Delete this BOM?");

    if (!confirmDelete) {
      return;
    }

    const result = await deleteBOM(id);

    if (result.error) {
      return alert(result.error.message);
    }

    navigate("/manufacturing/bom");
  }

  async function handleClone() {
    const result = await cloneBOM(id);

    if (result.error) {
      return alert(result.error.message);
    }

    loadBOM();
  }

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
        <div className="flex items-start justify-between">
          {/* LEFT */}

          <div>
            <h1 className="text-2xl font-bold">{bom.name}</h1>

            <p className="mt-2 text-slate-400">Finished Product: {bom.product?.name}</p>

            {bom.note && <p className="mt-4 text-sm text-slate-500">{bom.note}</p>}
          </div>

          {/* ACTIONS */}

          <div className="flex gap-3">
            <button
              onClick={handleClone}
              className="
              rounded-xl
              bg-blue-600
              px-4
              py-2
              text-sm
              font-medium
            "
            >
              Clone
            </button>

            <button
              onClick={handleDelete}
              className="
              rounded-xl
              bg-red-500/20
              px-4
              py-2
              text-sm
              font-medium
              text-red-400
            "
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* MATERIALS */}

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
          <h2 className="font-semibold">Materials</h2>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-950">
            <tr>
              <th className="p-4 text-left">Material</th>

              <th className="p-4 text-right">Qty</th>

              <th className="p-4 text-left">Unit</th>
            </tr>
          </thead>

          <tbody>
            {bom.items?.map((item) => (
              <tr key={item.id} className="border-t border-slate-800">
                <td className="p-4">{item.material?.name}</td>

                <td className="p-4 text-right font-medium">{item.qty}</td>

                <td className="p-4">{item.material?.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
