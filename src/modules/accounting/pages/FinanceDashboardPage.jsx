import { useFinanceSummary } from "../hooks/useFinanceSummary";

import { formatCurrency } from "../utils/accounting.utils";

export default function FinanceDashboardPage() {
  const { loading, summary } = useFinanceSummary();

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* =====================================
          HEADER
      ===================================== */}

      <div>
        <h1
          className="
          text-2xl
          font-bold
        "
        >
          Finance Dashboard
        </h1>

        <p
          className="
          text-sm
          text-gray-500
        "
        >
          Financial overview
        </p>
      </div>

      {/* =====================================
          KPI
      ===================================== */}

      <div
        className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-4
      "
      >
        <FinanceCard title="Revenue" value={summary?.revenue} />

        <FinanceCard title="Gross Profit" value={summary?.grossProfit} />

        <FinanceCard title="Net Profit" value={summary?.netProfit} />

        <FinanceCard title="Cash" value={summary?.cash} />

        <FinanceCard title="Inventory" value={summary?.inventory} />

        <FinanceCard title="Receivable" value={summary?.receivable} />

        <FinanceCard title="Payable" value={summary?.payable} />

        <FinanceCard title="COGS" value={summary?.cogs} />
      </div>
    </div>
  );
}

function FinanceCard({ title, value }) {
  return (
    <div
      className="
      bg-white
      border
      rounded-2xl
      shadow-sm
      p-5
    "
    >
      <div
        className="
  text-sm
  text-gray-700
"
      >
        {title}
      </div>

      <div
        className="
  text-2xl
  font-bold
  mt-2
  text-black
"
      >
        {formatCurrency(value || 0)}
      </div>
    </div>
  );
}
