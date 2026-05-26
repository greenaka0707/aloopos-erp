import { insertJournalEntry, insertJournalItems } from "../api/journal.api";

export async function createReceivePaymentJournal({ invoice, amount }) {
  const paymentAmount = Number(amount);

  // =====================================
  // CREATE JOURNAL ENTRY
  // =====================================

  const { data: journal, error: journalError } = await insertJournalEntry({
    date: new Date(),

    reference_type: "RECEIVE_PAYMENT",

    reference_id: invoice.id,

    description: `Receive Payment ${invoice.so_number}`,
  });

  if (journalError) {
    throw journalError;
  }

  // =====================================
  // JOURNAL ITEMS
  // =====================================

  const items = [
    // =====================================
    // DR KAS
    // =====================================

    {
      journal_entry_id: journal.id,

      account_id: "b69a35b1-6c78-4fbe-a196-e19282ffccf5",

      debit: paymentAmount,

      credit: 0,

      description: `Receive Payment ${invoice.so_number}`,
    },

    // =====================================
    // CR PIUTANG USAHA
    // =====================================

    {
      journal_entry_id: journal.id,

      account_id: "ce962319-8750-445e-a52c-f4936b37ed95",

      debit: 0,

      credit: paymentAmount,

      description: `Receive Payment ${invoice.so_number}`,
    },
  ];

  const { error: itemError } = await insertJournalItems(items);

  if (itemError) {
    throw itemError;
  }

  return journal;
}
