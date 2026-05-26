export function isBalanced(items = []) {
  const totalDebit = items.reduce((sum, item) => sum + Number(item.debit || 0), 0);

  const totalCredit = items.reduce((sum, item) => sum + Number(item.credit || 0), 0);

  return totalDebit === totalCredit;
}

export function formatCurrency(value = 0) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
}
