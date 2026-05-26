import { Boxes, Factory, Package, ShoppingCart, TrendingUp, ArrowUpRight } from "lucide-react";

import { appName } from "@/config/app";

import Card from "@/shared/components/Card";

/* ===================================================== */
/* STATS CARD */
/* ===================================================== */

function StatsCard({ title, value, icon, growth, iconClassName = "" }) {
  return (
    <Card
      className="
        relative
        overflow-hidden
        px-5
        py-4
      "
    >
      <div className="flex items-start justify-between">
        {/* LEFT */}

        <div>
          <p
            className="
              text-sm
              font-medium
              text-slate-500
            "
          >
            {title}
          </p>

          <h2
            className="
              mt-3
              text-3xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            {value}
          </h2>

          <div
            className="
              mt-4
              inline-flex
              items-center
              gap-1
              rounded-lg
              bg-emerald-50
              px-2
              py-1
              text-xs
              font-semibold
              text-emerald-600
            "
          >
            <TrendingUp size={12} />

            {growth}
          </div>
        </div>

        {/* RIGHT */}

        <div
          className={`
            rounded-2xl
            p-3
            ${iconClassName}
          `}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="flex items-start justify-between">
        {/* LEFT */}

        <div>
          <h1
            className="
              text-4xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            {appName}
          </h1>

          <p
            className="
              mt-2
              text-base
              text-slate-500
            "
          >
            Enterprise Manufacturing System
          </p>
        </div>

        {/* RIGHT */}

        <div
          className="
            hidden
            items-center
            gap-2
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-4
            py-3
            shadow-sm
            lg:flex
          "
        >
          <div
            className="
              h-2.5
              w-2.5
              animate-pulse
              rounded-full
              bg-emerald-500
            "
          />

          <span
            className="
              text-sm
              font-medium
              text-slate-600
            "
          >
            System Active
          </span>
        </div>
      </div>

      {/* ===================================================== */}
      {/* STATS */}
      {/* ===================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-5
          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        <StatsCard
          title="Total Products"
          value="248"
          growth="+12.5%"
          icon={<Package size={22} />}
          iconClassName="
            bg-blue-50
            text-blue-600
          "
        />

        <StatsCard
          title="Sales Orders"
          value="128"
          growth="+8.2%"
          icon={<ShoppingCart size={22} />}
          iconClassName="
            bg-emerald-50
            text-emerald-600
          "
        />

        <StatsCard
          title="Manufacturing Orders"
          value="32"
          growth="+4.8%"
          icon={<Factory size={22} />}
          iconClassName="
            bg-orange-50
            text-orange-600
          "
        />

        <StatsCard
          title="Inventory Value"
          value="Rp 248JT"
          growth="+18.1%"
          icon={<Boxes size={22} />}
          iconClassName="
            bg-purple-50
            text-purple-600
          "
        />
      </div>

      {/* ===================================================== */}
      {/* DASHBOARD CONTENT */}
      {/* ===================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-3
        "
      >
        {/* ===================================================== */}
        {/* ACTIVITY */}
        {/* ===================================================== */}

        <Card className="xl:col-span-2">
          {/* HEADER */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-slate-200
              px-6
              py-5
            "
          >
            <div>
              <h2
                className="
                  text-lg
                  font-semibold
                  text-slate-900
                "
              >
                Recent Activities
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Latest manufacturing & inventory updates
              </p>
            </div>

            <button
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-2
                text-sm
                font-medium
                text-slate-700
                transition
                hover:bg-slate-50
              "
            >
              View All
              <ArrowUpRight size={16} />
            </button>
          </div>

          {/* LIST */}

          <div className="divide-y divide-slate-100">
            {[
              {
                title: "Production completed",
                desc: "RB Robusta Dampit Grade A",
                time: "2 minutes ago",
              },

              {
                title: "New sales order created",
                desc: "SO-1779702973432",
                time: "15 minutes ago",
              },

              {
                title: "Stock updated",
                desc: "GB Dampit Rjiect (Pixel)",
                time: "32 minutes ago",
              },

              {
                title: "Purchase order received",
                desc: "PO-1779702709961",
                time: "1 hour ago",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="
                  flex
                  items-center
                  justify-between
                  px-6
                  py-5
                  transition
                  hover:bg-slate-50
                "
              >
                <div>
                  <h3
                    className="
                      font-medium
                      text-slate-900
                    "
                  >
                    {item.title}
                  </h3>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-500
                    "
                  >
                    {item.desc}
                  </p>
                </div>

                <span
                  className="
                    text-sm
                    text-slate-400
                  "
                >
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* ===================================================== */}
        {/* QUICK SUMMARY */}
        {/* ===================================================== */}

        <Card>
          {/* HEADER */}

          <div
            className="
              border-b
              border-slate-200
              px-6
              py-5
            "
          >
            <h2
              className="
                text-lg
                font-semibold
                text-slate-900
              "
            >
              Quick Summary
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Operational overview
            </p>
          </div>

          {/* CONTENT */}

          <div className="space-y-5 p-6">
            {[
              {
                label: "Stock Availability",
                value: "98%",
              },

              {
                label: "Production Efficiency",
                value: "92%",
              },

              {
                label: "Order Completion",
                value: "87%",
              },

              {
                label: "Warehouse Capacity",
                value: "68%",
              },
            ].map((item, index) => (
              <div key={index}>
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className="
                      text-sm
                      text-slate-600
                    "
                  >
                    {item.label}
                  </span>

                  <span
                    className="
                      text-sm
                      font-semibold
                      text-slate-900
                    "
                  >
                    {item.value}
                  </span>
                </div>

                <div
                  className="
                    h-2
                    overflow-hidden
                    rounded-full
                    bg-slate-100
                  "
                >
                  <div
                    className="
                      h-full
                      rounded-full
                      bg-blue-500
                    "
                    style={{
                      width: item.value,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
