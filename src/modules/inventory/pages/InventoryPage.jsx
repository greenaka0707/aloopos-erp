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

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-w-0 pb-32 lg:pb-8 relative">

      {/* ===================================================== */}
      {/* MOBILE LIST */}
      {/* ===================================================== */}
      
      <div className="space-y-3 px-1 md:hidden">
        {filteredProducts.map((row) => (
          <div key={row.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div 
                className="min-w-0 flex-1 cursor-pointer" 
                onClick={() => navigate(`/inventory/products/${row.id}`)}
              >
                <h3 className="truncate text-sm font-bold text-slate-900">{row.name}</h3>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  {row.sku}
                </p>
              </div>
              <div className="flex items-center gap-1.5 -mt-1 -mr-1">
                <button onClick={() => handleEdit(row)} className="p-1.5 text-blue-600 transition hover:bg-blue-50 rounded-lg">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(row.id)} className="p-1.5 text-red-500 transition hover:bg-red-50 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-medium uppercase text-slate-400">Stock</span>
                <span className="mt-0.5 text-xs font-semibold text-slate-700">
                  {Number(row.stock || 0)} <span className="uppercase">{row.unit}</span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-medium uppercase text-slate-400">Avg Cost</span>
                <span className="mt-0.5 text-xs font-semibold text-slate-700">
                  Rp {Number(row.average_cost || 0).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-medium uppercase text-slate-400">Sell Price</span>
                <span className="mt-0.5 text-sm font-bold text-blue-600">
                  Rp {Number(row.selling_price || 0).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-500">No products found.</div>
        )}
      </div>

      {/* ===================================================== */}
      {/* DESKTOP TABLE */}
      {/* ===================================================== */}
      <div className="hidden px-1 md:block">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <Table columns={columns} data={filteredProducts} />
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* STICKY SEARCH + FAB (BOTTOM) */}
      {/* ===================================================== */}
      <div className="fixed bottom-6 left-0 right-0 z-50 px-4 md:px-6">
        <div className="flex items-center justify-end gap-3 mx-auto max-w-7xl">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
              <Search size={18} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white/90 backdrop-blur-md py-3.5 pl-11 pr-4 text-base shadow-[0_4px_20px_rgba(0,0,0,0.08)] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button
            onClick={handleAddProduct}
            className="flex flex-shrink-0 h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-[0_4px_20px_rgba(249,115,22,0.4)] transition-transform hover:scale-105 hover:bg-orange-600 active:scale-95"
          >
            <Plus size={28} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ===================================================== */}
      {/* MODAL */}
      {/* ===================================================== */}
      <Modal open={openModal} onClose={closeModal} title={editingId ? "Edit Product" : "Add Product"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            <Input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </div>
          <Input placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input type="number" placeholder="Average Cost" value={form.average_cost} onChange={(e) => setForm({ ...form, average_cost: e.target.value })} />
          <Input type="number" placeholder="Selling Price" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100">Cancel</button>
            <Button type="submit">{editingId ? "Update Product" : "Save Product"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}