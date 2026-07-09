"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  History,
  LayoutDashboard,
  LogOut,
  QrCode,
  School,
  UserCircle2,
  Users,
  X,
} from "lucide-react";

interface SidebarProps {
  mobile?: boolean;
  closeSidebar?: () => void;
}

export default function Sidebar({
  mobile = false,
  closeSidebar,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menus = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Data Siswa",
      href: "/students",
      icon: Users,
    },
    {
      title: "Scanner",
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

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("account_type");
    router.push("/login");
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-900 text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-700 p-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600">
            <School size={26} />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold">Digital Attendance</h1>
            <p className="truncate text-xs text-slate-400">MTs Sunan Drajat</p>
          </div>
        </div>

        {mobile && (
          <button
            type="button"
            onClick={closeSidebar}
            className="rounded-lg p-2 transition hover:bg-slate-800"
            aria-label="Tutup menu"
          >
            <X size={22} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const active = pathname === menu.href || pathname.startsWith(`${menu.href}/`);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              onClick={() => mobile && closeSidebar?.()}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                active
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={21} />
              <span>{menu.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 p-4">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 py-3 font-semibold transition hover:bg-red-700"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}

