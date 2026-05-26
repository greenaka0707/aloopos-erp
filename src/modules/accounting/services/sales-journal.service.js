import { createJournalEntry } from "./journal.service";

import { getAccountMappings } from "../api/accounts.api";

export async function createSalesJournal({ sale, hpp = 0 }) {
  // =====================================
  // LOAD ACCOUNT MAPPINGS
  // =====================================

  const { data: mappings, error } = await getAccountMappings();

  if (error) throw error;

  // =====================================
  // FIND ACCOUNTS
  // =====================================

  const findAccount = (key) => {
    const mapping = mappings.find((item) => item.key === key);

    if (!mapping?.accounts) {
      throw new Error(`Account mapping not found: ${key}`);
    }

    return mapping.accounts;
  };

  const cashAccount = findAccount("CASH");

  const arAccount = findAccount("AR");

  const revenueAccount = findAccount("SALES_REVENUE");

  const inventoryAccount = findAccount("INVENTORY");

  const cogsAccount = findAccount("COGS");

  // =====================================
  // PAYMENT ACCOUNT
  // =====================================

  const paymentAccount = sale.payment_type === "CREDIT" ? arAccount : cashAccount;

  // =====================================
  // SALES JOURNAL
  // =====================================

  await createJournalEntry({
    date: sale.date,

    referenceType: "SALE",

    referenceId: sale.id,

    referenceNo: sale.invoice_number,

    description: `Sales Invoice ${sale.invoice_number}`,

    items: [
      {
        accountId: paymentAccount.id,
        debit: sale.grand_total,
      },

      {
        accountId: revenueAccount.id,
        credit: sale.grand_total,
      },
    ],
  });

  // =====================================
  // HPP JOURNAL
  // =====================================

  if (hpp > 0) {
    await createJournalEntry({
      date: sale.date,

      referenceType: "SALE_HPP",

      referenceId: sale.id,

      referenceNo: sale.invoice_number,

      description: `HPP ${sale.invoice_number}`,

      items: [
        {
          accountId: cogsAccount.id,
          debit: hpp,
        },

        {
          accountId: inventoryAccount.id,
          credit: hpp,
        },
      ],
    });
  }
}
