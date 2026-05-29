import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import Modal from "@/shared/components/common/Modal";

import BOMForm from "../components/BOMForm";

import { createBOM, getBOMs } from "../services/bom.service";

export default function BOMPage() {
  const navigate = useNavigate();

  const [boms, setBoms] = useState([]);

  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);

  // =========================================
  // LOAD
  // =========================================

  async function loadBOMs() {
    try {
      const data = await getBOMs();

      setBoms(data || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadBOMs();
  }, []);

  // =========================================
  // CREATE
  // =========================================

  async function handleCreate(data) {
    try {
      setLoading(true);

      const result = await createBOM(data);

      if (result.error) {
        alert(result.error.message);

        return;
      }

      setOpenModal(false);

      loadBOMs();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manufacturing BOM</h1>

          <p className="text-slate-400">Bill of Materials</p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="
            rounded-xl
            bg-blue-600
            px-5
            py-3
            font-medium
            transition
            hover:bg-blue-500
          "
        >
          + Create BOM
        </button>
      </div>

      {/* EMPTY */}

      {!boms.length && (
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
          No BOM data
        </div>
      )}

      {/* LIST */}

      <div className="grid gap-4">
        {boms.map((bom) => (
          <div
            key={bom.id}
            onClick={() => navigate(`/manufacturing/bom/${bom.id}`)}
            className="
              cursor-pointer
              rounded-2xl
              border
              border-slate-800
              bg-slate-900
              p-5
              transition
              hover:border-blue-500
              hover:bg-slate-900/80
            "
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">{bom.name}</h2>

                <p className="mt-1 text-sm text-slate-400">Product: {bom.product?.name}</p>
              </div>

              <div
                className="
                  rounded-lg
                  bg-blue-500/10
                  px-3
                  py-1
                  text-xs
                  font-medium
                  text-blue-400
                "
              >
                BOM
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}

      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Create BOM">
        <BOMForm onSubmit={handleCreate} loading={loading} />
      </Modal>
    </div>
  );
}
