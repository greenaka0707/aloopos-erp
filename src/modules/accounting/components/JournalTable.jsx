import { formatCurrency } from "../utils/accounting.utils";

export default function JournalTable({ entries = [] }) {
  return (
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
        <thead
          className="
          bg-gray-100
          text-gray-700
        "
        >
          <tr>
            <th className="p-4 text-left">Date</th>

            <th className="p-4 text-left">Ref</th>

            <th className="p-4 text-left">Description</th>

            <th className="p-4 text-left">Account</th>

            <th className="p-4 text-right">Debit</th>

            <th className="p-4 text-right">Credit</th>
          </tr>
        </thead>

        <tbody>
          {entries.map((entry) =>
            entry.items?.map((item) => (
              <tr
                key={item.id}
                className="
                  border-t
                "
              >
                <td className="p-4 text-black">{entry.date}</td>

                <td className="p-4 text-black">{entry.reference_no}</td>

                <td className="p-4 text-black">{entry.description}</td>

                <td className="p-4 text-black">
                  {item.account?.code}
                  {" - "}
                  {item.account?.name}
                </td>

                <td
                  className="
                  p-4
                  text-right
                  text-black
                "
                >
                  {item.debit > 0 ? formatCurrency(item.debit) : "-"}
                </td>

                <td
                  className="
                  p-4
                  text-right
                  text-black
                "
                >
                  {item.credit > 0 ? formatCurrency(item.credit) : "-"}
                </td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}
