import {
  MobilePage,
  MobileHeader,
  MobileSection,
  MobileList,
  MobileListItem,
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
          <MobileListItem
            icon={<ArrowUpRight size={18} />}
            title="Penjualan"
            subtitle="12 transaksi"
            value="Rp 2.500.000"
          />

          <MobileListItem
            icon={<ArrowDownLeft size={18} />}
            title="Pembelian"
            subtitle="5 transaksi"
            value="Rp 850.000"
          />
        </MobileList>
      </MobileSection>
    </MobilePage>
  );
}
