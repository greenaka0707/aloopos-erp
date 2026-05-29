import DataTable from "@/shared/components/desktop/DataTable";

import { useJournalEntries } from "../hooks/useJournalEntries";

export default function JournalPage() {
  const { loading, entries } = useJournalEntries();

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
      <div>
        <h1
          className="
          text-2xl
          font-bold
        "
        >
          Journal Entries
        </h1>

        <p
          className="
          text-sm
          text-gray-400
        "
        >
          Accounting transaction list
        </p>
      </div>

      <JournalTable entries={entries} />
    </div>
  );
}
