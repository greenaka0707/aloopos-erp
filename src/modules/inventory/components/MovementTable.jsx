export default function MovementTable({ data, loading }) {
  if (loading) {
    return <div className="rounded-2xl border border-slate-800 p-6">Loading movements...</div>;
  }

  if (!data?.length) {
    return <div className="rounded-2xl border border-slate-800 p-6">No movement data</div>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-800 bg-slate-900">
          <tr>
            <th className="p-4 text-left font-medium">Date</th>

            <th className="p-4 text-left font-medium">Product</th>

            <th className="p-4 text-left font-medium">Type</th>

            <th className="p-4 text-right font-medium">Qty</th>

            <th className="p-4 text-left font-medium">Source</th>

            <th className="p-4 text-left font-medium">Note</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-900/50">
              <td className="p-4 whitespace-nowrap">{new Date(item.created_at).toLocaleString()}</td>

              <td className="p-4">{item.product_name}</td>

              <td className="p-4">
                <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${item.type === "IN" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>{item.type}</span>
              </td>

              <td className="p-4 text-right font-medium">{item.qty}</td>

              <td className="p-4">{item.source || "-"}</td>

              <td className="p-4 max-w-xs truncate">{item.note || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
