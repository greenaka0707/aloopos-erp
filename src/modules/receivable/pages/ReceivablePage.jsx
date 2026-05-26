import { useReceivables } from "../hooks/useReceivables";

import { formatCurrency } from "@/modules/accounting/utils/accounting.utils";

import { useNavigate } from "react-router-dom";

export default function ReceivablePage() {
  const { loading, invoices } = useReceivables();
  const navigate = useNavigate();

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div
      className="
      p-6
      space-y-6
    "
    >
      {/* =========================
          HEADER
      ========================= */}

      <div>
        <h1
          className="
          text-2xl
          font-bold
        "
        >
          Account Receivable
        </h1>

        <p
          className="
          text-sm
          text-gray-400
        "
        >
          Outstanding customer invoices
        </p>
      </div>

      {/* =========================
          TABLE
      ========================= */}

      <div
        className="
        bg-white
        rounded-2xl
        overflow-hidden
        shadow-sm
      "
      >
        <table
          className="
          w-full
          text-sm
        "
        >
          <thead
            className="
            bg-gray-100
          "
          >
            <tr>
              <th
                className="
                p-4
                text-left
                text-black
              "
              >
                Invoice
              </th>

              <th
                className="
                p-4
                text-left
                text-black
              "
              >
                Customer
              </th>

              <th
                className="
                p-4
                text-right
                text-black
              "
              >
                Total
              </th>

              <th
                className="
                p-4
                text-right
                text-black
              "
              >
                Paid
              </th>

              <th
                className="
                p-4
                text-right
                text-black
              "
              >
                Remaining
              </th>

              <th
                className="
                p-4
                text-center
                text-black
              "
              >
                Status
              </th>

              <th
                className="
    p-4
    text-center
    text-black
  "
              >
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="
                    border-t
                  "
              >
                <td
                  className="
                    p-4
                    text-black
                  "
                >
                  {invoice.invoice_number}
                </td>

                <td
                  className="
                    p-4
                    text-black
                  "
                >
                  {invoice.customer_name || "-"}
                </td>

                <td
                  className="
                    p-4
                    text-right
                    text-black
                  "
                >
                  {formatCurrency(invoice.total_amount || 0)}
                </td>

                <td
                  className="
                    p-4
                    text-right
                    text-black
                  "
                >
                  {formatCurrency(invoice.paid_amount || 0)}
                </td>

                <td
                  className="
                    p-4
                    text-right
                    text-red-600
                    font-semibold
                  "
                >
                  {formatCurrency(invoice.remaining_amount || 0)}
                </td>

                <td
                  className="
                    p-4
                    text-center
                  "
                >
                  <span
                    className="
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-semibold
                      bg-yellow-100
                      text-yellow-700
                    "
                  >
                    {invoice.payment_status}
                  </span>
                </td>
                <td
                  className="
    p-4
    text-center
  "
                >
                  <button
                    onClick={() => navigate(`/receivable/payment/${invoice.id}`)}
                    className="
      px-4
      py-2
      rounded-lg
      bg-blue-600
      text-white
      text-xs
      font-semibold
      hover:bg-blue-700
    "
                  >
                    Receive Payment
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
