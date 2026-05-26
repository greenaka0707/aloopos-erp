import { supabase } from "@/lib/supabase";

export async function getFinanceSummaryData() {
  return await supabase.from("journal_items").select(`
      debit,
      credit,
      account:accounts!fk_journal_account (
        id,
        code,
        name,
        category,
        normal_balance
      )
    `);
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

export async function getBalanceSheetData() {
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
