import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Modal from "@/shared/components/Modal";

import { executeProduction, getProductionOrderById, receiveProduction } from "../services/production-order.service";

import Tabs from "@/shared/components/Tabs";

import { STATUS_TABS } from "../constants/status";

export default function ProductionOrderDetailPage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [receiveOpen, setReceiveOpen] = useState(false);

  const [yieldQty, setYieldQty] = useState(0);

  const [processCost, setProcessCost] = useState(0);

  const [produceNowQty, setProduceNowQty] = useState(0);

  const [rejectQty, setRejectQty] = useState(0);

  const [shrinkageQty, setShrinkageQty] = useState(0);
  // =========================================
  // LOAD
  // =========================================

  async function loadOrder() {
    try {
      setLoading(true);

      const result = await getProductionOrderById(id);

      if (result.error) {
        console.error(result.error);
        return;
      }

      setOrder(result.data);

      setYieldQty(Number(result.data.yield_qty || 0));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [id]);

  // =========================================
  // EXECUTE
  // =========================================

  async function handleExecute() {
    const confirmExecute = window.confirm("Execute this production?");

    if (!confirmExecute) {
      return;
    }

    try {
      const result = await executeProduction(order);

      if (result.error) {
        return alert(result.error.message);
      }

      await loadOrder();

      alert("Production executed");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleReceive() {
    if (Number(rejectQty || 0) > Number(produceNowQty || 0)) {
      return alert("Reject qty cannot exceed produced qty");
    }
    try {
      const result = await receiveProduction({
        order,

        finalQty,

        totalYield,

        shrinkageQty: Number(shrinkageQty || 0),

        processCost: Number(processCost),
      });

      if (result.error) {
        return alert(result.error.message);
      }

      setReceiveOpen(false);

      setProduceNowQty(0);

      setRejectQty(0);

      setShrinkageQty(0);

      setProcessCost(0);

      await loadOrder();

      alert("Product received");
    } catch (err) {
      console.error(err);
    }
  }
  const STATUS_FLOW = {
    DRAFT: "IN_PROGRESS",
    IN_PROGRESS: "PARTIAL",
    PARTIAL: "QC",
    QC: "DONE",
  };

  const TIMELINE = ["DRAFT", "IN_PROGRESS", "PARTIAL", "QC", "DONE"];

  const nextStatus = STATUS_FLOW[order?.status];
  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return <div className="p-6">Loading production order...</div>;
  }

  if (!order) {
    return <div className="p-6">Order not found</div>;
  }
  const finalQty = Number(produceNowQty || 0) - Number(rejectQty || 0);

  const totalYield = Number(order.yield_qty || 0) + finalQty;

  const totalProgress = totalYield + Number(shrinkageQty || 0);

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard title="Production Qty" value={Number(order.production_qty || 0).toFixed(2)} />

        <SummaryCard title="Yield Qty" value={Number(order.yield_qty || 0).toFixed(2)} />

        <SummaryCard title="Process Cost" value={`Rp ${Number(order.process_cost || 0).toLocaleString("id-ID")}`} />

        <SummaryCard title="Status" value={order.status} valueClass="text-blue-400" />
      </div>

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
            <h1 className="text-2xl font-bold">{order.order_no}</h1>

            <p className="mt-2 text-slate-400">Product: {order.product?.name}</p>

            <p className="mt-1 text-slate-500">BOM: {order.bom?.name}</p>

            <p className="mt-1 text-slate-500">
              Production Qty: {Number(order.production_qty).toFixed(2)} {order.product?.unit}
            </p>

            {order.note && <p className="mt-4 text-sm text-slate-500">{order.note}</p>}
          </div>

          {/* RIGHT */}

          <div className="flex flex-col items-end gap-4">
            {/* STATUS BADGE */}

            <div
              className="
      rounded-xl
      bg-blue-500/10
      px-4
      py-2
      text-sm
      font-medium
      text-blue-400
    "
            >
              {order.status}
            </div>

            {/* ACTION */}

            {nextStatus && (
              <button
                onClick={async () => {
                  if (order.status === "DRAFT") {
                    await handleExecute();

                    return;
                  }

                  if (["QC", "PARTIAL"].includes(order.status)) {
                    setReceiveOpen(true);

                    return;
                  }
                }}
                className="
        rounded-xl
        bg-blue-600
        px-5
        py-2
        text-sm
        font-medium
        transition
        hover:bg-blue-500
      "
              >
                {order.status === "DRAFT" ? "Start Production" : ["QC", "PARTIAL"].includes(order.status) ? "Receive Product" : `Mark as ${nextStatus}`}
              </button>
            )}
          </div>
        </div>
      </div>
      <div
        className="
    rounded-2xl
    border
    border-slate-800
    bg-slate-900/70
    p-6
  "
      >
        <div className="flex items-center justify-between">
          {TIMELINE.map((status, index) => {
            const currentIndex = TIMELINE.indexOf(order.status);

            const isCompleted = index <= currentIndex;

            const isCurrent = status === order.status;

            return (
              <div key={status} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition ${
                      isCurrent ? "bg-blue-600 text-white ring-4 ring-blue-500/20" : isCompleted ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {index + 1}
                  </div>

                  <p className={`mt-2 text-xs ${isCurrent ? "text-white" : isCompleted ? "text-emerald-400" : "text-slate-500"}`}>{status}</p>
                </div>

                {index !== TIMELINE.length - 1 && <div className={`mb-6 h-1 flex-1 ${index < currentIndex ? "bg-emerald-500" : "bg-slate-800"}`} />}
              </div>
            );
          })}
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

              <th className="p-4 text-right">Required Qty</th>

              <th className="p-4 text-right">Stock</th>

              <th className="p-4 text-left">Unit</th>

              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {order.items?.map((item) => (
              <tr
                key={item.id}
                className="
                  border-t
                  border-slate-800
                "
              >
                <td className="p-4">{item.material?.name}</td>

                <td className="p-4 text-right font-medium">{Number(item.required_qty).toFixed(2)}</td>

                <td className="p-4 text-right">{Number(item.material?.stock || 0).toFixed(2)}</td>

                <td className="p-4">{item.material?.unit}</td>

                <td className="p-4 text-center">
                  {Number(item.material?.stock || 0) >= Number(item.required_qty) ? (
                    <span
                      className="
        inline-flex
        rounded-lg
        bg-emerald-500/10
        px-3
        py-1
        text-xs
        font-medium
        text-emerald-400
      "
                    >
                      READY
                    </span>
                  ) : (
                    <span
                      className="
        inline-flex
        rounded-lg
        bg-red-500/10
        px-3
        py-1
        text-xs
        font-medium
        text-red-400
      "
                    >
                      SHORTAGE
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={receiveOpen} onClose={() => setReceiveOpen(false)} title="Receive Product">
        <div className="space-y-5">
          {/* PRODUCED NOW */}

          <div>
            <label
              className="
      mb-2
      block
      text-sm
      font-medium
    "
            >
              Produced Now
            </label>

            <input
              type="number"
              value={produceNowQty}
              onChange={(e) => setProduceNowQty(e.target.value)}
              className="
      w-full
      rounded-xl
      border
      border-slate-700
      bg-slate-800
      px-4
      py-3
    "
            />
          </div>

          {/* REJECT */}

          <div>
            <label
              className="
      mb-2
      block
      text-sm
      font-medium
    "
            >
              Reject Qty
            </label>

            <input
              type="number"
              value={rejectQty}
              onChange={(e) => setRejectQty(e.target.value)}
              className="
      w-full
      rounded-xl
      border
      border-slate-700
      bg-slate-800
      px-4
      py-3
    "
            />
          </div>
          {/* SHRINKAGE */}

          <div>
            <label
              className="
      mb-2
      block
      text-sm
      font-medium
    "
            >
              Shrinkage Qty
            </label>

            <input
              type="number"
              value={shrinkageQty}
              onChange={(e) => setShrinkageQty(e.target.value)}
              className="
      w-full
      rounded-xl
      border
      border-slate-700
      bg-slate-800
      px-4
      py-3
    "
            />
          </div>
          {/* PROCESS COST */}

          <div>
            <label
              className="
          mb-2
          block
          text-sm
          font-medium
        "
            >
              Process Cost
            </label>

            <input
              type="number"
              value={processCost}
              onChange={(e) => setProcessCost(e.target.value)}
              className="
          w-full
          rounded-xl
          border
          border-slate-700
          bg-slate-800
          px-4
          py-3
        "
            />
          </div>

          {/* ACTION */}
          <div
            className="
    rounded-xl
    border
    border-slate-800
    bg-slate-950
    p-4
  "
          >
            <div className="flex justify-between">
              <span className="text-slate-400">Final Qty</span>

              <span className="font-bold text-emerald-400">{(Number(produceNowQty || 0) - Number(rejectQty || 0)).toFixed(2)}</span>
            </div>

            <div className="mt-3 flex justify-between">
              <span className="font-bold text-amber-400">{(Number(order.production_qty || 0) - totalProgress).toFixed(2)}</span>

              <span className="font-bold text-amber-400">{(Number(order.production_qty || 0) - (Number(order.yield_qty || 0) + (Number(produceNowQty || 0) - Number(rejectQty || 0)))).toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleReceive}
            className="
        w-full
        rounded-xl
        bg-blue-600
        px-5
        py-3
        font-medium
      "
          >
            Receive Product
          </button>
        </div>
      </Modal>
    </div>
  );
}

function SummaryCard({ title, value, valueClass = "" }) {
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

      <p className={`mt-3 text-3xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}
