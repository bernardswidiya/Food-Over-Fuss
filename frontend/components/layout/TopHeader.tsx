"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarProvider";

export default function TopHeader() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [greeting, setGreeting] = useState("Selamat datang");
  const [mounted, setMounted] = useState(false);
  
  // Dummy user data
  const fullName = "Bernards Widiya";
  const firstName = fullName.split(" ")[0];

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 11) setGreeting("Selamat pagi");
    else if (hour < 15) setGreeting("Selamat siang");
    else if (hour < 18) setGreeting("Selamat sore");
    else setGreeting("Selamat malam");
  }, []);

  const renderTitle = () => {
    if (pathname === "/settings") {
      return <h1 className="text-lg font-heading font-bold text-text-main">Pengaturan Akun</h1>;
    }
    
    if (pathname === "/grocery") {
      return (
        <>
          <h1 className="text-lg font-heading font-bold text-text-main hidden md:block">
            <span className="text-primary">{firstName}'s</span> Pantry
          </h1>
          <h1 className="text-xl font-heading font-bold text-text-main md:hidden">Food Over Fuss</h1>
        </>
      );
    }

    // Default for Dashboard, Calendar, etc.
    return (
      <>
        <h1 className="text-lg font-heading font-bold text-text-main hidden md:block">
          {mounted ? greeting : "Selamat datang"}, <span className="text-primary">{firstName}!</span> 👋
        </h1>
        <h1 className="text-xl font-heading font-bold text-text-main md:hidden">Food Over Fuss</h1>
      </>
    );
  };

  return (
    <header className="sticky top-0 w-full z-30 bg-white/80 backdrop-blur-md flex justify-between items-center px-8 py-4 border-b border-gray-100 shrink-0">
      <div className="flex items-center gap-4">
        {/* Hamburger Menu Toggle (Desktop only since mobile nav is at bottom) */}
        <button 
          onClick={toggleSidebar} 
          className="hidden md:flex p-2 text-muted hover:bg-surface rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        {renderTitle()}
      </div>
      
      <div className="flex items-center gap-4 relative">
        <button className="p-2 text-muted hover:bg-surface rounded-full transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-all focus:outline-none relative">
          <Image src="/default-avatar.png" alt="Profile" fill className="object-cover bg-slate-200" />
        </button>
        {isProfileOpen && (
          <div className="absolute top-14 right-0 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-slide-up">
            <Link href="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-text-main hover:bg-surface transition-colors">
              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
              Profil & Preferensi
            </Link>
            <div className="my-1 border-t border-gray-100"></div>
            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium">
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Keluar
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
