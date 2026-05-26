import { useBalanceSheet } from "../hooks/useBalanceSheet";

import { formatCurrency } from "../utils/accounting.utils";

export default function BalanceSheetPage() {
  const { loading, report } = useBalanceSheet();

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
          Balance Sheet
        </h1>

        <p
          className="
          text-sm
          text-gray-400
        "
        >
          Financial position report
        </p>
      </div>

      {/* =====================================
          REPORT
      ===================================== */}

      <div
        className="
        grid
        grid-cols-1
        xl:grid-cols-2
        gap-6
      "
      >
        {/* =================================
            ASSETS
        ================================= */}

        <div
          className="
          bg-white
          rounded-2xl
          shadow-sm
          overflow-hidden
        "
        >
          <div
            className="
            p-4
            bg-gray-100
            font-bold
            text-black
          "
          >
            Assets
          </div>

          <table
            className="
            w-full
            text-sm
          "
          >
            <tbody>
              {report.assets.map((item, index) => (
                <tr key={index} className="border-t">
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
                  Total Assets
                </td>

                <td
                  className="
                  p-4
                  text-right
                  text-black
                "
                >
                  {formatCurrency(report.totalAssets)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* =================================
            LIABILITY + EQUITY
        ================================= */}

        <div
          className="
          bg-white
          rounded-2xl
          shadow-sm
          overflow-hidden
        "
        >
          <div
            className="
            p-4
            bg-gray-100
            font-bold
            text-black
          "
          >
            Liabilities & Equity
          </div>

          <table
            className="
            w-full
            text-sm
          "
          >
            <tbody>
              {report.liabilities.map((item, index) => (
                <tr key={index} className="border-t">
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
                  Total Liabilities
                </td>

                <td
                  className="
                  p-4
                  text-right
                  text-black
                "
                >
                  {formatCurrency(report.totalLiabilities)}
                </td>
              </tr>

              {/* =========================
                  EQUITY
              ========================= */}

              {report.equities.map((item, index) => (
                <tr key={index} className="border-t">
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
                  Total Equity
                </td>

                <td
                  className="
                  p-4
                  text-right
                  text-black
                "
                >
                  {formatCurrency(report.totalEquities)}
                </td>
              </tr>

              <tr
                className="
                bg-blue-100
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
                  Total Liability + Equity
                </td>

                <td
                  className="
                  p-4
                  text-right
                  text-black
                "
                >
                  {formatCurrency(report.totalLiabilities + report.totalEquities)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
