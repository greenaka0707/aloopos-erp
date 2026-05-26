import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { fetchReceivableById } from "../services/receivable.service";

import { formatCurrency } from "@/modules/accounting/utils/accounting.utils";

import { submitPayment } from "../services/receivable.service";

import { useNavigate } from "react-router-dom";

export default function ReceivePaymentPage() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);

  const [invoice, setInvoice] = useState(null);

  const [amount, setAmount] = useState("");

  const [notes, setNotes] = useState("");

  const navigate = useNavigate();

  async function loadInvoice() {
    try {
      setLoading(true);

      const result = await fetchReceivableById(id);

      setInvoice(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvoice();
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!invoice) {
    return <div className="p-6">Invoice not found</div>;
  }
  async function handleSubmit() {
    try {
      if (!amount) {
        return;
      }

      await submitPayment({
        invoice,
        amount,
      });

      navigate("/receivable");
    } catch (err) {
      console.error(err);

      alert("Payment failed");
    }
  }
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold">Receive Payment</h1>

        <p className="text-sm text-gray-400">Customer payment posting</p>
      </div>

      {/* INFO */}

      <div
        className="
        bg-white
        rounded-2xl
        p-6
        max-w-2xl
        space-y-6
      "
      >
        <div
          className="
          grid
          grid-cols-2
          gap-4
        "
        >
          <div>
            <p
              className="
              text-sm
              text-gray-500
            "
            >
              Invoice
            </p>

            <h2
              className="
              text-lg
              font-semibold
              text-black
            "
            >
              {invoice.so_number}
            </h2>
          </div>

          <div>
            <p
              className="
              text-sm
              text-gray-500
            "
            >
              Customer
            </p>

            <h2
              className="
              text-lg
              font-semibold
              text-black
            "
            >
              {invoice.customer_name}
            </h2>
          </div>

          <div>
            <p
              className="
              text-sm
              text-gray-500
            "
            >
              Remaining
            </p>

            <h2
              className="
              text-xl
              font-bold
              text-red-600
            "
            >
              {formatCurrency(invoice.remaining_amount || 0)}
            </h2>
          </div>

          <div>
            <p
              className="
              text-sm
              text-gray-500
            "
            >
              Status
            </p>

            <h2
              className="
              text-lg
              font-semibold
              text-black
            "
            >
              {invoice.payment_status}
            </h2>
          </div>
        </div>

        {/* FORM */}

        <div
          className="
          space-y-4
          pt-4
        "
        >
          <div>
            <label
              className="
              text-sm
              text-gray-600
            "
            >
              Payment Amount
            </label>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="
                w-full
                border
                rounded-xl
                p-3
                mt-1
                text-black
              "
              placeholder="
                Input payment amount
              "
            />
          </div>

          <div>
            <label
              className="
              text-sm
              text-gray-600
            "
            >
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="
                w-full
                border
                rounded-xl
                p-3
                mt-1
                text-black
              "
              rows={4}
              placeholder="
                Payment notes...
              "
            />
          </div>

          <button
            onClick={handleSubmit}
            className="
              w-full
              bg-blue-600
              hover:bg-blue-700
              text-white
              font-semibold
              py-3
              rounded-xl
            "
          >
            Submit Payment
          </button>
        </div>
      </div>
    </div>
  );
}
