import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Factory,
  Wallet,
  BookOpen,
  BarChart3,
  Scale,
  Receipt,
  Settings,
  Database,
  Package,
  ArrowLeftRight,
  ClipboardList,
  PackageCheck,
  DollarSign,
} from "lucide-react";

export const navigation = [
  {
    section: "OVERVIEW",

    items: [
      {
        label: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    section: "OPERASIONAL",

    items: [
      {
        label: "Penjualan",
        path: "/sales",
        icon: DollarSign,
      },

      {
        label: "Pembelian",
        path: "/purchasing",
        icon: ShoppingCart,
      },

      {
        label: "Stok",
        icon: Boxes,

        children: [
          {
            label: "Daftar Produk",
            path: "/inventory",
            icon: Package,
          },

          {
            label: "Pergerakan Stok",
            path: "/inventory/movements",
            icon: ArrowLeftRight,
          },

          {
            label: "Analisa Stok",
            path: "/inventory/analysis",
            icon: BarChart3,
          },

          {
            label: "Penyesuaian Stok",
            path: "/inventory/adjustments",
            icon: ClipboardList,
          },
        ],
      },

      {
        label: "Produksi",
        icon: Factory,

        children: [
          {
            label: "Dashboard Produksi",
            path: "/manufacturing",
            icon: LayoutDashboard,
          },

          {
            label: "Bill of Material",
            path: "/manufacturing/bom",
            icon: ClipboardList,
          },

          {
            label: "Perintah Produksi",
            path: "/manufacturing/orders",
            icon: PackageCheck,
          },
        ],
      },
    ],
  },

  {
    section: "KEUANGAN",

    items: [
      {
        label: "Keuangan",
        icon: Wallet,

        children: [
          {
            label: "Dashboard",
            path: "/finance",
            icon: LayoutDashboard,
          },

          {
            label: "Jurnal",
            path: "/finance/journal",
            icon: BookOpen,
          },

          {
            label: "Laba Rugi",
            path: "/finance/profit-loss",
            icon: BarChart3,
          },

          {
            label: "Neraca",
            path: "/finance/balance-sheet",
            icon: Scale,
          },

          {
            label: "Hutang",
            path: "/finance/payables",
            icon: Receipt,
          },

          {
            label: "Piutang",
            path: "/finance/receivable",
            icon: Receipt,
          },
        ],
      },
    ],
  },

  {
    section: "MASTER DATA",

    items: [
      {
        label: "Master Data",
        icon: Database,

        children: [
          {
            label: "Produk",
            path: "/master/products",
            icon: Package,
          },

          {
            label: "Supplier",
            path: "/master/suppliers",
            icon: ShoppingCart,
          },

          {
            label: "Customer",
            path: "/master/customers",
            icon: DollarSign,
          },
        ],
      },
    ],
  },

  {
    section: "SYSTEM",

    items: [
      {
        label: "Pengaturan",
        path: "/settings",
        icon: Settings,
      },
    ],
  },
];
