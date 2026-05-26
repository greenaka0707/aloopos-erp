import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export default function PayablesPage() {
  const [payables, setPayables] = useState([]);

  const [loading, setLoading] = useState(true);

  async function loadPayables() {
    setLoading(true);

    const { data, error } = await supabase.from("account_payables").select("*").order("created_at", {
      ascending: false,
    });

    if (!error) {
      setPayables(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadPayables();
  }, []);

  function getStatusClass(status) {
    switch (status) {
      case "PAID":
        return "bg-green-500/20 text-green-400";

      case "PARTIAL":
        return "bg-yellow-500/20 text-yellow-400";

      default:
        return "bg-red-500/20 text-red-400";
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-bold text-white">Account Payables</h1>

        <p className="text-slate-400">Supplier payable management</p>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr className="text-left">
              <th className="px-6 py-4 text-sm text-slate-300">Invoice</th>

              <th className="px-6 py-4 text-sm text-slate-300">Supplier</th>

              <th className="px-6 py-4 text-sm text-slate-300">Total</th>

              <th className="px-6 py-4 text-sm text-slate-300">Paid</th>

              <th className="px-6 py-4 text-sm text-slate-300">Remaining</th>

              <th className="px-6 py-4 text-sm text-slate-300">Status</th>
            </tr>
          </thead>

          <tbody>
            {!loading &&
              payables.map((item) => (
                <tr key={item.id} className="border-t border-slate-800">
                  <td className="px-6 py-4 text-sm text-blue-400">{item.invoice_number}</td>

                  <td className="px-6 py-4 text-white">{item.supplier_name}</td>

                  <td className="px-6 py-4 text-white">Rp {Number(item.total_amount || 0).toLocaleString("id-ID")}</td>

                  <td className="px-6 py-4 text-white">Rp {Number(item.paid_amount || 0).toLocaleString("id-ID")}</td>

                  <td className="px-6 py-4 text-white">Rp {Number(item.remaining_amount || 0).toLocaleString("id-ID")}</td>

                  <td className="px-6 py-4">
                    <span className={`rounded-lg px-3 py-1 text-xs font-semibold ${getStatusClass(item.payment_status)}`}>{item.payment_status}</span>
                  </td>
                </tr>
              ))}

            {!loading && payables.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                  No payables found
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
