import { useEffect, useState } from "react";

import DataTable from "@/shared/components/desktop/DataTable";
import Modal from "@/shared/components/common/Modal";
import DesktopTabs from "@/shared/components/desktop/DesktopTabs";

import { createProductionOrder, getBOMDetail, getBOMOptions, getProductionOrders } from "../services/production-order.service";

import { useNavigate } from "react-router-dom";



import { STATUS_TABS } from "../constants/status";

export default function ProductionOrdersPage() {
  const navigate = useNavigate();
  // =========================================
  // STATE
  // =========================================

  const [openModal, setOpenModal] = useState(false);

  const [boms, setBOMs] = useState([]);

  const [selectedBOM, setSelectedBOM] = useState(null);

  const [productionQty, setProductionQty] = useState(1);

  const [materials, setMaterials] = useState([]);

  const [note, setNote] = useState("");

  const [orders, setOrders] = useState([]);

  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "ALL") {
      return true;
    }

    return order.status === statusFilter;
  });

  // =========================================
  // LOAD
  // =========================================

  async function loadBOMs() {
    try {
      const data = await getBOMOptions();

      setBOMs(data || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadBOMs();

    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const data = await getProductionOrders();

      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  }

  // =========================================
  // CALCULATE MATERIALS
  // =========================================

  function calculateMaterials(bom, qty) {
    if (!bom) {
      return;
    }

    const calculated = bom.items.map((item) => ({
      ...item,
      required_qty: Number(item.qty) * Number(qty),
    }));

    setMaterials(calculated);
  }

  // =========================================
  // SELECT BOM
  // =========================================

  async function handleSelectBOM(id) {
    try {
      const bom = await getBOMDetail(id);

      setSelectedBOM(bom);

      calculateMaterials(bom, productionQty);
    } catch (err) {
      console.error(err);
    }
  }

  // =========================================
  // QTY CHANGE
  // =========================================

  function handleQtyChange(value) {
    setProductionQty(value);

    if (selectedBOM) {
      calculateMaterials(selectedBOM, value);
    }
  }

  async function handleCreateOrder() {
    try {
      // =========================================
      // VALIDATION
      // =========================================

      if (!selectedBOM) {
        return alert("BOM required");
      }

      if (!productionQty || Number(productionQty) <= 0) {
        return alert("Invalid production qty");
      }

      // =========================================
      // CREATE
      // =========================================

      const result = await createProductionOrder({
        bom: selectedBOM,

        productionQty,

        materials,

        note,
      });

      if (result.error) {
        return alert(result.error.message);
      }

      // =========================================
      // RESET
      // =========================================

      setOpenModal(false);

      setSelectedBOM(null);

      setProductionQty(1);

      setMaterials([]);

      setNote("");

      await loadOrders();

      alert("Production order created");
    } catch (err) {
      console.error(err);
    }
  }

  const columns = [
    {
      key: "order_no",
      label: "MO Number",

      render: (row) => (
        <button
          onClick={() => navigate(`/manufacturing/orders/${row.id}`)}
          className="
          font-semibold
          text-cyan-400
          transition
          hover:text-cyan-300
        "
        >
          {row.order_no}
        </button>
      ),
    },

    {
      key: "product",
      label: "Product",

      render: (row) => row.product?.name || "-",
    },

    {
      key: "bom",
      label: "BOM",

      render: (row) => row.bom?.name || "-",
    },

    {
      key: "qty",
      label: "Qty",

      render: (row) => row.production_qty,
    },

    {
      key: "status",
      label: "Status",

      render: (row) => (
        <span
          className="
          inline-flex
          rounded-lg
          bg-blue-500/10
          px-3
          py-1
          text-xs
          font-medium
          text-blue-400
        "
        >
          {row.status}
        </span>
      ),
    },
  ];
  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <Tabs tabs={STATUS_TABS} value={statusFilter} onChange={setStatusFilter} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Production Orders</h1>

          <p className="text-slate-400">Manufacturing execution</p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="
            rounded-xl
            bg-blue-600
            px-5
            py-3
            font-medium
          "
        >
          + Create Order
        </button>
      </div>

      {/* EMPTY */}

      {!orders.length ? (
        <div
          className="
      rounded-2xl
      border
      border-slate-800
      bg-slate-900
      p-10
      text-center
      text-slate-400
    "
        >
          No production orders
        </div>
      ) : (
        <div
          className="
    overflow-hidden
    rounded-2xl
    border
    border-slate-800
    bg-slate-900/70
  "
        >
          {filteredOrders.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-lg font-semibold text-white">No production orders</p>
            </div>
          ) : (
            <Table columns={columns} data={filteredOrders} />
          )}
        </div>
      )}

      {/* MODAL */}

      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Create Production Order">
        <div className="space-y-5">
          {/* BOM */}

          <div>
            <label className="mb-2 block text-sm text-slate-400">BOM</label>

            <select className="erp-input" onChange={(e) => handleSelectBOM(e.target.value)}>
              <option value="">Select BOM</option>

              {boms.map((bom) => (
                <option key={bom.id} value={bom.id}>
                  {bom.name}
                  {" - "}
                  {bom.product?.name}
                </option>
              ))}
            </select>
          </div>

          {/* PRODUCTION QTY */}

          <div>
            <label className="mb-2 block text-sm text-slate-400">Production Qty</label>

            <input type="number" className="erp-input" value={productionQty} onChange={(e) => handleQtyChange(e.target.value)} />
          </div>

          {/* NOTE */}

          <div>
            <label className="mb-2 block text-sm text-slate-400">Note</label>

            <textarea className="erp-input min-h-[100px]" placeholder="Production note..." value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {/* MATERIALS */}

          {materials.length > 0 && (
            <div
              className="
                overflow-hidden
                rounded-xl
                border
                border-slate-800
                bg-slate-950
              "
            >
              <div className="border-b border-slate-800 p-4">
                <h3 className="font-semibold">Required Materials</h3>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="p-4 text-left">Material</th>

                    <th className="p-4 text-right">Required Qty</th>

                    <th className="p-4 text-left">Unit</th>
                  </tr>
                </thead>

                <tbody>
                  {materials.map((item) => (
                    <tr key={item.id} className="border-t border-slate-800">
                      <td className="p-4">{item.material?.name}</td>

                      <td className="p-4 text-right font-medium">{item.required_qty}</td>

                      <td className="p-4">{item.material?.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SUBMIT */}

          <button
            onClick={handleCreateOrder}
            className="
    w-full
    rounded-xl
    bg-blue-600
    py-3
    font-medium
  "
          >
            Create Order
          </button>
        </div>
      </Modal>
    </div>
  );
}
