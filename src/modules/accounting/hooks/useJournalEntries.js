import { useEffect, useState } from "react";

import { fetchJournalEntries } from "../services/journal.service";

export function useJournalEntries() {
  const [loading, setLoading] = useState(true);

  const [entries, setEntries] = useState([]);

  async function loadData() {
    try {
      setLoading(true);

      const result = await fetchJournalEntries();

      setEntries(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return {
    loading,
    entries,
    reload: loadData,
  };
}
