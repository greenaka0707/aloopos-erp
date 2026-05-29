export default function DataTable({
  columns = [],
  data = [],
  emptyMessage = "Belum ada data",
  onRowClick,
}) {
  return (
    <div
      className="
        overflow-hidden
        rounded-lg
        border
        border-slate-200
        bg-white
      "
    >
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-100">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="
                    px-4
                    py-3
                    text-left
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="
                    py-12
                    text-center
                    text-sm
                    text-slate-500
                  "
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={row.id || index}
                  onClick={() => onRowClick?.(row)}
                  className={`
                    border-t
                    border-slate-100
                    ${
                      onRowClick
                        ? "cursor-pointer hover:bg-slate-50 transition-colors"
                        : ""
                    }
                  `}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="
                        px-4
                        py-3
                        text-sm
                        text-slate-700
                      "
                    >
                      {column.render
                        ? column.render(row)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
