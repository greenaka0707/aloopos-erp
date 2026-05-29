import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import Button from "@/shared/components/common/Button";
import DesktopTabs from "@/shared/components/desktop/DesktopTabs";
import DataTable from "@/shared/components/desktop/DataTable";

import { supabase } from "@/lib/supabase";



export default function PurchasingPage() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);

      const { data, error } = await supabase.from("purchase_orders").select("*").order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error(error);

        return;
      }

      setOrders(data || []);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = activeTab === "ALL" ? orders : orders.filter((order) => order.receive_status === activeTab);

  return (
    <div className="space-y-6">
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Purchase Orders</h1>

          <p className="mt-2 text-slate-500">Purchasing management</p>
        </div>

        <Button onClick={() => navigate("/purchasing/create")}>+ Create Purchase Order</Button>
      </div>

      {/* ===================================================== */}
      {/* TABS */}
      {/* ===================================================== */}

      <div
        className="
        flex
        items-center
        gap-2
        border-b
        border-slate-200
      "
      >
        {["ALL", "PENDING", "CHECKING", "PARTIAL", "COMPLETED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
            border-b-2
            px-1
            py-3
            text-sm
            font-medium
            transition

            ${
              activeTab === tab
                ? `
                  border-blue-600
                  text-blue-600
                `
                : `
                  border-transparent
                  text-slate-500
                  hover:text-slate-900
                `
            }
          `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ===================================================== */}
      {/* TABLE */}
      {/* ===================================================== */}

      <div
        className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
      "
      >
        {loading ? (
          <div
            className="
            py-24
            text-center
            text-slate-500
          "
          >
            Loading...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div
            className="
            flex
            flex-col
            items-center
            justify-center
            py-24
          "
          >
            <h2
              className="
              text-xl
              font-semibold
              text-slate-900
            "
            >
              No purchase orders
            </h2>

            <p className="mt-2 text-slate-500">Create your first purchase order</p>
          </div>
        ) : (
          <table className="w-full">
            {/* ===================================================== */}
            {/* HEAD */}
            {/* ===================================================== */}

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
                  PO Number
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
                  Supplier
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
                  Date
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
                  Receive
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
                  Payment
                </th>
              </tr>
            </thead>

            {/* ===================================================== */}
            {/* BODY */}
            {/* ===================================================== */}

            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/purchasing/orders/${order.id}`)}
                  className="
                  cursor-pointer
                  border-b
                  border-slate-100
                  transition
                  hover:bg-slate-50
                "
                >
                  <td
                    className="
                    px-6
                    py-4
                    font-medium
                    text-blue-600
                  "
                  >
                    {order.po_number}
                  </td>

                  <td
                    className="
                    px-6
                    py-4
                    text-slate-700
                  "
                  >
                    {order.supplier_name}
                  </td>

                  <td
                    className="
                    px-6
                    py-4
                    text-slate-500
                  "
                  >
                    {new Date(order.order_date).toLocaleDateString("id-ID")}
                  </td>

                  {/* RECEIVE */}

                  <td className="px-6 py-4">
                    <span
                      className={`
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      font-semibold

                      ${
                        order.receive_status === "COMPLETED"
                          ? `
                            bg-emerald-100
                            text-emerald-700
                          `
                          : order.receive_status === "PARTIAL"
                            ? `
                              bg-yellow-100
                              text-yellow-700
                            `
                            : order.receive_status === "CHECKING"
                              ? `
                                bg-blue-100
                                text-blue-700
                              `
                              : `
                                bg-slate-100
                                text-slate-600
                              `
                      }
                    `}
                    >
                      {order.receive_status}
                    </span>
                  </td>

                  {/* PAYMENT */}

                  <td className="px-6 py-4">
                    <span
                      className={`
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      font-semibold

                      ${
                        order.payment_status === "PAID"
                          ? `
                            bg-emerald-100
                            text-emerald-700
                          `
                          : order.payment_status === "PARTIAL"
                            ? `
                              bg-yellow-100
                              text-yellow-700
                            `
                            : `
                              bg-red-100
                              text-red-700
                            `
                      }
                    `}
                    >
                      {order.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
