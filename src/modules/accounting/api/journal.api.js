import { supabase } from "@/lib/supabase";

export async function insertJournalEntry(payload) {
  return await supabase.from("journal_entries").insert(payload).select().single();
}

export async function insertJournalItems(payload) {
  return await supabase.from("journal_items").insert(payload);
}

export async function deleteJournalByReference(referenceId) {
  return await supabase.from("journal_entries").delete().eq("reference_id", referenceId);
}

export async function getJournalEntries() {
  return await supabase
    .from("journal_entries")
    .select(
      `
      *,
      items:journal_items (
        id,
        debit,
        credit,
        description,

        account:accounts!fk_journal_account (
          id,
          code,
          name
        )
      )
    `,
    )
    .order("date", {
      ascending: false,
    });
}

export async function getProfitLossData() {
  return await supabase.from("journal_items").select(`
      debit,
      credit,

      account:accounts!fk_journal_account (
        id,
        code,
        name,
        category
      )
    `);
}
