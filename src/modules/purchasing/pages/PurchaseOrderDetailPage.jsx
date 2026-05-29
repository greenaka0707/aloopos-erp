import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import Button from "@/shared/components/common/Button";

import { supabase } from "@/lib/supabase";

export default function PurchaseOrderDetailPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [receiveOpen, setReceiveOpen] = useState(false);

  const [receivingProcess, setReceivingProcess] = useState(false);

  const [order, setOrder] = useState(null);

  const [receivingItems, setReceivingItems] = useState([]);

  // ========================================
  // LOAD
  // ========================================

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  async function loadOrder() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("purchase_orders")
        .select(
          `
                *,
                purchase_order_items (
                  *,
                  product:products (*)
                )
              `,
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);

        alert(error.message);
        return;
      }

      setOrder(data);

      setReceivingItems(
        data.purchase_order_items?.map((item, index) => ({
          id: item.id,

          product_id: item.product_id || item.product?.id,

          product_name: item.product?.name,

          po_qty: Number(item.qty || 0),

          received_qty: Number(item.received_qty || 0),

          receive_now_qty: 0,

          reject_qty: 0,
        })) || [],
      );
    } finally {
      setLoading(false);
    }
  }
  function updateReceivingItem(index, field, value) {
    const updated = [...receivingItems];

    updated[index][field] = value;

    setReceivingItems(updated);
  }

  async function handleUpdateStatus(status) {
    const { error } = await supabase
      .from("purchase_orders")
      .update({
        receive_status: status,
      })
      .eq("id", order.id);

    if (error) {
      console.error(error);

      alert(error.message);

      return;
    }

    await loadOrder();
    setReceiveOpen(false);
  }

  async function handleCompleteReceiving() {
    if (receivingProcess) return;

    setReceivingProcess(true);

    try {
      for (const item of receivingItems) {
        // ========================================
        // BASE QTY
        // ========================================

        const poQty = Number(item.po_qty || 0);

        const alreadyReceived = Number(item.received_qty || 0);

        const receiveNow = Number(item.receive_now_qty || 0);

        const rejectQty = Number(item.reject_qty || 0);

        // ========================================
        // VALIDATION
        // ========================================

        if (rejectQty > receiveNow) {
          alert(`${item.product_name} reject qty invalid`);

          return;
        }

        // ========================================
        // FINAL RECEIVED
        // ========================================

        const finalQty = Math.max(receiveNow - rejectQty, 0);
        if (finalQty <= 0) {
          continue;
        }

        // ========================================
        // CLAMP
        // ========================================

        const allowedQty = poQty - alreadyReceived;

        const safeQty = finalQty;

        if (safeQty <= 0) {
          continue;
        }

        const totalReceived = alreadyReceived + safeQty;

        // ========================================
        // GET COST
        // ========================================

        const incomingCost = Number(order.purchase_order_items.find((poItem) => (poItem.product_id || poItem.product?.id) === item.product_id)?.price || 0);

        // ========================================
        // UPDATE RECEIVED
        // ========================================

        const { error: receiveError } = await supabase
          .from("purchase_order_items")
          .update({
            received_qty: totalReceived,
          })
          .eq("id", item.id);

        if (receiveError) {
          throw receiveError;
        }

        // ========================================
        // INVENTORY MOVEMENT
        // ========================================

        const { error: movementError } = await supabase.from("inventory_movements").insert({
          product_id: item.product_id,

          type: "IN",

          qty: safeQty,

          unit_cost: incomingCost,

          total_cost: safeQty * incomingCost,

          reference_type: "PURCHASE_ORDER",

          reference_id: order.id,

          source_line_id: item.id,

          note: `PO ${order.po_number}`,
        });

        if (movementError) {
          throw movementError;
        }

        // ========================================
        // GET PRODUCT
        // ========================================

        const { data: product } = await supabase
          .from("products")
          .select(
            `
            stock,
            average_cost
          `,
          )
          .eq("id", item.product_id)
          .single();

        const currentStock = Number(product?.stock || 0);

        const currentAverage = Number(product?.average_cost || 0);

        // ========================================
        // MOVING AVERAGE
        // ========================================

        const newStock = currentStock + safeQty;

        const newAverage = newStock <= 0 ? incomingCost : (currentStock * currentAverage + safeQty * incomingCost) / newStock;

        // ========================================
        // UPDATE PRODUCT
        // ========================================

        const { error: stockError } = await supabase
          .from("products")
          .update({
            stock: newStock,

            average_cost: Number(newAverage.toFixed(2)),
          })
          .eq("id", item.product_id);

        if (stockError) {
          throw stockError;
        }
      }

      // ========================================
      // GET LATEST ITEMS
      // ========================================

      const { data: latestItems, error: latestError } = await supabase.from("purchase_order_items").select("*").eq("purchase_order_id", order.id);

      if (latestError) {
        throw latestError;
      }

      // ========================================
      // CHECK STATUS
      // ========================================

      const isCompleted = latestItems.every((poItem) => {
        const received = Number(poItem.received_qty || 0);

        const qty = Number(poItem.qty || 0);

        return received >= qty;
      });

      const hasReceiving = latestItems.some((poItem) => Number(poItem.received_qty || 0) > 0);

      // ========================================
      // FINAL STATUS
      // ========================================

      let finalStatus = order.receive_status;

      if (order.receive_status === "PENDING") {
        finalStatus = "CHECKING";
      }

      if (hasReceiving && !isCompleted) {
        finalStatus = "PARTIAL";
      }

      if (isCompleted) {
        finalStatus = "COMPLETED";
      }

      // ========================================
      // UPDATE PO
      // ========================================

      const { error: statusError } = await supabase
        .from("purchase_orders")
        .update({
          receive_status: finalStatus,
        })
        .eq("id", order.id);

      if (statusError) {
        throw statusError;
      }

      // ========================================
      // RESET FORM
      // ========================================

      setReceivingItems(
        receivingItems.map((item) => ({
          ...item,
          receive_now_qty: 0,
          reject_qty: 0,
        })),
      );

      alert("Receiving processed");

      setReceiveOpen(false);

      await loadOrder();
    } catch (error) {
      console.error(error);

      alert(error.message);
    } finally {
      setReceivingProcess(false);
    }
  }

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  // ========================================
  // NOT FOUND
  // ========================================

  if (!order) {
    return <div className="p-6">Purchase order not found</div>;
  }

  // ========================================
  // TOTAL
  // ========================================

  const total =
    order.purchase_order_items?.reduce((sum, item) => {
      return sum + Number(item.qty || 0) * Number(item.price || 0);
    }, 0) || 0;
  const TIMELINE = ["PENDING", "CHECKING", "PARTIAL", "COMPLETED"];
  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}

      <div className="space-y-3">
        <Button variant="secondary" onClick={() => navigate("/purchasing")} className="w-fit">
          Back
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{order.po_number}</h1>

            <p className="mt-1 text-sm text-slate-400">Purchase order detail</p>
          </div>

          <div className="flex items-center gap-2">
            {order.receive_status === "PENDING" && (
              <Button variant="secondary" onClick={() => navigate(`/purchasing/${id}/edit`)}>
                Edit PO
              </Button>
            )}

            {["PENDING", "CHECKING", "PARTIAL"].includes(order.receive_status) && (
              <Button
                onClick={async () => {
                  if (order.receive_status === "PENDING") {
                    await handleUpdateStatus("CHECKING");
                  }

                  setReceiveOpen(true);
                }}
              >
                Receive Material
              </Button>
            )}
          </div>
        </div>
      </div>
      {/* SUMMARY */}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* PURCHASE ORDER */}

        <div
          className="
      rounded-2xl
      border border-slate-800
      bg-slate-900/70
      p-5
    "
        >
          <p
            className="
        text-xs uppercase
        tracking-wider
        text-slate-500
      "
          >
            Purchase Order
          </p>

          <div className="mt-5 space-y-5">
            <div>
              <p className="text-xs text-slate-400">Supplier</p>

              <p className="mt-1 text-xl font-semibold">{order.supplier_name}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Total Items</p>

              <p className="mt-1 font-semibold">{order.purchase_order_items?.length || 0}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Total Amount</p>

              <p className="mt-1 text-2xl font-bold">Rp {total.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>

        {/* FINANCE */}

        <div
          className="
      rounded-2xl
      border border-slate-800
      bg-slate-900/70
      p-5
    "
        >
          <p
            className="
        text-xs uppercase
        tracking-wider
        text-slate-500
      "
          >
            Finance
          </p>

          <div className="mt-5 space-y-5">
            <div>
              <p className="text-xs text-slate-400">Payment Status</p>

              <p className="mt-1 text-xl font-semibold text-red-400">{order.payment_status}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Remaining</p>

              <p className="mt-1 font-semibold">Rp {Number(order.remaining_amount || 0).toLocaleString("id-ID")}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Paid Amount</p>

              <p className="mt-1 font-semibold">Rp {Number(order.paid_amount || 0).toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>

        {/* RECEIVING */}

        <div
          className="
      rounded-2xl
      border border-slate-800
      bg-slate-900/70
      p-5
    "
        >
          <p
            className="
        text-xs uppercase
        tracking-wider
        text-slate-500
      "
          >
            Receiving
          </p>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              {TIMELINE.map((status, index) => {
                const currentIndex = TIMELINE.indexOf(order.receive_status);

                const isCompleted = index <= currentIndex;

                const isCurrent = status === order.receive_status;

                return (
                  <div key={status} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                          isCurrent ? "bg-blue-600 text-white ring-4 ring-blue-500/20" : isCompleted ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {index + 1}
                      </div>

                      <p className={`mt-2 text-[11px] ${isCurrent ? "text-white" : isCompleted ? "text-emerald-400" : "text-slate-500"}`}>{status}</p>
                    </div>

                    {index !== TIMELINE.length - 1 && <div className={`mb-6 h-1 flex-1 ${index < currentIndex ? "bg-emerald-500" : "bg-slate-800"}`} />}
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <p className="text-xs text-slate-400">Current Status</p>

              <p className="mt-1 font-semibold text-blue-400">{order.receive_status}</p>
            </div>
          </div>
        </div>
      </div>
      {/* ITEMS */}

      <div
        className="
      overflow-hidden
      rounded-2xl
      border
      border-slate-800
      bg-slate-900/70
    "
      >
        <div className="border-b border-slate-800 p-5">
          <h2 className="text-lg font-semibold">Purchase Items</h2>
        </div>

        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="p-4 text-left">Product</th>

              <th className="p-4 text-right">PO Qty</th>

              <th className="p-4 text-right">Received</th>

              <th className="p-4 text-right">Remaining</th>

              <th className="p-4 text-right">Price</th>

              <th className="p-4 text-right">Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {order.purchase_order_items?.map((item) => (
              <tr key={item.id} className="border-t border-slate-800">
                <td className="p-4">{item.product?.name}</td>

                <td className="p-4 text-right">{Number(item.qty || 0).toFixed(2)}</td>

                <td className="p-4 text-right text-emerald-400">{Number(item.received_qty || 0).toFixed(2)}</td>

                <td className="p-4 text-right text-amber-400">{Math.max(Number(item.qty || 0) - Number(item.received_qty || 0), 0).toFixed(2)}</td>

                <td className="p-4 text-right">Rp {Number(item.price || 0).toLocaleString("id-ID")}</td>

                <td className="p-4 text-right font-medium">Rp {(Number(item.qty || 0) * Number(item.price || 0)).toLocaleString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {receiveOpen && (
        <div
          className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/70
        p-4
      "
        >
          <div
            className="
          w-full
          max-w-4xl
          rounded-2xl
          border
          border-slate-800
          bg-slate-900
        "
          >
            <div
              className="
            flex items-center justify-between
            border-b border-slate-800
            p-5
          "
            >
              <h2 className="text-xl font-semibold">Receive Material</h2>

              <button onClick={() => setReceiveOpen(false)} className="text-slate-400">
                ✕
              </button>
            </div>

            <div className="p-5">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="p-4 text-left">Product</th>

                    <th className="p-4 text-right">PO Qty</th>

                    <th className="p-4 text-right">Already Received</th>

                    <th className="p-4 text-right">Receive Now</th>

                    <th className="p-4 text-right">Reject</th>

                    <th className="p-4 text-right">Final Qty</th>

                    <th className="p-4 text-right">Remaining</th>
                  </tr>
                </thead>

                <tbody>
                  {receivingItems.map((item, index) => {
                    const finalQty = Number(item.receive_now_qty || 0) - Number(item.reject_qty || 0);

                    const remainingQty = Math.max(Number(item.po_qty || 0) - (Number(item.received_qty || 0) + finalQty), 0);

                    return (
                      <tr
                        key={item.id}
                        className="
        border-t border-slate-800
        hover:bg-slate-800/30
      "
                      >
                        {/* PRODUCT */}

                        <td className="p-4">
                          <div className="font-medium">{item.product_name}</div>
                        </td>

                        {/* PO QTY */}

                        <td className="p-4 text-right">{Number(item.po_qty || 0).toFixed(2)}</td>

                        {/* RECEIVED */}

                        <td
                          className="
          p-4 text-right
          text-emerald-400
        "
                        >
                          {Number(item.received_qty || 0).toFixed(2)}
                        </td>

                        {/* RECEIVE NOW */}

                        <td className="p-4 text-right">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            inputMode="decimal"
                            disabled={order.receive_status === "COMPLETED"}
                            value={item.receive_now_qty}
                            onChange={(e) => updateReceivingItem(index, "receive_now_qty", e.target.value)}
                            className="
            w-28
            rounded-xl
            border border-slate-700
            bg-slate-800
            px-3 py-2
            text-right
            outline-none
            transition
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/20

            [appearance:textfield]
            [&::-webkit-outer-spin-button]:appearance-none
            [&::-webkit-inner-spin-button]:appearance-none
          "
                          />
                        </td>

                        {/* REJECT */}

                        <td className="p-4 text-right">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            inputMode="decimal"
                            disabled={order.receive_status === "COMPLETED"}
                            value={item.reject_qty}
                            onChange={(e) => updateReceivingItem(index, "reject_qty", e.target.value)}
                            className="
            w-28
            rounded-xl
            border border-slate-700
            bg-slate-800
            px-3 py-2
            text-right
            outline-none
            transition
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/20

            [appearance:textfield]
            [&::-webkit-outer-spin-button]:appearance-none
            [&::-webkit-inner-spin-button]:appearance-none
          "
                          />
                        </td>

                        {/* FINAL */}

                        <td
                          className="
          p-4 text-right
          font-semibold
          text-emerald-400
        "
                        >
                          {finalQty.toFixed(2)}
                        </td>

                        {/* REMAINING */}

                        <td
                          className="
          p-4 text-right
          font-semibold
          text-amber-400
        "
                        >
                          {remainingQty.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setReceiveOpen(false)}>
                  Cancel
                </Button>

                <Button disabled={receivingProcess} onClick={handleCompleteReceiving}>
                  {receivingProcess ? "Processing..." : "Process Receiving"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================
// SUMMARY CARD
// ========================================

function SummaryCard({ title, value }) {
  return (
    <div
      className="
          rounded-2xl
          border
          border-slate-800
          bg-slate-900/70
          p-5
        "
    >
      <p className="text-sm text-slate-400">{title}</p>

      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}
