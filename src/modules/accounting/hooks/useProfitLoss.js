import { useEffect, useState } from "react";

import { getProfitLossReport } from "../services/finance.service";

export function useProfitLoss() {
  const [loading, setLoading] = useState(true);

  const [report, setReport] = useState(null);

  async function loadData() {
    try {
      setLoading(true);

      const result = await getProfitLossReport();

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
