import { useEffect, useState } from "react";

import { getBalanceSheetReport } from "../services/finance.service";

export function useBalanceSheet() {
  const [loading, setLoading] = useState(true);

  const [report, setReport] = useState(null);

  async function loadData() {
    try {
      setLoading(true);

      const result = await getBalanceSheetReport();

      setReport(result);
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
    report,
    reload: loadData,
  };
}
