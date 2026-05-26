import { getFinanceSummaryData } from "../api/finance.api";

import { getProfitLossData } from "../api/finance.api";

import { getBalanceSheetData } from "../api/finance.api";

export async function getFinanceSummary() {
  const { data, error } = await getFinanceSummaryData();

  if (error) throw error;

  const summary = {
    revenue: 0,
    cogs: 0,
    expense: 0,

    cash: 0,
    receivable: 0,
    payable: 0,
    inventory: 0,

    grossProfit: 0,
    netProfit: 0,
  };

  data.forEach((item) => {
    const account = item.account;

    if (!account) return;

    const category = account.category;

    const code = account.code;

    const debit = Number(item.debit || 0);

    const credit = Number(item.credit || 0);

    const balance = debit - credit;

    // =====================================
    // REVENUE
    // =====================================

    if (category === "REVENUE") {
      summary.revenue += credit - debit;
    }

    // =====================================
    // COGS
    // =====================================

    if (category === "COGS") {
      summary.cogs += balance;
    }

    // =====================================
    // EXPENSE
    // =====================================

    if (category === "EXPENSE") {
      summary.expense += balance;
    }

    // =====================================
    // CASH
    // =====================================

    if (code === "1001") {
      summary.cash += balance;
    }

    // =====================================
    // RECEIVABLE
    // =====================================

    if (code === "1101") {
      summary.receivable += balance;
    }

    // =====================================
    // INVENTORY
    // =====================================

    if (code === "1201") {
      summary.inventory += debit - credit;
    }

    // =====================================
    // PAYABLE
    // =====================================

    if (code === "2001") {
      summary.payable += credit - debit;
    }
  });

  // =====================================
  // PROFIT
  // =====================================

  summary.grossProfit = summary.revenue - summary.cogs;

  summary.netProfit = summary.grossProfit - summary.expense;

  summary.inventory = Math.abs(summary.inventory);

  return summary;
}

export async function getProfitLossReport() {
  const { data, error } = await getProfitLossData();
  console.log(data);

  if (error) {
    throw error;
  }

  const report = {
    revenue: [],
    cogs: [],
    expenses: [],

    totalRevenue: 0,
    totalCogs: 0,
    totalExpenses: 0,

    grossProfit: 0,
    netProfit: 0,
  };

  data.forEach((item) => {
    const account = item.account;

    if (!account) return;

    const category = String(account.category || "")
      .trim()
      .toUpperCase();

    const debit = Number(item.debit || 0);

    const credit = Number(item.credit || 0);

    // =====================================
    // REVENUE
    // =====================================

    if (category === "REVENUE") {
      const amount = credit - debit;

      report.totalRevenue += amount;

      report.revenue.push({
        code: account.code,
        name: account.name,
        amount,
      });
    }

    // =====================================
    // COGS
    // =====================================

    if (category === "COGS") {
      const amount = debit - credit;

      report.totalCogs += amount;

      report.cogs.push({
        code: account.code,
        name: account.name,
        amount,
      });
    }

    // =====================================
    // EXPENSE
    // =====================================

    if (category === "EXPENSE") {
      const amount = debit - credit;

      report.totalExpenses += amount;

      report.expenses.push({
        code: account.code,
        name: account.name,
        amount,
      });
    }
  });

  report.grossProfit = report.totalRevenue - report.totalCogs;

  report.netProfit = report.grossProfit - report.totalExpenses;

  return report;
}

export async function getBalanceSheetReport() {
  const { data, error } = await getBalanceSheetData();

  if (error) {
    throw error;
  }

  // =====================================
  // MAP
  // =====================================

  const assetMap = {};

  const liabilityMap = {};

  const equityMap = {};

  // =====================================
  // TOTAL
  // =====================================

  let totalAssets = 0;

  let totalLiabilities = 0;

  let totalEquities = 0;

  // =====================================
  // PROFIT
  // =====================================

  let netProfit = 0;

  // =====================================
  // LOOP
  // =====================================

  data.forEach((item) => {
    const account = item.account;

    if (!account) return;

    const category = account.category;

    const debit = Number(item.debit || 0);

    const credit = Number(item.credit || 0);

    // =====================================
    // REVENUE
    // =====================================

    if (category === "REVENUE") {
      netProfit += credit - debit;
    }

    // =====================================
    // COGS / EXPENSE
    // =====================================

    if (category === "COGS" || category === "EXPENSE") {
      netProfit -= debit - credit;
    }

    // =====================================
    // ASSET
    // =====================================

    if (category === "ASSET") {
      const amount = debit - credit;

      totalAssets += amount;

      if (!assetMap[account.code]) {
        assetMap[account.code] = {
          code: account.code,
          name: account.name,
          amount: 0,
        };
      }

      assetMap[account.code].amount += amount;
    }

    // =====================================
    // LIABILITY
    // =====================================

    if (category === "LIABILITY") {
      const amount = credit - debit;

      totalLiabilities += amount;

      if (!liabilityMap[account.code]) {
        liabilityMap[account.code] = {
          code: account.code,
          name: account.name,
          amount: 0,
        };
      }

      liabilityMap[account.code].amount += amount;
    }

    // =====================================
    // EQUITY
    // =====================================

    if (category === "EQUITY") {
      const amount = credit - debit;

      totalEquities += amount;

      if (!equityMap[account.code]) {
        equityMap[account.code] = {
          code: account.code,
          name: account.name,
          amount: 0,
        };
      }

      equityMap[account.code].amount += amount;
    }
  });

  // =====================================
  // CURRENT EARNINGS
  // =====================================

  totalEquities += netProfit;

  // =====================================
  // RETURN
  // =====================================

  return {
    assets: Object.values(assetMap),

    liabilities: Object.values(liabilityMap),

    equities: [
      ...Object.values(equityMap),

      {
        code: "CURRENT",

        name: "Current Year Earnings",

        amount: netProfit,
      },
    ],

    totalAssets,

    totalLiabilities,

    totalEquities,
  };
}
