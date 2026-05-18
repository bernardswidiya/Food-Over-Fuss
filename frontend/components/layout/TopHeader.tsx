"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "./SidebarProvider";
import {
  getMe,
  logoutUser,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api";
import type { UserResponse, NotificationItem } from "@/lib/api";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export default function TopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [greeting, setGreeting] = useState("Selamat datang");
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifs = useCallback(async () => {
    setNotifsLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      // silent
    } finally {
      setNotifsLoading(false);
    }
  }, []);

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getMe();
        setUser(userData);
      } catch {
        // handled by middleware
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
    fetchNotifs();
  }, [fetchNotifs]);

  // Poll for new notifications every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firstName = user ? user.name.split(" ")[0] : "";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch {
      // redirect anyway
    } finally {
      router.push("/login");
    }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // silent
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkOne = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // silent
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
          <div className="flex items-center gap-2 md:hidden">
            <Image src="/Logo.png" alt="Food Over Fuss" width={24} height={24} className="object-contain" />
            <h1 className="text-xl font-heading font-bold text-text-main">Food Over Fuss</h1>
          </div>
        </>
      );
    }

    return (
      <>
        <h1 className="text-lg font-heading font-bold text-text-main hidden md:block">
          {userLoading ? (
            <span className="inline-block w-48 h-5 bg-gray-200 rounded-md animate-pulse align-middle" />
          ) : (
            <>{mounted ? greeting : "Selamat datang"}, <span className="text-primary">{firstName}!</span> 👋</>
          )}
        </h1>
        <div className="flex items-center gap-2 md:hidden">
          <Image src="/Logo.png" alt="Food Over Fuss" width={24} height={24} className="object-contain" />
          <h1 className="text-xl font-heading font-bold text-text-main">Food Over Fuss</h1>
        </div>
      </>
    );
  };

  return (
    <header className="sticky top-0 w-full z-30 bg-white/95 backdrop-blur-md flex justify-between items-center px-8 py-4 border-b border-gray-200 shadow-sm shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-2 text-muted hover:bg-gray-100 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        {renderTitle()}
      </div>

      <div className="flex items-center gap-2">

        {/* ── Notification Bell ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotifOpen((v) => !v);
              setIsProfileOpen(false);
            }}
            className="relative p-2 text-muted hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Notifikasi"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute top-12 right-0 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="font-bold text-sm text-text-main">Notifikasi</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAll}
                    disabled={markingAll}
                    className="text-xs font-bold text-primary hover:underline disabled:opacity-50"
                  >
                    {markingAll ? "Menandai..." : "Tandai semua dibaca"}
                  </button>
                )}
              </div>

              {/* Body */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted">
                    <span className="material-symbols-outlined text-4xl text-gray-200">notifications_off</span>
                    <span className="text-xs font-medium">Belum ada notifikasi</span>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => !n.is_read && handleMarkOne(n.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 items-start ${!n.is_read ? "bg-primary/5" : ""}`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.is_read ? "bg-transparent" : "bg-primary"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${n.is_read ? "text-muted" : "text-text-main"}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-muted leading-relaxed line-clamp-2 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-gray-300 mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Profile Dropdown ── */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setIsProfileOpen((v) => !v);
              setIsNotifOpen(false);
            }}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-all focus:outline-none relative bg-slate-200"
          >
            <Image
              src={user?.profile_picture || "/default-avatar.png"}
              alt="Profile"
              fill
              sizes="40px"
              className="object-cover"
            />
          </button>

          {isProfileOpen && (
            <div className="absolute top-14 right-0 w-48 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 animate-fade-slide-up">
              <div className="px-4 py-2 border-b border-gray-200 mb-1">
                <p className="text-sm font-bold text-text-main truncate">{user?.name || "User"}</p>
                <p className="text-xs text-muted truncate">{user?.email || ""}</p>
              </div>
              <Link
                href="/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-text-main hover:bg-gray-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                Profil &amp; Preferensi
              </Link>
              <div className="my-1 border-t border-gray-200" />
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {loggingOut ? "hourglass_empty" : "logout"}
                </span>
                {loggingOut ? "Keluar..." : "Keluar"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
