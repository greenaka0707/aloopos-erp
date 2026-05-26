import { useEffect, useMemo, useState } from "react";

import { NavLink, useLocation } from "react-router-dom";

import Logo from "@/assets/aloopos.svg";

import {
  ChevronDown,
  Menu,
  PanelLeftClose,
  X,
} from "lucide-react";

import { navigation } from "@/constants/navigation";

import { useAuth } from "@/providers/AuthProvider";

export default function AppLayout({
  children,
}) {
  const { user, logout } = useAuth();

  const location = useLocation();

  const [openMenu, setOpenMenu] =
    useState(null);

  const [sidebarMini, setSidebarMini] =
    useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [pageTransition, setPageTransition] =
    useState(false);

  /* ===================================================== */
  /* RESPONSIVE */
  /* ===================================================== */

  const isDesktop = useMemo(() => {
    if (typeof window === "undefined")
      return false;

    return window.innerWidth >= 1024;
  }, []);

  const isMini =
    isDesktop && sidebarMini;

  /* ===================================================== */
  /* PAGE TITLE */
  /* ===================================================== */

  const pageTitle = useMemo(() => {
    const path =
      location.pathname.toLowerCase();

    if (path.includes("dashboard")) {
      return "Dashboard";
    }

    if (path.includes("inventory")) {
      return "Inventory";
    }

    if (
      path.includes("sales") ||
      path.includes("order")
    ) {
      return "Sales Orders";
    }

    if (
      path.includes("create")
    ) {
      return "Create Sales Order";
    }

    if (
      path.includes("manufacturing")
    ) {
      return "Manufacturing";
    }

    if (path.includes("finance")) {
      return "Finance";
    }

    if (
      path.includes("settings")
    ) {
      return "Settings";
    }

    return "ERP System";
  }, [location.pathname]);

  /* ===================================================== */
  /* PAGE TRANSITION */
  /* ===================================================== */

  useEffect(() => {
    setPageTransition(true);

    const timeout = setTimeout(() => {
      setPageTransition(false);
    }, 150);

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  /* ===================================================== */
  /* AUTO CLOSE MOBILE SIDEBAR */
  /* ===================================================== */

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100 text-slate-900">
      {/* ===================================================== */}
      {/* MOBILE OVERLAY */}
      {/* ===================================================== */}

      {sidebarOpen && (
        <div
          onClick={() =>
            setSidebarOpen(false)
          }
          className="
            fixed
            inset-0
            z-40
            bg-black/40
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      {/* ===================================================== */}
      {/* SIDEBAR */}
      {/* ===================================================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          flex-col
          border-r
          border-slate-200
          bg-white
          transition-all
          duration-300
          w-[280px]

          ${
            isMini
              ? "lg:w-[88px]"
              : "lg:w-[280px]"
          }

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* ===================================================== */}
        {/* LOGO */}
        {/* ===================================================== */}

        <div
          className={`
            relative
            flex
            items-center
            border-b
            border-slate-200
            bg-white
            px-5
            py-5

            ${
              isMini
                ? "justify-center"
                : "justify-between"
            }
          `}
        >
          {/* LOGO */}

          <img
            src={Logo}
            alt="Logo"
            className={`
              object-contain
              transition-all
              duration-300

              ${
                isMini
                  ? "h-8"
                  : "h-10"
              }
            `}
          />

          {/* DESKTOP MINI BUTTON */}

          {!isMini && (
            <button
              onClick={() =>
                setSidebarMini(true)
              }
              className="
                hidden
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                text-slate-500
                transition
                hover:bg-slate-100
                lg:flex
              "
            >
              <PanelLeftClose
                size={18}
              />
            </button>
          )}

          {/* MINI EXPAND */}

          {isMini && (
            <button
              onClick={() =>
                setSidebarMini(false)
              }
              className="
                absolute
                right-[-14px]
                top-6
                hidden
                h-7
                w-7
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-white
                text-slate-600
                shadow-sm
                lg:flex
              "
            >
              <PanelLeftClose
                size={14}
                className="rotate-180"
              />
            </button>
          )}

          {/* MOBILE CLOSE */}

          <button
            onClick={() =>
              setSidebarOpen(false)
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-slate-500
              transition
              hover:bg-slate-100
              lg:hidden
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* ===================================================== */}
        {/* NAVIGATION */}
        {/* ===================================================== */}

        <nav
          className="
            flex-1
            overflow-y-auto
            px-4
            py-5
          "
        >
          <div className="flex flex-col gap-1">
            {navigation.map((item) => {
              if (!item.children) {
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({
                      isActive,
                    }) =>
                      `
                        flex
                        items-center

                        ${
                          isMini
                            ? "justify-center"
                            : "gap-3"
                        }

                        rounded-2xl
                        px-4
                        py-3
                        text-sm
                        font-medium
                        transition-all

                        ${
                          isActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-700 hover:bg-slate-100"
                        }
                      `
                    }
                  >
                    {item.icon && (
                      <item.icon
                        size={18}
                        strokeWidth={2}
                      />
                    )}

                    {!isMini && (
                      <span>
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                );
              }

              const isGroupActive =
                item.children.some(
                  (child) =>
                    location.pathname.startsWith(
                      child.path,
                    ),
                );

              const isOpen =
                openMenu ===
                  item.label ||
                (openMenu === null &&
                  isGroupActive);

              return (
                <div
                  key={item.label}
                  className="mt-2"
                >
                  {/* HEADER */}

                  <button
                    onClick={() =>
                      setOpenMenu(
                        openMenu ===
                          item.label
                          ? null
                          : item.label,
                      )
                    }
                    className={`
                      flex
                      w-full
                      items-center

                      ${
                        isMini
                          ? "justify-center"
                          : "justify-between"
                      }

                      rounded-2xl
                      px-4
                      py-3
                      text-sm
                      font-semibold
                      transition-all

                      ${
                        isGroupActive
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-700 hover:bg-slate-100"
                      }
                    `}
                  >
                    {/* LEFT */}

                    <div
                      className={`
                        flex
                        items-center

                        ${
                          isMini
                            ? "justify-center"
                            : "gap-3"
                        }
                      `}
                    >
                      {item.icon && (
                        <item.icon
                          size={18}
                          strokeWidth={2}
                        />
                      )}

                      {!isMini && (
                        <span>
                          {item.label}
                        </span>
                      )}
                    </div>

                    {/* RIGHT */}

                    {!isMini && (
                      <ChevronDown
                        size={16}
                        className={`
                          transition-transform
                          ${
                            isOpen
                              ? "rotate-180"
                              : ""
                          }
                        `}
                      />
                    )}
                  </button>

                  {/* CHILDREN */}

                  {!isMini &&
                    isOpen && (
                      <div
                        className="
                          mt-1
                          ml-3
                          flex
                          flex-col
                          gap-1
                          border-l
                          border-slate-200
                          pl-4
                        "
                      >
                        {item.children.map(
                          (child) => (
                            <NavLink
                              key={
                                child.path
                              }
                              to={
                                child.path
                              }
                              className={({
                                isActive,
                              }) =>
                                `
                                  rounded-xl
                                  px-4
                                  py-3
                                  text-sm
                                  font-medium
                                  transition-all

                                  ${
                                    isActive
                                      ? "bg-blue-50 text-blue-600"
                                      : "text-slate-600 hover:bg-slate-100"
                                  }
                                `
                              }
                            >
                              {
                                child.label
                              }
                            </NavLink>
                          ),
                        )}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* ===================================================== */}
      {/* MAIN */}
      {/* ===================================================== */}

      <div
        className={`
          flex
          min-w-0
          flex-col
          transition-all
          duration-300

          ${
            isMini
              ? "lg:ml-[88px]"
              : "lg:ml-[280px]"
          }
        `}
      >
        {/* ===================================================== */}
        {/* HEADER */}
        {/* ===================================================== */}

        <header
          className="
            sticky
            top-0
            z-30
            flex
            h-20
            items-center
            justify-between
            border-b
            border-slate-200
            bg-white
            px-4
            lg:px-8
          "
        >
          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-4">
            {/* MOBILE MENU */}

            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                lg:hidden
              "
            >
              <Menu size={18} />
            </button>

            {/* TITLE */}

            <div className="min-w-0">
              {/* MOBILE TITLE */}

              <h2
                className="
                  truncate
                  text-2xl
                  font-bold
                  text-slate-900
                  lg:hidden
                "
              >
                {pageTitle}
              </h2>

              {/* DESKTOP TITLE */}

              <h2
                className="
                  hidden
                  text-base
                  font-semibold
                  text-slate-900
                  lg:block
                  lg:text-lg
                "
              >
                Enterprise Manufacturing
                System
              </h2>

              <p
                className="
                  mt-1
                  hidden
                  text-sm
                  text-slate-500
                  lg:block
                "
              >
                Inventory • Manufacturing • Finance
              </p>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-3 lg:gap-4">
            {/* USER */}

            <div className="hidden text-right lg:block">
              <p
                className="
                  text-sm
                  font-semibold
                  text-slate-900
                "
              >
                {user?.email}
              </p>

              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                Administrator
              </p>
            </div>

            {/* LOGOUT */}

            <button
              onClick={logout}
              className="
                rounded-xl
                bg-red-500
                px-5
                py-2.5
                text-sm
                font-medium
                text-white
                transition
                hover:bg-red-600
              "
            >
              Logout
            </button>
          </div>
        </header>

        {/* ===================================================== */}
        {/* PAGE */}
        {/* ===================================================== */}

        <main
          className="
            relative
            min-w-0
            flex-1
            overflow-x-hidden
            bg-slate-100
            p-5
            lg:p-8
          "
        >
          <div
            className={`
              transform-gpu
              transition-all
              duration-300
              ease-out

              ${
                pageTransition
                  ? "translate-y-2 opacity-95"
                  : "translate-y-0 opacity-100"
              }
            `}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}