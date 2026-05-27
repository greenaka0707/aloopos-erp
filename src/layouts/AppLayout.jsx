import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Logo from "@/assets/aloopos.svg";
import { ChevronDown, Menu, PanelLeftClose, X, User, LogOut } from "lucide-react";
import { navigation } from "@/constants/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [openMenu, setOpenMenu] = useState(null);
  const [sidebarMini, setSidebarMini] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageTransition, setPageTransition] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Fungsi navigasi di-reset otomatis jika pindah path
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const isDesktop = useMemo(() => typeof window !== "undefined" && window.innerWidth >= 1024, []);
  const isMini = isDesktop && sidebarMini;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed left-0 top-0 z-50 flex h-dvh flex-col border-r border-slate-200 bg-white transition-[width,transform] duration-300 w-[280px] ${isMini ? "lg:w-[88px]" : "lg:w-[280px]"} ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        
        {/* LOGO AREA */}
        <div className={`relative flex items-center border-b border-slate-200 bg-white px-5 py-5 ${isMini ? "justify-center" : "justify-between"}`}>
          <img src={Logo} alt="Logo" className={`object-contain transition-[height] ${isMini ? "h-8" : "h-10"}`} />
          {!isMini && <button onClick={() => setSidebarMini(true)} className="hidden h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 lg:flex"><PanelLeftClose size={18} /></button>}
          {isMini && <button onClick={() => setSidebarMini(false)} className="absolute right-[-14px] top-6 hidden h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm lg:flex"><PanelLeftClose size={14} className="rotate-180" /></button>}
          <button onClick={() => setSidebarOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"><X size={18} /></button>
        </div>

        {/* NAVIGATION AREA - KODE INI YANG TADI MUNGKIN HILANG/KOMENTAR */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <div className="flex flex-col gap-1">
            {navigation.map((item) => (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex items-center ${isMini ? "justify-center" : "gap-3"} rounded-2xl px-4 py-3 text-sm font-medium ${isActive ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-100"}`}>
                {item.icon && <item.icon size={18} strokeWidth={2} />}
                {!isMini && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>

      {/* MAIN WRAPPER */}
      <div className={`relative flex min-h-screen min-w-0 flex-col transition-[margin] duration-300 ${isMini ? "lg:ml-[88px]" : "lg:ml-[280px]"}`}>
        
        {/* HEADER */}
        <header className="fixed top-0 right-0 z-30 flex h-24 items-start justify-between bg-slate-100/95 backdrop-blur-md px-4 pt-6 pb-4 lg:px-8 left-0 right-0">
           <button onClick={() => setSidebarOpen(true)} className="flex h-10 w-10 items-center justify-center text-slate-800 lg:hidden">
             <Menu size={24} />
           </button>
           {/* ... Header content lainnya ... */}
        </header>

        <main className="bg-slate-100 pt-24 px-4 pb-5 lg:px-8 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
