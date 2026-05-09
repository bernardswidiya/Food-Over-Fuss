"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarProvider";

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen } = useSidebar();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/grocery", label: "Daftar Belanja", icon: "shopping_cart" },
    { href: "/calendar", label: "Kalender", icon: "calendar_month" },
    { href: "/chatbot", label: "Foodie Assistant", icon: "chat_bubble" },
    { href: "/settings", label: "Pengaturan", icon: "settings" },
  ];

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-0'} bg-white shadow-[2px_0_20px_rgba(0,0,0,0.10)] flex-col h-full shrink-0 hidden md:flex z-20 border-r border-gray-200 transition-all duration-300 overflow-hidden`}>
      <div className="p-8 flex-1 flex flex-col w-64">
        <Link href="/" className="flex items-center gap-3 mb-10 group">
          <Image src="/Logo.png" alt="Food Over Fuss logo" width={32} height={32} className="object-contain transition-transform group-hover:scale-105" priority />
          <span className="text-xl font-bold text-text-main font-heading tracking-tight">Food Over Fuss</span>
        </Link>
        
        <nav className="flex flex-col gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-full font-medium transition-all ${isActive ? 'bg-primary/15 text-primary font-bold shadow-sm' : 'text-muted hover:text-text-main hover:bg-gray-100'}`}>
                <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
