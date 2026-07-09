"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Clock3,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  UserCircle,
} from "lucide-react";

import { apiUrl } from "@/lib/api";

type NavbarProps = {
  openSidebar?: () => void;
};

type User = {
  name?: string;
  email?: string;
  role?: string;
};

type UserResponse = {
  account_type?: "admin" | "student";
  data?: User;
  message?: string;
};

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Ringkasan absensi hari ini",
  },
  "/students": {
    title: "Data Siswa",
    subtitle: "Kelola siswa dan QR absensi",
  },
  "/scanner": {
    title: "Scanner",
    subtitle: "Scan QR masuk dan pulang",
  },
  "/attendance": {
    title: "Riwayat Absensi",
    subtitle: "Catatan kehadiran siswa",
  },
  "/profile": {
    title: "Profil",
    subtitle: "Informasi akun pengguna",
  },
};

const notifications = [
  "Dashboard otomatis memperbarui data absensi.",
  "Gunakan scanner untuk mencatat masuk dan pulang.",
  "QR siswa bisa diunduh dari halaman Data Siswa.",
];

export default function Navbar({ openSidebar }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [time, setTime] = useState("");
  const [search, setSearch] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const pageInfo = useMemo(() => {
    const matchedPath = Object.keys(pageTitles)
      .sort((a, b) => b.length - a.length)
      .find((path) => pathname === path || pathname.startsWith(`${path}/`));

    return matchedPath ? pageTitles[matchedPath] : pageTitles["/dashboard"];
  }, [pathname]);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("token");

    async function loadUser() {
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(apiUrl("/auth/me"), {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = (await response.json().catch(() => null)) as UserResponse | null;

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            router.replace("/login");
          }

          return;
        }

        if (data?.account_type === "student") {
          localStorage.setItem("account_type", "student");
          router.replace("/student-dashboard");
          return;
        }

        localStorage.setItem("account_type", "admin");

        if (mounted) {
          setUser(data?.data ?? null);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      }
    }

    loadUser();

    const updateClock = () => {
      const now = new Date();

      setTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };

    updateClock();

    const interval = window.setInterval(updateClock, 1000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [router]);

  useEffect(() => {
    function closeMenus(event: MouseEvent) {
      const target = event.target as Node;

      if (!menuRef.current?.contains(target)) {
        setUserMenuOpen(false);
      }

      if (!notificationRef.current?.contains(target)) {
        setNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMenus);

    return () => document.removeEventListener("mousedown", closeMenus);
  }, []);

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const keyword = search.trim();

    router.push(keyword ? `/students?search=${encodeURIComponent(keyword)}` : "/students");
  }

  async function logout() {
    const token = localStorage.getItem("token");

    try {
      if (token) {
        await fetch(apiUrl("/auth/logout"), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      }
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("account_type");
      router.replace("/login");
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="flex min-h-20 flex-col gap-3 px-4 py-3 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={openSidebar}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 lg:hidden"
              aria-label="Buka menu"
            >
              <Menu size={24} />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">
                {pageInfo.title}
              </h1>
              <p className="truncate text-sm text-slate-500">{pageInfo.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <NotificationButton
              open={notificationOpen}
              setOpen={setNotificationOpen}
              wrapperRef={notificationRef}
            />
            <UserMenu
              user={user}
              open={userMenuOpen}
              setOpen={setUserMenuOpen}
              logout={logout}
              wrapperRef={menuRef}
            />
          </div>
        </div>

        <form onSubmit={submitSearch} className="relative w-full xl:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari siswa atau NIS..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </form>

        <div className="hidden items-center gap-4 xl:flex">
          <div className="min-w-[210px] text-right">
            <div className="flex items-center justify-end gap-2 font-semibold text-slate-700">
              <Clock3 size={18} />
              {time}
            </div>
            <div className="mt-1 flex items-center justify-end gap-2 text-xs text-slate-500">
              <CalendarDays size={14} />
              {today}
            </div>
          </div>

          <NotificationButton
            open={notificationOpen}
            setOpen={setNotificationOpen}
            wrapperRef={notificationRef}
          />
          <UserMenu
            user={user}
            open={userMenuOpen}
            setOpen={setUserMenuOpen}
            logout={logout}
            wrapperRef={menuRef}
          />
        </div>
      </div>
    </header>
  );
}

function NotificationButton({
  open,
  setOpen,
  wrapperRef,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50"
        aria-label="Buka notifikasi"
        aria-expanded={open}
      >
        <Bell size={21} />
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
          {notifications.length}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-4">
            <p className="font-bold text-slate-900">Notifikasi</p>
            <p className="mt-1 text-xs text-slate-500">Informasi cepat sistem absensi.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {notifications.map((item) => (
              <div key={item} className="flex gap-3 p-4 text-sm text-slate-700">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                <p className="leading-6">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UserMenu({
  user,
  open,
  setOpen,
  logout,
  wrapperRef,
}: {
  user: User | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  logout: () => void;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 text-left transition hover:bg-slate-50 sm:h-12 sm:px-3"
        aria-label="Buka menu akun"
        aria-expanded={open}
      >
        <UserCircle size={32} className="shrink-0 text-blue-600" />
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-40 truncate text-sm font-bold text-slate-900">
            {user?.name ?? "Administrator"}
          </span>
          <span className="block max-w-40 truncate text-xs text-slate-500">
            {user?.email ?? "admin@school.test"}
          </span>
        </span>
        <ChevronDown size={17} className="hidden text-slate-400 sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <UserCircle size={42} className="text-blue-600" />
              <div className="min-w-0">
                <p className="truncate font-bold text-slate-900">{user?.name ?? "Administrator"}</p>
                <p className="truncate text-sm text-slate-500">{user?.email ?? "admin@school.test"}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-1 p-2">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ShieldCheck size={18} />
              Lihat Profil
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

