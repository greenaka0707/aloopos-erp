import { supabase } from "@/lib/supabase";

import { createPurchaseJournal } from "@/modules/accounting/services/purchase-journal.service";

import { createPurchasePayable } from "@/modules/payable/services/purchase-payable.service";

export async function createPurchaseOrder({ supplierName, orderDate, items, paidAmount = 0, shippingCost = 0 }) {
  // ============================================
  // GENERATE PO NUMBER
  // ============================================

  const poNumber = "PO-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

  // ============================================
  // TOTAL
  // ============================================

  const subtotal = items.reduce((sum, item) => {
    return sum + Number(item.qty || 0) * Number(item.price || 0);
  }, 0);

  const shipping = Number(shippingCost || 0);

  const total = subtotal + shipping;

  const payment = Number(paidAmount || 0);

  if (payment > total) {
    return {
      error: new Error("Payment exceeds total"),
    };
  }

  if (total <= 0) {
    return {
      error: new Error("Invalid total"),
    };
  }

  // ============================================
  // PAYMENT STATUS
  // ============================================

  let paymentStatus = "UNPAID";

  if (payment > 0 && payment < total) {
    paymentStatus = "PARTIAL";
  }

  if (total > 0 && payment >= total) {
    paymentStatus = "PAID";
  }

  // ============================================
  // CREATE PURCHASE ORDER
  // ============================================
  if (!items.length) {
    return {
      error: new Error("Items required"),
    };
  }
  const { data: purchaseOrder, error: poError } = await supabase
    .from("purchase_orders")
    .insert([
      {
        po_number: poNumber,

        supplier_name: supplierName,

        order_date: orderDate,

        // PAYMENT
        payment_status: paymentStatus,

        paid_amount: payment,

        remaining_amount: Math.max(total - payment, 0),

        // RECEIVING
        receive_status: "PENDING",

        // COST
        subtotal,

        shipping_cost: shipping,

        total,
      },
    ])
    .select()
    .single();

  if (poError) {
    return {
      error: poError,
    };
  }

  // ============================================
  // CREATE ITEMS (BULK INSERT)
  // ============================================

  const itemPayload = items
    .filter((item) => item.product_id && Number(item.qty || 0) > 0 && Number(item.price || 0) >= 0)
    .map((item) => ({
      purchase_order_id: purchaseOrder.id,

      product_id: item.product_id,

      qty: Number(item.qty || 0),

      price: Number(item.price || 0),

      subtotal: Number(item.qty || 0) * Number(item.price || 0),
    }));
  const productIds = itemPayload.map((item) => item.product_id);

  const hasDuplicate = new Set(productIds).size !== productIds.length;

  if (hasDuplicate) {
    await supabase.from("purchase_orders").delete().eq("id", purchaseOrder.id);

    return {
      error: new Error("Duplicate products detected"),
    };
  }
  if (!itemPayload.length) {
    await supabase.from("purchase_orders").delete().eq("id", purchaseOrder.id);

    return {
      error: new Error("No valid items"),
    };
  }
  const { error: itemError } = await supabase.from("purchase_order_items").insert(itemPayload);

  if (itemError) {
    await supabase.from("purchase_orders").delete().eq("id", purchaseOrder.id);

    return {
      error: itemError,
    };
  }
  let journal = null;
  // ============================================
  // PURCHASE JOURNAL
  // ============================================

  try {
    journal = await createPurchaseJournal({
      purchaseOrder,
      paidAmount: payment,
    });
  } catch (error) {
    console.error("PURCHASE JOURNAL ERROR:", error);

    if (journal?.id) {
      await supabase.from("journal_items").delete().eq("journal_entry_id", journal.id);

      await supabase.from("journal_entries").delete().eq("id", journal.id);
    }

    await supabase.from("purchase_order_items").delete().eq("purchase_order_id", purchaseOrder.id);

    await supabase.from("purchase_orders").delete().eq("id", purchaseOrder.id);

    return {
      error,
    };
  }

  // ============================================
  // CREATE PAYABLE
  // ============================================

  if (payment < total) {
    try {
      await createPurchasePayable({
        purchase: purchaseOrder,
      });
    } catch (error) {
      console.error("PURCHASE PAYABLE ERROR:", error);

      if (journal?.id) {
        await supabase.from("journal_items").delete().eq("journal_entry_id", journal.id);

        await supabase.from("journal_entries").delete().eq("id", journal.id);
      }

      await supabase.from("purchase_order_items").delete().eq("purchase_order_id", purchaseOrder.id);

      await supabase.from("purchase_orders").delete().eq("id", purchaseOrder.id);

      return {
        error,
      };
    }
  }

  // ============================================
  // SUCCESS
  // ============================================

  return {
    success: true,
  };
}
