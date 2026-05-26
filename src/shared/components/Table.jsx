export default function Table({ columns = [], data = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        {/* ========================================= */}
        {/* HEAD */}
        {/* ========================================= */}

        <thead className="bg-slate-100 border-b border-slate-200">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="
                  px-6
                  py-4
                  text-left
                  text-sm
                  font-semibold
                  text-slate-600
                "
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* ========================================= */}
        {/* BODY */}
        {/* ========================================= */}

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="
                  py-16
                  text-center
                  text-sm
                  text-slate-400
                "
              >
                No Data
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={index}
                className="
                  border-b
                  border-slate-100
                  transition
                  hover:bg-slate-50
                "
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="
                      px-6
                      py-4
                      text-sm
                      text-slate-700
                    "
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
