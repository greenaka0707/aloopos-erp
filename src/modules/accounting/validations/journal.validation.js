export function validateJournal(items) {
  const debit = items.reduce((sum, item) => sum + item.debit, 0);

  const credit = items.reduce((sum, item) => sum + item.credit, 0);

  if (debit !== credit) {
    throw new Error("Journal not balanced");
  }
}
