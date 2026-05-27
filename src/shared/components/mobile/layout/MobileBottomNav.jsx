import {
  House,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menus = [
  {
    label: "Home",
    icon: House,
    to: "/",
  },
  {
    label: "Sales",
    icon: ShoppingCart,
    to: "/sales",
  },
  {
    label: "Stock",
    icon: Package,
    to: "/stock",
  },
  {
    label: "Customer",
    icon: Users,
    to: "/customers",
  },
];

export default function MobileBottomNav() {
  return (
    <div
      className="
        fixed
        bottom-4
        left-1/2
        z-50
        w-[calc(100%-24px)]
        max-w-md
        -translate-x-1/2
      "
    >
      <div
        className="
          rounded-full
          border border-zinc-200
          bg-white/90
          backdrop-blur-xl
          shadow-lg
          px-2
          py-2
          flex items-center justify-around
        "
      >
        {menus.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `
                  flex flex-col items-center
                  gap-1
                  px-4 py-2
                  rounded-full
                  transition
                  ${
                    isActive
                      ? "text-black"
                      : "text-zinc-400"
                  }
                `
              }
            >
              <Icon size={20} />

              <span className="text-xs">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}