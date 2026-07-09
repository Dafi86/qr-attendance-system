"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  History,
  LayoutDashboard,
  QrCode,
  UserCircle2,
  Users,
} from "lucide-react";

export default function BottomNavigation() {
  const pathname = usePathname();

  const menus = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Siswa",
      href: "/students",
      icon: Users,
    },
    {
      title: "Scan",
      href: "/scanner",
      icon: QrCode,
    },
    {
      title: "Riwayat",
      href: "/attendance",
      icon: History,
    },
    {
      title: "Profil",
      href: "/profile",
      icon: UserCircle2,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white shadow-2xl lg:hidden">
      <div className="grid grid-cols-5">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const active = pathname === menu.href || pathname.startsWith(`${menu.href}/`);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[64px] flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold transition ${
                active ? "text-blue-600" : "text-slate-500"
              }`}
            >
              <Icon size={21} />
              <span className="truncate">{menu.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
