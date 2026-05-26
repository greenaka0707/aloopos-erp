import { insertJournalEntry, insertJournalItems } from "../api/journal.api";

import { isBalanced } from "../utils/accounting.utils";

import { deleteJournalByReference } from "../api/journal.api";

import { getJournalEntries } from "../api/journal.api";

export async function createJournalEntry({ date, referenceType, referenceId, referenceNo, description, items }) {
  // =====================================
  // VALIDATION
  // =====================================

  if (!isBalanced(items)) {
    throw new Error("Journal not balanced");
  }

  // =====================================
  // HEADER
  // =====================================

  const { data: header, error: headerError } = await insertJournalEntry({
    date,
    reference_type: referenceType,
    reference_id: referenceId,
    reference_no: referenceNo,
    description,
  });

  if (headerError) {
    throw headerError;
  }

  // =====================================
  // ITEMS
  // =====================================

  const payload = items.map((item) => ({
    journal_entry_id: header.id,
    account_id: item.accountId,
    debit: item.debit || 0,
    credit: item.credit || 0,
    description: item.description || null,
  }));

  const { error: itemsError } = await insertJournalItems(payload);

  if (itemsError) {
    throw itemsError;
  }

  return header;
}

export async function removeJournalByReference(referenceId) {
  const { error } = await deleteJournalByReference(referenceId);

  if (error) {
    throw error;
  }
}

export async function fetchJournalEntries() {
  const { data, error } = await getJournalEntries();

  if (error) {
    throw error;
  }

  return data || [];
}
