import { supabase } from "@/lib/supabase";

import { insertJournalEntry, insertJournalItems } from "../api/journal.api";

import { getAccountMappings } from "../api/accounts.api";

export async function createPurchaseJournal({ purchaseOrder, paidAmount = 0 }) {
  const total = Number(purchaseOrder.total || 0);

  const payment = Number(paidAmount || 0);

  const remaining = total - payment;

  // =====================================
  // GET ACCOUNT MAPPINGS
  // =====================================

  const { data: mappings, error: mappingError } = await getAccountMappings();

  if (mappingError) {
    throw mappingError;
  }

  const inventoryAccount = mappings.find((m) => m.key === "INVENTORY")?.accounts;

  const cashAccount = mappings.find((m) => m.key === "CASH")?.accounts;
  const payableAccount = mappings.find((m) => m.key === "AP")?.accounts;

  if (!inventoryAccount || !cashAccount || !payableAccount) {
    throw new Error("Account mapping incomplete");
  }
  let journal = null;
  // =====================================
  // HEADER
  // =====================================

  const { data, error } = await insertJournalEntry({
    date: new Date(),

    reference_number: purchaseOrder.po_number,

    description: `Purchase ${purchaseOrder.po_number}`,
  });

  if (error) {
    throw error;
  }

  journal = data;

  // =====================================
  // ITEMS
  // =====================================

  const items = [];

  // =====================================
  // DR INVENTORY
  // =====================================

  items.push({
    journal_entry_id: journal.id,

    account_id: inventoryAccount.id,

    debit: total,

    credit: 0,
  });

  // =====================================
  // CR CASH
  // =====================================

  if (payment > 0) {
    items.push({
      journal_entry_id: journal.id,

      account_id: cashAccount.id,

      debit: 0,

      credit: payment,
    });
  }

  // =====================================
  // CR PAYABLE
  // =====================================

  if (remaining > 0) {
    items.push({
      journal_entry_id: journal.id,

      account_id: payableAccount.id,

      debit: 0,

      credit: remaining,
    });
  }

  // =====================================
  // BALANCE VALIDATION
  // =====================================

  const totalDebit = items.reduce((sum, item) => sum + Number(item.debit || 0), 0);

  const totalCredit = items.reduce((sum, item) => sum + Number(item.credit || 0), 0);

  if (totalDebit !== totalCredit) {
    throw new Error("Journal is not balanced");
  }

  // =====================================
  // INSERT ITEMS
  // =====================================

  try {
    const result = await insertJournalItems(items);

    if (result.error) {
      throw result.error;
    }

    return journal;
  } catch (error) {
    if (journal?.id) {
      await supabase.from("journal_items").delete().eq("journal_entry_id", journal.id);

      await supabase.from("journal_entries").delete().eq("id", journal.id);
    }

    throw error;
  }
}
