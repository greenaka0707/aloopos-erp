import { useEffect, useState } from "react";

import Tabs from "@/shared/components/Tabs";

import { Pencil, Trash2 } from "lucide-react";

import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import Modal from "@/shared/components/Modal";
import Table from "@/shared/components/Table";

import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase";

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState("Produk");
  // =====================================================
  // STATE
  // =====================================================

  const [products, setProducts] = useState([]);

  const [brands, setBrands] = useState([]);

  const [categories, setCategories] = useState([]);

  const [openModal, setOpenModal] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const navigate = useNavigate();

  const [form, setForm] = useState({
    sku: "",
    name: "",
    unit: "",
    average_cost: "",
    selling_price: "",
  });

  // =====================================================
  // TABLE COLUMNS
  // =====================================================

  const columns = [
    // =====================================================
    // SKU
    // =====================================================

    {
      key: "sku",
      label: "SKU",

      render: (row) => <span className="text-slate-500">{row.sku}</span>,
    },

    // =====================================================
    // PRODUCT NAME
    // =====================================================

    {
      key: "name",
      label: "Product Name",

      render: (row) => (
        <button
          onClick={() => navigate(`/inventory/products/${row.id}`)}
          className="
          text-left
          font-medium
          text-slate-900
          transition
          hover:text-blue-600
        "
        >
          {row.name}
        </button>
      ),
    },

    // =====================================================
    // STOCK
    // =====================================================

    {
      key: "stock",
      label: "Stock",

      render: (row) => <span className="text-slate-700">{Number(row.stock || 0)}</span>,
    },

    // =====================================================
    // UNIT
    // =====================================================

    {
      key: "unit",
      label: "Unit",

      render: (row) => <span className="uppercase text-slate-500">{row.unit}</span>,
    },

    // =====================================================
    // ACTIONS
    // =====================================================

    {
      key: "actions",
      label: "Actions",

      render: (row) => (
        <div className="flex items-center gap-3">
          {/* EDIT */}

          <button
            onClick={() => handleEdit(row)}
            className="
            text-blue-600
            transition
            hover:text-blue-700
          "
          >
            <Pencil size={18} />
          </button>

          {/* DELETE */}

          <button
            onClick={() => handleDelete(row.id)}
            className="
            text-red-500
            transition
            hover:text-red-600
          "
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  // =====================================================
  // BRAND COLUMNS
  // =====================================================

  const brandColumns = [
    {
      key: "name",
      label: "Brand Name",
    },

    {
      key: "total_products",
      label: "Total Products",
    },
  ];

  // =====================================================
  // CATEGORY COLUMNS
  // =====================================================

  const categoryColumns = [
    {
      key: "name",
      label: "Category Name",
    },

    {
      key: "total_products",
      label: "Total Products",
    },
  ];

  // =====================================================
  // PRICE COLUMNS
  // =====================================================

  const priceColumns = [
    {
      key: "name",
      label: "Product",
    },

    {
      key: "average_cost",

      label: "Avg Cost",

      render: (row) => <span>Rp {Number(row.average_cost || 0).toLocaleString()}</span>,
    },

    {
      key: "selling_price",
      label: "Selling Price",

      render: (row) => <span className="font-medium text-blue-600">Rp {Number(row.selling_price || 0).toLocaleString()}</span>,
    },

    {
      key: "inventory_value",
      label: "Inventory Value",

      render: (row) => <span className="text-emerald-600">Rp {(Number(row.stock || 0) * Number(row.average_cost || 0)).toLocaleString()}</span>,
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
      .select(
        `
    *,
    brands (
      id,
      name
    ),
    categories (
      id,
      name
    )
  `,
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      return;
    }

    setProducts(data);

    // =====================================================
    // BRAND LIST
    // =====================================================

    const groupedBrands = Object.values(
      data.reduce((acc, item) => {
        const name = item.brands?.name;

        if (!name) return acc;

        if (!acc[name]) {
          acc[name] = {
            name,
            total_products: 0,
          };
        }

        acc[name].total_products += 1;

        return acc;
      }, {}),
    );

    setBrands(groupedBrands);

    // =====================================================
    // CATEGORY LIST
    // =====================================================

    const groupedCategories = Object.values(
      data.reduce((acc, item) => {
        const name = item.categories?.name;

        if (!name) return acc;

        if (!acc[name]) {
          acc[name] = {
            name,
            total_products: 0,
          };
        }

        acc[name].total_products += 1;

        return acc;
      }, {}),
    );

    setCategories(groupedCategories);
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
      response = await supabase.from("products").update(payload).eq("id", editingId);
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

  return (
    <div className="flex flex-col gap-6">
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory</h1>

          <p className="mt-1 text-sm text-slate-500">Product master and inventory overview</p>
        </div>

        <Button
          onClick={handleAddProduct}
          className="
          rounded-xl
          bg-blue-600
          px-5
          py-2.5
          text-sm
          font-medium
          text-white
          hover:bg-blue-700
        "
        >
          + Add Product
        </Button>
      </div>

      {/* ===================================================== */}
      {/* TABS */}
      {/* ===================================================== */}

      <Tabs tabs={["Produk", "Merek", "Kategori Produk", "Daftar Harga"]} value={activeTab} onChange={setActiveTab} />

      {/* ===================================================== */}
      {/* PRODUK TAB */}
      {/* ===================================================== */}

      {activeTab === "Produk" && (
        <div
          className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      shadow-sm
    "
        >
          {/* TOPBAR */}

          <div
            className="
        flex
        flex-wrap
        items-center
        justify-between
        gap-4
        border-b
        border-slate-200
        px-6
        py-5
      "
          >
            <div className="flex items-center gap-3">
              <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">Bulk Action</button>

              <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">Export</button>
            </div>

            <div className="w-full max-w-xs">
              <Input
                placeholder="Search product..."
                className="
            border-slate-200
            bg-white
            text-slate-900
          "
              />
            </div>
          </div>

          <Table columns={columns} data={products} />
        </div>
      )}

      {/* ===================================================== */}
      {/* BRAND TAB */}
      {/* ===================================================== */}

      {activeTab === "Merek" && (
        <div
          className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      shadow-sm
    "
        >
          <div
            className="
        border-b
        border-slate-200
        px-6
        py-5
      "
          >
            <h2 className="text-lg font-semibold text-slate-900">Brand List</h2>

            <p className="mt-1 text-sm text-slate-500">Product brands grouping</p>
          </div>

          <Table columns={brandColumns} data={brands} />
        </div>
      )}

      {/* ===================================================== */}
      {/* CATEGORY TAB */}
      {/* ===================================================== */}

      {activeTab === "Kategori Produk" && (
        <div
          className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      shadow-sm
    "
        >
          <div
            className="
        border-b
        border-slate-200
        px-6
        py-5
      "
          >
            <h2 className="text-lg font-semibold text-slate-900">Category List</h2>

            <p className="mt-1 text-sm text-slate-500">Product category grouping</p>
          </div>

          <Table columns={categoryColumns} data={categories} />
        </div>
      )}

      {/* ===================================================== */}
      {/* PRICE TAB */}
      {/* ===================================================== */}

      {activeTab === "Daftar Harga" && (
        <div
          className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      shadow-sm
    "
        >
          <div
            className="
        flex
        items-center
        justify-between
        border-b
        border-slate-200
        px-6
        py-5
      "
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Price List</h2>

              <p className="mt-1 text-sm text-slate-500">Product costing overview</p>
            </div>

            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">Update Price</button>
          </div>

          <Table columns={priceColumns} data={products} />
        </div>
      )}

      <Modal open={openModal} onClose={closeModal} title={editingId ? "Edit Product" : "Add Product"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* SKU + UNIT */}

          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="SKU"
              value={form.sku}
              onChange={(e) =>
                setForm({
                  ...form,
                  sku: e.target.value,
                })
              }
            />

            <Input
              placeholder="Unit"
              value={form.unit}
              onChange={(e) =>
                setForm({
                  ...form,
                  unit: e.target.value,
                })
              }
            />
          </div>

          {/* PRODUCT */}

          <Input
            placeholder="Product Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          {/* COST */}

          <Input
            type="number"
            placeholder="Average Cost"
            value={form.average_cost}
            onChange={(e) =>
              setForm({
                ...form,
                average_cost: e.target.value,
              })
            }
          />
          <Input
            type="number"
            placeholder="Selling Price"
            value={form.selling_price}
            onChange={(e) =>
              setForm({
                ...form,
                selling_price: e.target.value,
              })
            }
          />
          {/* BUTTON */}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="
          rounded-xl
          border
          border-slate-200
          px-5
          py-2.5
          text-sm
          font-medium
          text-slate-600
          transition
          hover:bg-slate-100
        "
            >
              Cancel
            </button>

            <Button type="submit">{editingId ? "Update Product" : "Save Product"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
