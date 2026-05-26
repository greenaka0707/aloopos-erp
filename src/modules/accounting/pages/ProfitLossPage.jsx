import { useProfitLoss } from "../hooks/useProfitLoss";

import { formatCurrency } from "../utils/accounting.utils";

export default function ProfitLossPage() {
  const { loading, report } = useProfitLoss();

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
          Profit Loss
        </h1>

        <p
          className="
          text-sm
          text-gray-400
        "
        >
          Profit and loss report
        </p>
      </div>

      {/* =====================================
          REPORT
      ===================================== */}

      <div
        className="
        bg-white
        rounded-2xl
        shadow-sm
        overflow-hidden
      "
      >
        <table
          className="
          w-full
          text-sm
        "
        >
          <tbody>
            {/* ================================
                REVENUE
            ================================= */}

            <tr
              className="
              bg-gray-100
            "
            >
              <td
                className="
                p-4
                font-bold
                text-black
              "
              >
                Revenue
              </td>

              <td />
            </tr>

            {report.revenue.map((item, index) => (
              <tr key={index}>
                <td
                  className="
                    p-4
                    text-black
                  "
                >
                  {item.code}
                  {" - "}
                  {item.name}
                </td>

                <td
                  className="
                    p-4
                    text-right
                    text-black
                  "
                >
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}

            <tr
              className="
              border-t
              font-bold
            "
            >
              <td
                className="
                p-4
                text-black
              "
              >
                Total Revenue
              </td>

              <td
                className="
                p-4
                text-right
                text-black
              "
              >
                {formatCurrency(report.totalRevenue)}
              </td>
            </tr>

            {/* ================================
                COGS
            ================================= */}

            <tr
              className="
              bg-gray-100
            "
            >
              <td
                className="
                p-4
                font-bold
                text-black
              "
              >
                Cost Of Goods Sold
              </td>

              <td />
            </tr>

            {report.cogs.map((item, index) => (
              <tr key={index}>
                <td
                  className="
                    p-4
                    text-black
                  "
                >
                  {item.code}
                  {" - "}
                  {item.name}
                </td>

                <td
                  className="
                    p-4
                    text-right
                    text-black
                  "
                >
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}

            <tr
              className="
              border-t
              font-bold
            "
            >
              <td
                className="
                p-4
                text-black
              "
              >
                Total COGS
              </td>

              <td
                className="
                p-4
                text-right
                text-black
              "
              >
                {formatCurrency(report.totalCogs)}
              </td>
            </tr>

            {/* ================================
                GROSS PROFIT
            ================================= */}

            <tr
              className="
              bg-green-100
              font-bold
            "
            >
              <td
                className="
                p-4
                text-black
              "
              >
                Gross Profit
              </td>

              <td
                className="
                p-4
                text-right
                text-black
              "
              >
                {formatCurrency(report.grossProfit)}
              </td>
            </tr>

            {/* ================================
                EXPENSE
            ================================= */}

            <tr
              className="
              bg-gray-100
            "
            >
              <td
                className="
                p-4
                font-bold
                text-black
              "
              >
                Expenses
              </td>

              <td />
            </tr>

            {report.expenses.map((item, index) => (
              <tr key={index}>
                <td
                  className="
                    p-4
                    text-black
                  "
                >
                  {item.code}
                  {" - "}
                  {item.name}
                </td>

                <td
                  className="
                    p-4
                    text-right
                    text-black
                  "
                >
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}

            <tr
              className="
              border-t
              font-bold
            "
            >
              <td
                className="
                p-4
                text-black
              "
              >
                Total Expenses
              </td>

              <td
                className="
                p-4
                text-right
                text-black
              "
              >
                {formatCurrency(report.totalExpenses)}
              </td>
            </tr>

            {/* ================================
                NET PROFIT
            ================================= */}

            <tr
              className="
              bg-blue-100
              font-bold
            "
            >
              <td
                className="
                p-4
                text-black
              "
              >
                Net Profit
              </td>

              <td
                className="
                p-4
                text-right
                text-black
              "
              >
                {formatCurrency(report.netProfit)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
