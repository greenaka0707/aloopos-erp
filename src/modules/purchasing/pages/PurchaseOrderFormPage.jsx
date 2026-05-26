import { useEffect, useState } from "react";

import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";

import { createPurchaseOrder } from "@/modules/purchasing/services/purchasing.service";

import { supabase } from "@/lib/supabase";

import { useNavigate } from "react-router-dom";

export default function PurchaseOrderFormPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [supplierName, setSupplierName] = useState("");

  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);

  const [paidAmount, setPaidAmount] = useState(0);

  const [shippingCost, setShippingCost] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState([
    {
      product_id: "",
      qty: 1,
      price: 0,
    },
  ]);

  // ============================================
  // LOAD PRODUCTS
  // ============================================

  useEffect(() => {
    getProducts();
  }, []);

  async function getProducts() {
    const { data, error } = await supabase.from("products").select("*").order("name");

    if (error) {
      console.error(error);

      return;
    }

    setProducts(data || []);
  }

  // ============================================
  // ITEM HANDLER
  // ============================================

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
    if (items.length === 1) {
      return;
    }

    const updated = [...items];

    updated.splice(index, 1);

    setItems(updated);
  }

  function updateItem(index, field, value) {
    const updated = [...items];

    updated[index][field] = value;

    setItems(updated);
  }

  // ============================================
  // SUMMARY
  // ============================================

  const subtotal = items.reduce((acc, item) => {
    return acc + Number(item.qty || 0) * Number(item.price || 0);
  }, 0);

  const total = subtotal + Number(shippingCost || 0);

  // ============================================
  // SUBMIT
  // ============================================

  async function handleSubmit() {
    try {
      // ========================================
      // PREVENT DOUBLE CLICK
      // ========================================

      if (isSubmitting) {
        return;
      }

      // ========================================
      // VALIDATION
      // ========================================

      if (!supplierName.trim()) {
        alert("Supplier required");

        return;
      }

      if (items.length === 0) {
        alert("Items required");

        return;
      }

      const invalidItem = items.find((item) => !item.product_id || Number(item.qty) <= 0 || Number(item.price) <= 0);

      if (invalidItem) {
        alert("Product, qty, and price are required");

        return;
      }

      if (Number(paidAmount || 0) > total) {
        alert("Paid amount cannot exceed total");

        return;
      }

      // ========================================
      // SAVE
      // ========================================

      setIsSubmitting(true);

      const result = await createPurchaseOrder({
        supplierName,
        orderDate,
        items,
        paidAmount,
        shippingCost,
      });

      if (result?.error) {
        console.error(result.error);

        alert(result.error.message || "Failed to save purchase order");

        return;
      }

      // ========================================
      // SUCCESS
      // ========================================

      alert("Purchase Order Saved");

      navigate("/purchasing", {
        replace: true,
      });
    } catch (error) {
      console.error(error);

      alert(error.message || "Failed to save purchase order");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ... (Bagian import dan logika state tetap sama)

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Create Purchase Order</h1>
          <p className="text-slate-400 text-sm">Manage new supplier procurement requests</p>
        </div>
        <Button variant="secondary" onClick={() => navigate("/purchasing")}>
          Back to List
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* LEFT COLUMN: FORM */}
        <div className="erp-card col-span-9 flex flex-col gap-8">
          {/* HEADER FORM FIELDS (Tanpa Paid Amount) */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase text-slate-500">Supplier</label>
              <Input placeholder="Supplier Name" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase text-slate-500">Order Date</label>
              <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
            </div>
          </div>

          {/* DYNAMIC ITEMS LIST */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-12 gap-4 px-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <div className="col-span-5">Product</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-2 text-center">Subtotal</div>
              <div className="col-span-1"></div>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-5">
                  <select
                    value={item.product_id}
                    onChange={(e) => updateItem(index, "product_id", e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-blue-500 transition-all outline-none"
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <Input type="number" value={item.qty} onChange={(e) => updateItem(index, "qty", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Input type="number" value={item.price} onChange={(e) => updateItem(index, "price", e.target.value)} />
                </div>
                <div className="col-span-2 text-center font-mono text-slate-300">Rp {(Number(item.qty || 0) * Number(item.price || 0)).toLocaleString("id-ID")}</div>
                <div className="col-span-1 flex justify-center">
                  <button onClick={() => removeItem(index)} className="text-red-500/70 hover:text-red-400 text-xs font-bold uppercase">
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button onClick={addItem} className="mt-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors w-fit">
              + Add Another Item
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: SUMMARY & PAYMENT */}
        <div className="erp-card col-span-3 h-fit sticky top-6">
          <div className="flex flex-col gap-6">
            {/* PAID AMOUNT PINDAH KE SINI */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase text-slate-500">Paid Amount (Rp)</label>
              <Input type="number" placeholder="0" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
            </div>

            {/* SHIPPING COST */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase text-slate-500">Shipping Cost (Rp)</label>
              <Input type="number" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} />
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span> <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span> <span>Rp {Number(shippingCost || 0).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2">
                <span>Total</span> <span>Rp {total.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Processing..." : "Save Purchase Order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
