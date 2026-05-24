"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      icon: "dashboard",
      label: "Beranda",
    },
    {
      href: "/grocery",
      icon: "shopping_cart",
      label: "Belanja",
    },
    {
      href: "/calendar",
      icon: "calendar_month",
      label: "Kalender",
    },
    {
      href: "/history",
      icon: "history",
      label: "Riwayat",
    },
    {
      href: "/settings",
      icon: "account_circle",
      label: "Profil",
    },
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <Link
        href="/chatbot"
        className="fixed bottom-20 right-5 z-[60] w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform md:hidden"
      >
        <span className="material-symbols-outlined text-3xl">
          chat_bubble
        </span>
      </Link>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden z-50 flex justify-around items-center py-2 px-2">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all ${
                active ? "text-primary" : "text-muted"
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={
                  active
                    ? { fontVariationSettings: "'FILL' 1" }
                    : {}
                }
              >
                {item.icon}
              </span>

              <span className="text-[10px] font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}