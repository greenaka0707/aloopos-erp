import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "@/shared/components/common/Button";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { getSalesOrderById, updateSalesStatus, voidSalesOrder } from "../services/sales.service";

// ========================================
// HELPERS
// ========================================

const STATUS_CLASSES = {
  PENDING: "bg-yellow-100 text-yellow-700",
  DIKEMAS: "bg-orange-100 text-orange-700",
  DIKIRIM: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  VOID: "bg-red-100 text-red-700",
  DRAFT: "bg-slate-100 text-slate-600",
};

function formatRupiah(value = 0) {
  return `Rp ${Math.round(value || 0).toLocaleString("id-ID")}`;
}

// ========================================
// COMPONENT
// ========================================

export default function SalesOrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState(null);

  // ========================================
  // LOAD DATA
  // ========================================

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  async function loadOrder() {
    try {
      setLoading(true);
      const data = await getSalesOrderById(id);
      setOrder(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // TOTALS
  // ========================================

  const totals = useMemo(() => {
    if (!order) {
      return { revenue: 0, hpp: 0, profit: 0 };
    }

    const revenue =
      order.items?.reduce((sum, item) => sum + Number(item.subtotal || 0), 0) || 0;

    const hpp =
      order.items?.reduce((sum, item) => sum + Number(item.total_hpp || 0), 0) || 0;

    return {
      revenue,
      hpp,
      profit: revenue - hpp,
    };
  }, [order]);

  // ========================================
  // STATUS WORKFLOW
  // ========================================

  const STATUS_FLOW = {
    PENDING: "DIKEMAS",
    DIKEMAS: "DIKIRIM",
    DIKIRIM: "COMPLETED",
  };

  const TIMELINE = ["PENDING", "DIKEMAS", "DIKIRIM", "COMPLETED"];
  const nextStatus = order ? STATUS_FLOW[order.status] : null;

  async function handleUpdateStatus(status) {
    try {
      setSaving(true);
      const result = await updateSalesStatus(order.id, status);

      if (result.error) {
        alert(result.error.message || "Failed update status");
        return;
      }

      navigate(`/sales?tab=${status}`);
    } finally {
      setSaving(false);
    }
  }

  // ========================================
  // VOID ACTION
  // ========================================

  async function handleVoid() {
    const confirmVoid = confirm(`Void sales order ${order.so_number}?`);
    if (!confirmVoid) return;

    try {
      setSaving(true);
      const result = await voidSalesOrder(order);

      if (result.error) {
        alert(result.error.message || "Failed void order");
        return;
      }

      navigate("/sales?tab=VOID");
    } finally {
      setSaving(false);
    }
  }

  // ========================================
  // LOADING SKELETON
  // ========================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-72 animate-pulse rounded-xl bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  // ========================================
  // NOT FOUND
  // ========================================

  if (!order) {
    return (
      <div className="p-6">
        <p className="text-slate-400">Sales order not found</p>
      </div>
    );
  }

  function handleDownloadInvoice() {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("INVOICE", 14, 20);

  doc.setFontSize(11);

  doc.text(`No Invoice : ${order.so_number}`, 14, 35);
  doc.text(`Tanggal : ${order.order_date}`, 14, 42);

  doc.text(`Customer : ${order.customer_name}`, 14, 55);
  doc.text(`Sales : ${order.sales_name || "-"}`, 14, 62);

  const rows =
    order.items?.map((item) => [
      item.product?.name,
      item.qty,
      formatRupiah(item.price),
      formatRupiah(item.subtotal),
    ]) || [];

  autoTable(doc, {
    startY: 75,
    head: [["Produk", "Qty", "Harga", "Subtotal"]],
    body: rows,
  });

  const finalY = doc.lastAutoTable.finalY + 15;

  doc.text(
    `Total : ${formatRupiah(totals.revenue)}`,
    140,
    finalY
  );

  doc.text(
    `Status Pembayaran : ${
      order.is_paid ? "LUNAS" : "BELUM LUNAS"
    }`,
    14,
    finalY + 15
  );

  doc.save(`Invoice_${order.so_number}.pdf`);
}

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="space-y-4">
        <Button variant="secondary" onClick={() => navigate("/sales")} className="w-fit">
          Back
        </Button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{order.so_number}</h1>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  STATUS_CLASSES[order.status] || "bg-slate-100 text-slate-600"
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">Sales order detail information</p>
          </div>

         <div className="flex flex-wrap gap-2">
  <Button
    variant="secondary"
    onClick={handleDownloadInvoice}
  >
    Download Invoice
  </Button>

  <Button
    onClick={() => navigate(`/sales/orders/edit/${order.id}`)}
  >
    Edit
  </Button>

  {order.status !== "VOID" && (
    <Button
      variant="danger"
      onClick={handleVoid}
      disabled={saving}
    >
      Void
    </Button>
  )}
</div>
        </div>
      </div>

      {/* TOP GRID */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* CUSTOMER INFO */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Customer Info</h2>
            <p className="mt-1 text-sm text-slate-500">Customer transaction data</p>
          </div>
          <div className="space-y-5">
            <InfoRow label="Customer" value={order.customer_name} />
            <InfoRow label="Salesman" value={order.sales_name || "-"} />
            <InfoRow label="Order Date" value={order.order_date} />
            <InfoRow label="Payment Status" value={order.is_paid ? "Paid" : "Unpaid"} />
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
            <p className="mt-1 text-sm text-slate-500">Revenue and profitability</p>
          </div>
          <div className="space-y-5">
            <SummaryMini title="Revenue" value={formatRupiah(totals.revenue)} />
            <SummaryMini title="HPP" value={formatRupiah(totals.hpp)} />
            <SummaryMini title="Profit" value={formatRupiah(totals.profit)} valueClass="text-emerald-600" />
            <SummaryMini title="Paid" value={formatRupiah(order.paid_amount)} />
          </div>
        </div>

        {/* STATUS CONTROL & TIMELINE */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Status Control</h2>
            <p className="mt-1 text-sm text-slate-500">Workflow progression</p>
          </div>

          <div>
            {nextStatus ? (
              <Button disabled={saving} onClick={() => handleUpdateStatus(nextStatus)} className="w-full">
                Mark as {nextStatus}
              </Button>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
                {order.status === "VOID" ? "Order Voided" : "Order Completed"}
              </div>
            )}
          </div>

          {/* TIMELINE VIEW */}
          {order.status !== "VOID" && (
            <div className="mt-10">
              <div className="flex items-center">
                {TIMELINE.map((status, index) => {
                  const currentIndex = TIMELINE.indexOf(order.status);
                  const isCompleted = index <= currentIndex;
                  const isCurrent = status === order.status;

                  return (
                    <div key={status} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition ${
                            isCurrent
                              ? "bg-blue-600 text-white ring-4 ring-blue-100"
                              : isCompleted
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <p
                          className={`mt-2 text-[11px] font-medium ${
                            isCurrent ? "text-slate-900" : isCompleted ? "text-emerald-600" : "text-slate-400"
                          }`}
                        >
                          {status}
                        </p>
                      </div>

                      {index !== TIMELINE.length - 1 && (
                        <div
                          className={`mb-6 h-[3px] flex-1 ${
                            index < currentIndex ? "bg-emerald-500" : "bg-slate-200"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">Sales Items</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Product</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Qty</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Price</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">HPP</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Subtotal</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items?.map((item) => {
                const profit = Number(item.subtotal || 0) - Number(item.total_hpp || 0);

                return (
                  <tr key={item.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">{item.product?.name}</td>
                    <td className="px-6 py-4 text-slate-700">{item.qty}</td>
                    <td className="px-6 py-4 text-slate-700">{formatRupiah(item.price)}</td>
                    <td className="px-6 py-4 text-slate-700">{formatRupiah(item.hpp)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-800">{formatRupiah(item.subtotal)}</td>
                    <td
                      className={`px-6 py-4 text-right font-semibold ${
                        profit >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {formatRupiah(profit)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ========================================
// REUSABLE SUB-COMPONENTS
// ========================================

function SummaryMini({ title, value, valueClass = "" }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`text-xl font-bold text-slate-900 ${valueClass}`}>{value}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-medium text-slate-900">{value}</p>
    </div>
  );
}
