import { useEffect, useState } from "react";

import { getFinanceSummary } from "../services/finance.service";

export function useFinanceSummary() {
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState(null);

  async function loadData() {
    try {
      setLoading(true);

      const result = await getFinanceSummary();

      setSummary(result);
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
    summary,
    reload: loadData,
  };
}
