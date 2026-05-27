import {
  MobilePage,
  MobileHeader,
  MobileSection,
  MobileList,
  MobileTransactionCard,
} from "@/shared/components/mobile";

import {
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

export default function TestMobile() {
  return (
    <MobilePage>
      <MobileHeader title="Dashboard" />

      <MobileSection title="Aktivitas">
        <MobileList>
          <MobileTransactionCard
            icon={<ArrowUpRight size={18} />}
            title="Penjualan"
            subtitle="12 transaksi"
            amount="Rp 2.500.000"
            meta="Hari ini"
          />

          <MobileTransactionCard
            icon={<ArrowDownLeft size={18} />}
            title="Pembelian"
            subtitle="5 transaksi"
            amount="Rp 850.000"
            meta="Hari ini"
          />
        </MobileList>
      </MobileSection>
    </MobilePage>
  );
}
