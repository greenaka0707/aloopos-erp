import { supabase } from "@/lib/supabase";

import { insertJournalEntry, insertJournalItems } from "../../accounting/api/journal.api";

import { getAccountMappings } from "../../accounting/api/accounts.api";

export async function createReceivePaymentJournal({ invoice, amount }) {
  let journal = null;

  try {
    const paymentAmount = Number(amount);

    // =====================================
    // GET ACCOUNT MAPPINGS
    // =====================================

    const { data: mappings, error: mappingError } = await getAccountMappings();

    if (mappingError) {
      throw mappingError;
    }

    const cashAccount = mappings.find((m) => m.key === "CASH")?.accounts;

    const receivableAccount = mappings.find((m) => m.key === "AR")?.accounts;

    if (!cashAccount || !receivableAccount) {
      throw new Error("Account mapping incomplete");
    }

    // =====================================
    // CREATE JOURNAL ENTRY
    // =====================================

    const { data, error } = await insertJournalEntry({
      date: new Date(),

      reference_type: "RECEIVE_PAYMENT",

      reference_id: invoice.id,

      description: `Receive Payment ${invoice.invoice_number}`,
    });

    if (error) {
      throw error;
    }

    journal = data;

    // =====================================
    // JOURNAL ITEMS
    // =====================================

    const items = [
      // DR CASH

      {
        journal_entry_id: journal.id,

        account_id: cashAccount.id,

        debit: paymentAmount,

        credit: 0,

        description: `Receive Payment ${invoice.invoice_number}`,
      },

      // CR RECEIVABLE

      {
        journal_entry_id: journal.id,

        account_id: receivableAccount.id,

        debit: 0,

        credit: paymentAmount,

        description: `Receive Payment ${invoice.invoice_number}`,
      },
    ];

    // =====================================
    // BALANCE VALIDATION
    // =====================================

    const totalDebit = items.reduce((sum, item) => sum + Number(item.debit || 0), 0);

    const totalCredit = items.reduce((sum, item) => sum + Number(item.credit || 0), 0);

    if (totalDebit !== totalCredit) {
      throw new Error("Journal not balanced");
    }

    // =====================================
    // INSERT ITEMS
    // =====================================

    const { error: itemError } = await insertJournalItems(items);

    if (itemError) {
      throw itemError;
    }

    return journal;
  } catch (error) {
    // =====================================
    // ROLLBACK
    // =====================================

    if (journal?.id) {
      await supabase.from("journal_items").delete().eq("journal_entry_id", journal.id);

      await supabase.from("journal_entries").delete().eq("id", journal.id);
    }

    throw error;
  }
}
