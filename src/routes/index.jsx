import { Navigate, Route, Routes } from "react-router-dom";

import DashboardPage from "@/modules/dashboard/pages/DashboardPage";

import InventoryPage from "@/modules/inventory/pages/InventoryPage";
import InventoryMovementPage from "@/modules/inventory/pages/InventoryMovementPage";
import ProductDetailPage from "@/modules/inventory/pages/ProductDetailPage";
import StockAnalysisPage from "@/modules/inventory/pages/StockAnalysisPage";

import ManufacturingPage from "@/modules/manufacturing/pages/ManufacturingPage";
import BOMPage from "@/modules/manufacturing/pages/BOMPage";
import BOMDetailPage from "@/modules/manufacturing/pages/BOMDetailPage";
import ProductionOrdersPage from "@/modules/manufacturing/pages/ProductionOrdersPage";
import ProductionOrderDetailPage from "@/modules/manufacturing/pages/ProductionOrderDetailPage";

import PurchasingPage from "@/modules/purchasing/pages/PurchasingPage";
import PurchaseOrderFormPage from "@/modules/purchasing/pages/PurchaseOrderFormPage";
import PurchaseOrderDetailPage from "@/modules/purchasing/pages/PurchaseOrderDetailPage";

import SalesOrdersPage from "@/modules/sales/pages/SalesOrdersPage";
import SalesOrderDetailPage from "@/modules/sales/pages/SalesOrderDetailPage";
import SalesPage from "@/modules/sales/pages/SalesPage";

import FinanceDashboardPage from "@/modules/accounting/pages/FinanceDashboardPage";
import JournalPage from "@/modules/accounting/pages/JournalPage";
import ProfitLossPage from "@/modules/accounting/pages/ProfitLossPage";
import BalanceSheetPage from "@/modules/accounting/pages/BalanceSheetPage";

import ReceivablePage from "@/modules/receivable/pages/ReceivablePage";
import ReceivePaymentPage from "@/modules/receivable/pages/ReceivePaymentPage";

import PayablesPage from "@/modules/payable/pages/PayablesPage";

import DesignSystemPage from "@/pages/dev/DesignSystemPage";

import LoginPage from "@/pages/LoginPage";

import { useAuth } from "@/providers/AuthProvider";


export default function AppRoutes() {
  const { user } = useAuth();

  // =========================================
  // AUTH
  // =========================================

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  // =========================================
  // ROUTES
  // =========================================

  return (
    <Routes>
      {/* =========================================
          DASHBOARD
      ========================================= */}

      <Route path="/" element={<DashboardPage />} />

      {/* =========================================
          INVENTORY
      ========================================= */}

      <Route path="/inventory" element={<InventoryPage />} />

      <Route path="/inventory/movements" element={<InventoryMovementPage />} />

      <Route path="/inventory/analysis" element={<StockAnalysisPage />} />

      <Route path="/inventory/products/:id" element={<ProductDetailPage />} />
      {/* =========================================
          PURCHASING
      ========================================= */}

      <Route path="/purchasing" element={<PurchasingPage />} />

      <Route path="/purchasing/create" element={<PurchaseOrderFormPage />} />

      <Route path="/purchasing/orders/:id" element={<PurchaseOrderDetailPage />} />

      <Route path="/purchasing/orders/edit/:id" element={<PurchaseOrderFormPage />} />

      {/* =========================================
          MANUFACTURING
      ========================================= */}

      <Route path="/manufacturing" element={<ManufacturingPage />} />

      <Route path="/manufacturing/bom" element={<BOMPage />} />

      <Route path="/manufacturing/bom/:id" element={<BOMDetailPage />} />

      <Route path="/manufacturing/orders" element={<ProductionOrdersPage />} />

      <Route path="/manufacturing/orders/:id" element={<ProductionOrderDetailPage />} />

      {/* =========================================
          SALES
      ========================================= */}

      <Route path="/sales" element={<SalesOrdersPage />} />

      <Route path="/sales/create" element={<SalesPage />} />

      <Route path="/sales/orders/edit/:id" element={<SalesPage />} />

      <Route path="/sales/orders/:id" element={<SalesOrderDetailPage />} />

      <Route path="/sales/orders" element={<Navigate to="/sales" />} />

      {/* =========================================
          FINANCE DASHBOARD
      ========================================= */}

      <Route path="/finance" element={<FinanceDashboardPage />} />

      <Route path="/finance/journal" element={<JournalPage />} />

      <Route path="/finance/profit-loss" element={<ProfitLossPage />} />

      <Route path="/finance/balance-sheet" element={<BalanceSheetPage />} />

      <Route path="/receivable" element={<ReceivablePage />} />



      <Route path="/receivable/payment/:id" element={<ReceivePaymentPage />} />

      <Route path="/finance/payables" element={<PayablesPage />} />


      <Route
        path="/dev/design-system"
        element={<DesignSystemPage />}
      />

      {/* =========================================
          FALLBACK
      ========================================= */}

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
