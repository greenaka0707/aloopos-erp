import { supabase } from "@/lib/supabase";

// ============================================
// GET OUTSTANDING INVOICES
// ============================================

export async function getOutstandingInvoices() {
  return await supabase.from("account_receivables").select("*").neq("payment_status", "PAID").order("created_at", {
    ascending: false,
  });
}

// ============================================
// GET RECEIVABLE DETAIL
// ============================================

export async function getReceivableById(id) {
  return await supabase.from("account_receivables").select("*").eq("id", id).single();
}

// ============================================
// UPDATE RECEIVABLE
// ============================================

export async function updateReceivable(id, payload) {
  return await supabase.from("account_receivables").update(payload).eq("id", id).select().single();
}
