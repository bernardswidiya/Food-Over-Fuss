"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 md:hidden z-50 flex justify-around items-center py-3 px-2 pb-safe">
      <Link href="/dashboard" className={`flex flex-col items-center gap-1 ${pathname === "/dashboard" ? "text-primary" : "text-muted"}`}>
        <span className="material-symbols-outlined" style={pathname === "/dashboard" ? { fontVariationSettings: "'FILL' 1" } : {}}>dashboard</span>
        <span className="text-[10px] font-medium">Beranda</span>
      </Link>
      <Link href="/grocery" className={`flex flex-col items-center gap-1 ${pathname === "/grocery" ? "text-primary" : "text-muted"}`}>
        <span className="material-symbols-outlined" style={pathname === "/grocery" ? { fontVariationSettings: "'FILL' 1" } : {}}>shopping_cart</span>
        <span className="text-[10px] font-medium">Belanja</span>
      </Link>
      
      {/* Tombol Plus Tengah Mobile */}
      <div className="relative -mt-8">
        <button className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>

      <Link href="/calendar" className={`flex flex-col items-center gap-1 ${pathname === "/calendar" ? "text-primary" : "text-muted"}`}>
        <span className="material-symbols-outlined" style={pathname === "/calendar" ? { fontVariationSettings: "'FILL' 1" } : {}}>calendar_month</span>
        <span className="text-[10px] font-medium">Kalender</span>
      </Link>
      <Link href="/settings" className={`flex flex-col items-center gap-1 ${pathname === "/settings" ? "text-primary" : "text-muted"}`}>
        <span className="material-symbols-outlined" style={pathname === "/settings" ? { fontVariationSettings: "'FILL' 1" } : {}}>account_circle</span>
        <span className="text-[10px] font-medium">Profil</span>
      </Link>
    </nav>
  );
}
