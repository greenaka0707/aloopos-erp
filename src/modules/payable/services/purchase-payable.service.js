import { supabase } from "@/lib/supabase";

export async function createPurchasePayable({ purchase }) {
  // =====================================
  // VALIDATION
  // =====================================

  if (!purchase?.id) {
    throw new Error("Purchase ID required");
  }

  const total = Number(purchase.total || 0);

  if (total <= 0) {
    throw new Error("Invalid payable amount");
  }

  // =====================================
  // DUPLICATE CHECK
  // =====================================

  const { data: existingPayable } = await supabase.from("account_payables").select("id").eq("purchase_id", purchase.id).maybeSingle();

  if (existingPayable) {
    throw new Error("Payable already exists");
  }

  // =====================================
  // PAYMENT STATUS
  // =====================================

  let paymentStatus = "UNPAID";

  if (Number(purchase.paid_amount || 0) >= total) {
    paymentStatus = "PAID";
  }

  // =====================================
  // PAYLOAD
  // =====================================

  const payload = {
    purchase_id: purchase.id,

    invoice_number: purchase.po_number,

    supplier_name: purchase.supplier_name,

    total_amount: total,

    paid_amount: Number(purchase.paid_amount || 0),

    remaining_amount: Math.max(total - Number(purchase.paid_amount || 0), 0),

    payment_status: paymentStatus,
  };

  // =====================================
  // INSERT
  // =====================================

  const { data, error } = await supabase.from("account_payables").insert(payload).select().single();

  if (error) {
    throw error;
  }

  return data;
}
