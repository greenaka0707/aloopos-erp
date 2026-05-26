import { getOutstandingInvoices, getReceivableById, updateReceivable } from "../api/receivable.api";

import { createReceivePaymentJournal } from "./receive-payment-journal.service";

// ======================================================
// FETCH OUTSTANDING INVOICES
// ======================================================

export async function fetchOutstandingInvoices() {
  const { data, error } = await getOutstandingInvoices();

  if (error) {
    throw error;
  }

  return data || [];
}

// ======================================================
// FETCH RECEIVABLE DETAIL
// ======================================================

export async function fetchReceivableById(id) {
  const { data, error } = await getReceivableById(id);

  if (error) {
    throw error;
  }

  return data;
}

// ======================================================
// SUBMIT PAYMENT
// ======================================================

export async function submitPayment({ invoice, amount }) {
  let previousState = null;

  let receivableUpdated = false;

  try {
    // ==================================================
    // NORMALIZE VALUES
    // ==================================================

    const paymentAmount = Number(amount);

    const paidAmount = Number(invoice.paid_amount || 0);

    const remainingAmount = Number(invoice.remaining_amount || 0);

    // ==================================================
    // VALIDATION
    // ==================================================

    if (paymentAmount <= 0) {
      throw new Error("Invalid payment amount");
    }

    if (paymentAmount > remainingAmount) {
      throw new Error("Payment exceeds remaining balance");
    }

    // ==================================================
    // CALCULATE NEW BALANCE
    // ==================================================

    const newPaid = paidAmount + paymentAmount;

    const newRemaining = remainingAmount - paymentAmount;

    // ==================================================
    // PAYMENT STATUS
    // ==================================================

    let status = "UNPAID";

    if (newPaid > 0 && newRemaining > 0) {
      status = "PARTIAL";
    }

    if (newRemaining <= 0) {
      status = "PAID";
    }

    // ==================================================
    // BACKUP STATE
    // ==================================================

    previousState = {
      paid_amount: paidAmount,

      remaining_amount: remainingAmount,

      payment_status: invoice.payment_status,
    };

    // ==================================================
    // UPDATE PAYLOAD
    // ==================================================

    const payload = {
      paid_amount: newPaid,

      remaining_amount: Math.max(newRemaining, 0),

      payment_status: status,
    };

    // ==================================================
    // UPDATE RECEIVABLE
    // ==================================================

    const { data, error } = await updateReceivable(invoice.id, payload);

    if (error) {
      throw error;
    }

    receivableUpdated = true;

    // ==================================================
    // CREATE PAYMENT JOURNAL
    // ==================================================

    console.log("CREATE PAYMENT JOURNAL");

    await createReceivePaymentJournal({
      invoice,
      amount: paymentAmount,
    });

    console.log("JOURNAL SUCCESS");

    // ==================================================
    // SUCCESS
    // ==================================================

    return data;
  } catch (err) {
    console.error("SUBMIT PAYMENT ERROR:", err);

    // ==================================================
    // ROLLBACK RECEIVABLE
    // ==================================================

    if (receivableUpdated && invoice?.id) {
      await updateReceivable(invoice.id, previousState);
    }

    throw err;
  }
}
