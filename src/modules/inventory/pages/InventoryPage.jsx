import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Pencil, Trash2, Plus } from "lucide-react";

import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import Modal from "@/shared/components/Modal";
import Table from "@/shared/components/Table";
import { supabase } from "@/lib/supabase";

export default function InventoryPage() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [products, setProducts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    sku: "",
    name: "",
    unit: "",
    average_cost: "",
    selling_price: "",
  });

  // =====================================================
  // TABLE COLUMNS (DESKTOP)
  // =====================================================

  const columns = [
    {
      key: "sku",
      label: "SKU",
      render: (row) => (
        <span className="whitespace-nowrap text-slate-500">{row.sku}</span>
      ),
    },
    {
      key: "name",
      label: "Product Name",
      render: (row) => (
        <button
          onClick={() => navigate(`/inventory/products/${row.id}`)}
          className="text-left font-medium text-slate-900 transition hover:text-blue-600"
        >
          {row.name}
        </button>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (row) => (
        <span className="whitespace-nowrap text-slate-700">
          {Number(row.stock || 0)}
        </span>
      ),
    },
    {
      key: "unit",
      label: "Unit",
      render: (row) => (
        <span className="whitespace-nowrap uppercase text-slate-500">
          {row.unit}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 transition hover:text-blue-700"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-500 transition hover:text-red-600"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  // =====================================================
  // INIT
  // =====================================================

  useEffect(() => {
    getProducts();
  }, []);

  // =====================================================
  // GET PRODUCTS
  // =====================================================

  async function getProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setProducts(data);
  }

  // =====================================================
  // CREATE / UPDATE PRODUCT
  // =====================================================

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      sku: form.sku,
      name: form.name,
      unit: form.unit,
      average_cost: Number(form.average_cost || 0),
      selling_price: Number(form.selling_price || 0),
    };

    let response;
    if (editingId) {
      response = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingId);
    } else {
      response = await supabase.from("products").insert([payload]);
    }

    if (response.error) {
      console.error(response.error);
      alert(response.error.message);
      return;
    }

    closeModal();
    getProducts();
  }

  // =====================================================
  // DELETE PRODUCT
  // =====================================================

  async function handleDelete(id) {
    const confirmDelete = confirm("Delete this product?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    getProducts();
  }

  // =====================================================
  // EDIT PRODUCT
  // =====================================================

  function handleEdit(product) {
    setEditingId(product.id);
    setForm({
      sku: product.sku,
      name: product.name,
      unit: product.unit,
      average_cost: product.average_cost || "",
      selling_price: product.selling_price || "",
    });
    setOpenModal(true);
  }

  // =====================================================
  // ADD PRODUCT
  // =====================================================

  function handleAddProduct() {
    setEditingId(null);
    setForm({
      sku: "",
      name: "",
      unit: "",
      average_cost: "",
      selling_price: "",
    });
    setOpenModal(true);
  }

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  function closeModal() {
    setOpenModal(false);
    setEditingId(null);
    setForm({
      sku: "",
      name: "",
      unit: "",
      average_cost: "",
      selling_price: "",
    });
  }

  // Simple local filter based on search input
  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-w-0 pb-24 lg:pb-8 relative">
      {/* ===================================================== */}
      {/* STICKY TOP BAR */}
      {/* ===================================================== */}
      <div className="sticky top-[75px] z-20 -mx-5 px-5 pb-4 pt-2 bg-slate-100 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 md:p-4 border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 active:bg-slate-200">
                Bulk Action
              </button>
              <button className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 active:bg-slate-200">
                Export
              </button>
            </div>
            
            <div className="relative w-full md:max-w-xs">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* PRODUCT LIST */}
      {/* ===================================================== */}
      
      {/* MOBILE LIST (RAMPING) */}
      <div className="mt-2 space-y-3 px-1 md:hidden">
        {filteredProducts.map((row) => (
          <div key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-start justify-between">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {row.sku}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleEdit(row)}
                  className="text-blue-600 transition hover:text-blue-700"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="text-red-500 transition hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate(`/inventory/products/${row.id}`)}
              className="mb-3 text-left text-base font-semibold text-slate-900 transition hover:text-blue-600"
            >
              {row.name}
            </button>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <p className="mb-0.5 text-xs text-slate-400">Stock</p>
                <p className="text-sm font-medium text-slate-800">
                  {Number(row.stock || 0)}
                </p>
              </div>
              <div>
                <p className="mb-0.5 text-xs text-slate-400">Unit</p>
                <p className="text-sm font-medium uppercase text-slate-800">
                  {row.unit}
                </p>
              </div>
              <div>
                <p className="mb-0.5 text-xs text-slate-400">Avg Cost</p>
                <p className="text-sm font-medium text-slate-800">
                  Rp {Number(row.average_cost || 0).toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <p className="mb-0.5 text-xs text-slate-400">Sell Price</p>
                <p className="text-sm font-medium text-blue-600">
                  Rp {Number(row.selling_price || 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-500">
            No products found.
          </div>
        )}
      </div>

      {/* DESKTOP TABLE */}
      <div className="mt-2 hidden px-1 md:block">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <Table columns={columns} data={filteredProducts} />
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* FAB: FIXED CREATE BUTTON */}
      {/* ===================================================== */}
      <div className="fixed bottom-6 right-6 z-50 lg:bottom-8 lg:right-8">
        <button
          onClick={handleAddProduct}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] transition-transform hover:scale-105 hover:bg-orange-600 active:scale-95 md:h-auto md:w-auto md:px-5 md:py-3.5 md:rounded-2xl"
        >
          <Plus size={24} strokeWidth={2.5} className="md:h-5 md:w-5" />
          <span className="hidden md:block md:ml-2 text-sm font-semibold">
            Add Product
          </span>
        </button>
      </div>

      {/* ===================================================== */}
      {/* MODAL */}
      {/* ===================================================== */}
      <Modal
        open={openModal}
        onClose={closeModal}
        title={editingId ? "Edit Product" : "Add Product"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              placeholder="SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
            <Input
              placeholder="Unit"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            />
          </div>

          <Input
            placeholder="Product Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            type="number"
            placeholder="Average Cost"
            value={form.average_cost}
            onChange={(e) => setForm({ ...form, average_cost: e.target.value })}
          />

          <Input
            type="number"
            placeholder="Selling Price"
            value={form.selling_price}
            onChange={(e) =>
              setForm({ ...form, selling_price: e.target.value })
            }
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <Button type="submit">
              {editingId ? "Update Product" : "Save Product"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}