import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Logo from "@/assets/aloopos.svg";
import {
  ChevronDown,
  Menu,
  PanelLeftClose,
  X,
  User,
  LogOut,
} from "lucide-react";
import { navigation } from "@/constants/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [openMenu, setOpenMenu] = useState(null);
  const [sidebarMini, setSidebarMini] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageTransition, setPageTransition] = useState(false);
  
  // State untuk Dropdown Profile
  const [profileOpen, setProfileOpen] = useState(false);

  /* ===================================================== */
  /* RESPONSIVE */
  /* ===================================================== */

  const isDesktop = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= 1024;
  }, []);

  const isMini = isDesktop && sidebarMini;

  /* ===================================================== */
  /* PAGE TITLE */
  /* ===================================================== */

  const pageTitle = useMemo(() => {
    const path = location.pathname.toLowerCase();

    if (path.includes("dashboard")) return "Dashboard";
    if (path.includes("inventory")) return "Inventory";
    if (path.includes("sales") || path.includes("order")) return "Sales Orders";
    if (path.includes("create")) return "Create Sales Order";
    if (path.includes("manufacturing")) return "Manufacturing";
    if (path.includes("finance")) return "Finance";
    if (path.includes("settings")) return "Settings";

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
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* ===================================================== */}
      {/* MOBILE OVERLAY */}
      {/* ===================================================== */}

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ===================================================== */}
      {/* SIDEBAR */}
      {/* ===================================================== */}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 w-[280px]
          ${isMini ? "lg:w-[88px]" : "lg:w-[280px]"}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* ===================================================== */}
        {/* LOGO */}
        {/* ===================================================== */}

        <div
          className={`relative flex items-center border-b border-slate-200 bg-white px-5 py-5 ${
            isMini ? "justify-center" : "justify-between"
          }`}
        >
          {/* LOGO */}
          <img
            src={Logo}
            alt="Logo"
            className={`object-contain transition-all duration-300 ${
              isMini ? "h-8" : "h-10"
            }`}
          />

          {/* DESKTOP MINI BUTTON */}
          {!isMini && (
            <button
              onClick={() => setSidebarMini(true)}
              className="hidden h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 lg:flex"
            >
              <PanelLeftClose size={18} />
            </button>
          )}

          {/* MINI EXPAND */}
          {isMini && (
            <button
              onClick={() => setSidebarMini(false)}
              className="absolute right-[-14px] top-6 hidden h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm lg:flex"
            >
              <PanelLeftClose size={14} className="rotate-180" />
            </button>
          )}

          {/* MOBILE CLOSE */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* ===================================================== */}
        {/* NAVIGATION */}
        {/* ===================================================== */}

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <div className="flex flex-col gap-1">
            {navigation.map((item) => {
              if (!item.children) {
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center ${
                        isMini ? "justify-center" : "gap-3"
                      } rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-700 hover:bg-slate-100"
                      }`
                    }
                  >
                    {item.icon && <item.icon size={18} strokeWidth={2} />}
                    {!isMini && <span>{item.label}</span>}
                  </NavLink>
                );
              }

              const isGroupActive = item.children.some((child) =>
                location.pathname.startsWith(child.path)
              );

              const isOpen =
                openMenu === item.label || (openMenu === null && isGroupActive);

              return (
                <div key={item.label} className="mt-2">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === item.label ? null : item.label)
                    }
                    className={`flex w-full items-center ${
                      isMini ? "justify-center" : "justify-between"
                    } rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                      isGroupActive
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div
                      className={`flex items-center ${
                        isMini ? "justify-center" : "gap-3"
                      }`}
                    >
                      {item.icon && <item.icon size={18} strokeWidth={2} />}
                      {!isMini && <span>{item.label}</span>}
                    </div>

                    {!isMini && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {!isMini && isOpen && (
                    <div className="mt-1 ml-3 flex flex-col gap-1 border-l border-slate-200 pl-4">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) =>
                            `rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                              isActive
                                ? "bg-blue-50 text-blue-600"
                                : "text-slate-600 hover:bg-slate-100"
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
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
          flex min-h-screen min-w-0 flex-col transition-all duration-300
          overflow-x-clip
          ${isMini ? "lg:ml-[88px]" : "lg:ml-[280px]"}
        `}
      >
        {/* ===================================================== */}
        {/* HEADER */}
        {/* ===================================================== */}

        <header className="sticky top-0 z-30 flex h-24 items-start pt-6 pb-4 justify-between bg-gradient-to-b from-slate-100 via-slate-100/90 to-transparent px-4 lg:px-8 pointer-events-none">
          {/* LEFT */}
          <div className="flex min-w-0 items-center gap-4 pointer-events-auto">
            {/* MOBILE MENU */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-800 transition hover:text-slate-600 lg:hidden"
            >
              <Menu size={24} />
            </button>

            {/* TITLE */}
            <div className="min-w-0">
              <h2 className="truncate text-xl lg:text-2xl font-bold text-slate-900 lg:hidden">
                {pageTitle}
              </h2>
              <h2 className="hidden text-base font-semibold text-slate-900 lg:block lg:text-lg">
                Enterprise Manufacturing System
              </h2>
              <p className="mt-1 hidden text-sm text-slate-500 lg:block">
                Inventory • Manufacturing • Finance
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative flex items-center gap-3 lg:gap-4 pointer-events-auto">
            {/* USER INFO (Desktop Only) */}
            <div className="hidden text-right lg:block">
              <p className="text-sm font-semibold text-slate-900">
                {user?.email || "Admin"}
              </p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>

            {/* AVATAR TOGGLE */}
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 transition hover:bg-slate-50"
            >
              <User size={20} />
            </button>

            {/* AVATAR DROPDOWN MENU */}
            {profileOpen && (
              <>
                {/* Overlay to close when clicking outside */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setProfileOpen(false)} 
                />
                
                {/* Dropdown Box */}
                <div className="absolute right-0 top-14 z-50 w-48 rounded-2xl border border-slate-100 bg-white p-2 shadow-lg ring-1 ring-black/5">
                  <div className="px-3 py-2 lg:hidden">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {user?.email || "Admin"}
                    </p>
                    <p className="text-xs text-slate-500">Administrator</p>
                  </div>
                  
                  <div className="my-1 border-t border-slate-100 lg:hidden" />

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      // Tambahkan navigasi ke profil jika ada
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <User size={16} />
                    Profile
                  </button>
                  
                  <div className="my-1 border-t border-slate-100" />
                  
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* ===================================================== */}
        {/* PAGE */}
        {/* ===================================================== */}

        <main className="relative min-w-0 flex-1 bg-slate-100 px-5 pb-5 lg:px-8 lg:pb-8">
          <div
            className={`
              transform-gpu transition-all duration-300 ease-out
              ${pageTransition ? "translate-y-2 opacity-95" : "translate-y-0 opacity-100"}
            `}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}