import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import Table from "@/shared/components/Table";
import Tabs from "@/shared/components/Tabs";

import { supabase } from "@/lib/supabase";

import { createSalesOrder, getSalesOrderById, updateSalesOrder } from "../services/sales.service";

export default function SalesPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);

  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);

  const [customerName, setCustomerName] = useState("");

  const [salesName, setSalesName] = useState("");

  const [paidAmount, setPaidAmount] = useState(0);

  const [isDraft, setIsDraft] = useState(false);

  const [items, setItems] = useState([
    {
      product_id: "",
      qty: 1,
      price: 0,
    },
  ]);

  // =====================================
  // LOAD PRODUCTS
  // =====================================

  useEffect(() => {
    getProducts();
  }, []);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  async function getProducts() {
    const { data } = await supabase.from("products").select("*").order("name");

    setProducts(data || []);
  }

  async function loadOrder() {
    try {
      setLoading(true);

      const data = await getSalesOrderById(id);

      if (!data) return;

      setOrderDate(data.order_date || "");

      setCustomerName(data.customer_name || "");

      setSalesName(data.sales_name || "");

      setPaidAmount(data.paid_amount || 0);

      setIsDraft(data.is_draft || false);

      setItems(
        data.items?.map((item) => ({
          id: item.id,
          product_id: item.product_id,
          qty: item.qty,
          price: item.price,
        })) || [],
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // =====================================
  // ITEM
  // =====================================

  function addItem() {
    setItems([
      ...items,
      {
        product_id: "",
        qty: 1,
        price: 0,
      },
    ]);
  }

  function removeItem(index) {
    if (items.length === 1) return;

    const updated = items.filter((_, i) => i !== index);

    setItems(updated);
  }

  function updateItem(index, field, value) {
    const updated = [...items];

    updated[index][field] = value;

    setItems(updated);
  }

  // =====================================
  // TOTAL
  // =====================================

  const total = items.reduce((acc, item) => {
    return acc + Number(item.qty || 0) * Number(item.price || 0);
  }, 0);

  // =====================================
  // SUBMIT
  // =====================================

  async function handleSubmit() {
    if (!customerName) {
      alert("Customer wajib diisi");

      return;
    }

    const invalidItem = items.find((item) => !item.product_id || Number(item.qty) <= 0 || Number(item.price) <= 0);

    if (invalidItem) {
      alert("Lengkapi item");

      return;
    }

    try {
      setLoading(true);

      const payload = {
        orderDate,

        customerName,

        salesName,

        paidAmount,

        isDraft,

        items,
      };
      console.log("EDIT MODE:", isEditMode);
      console.log("ID:", id);
      const result = isEditMode ? await updateSalesOrder(id, payload) : await createSalesOrder(payload);

      if (result.error) {
        alert(result.error.message);

        return;
      }

      alert(isEditMode ? "Sales Order berhasil diupdate" : "Sales Order berhasil dibuat");

      navigate("/sales");
    } finally {
      setLoading(false);
    }
  }

  // =====================================
  // RENDER
  // =====================================

  return (
    <div className="space-y-6">
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="flex items-start justify-between">
        <div>
          <h1
            className="
            text-4xl
            font-bold
            text-slate-900
          "
          >
            {isEditMode ? "Edit Sales Order" : "Create Sales Order"}
          </h1>

          <p className="mt-2 text-slate-500">{isEditMode ? "Update sales order transaction" : "Sales transaction entry"}</p>
        </div>

        <Button variant="secondary" onClick={() => navigate("/sales")}>
          Back
        </Button>
      </div>

      {/* ===================================================== */}
      {/* FORM */}
      {/* ===================================================== */}

      <div
        className="
        flex
        flex-col
        gap-6
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-6
      "
      >
        {/* ===================================================== */}
        {/* HEADER FORM */}
        {/* ===================================================== */}

        <div className="grid grid-cols-4 gap-4">
          <div>
            <p
              className="
              mb-2
              text-sm
              text-slate-500
            "
            >
              Tanggal
            </p>

            <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
          </div>

          <div>
            <p
              className="
              mb-2
              text-sm
              text-slate-500
            "
            >
              Customer
            </p>

            <Input placeholder="Customer" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>

          <div>
            <p
              className="
              mb-2
              text-sm
              text-slate-500
            "
            >
              Salesman
            </p>

            <Input placeholder="Salesman" value={salesName} onChange={(e) => setSalesName(e.target.value)} />
          </div>

          <div>
            <p
              className="
              mb-2
              text-sm
              text-slate-500
            "
            >
              Bayar
            </p>

            <Input placeholder="Bayar" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
          </div>
        </div>

        {/* ===================================================== */}
        {/* ITEMS TABLE */}
        {/* ===================================================== */}

        <div
          className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
        "
        >
          <table className="w-full">
            {/* HEAD */}

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
                  Product
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
                  Qty
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
                  Price
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
                  Subtotal
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
                  Action
                </th>
              </tr>
            </thead>

            {/* BODY */}

            <tbody>
              {items.map((item, index) => {
                const subtotal = Number(item.qty || 0) * Number(item.price || 0);

                return (
                  <tr
                    key={index}
                    className="
                    border-b
                    border-slate-100
                    transition
                    hover:bg-slate-50
                  "
                  >
                    {/* PRODUCT */}

                    <td className="px-6 py-4">
                      <select value={item.product_id} onChange={(e) => updateItem(index, "product_id", e.target.value)} className="erp-input">
                        <option value="">Select Product</option>

                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* QTY */}

                    <td className="px-6 py-4">
                      <Input placeholder="Qty" value={item.qty} onChange={(e) => updateItem(index, "qty", e.target.value)} />
                    </td>

                    {/* PRICE */}

                    <td className="px-6 py-4">
                      <Input placeholder="Price" value={item.price} onChange={(e) => updateItem(index, "price", e.target.value)} />
                    </td>

                    {/* SUBTOTAL */}

                    <td
                      className="
                      px-6
                      py-4
                      text-right
                      font-semibold
                      text-slate-800
                    "
                    >
                      Rp {Math.round(subtotal).toLocaleString()}
                    </td>

                    {/* ACTION */}

                    <td
                      className="
                      px-6
                      py-4
                      text-center
                    "
                    >
                      <button
                        onClick={() => removeItem(index)}
                        className="
                        rounded-xl
                        border
                        border-red-200
                        px-3
                        py-2
                        text-sm
                        font-medium
                        text-red-600
                        transition
                        hover:bg-red-50
                      "
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ===================================================== */}
        {/* FOOTER */}
        {/* ===================================================== */}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={addItem}>+ Add Item</Button>

            <label
              className="
              flex
              items-center
              gap-2
            "
            >
              <input type="checkbox" checked={isDraft} onChange={(e) => setIsDraft(e.target.checked)} />

              <span
                className="
                text-sm
                text-slate-500
              "
              >
                Save as Draft
              </span>
            </label>
          </div>

          <div className="text-right">
            <p
              className="
              text-sm
              text-slate-500
            "
            >
              Grand Total
            </p>

            <p
              className="
              text-3xl
              font-bold
              text-slate-900
            "
            >
              Rp {Math.round(total).toLocaleString()}
            </p>
          </div>
        </div>

        {/* ===================================================== */}
        {/* SAVE */}
        {/* ===================================================== */}

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save Sales Order"}
        </Button>
      </div>
    </div>
  );
}
