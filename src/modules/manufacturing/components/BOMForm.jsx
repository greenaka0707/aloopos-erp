import { useEffect, useState } from "react";

import Button from "@/shared/components/Button";

import Input from "@/shared/components/common/Input";

import { supabase } from "@/lib/supabase";

export default function BOMForm({ onSubmit, loading }) {
  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");

  const [productId, setProductId] = useState("");

  const [note, setNote] = useState("");

  const [materials, setMaterials] = useState([
    {
      material_id: "",
      qty: "",
    },
  ]);

  // =========================================
  // LOAD PRODUCTS
  // =========================================

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data } = await supabase.from("products").select("*").order("name");

    setProducts(data || []);
  }

  // =========================================
  // MATERIAL ROW
  // =========================================

  function addMaterialRow() {
    setMaterials([
      ...materials,
      {
        material_id: "",
        qty: "",
      },
    ]);
  }

  function removeMaterialRow(index) {
    const updated = [...materials];

    updated.splice(index, 1);

    setMaterials(updated);
  }

  function updateMaterial(index, field, value) {
    const updated = [...materials];

    updated[index][field] = value;

    setMaterials(updated);
  }

  // =========================================
  // SUBMIT
  // =========================================

  function handleSubmit(e) {
    e.preventDefault();
    if (!name) {
      return alert("BOM name required");
    }

    if (!productId) {
      return alert("Finished product required");
    }
    const materialIds = materials.map((m) => m.material_id);

    const hasDuplicate = new Set(materialIds).size !== materialIds.length;

    if (hasDuplicate) {
      return alert("Duplicate materials detected");
    }
    const invalidMaterial = materials.some((item) => !item.material_id || !item.qty || Number(item.qty) <= 0);

    if (invalidMaterial) {
      return alert("All material qty required");
    }
    onSubmit({
      name,
      productId,
      note,
      materials,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* BOM NAME */}

      <Input placeholder="BOM Name" value={name} onChange={(e) => setName(e.target.value)} />

      {/* PRODUCT */}

      <select
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        className="
          w-full
          rounded-xl
          border
          border-slate-700
          bg-slate-900
          px-4
          py-3
          text-white
        "
      >
        <option value="">Select Finished Product</option>

        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name}
          </option>
        ))}
      </select>

      {/* NOTE */}

      <Input placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} />

      {/* MATERIALS */}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Materials</h3>

          <button
            type="button"
            onClick={addMaterialRow}
            className="
              rounded-xl
              bg-blue-600
              px-4
              py-2
              text-sm
            "
          >
            + Add Material
          </button>
        </div>

        {materials.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-3">
            <select
              value={item.material_id}
              onChange={(e) => updateMaterial(index, "material_id", e.target.value)}
              className="
                col-span-8
                rounded-xl
                border
                border-slate-700
                bg-slate-900
                px-4
                py-3
                text-white
              "
            >
              <option value="">Select Material</option>

              {products
                .filter((product) => product.id !== productId)
                .map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
            </select>

            <Input placeholder="Qty" value={item.qty} onChange={(e) => updateMaterial(index, "qty", e.target.value)} className="col-span-3" />

            <button
              type="button"
              onClick={() => {
                if (materials.length === 1) {
                  return;
                }

                removeMaterialRow(index);
              }}
              className="
                col-span-1
                rounded-xl
                bg-red-500/20
                text-red-400
              "
            >
              X
            </button>
          </div>
        ))}
      </div>

      {/* SUBMIT */}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save BOM"}
      </Button>
    </form>
  );
}
