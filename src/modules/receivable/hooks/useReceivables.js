import { useEffect, useState } from "react";

import { fetchOutstandingInvoices } from "../services/receivable.service";

export function useReceivables() {
  const [loading, setLoading] = useState(true);

  const [invoices, setInvoices] = useState([]);

  async function loadData() {
    try {
      setLoading(true);

      const result = await fetchOutstandingInvoices();

      setInvoices(result);
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
    invoices,
    reload: loadData,
  };
}
