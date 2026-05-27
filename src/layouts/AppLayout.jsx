import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Logo from "@/assets/aloopos.svg";
import { ChevronDown, Menu, PanelLeftClose, X, User, LogOut, Search, ArrowLeft } from "lucide-react";
import { navigation } from "@/constants/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  const [openMenu, setOpenMenu] = useState(null);
  const [sidebarMini, setSidebarMini] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageTransition, setPageTransition] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Constants for visibility
  const showSearchIcon = ["sales", "purchase", "product"].some((p) => path.includes(p));

  useEffect(() => {
    setIsSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setPageTransition(true);
    const timeout = setTimeout(() => setPageTransition(false), 120);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  const isDesktop = useMemo(() => typeof window !== "undefined" && window.innerWidth >= 1024, []);
  const isMini = isDesktop && sidebarMini;

  const pageTitle = useMemo(() => {
    if (path.includes("dashboard")) return "Dashboard";
    if (path.includes("inventory")) return "Inventory";
    if (path.includes("sales") || path.includes("order")) return "Sales Orders";
    if (path.includes("create")) return "Create Sales Order";
    if (path.includes("manufacturing")) return "Manufacturing";
    if (path.includes("finance")) return "Finance";
    if (path.includes("settings")) return "Settings";
    return "ERP System";
  }, [path]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" />
      )}

      {/* Sidebar (Logika mapping navigation Anda di sini) */}
      <aside className={`fixed left-0 top-0 z-50 flex h-dvh flex-col border-r border-slate-200 bg-white transition-[width,transform] duration-300 ${isMini ? "lg:w-[88px]" : "lg:w-[280px]"} ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* ... Konten Sidebar (Logo & Nav) Anda ... */}
      </aside>

      <div className={`relative flex min-h-screen min-w-0 flex-col transition-[margin] duration-300 ${isMini ? "lg:ml-[88px]" : "lg:ml-[280px]"}`}>
        
        {/* HEADER */}
        <header className={`fixed top-0 right-0 z-30 flex h-24 items-start justify-between bg-gradient-to-b from-slate-100 via-slate-100/80 to-transparent px-4 pt-6 pb-4 lg:px-8 pointer-events-none will-change-auto ${isMini ? "lg:left-[88px]" : "lg:left-[280px]"} left-0`}>
          
          <div className="pointer-events-auto flex w-full min-w-0 items-center gap-4">
            {isSearchOpen ? (
              <div className="flex w-full items-center gap-3">
                <button onClick={() => setIsSearchOpen(false)} className="text-slate-800"><ArrowLeft size={24} /></button>
                <input type="text" placeholder="Cari..." autoFocus className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ) : (
              <>
                <button onClick={() => setSidebarOpen(true)} className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-800 lg:hidden">
                  <Menu size={24} />
                </button>
                
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-xl font-bold text-slate-900 lg:hidden">{pageTitle}</h2>
                  <h2 className="hidden text-base font-semibold text-slate-900 lg:block lg:text-lg">Enterprise Manufacturing System</h2>
                </div>

                {showSearchIcon && (
                  <button onClick={() => setIsSearchOpen(true)} className="text-slate-800">
                    <Search size={24} />
                  </button>
                )}
              </>
            )}
          </div>

          {!isSearchOpen && (
            <div className="pointer-events-auto relative flex items-center gap-3 lg:gap-4 ml-4">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                <User size={20} />
              </button>
            </div>
          )}
        </header>

        <main className="bg-slate-100 pt-24 px-4 pb-5 lg:px-8 lg:pb-8">
          <div className={`transition-opacity duration-200 ${pageTransition ? "opacity-95" : "opacity-100"}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
