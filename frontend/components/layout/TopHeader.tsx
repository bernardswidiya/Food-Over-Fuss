"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "./SidebarProvider";
import { getMe, logoutUser } from "@/lib/api";
import type { UserResponse } from "@/lib/api";

export default function TopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [greeting, setGreeting] = useState("Selamat datang");
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getMe();
        setUser(userData);
      } catch {
        // User not authenticated — will be handled by middleware
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  const firstName = user ? user.name.split(" ")[0] : "";

  // Handle logout
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch {
      // Even if the request fails, redirect to login
    } finally {
      router.push("/login");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const hour = new Date().getHours();
      if (hour < 11) setGreeting("Selamat pagi");
      else if (hour < 15) setGreeting("Selamat siang");
      else if (hour < 18) setGreeting("Selamat sore");
      else setGreeting("Selamat malam");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const renderTitle = () => {
    if (pathname === "/settings") {
      return <h1 className="text-lg font-heading font-bold text-text-main">Pengaturan Akun</h1>;
    }
    
    if (pathname === "/grocery") {
      return (
        <>
          <h1 className="text-lg font-heading font-bold text-text-main hidden md:block">
            {userLoading ? (
              <span className="inline-block w-32 h-5 bg-gray-200 rounded-md animate-pulse align-middle" />
            ) : (
              <><span className="text-primary">{firstName}&apos;s</span> Pantry</>
            )}
          </h1>
          <h1 className="text-xl font-heading font-bold text-text-main md:hidden">Food Over Fuss</h1>
        </>
      );
    }

    // Default for Dashboard, Calendar, etc.
    return (
      <>
        <h1 className="text-lg font-heading font-bold text-text-main hidden md:block">
          {userLoading ? (
            <span className="inline-block w-48 h-5 bg-gray-200 rounded-md animate-pulse align-middle" />
          ) : (
            <>{mounted ? greeting : "Selamat datang"}, <span className="text-primary">{firstName}!</span> 👋</>
          )}
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
      
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        <button className="p-2 text-muted hover:bg-surface rounded-full transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-all focus:outline-none relative bg-slate-200">
          <Image src={user?.profile_picture || "/default-avatar.png"} alt="Profile" fill sizes="40px" className="object-cover" />
        </button>
        {isProfileOpen && (
          <div className="absolute top-14 right-0 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-slide-up">
            <div className="px-4 py-2 border-b border-gray-100 mb-1">
              <p className="text-sm font-bold text-text-main truncate">{user?.name || "User"}</p>
              <p className="text-xs text-muted truncate">{user?.email || ""}</p>
            </div>
            <Link href="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-text-main hover:bg-surface transition-colors">
              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
              Profil & Preferensi
            </Link>
            <div className="my-1 border-t border-gray-100"></div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">{loggingOut ? 'hourglass_empty' : 'logout'}</span>
              {loggingOut ? 'Keluar...' : 'Keluar'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
