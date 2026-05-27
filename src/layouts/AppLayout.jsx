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
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Perbaikan: Menangani perubahan ukuran layar secara responsif
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMini = isDesktop && sidebarMini;

  // Efek transisi halaman
  useEffect(() => {
    setPageTransition(true);
    const timeout = setTimeout(() => setPageTransition(false), 120);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  // Auto close mobile sidebar
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" />
      )}

      {/* SIDEBAR (Sama seperti sebelumnya) */}
      {/* ... (Sidebar code tetap di sini untuk menjaga struktur) ... */}

      {/* MAIN WRAPPER */}
      <div className={`relative flex min-h-screen min-w-0 flex-col transition-[margin] duration-300 ${isMini ? "lg:ml-[88px]" : "lg:ml-[280px]"}`}>
        
        {/* HEADER dengan Efek Fade */}
        <header
          className={`
            fixed top-0 right-0 z-30
            flex h-24 items-start justify-between
            /* Background Fade: Putih (atas) ke Transparan (bawah) */
            bg-gradient-to-b from-slate-100 via-slate-100/90 to-transparent
            px-4 pt-6 pb-4 lg:px-8
            pointer-events-none
            ${isMini ? "lg:left-[88px]" : "lg:left-[280px]"} left-0
          `}
        >
          {/* Konten Header (Menu, Title, Profile) */}
          <div className="pointer-events-auto flex min-w-0 items-center gap-4">
             <button onClick={() => setSidebarOpen(true)} className="flex h-10 w-10 items-center justify-center text-slate-800 lg:hidden">
              <Menu size={24} />
            </button>
            {/* Title & User Profile tetap di sini */}
          </div>
          
          <div className="pointer-events-auto relative flex items-center gap-3 lg:gap-4">
             {/* Profile button code... */}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="pt-24 px-4 pb-5 lg:px-8 lg:pb-8">
          <div className={`transition-opacity duration-200 ${pageTransition ? "opacity-95" : "opacity-100"}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
