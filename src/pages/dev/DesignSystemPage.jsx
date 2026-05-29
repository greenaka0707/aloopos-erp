import PageHeader from "@/shared/components/desktop/PageHeader";
import StatCard from "@/shared/components/desktop/StatCard";
import Toolbar from "@/shared/components/desktop/Toolbar";
import DesktopTabs from "@/shared/components/desktop/DesktopTabs";
import DataTable from "@/shared/components/desktop/DataTable";
import EmptyState from "@/shared/components/common/EmptyState";

export default function DesignSystemPage() {
  return (
    <div className="p-6 space-y-6">

      <PageHeader
        title="Design System"
        description="Desktop Components"
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Revenue"
          value="Rp 25.000.000"
        />

        <StatCard
          title="Profit"
          value="Rp 8.500.000"
        />

        <StatCard
          title="Orders"
          value="125"
        />

        <StatCard
          title="Customer"
          value="45"
        />
      </div>

      <DesktopTabs
        tabs={[
          "Penawaran",
          "Order Penjualan",
          "Pengiriman",
          "Retur",
        ]}
        value="Order Penjualan"
        onChange={() => {}}
      />

      <Toolbar
        left={<div>Search Area</div>}
        right={<div>Actions</div>}
      />

      <DataTable
        columns={[
          {
            key: "so",
            label: "No SO",
          },
          {
            key: "customer",
            label: "Customer",
          },
          {
            key: "total",
            label: "Total",
          },
        ]}
        data={[
          {
            so: "SO-001",
            customer: "PT ENNA",
            total: "Rp 1.500.000",
          },
          {
            so: "SO-002",
            customer: "Alooka",
            total: "Rp 3.000.000",
          },
        ]}
      />

      <EmptyState
        title="Belum Ada Data"
        description="Data transaksi belum tersedia"
      />

    </div>
  );
}
