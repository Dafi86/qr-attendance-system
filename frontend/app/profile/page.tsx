"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  IdCard,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  UserCircle,
  ExternalLink,
} from "lucide-react";

import { apiUrl } from "@/lib/api";
import MainLayout from "@/src/components/layout/MainLayout";

type User = {
  name?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
  last_login_at?: string | null;
};

const authorName = "AHMAD DAFI ZIDNI ALFARISI";
const authorUrl = "https://dafi-portfolio-chi.vercel.app/";

type UserResponse = {
  data?: User;
  message?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.replace("/login");
          return;
        }

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
            return;
          }

          throw new Error(data?.message ?? `Profil belum bisa dimuat. Status API: ${response.status}.`);
        }

        setUser(data?.data ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Profil belum bisa dimuat.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

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
      router.replace("/login");
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl">
          <div className="bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.38),_transparent_36%),linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_58%,_#0891b2_100%)] p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-blue-50">
                  <ShieldCheck size={16} />
                  Profil akun
                </div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  Informasi Pengguna
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">
                  Lihat status akun yang sedang digunakan untuk mengakses sistem absensi.
                </p>
              </div>

              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-red-600 shadow-lg transition hover:bg-red-50"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-bold text-slate-900">Detail Akun</h2>
            <p className="mt-1 text-sm text-slate-500">Data diambil dari endpoint pengguna aktif.</p>
          </div>

          {loading ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="animate-spin" size={34} />
              <p className="text-sm font-semibold">Memuat profil...</p>
            </div>
          ) : (
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
              <ProfileItem icon={<UserCircle size={22} />} label="Nama" value={user?.name ?? "Administrator"} />
              <ProfileItem icon={<Mail size={22} />} label="Email" value={user?.email ?? "-"} />
              <ProfileItem icon={<IdCard size={22} />} label="Role" value={formatRole(user?.role)} />
              <ProfileItem
                icon={user?.is_active === false ? <AlertCircle size={22} /> : <CheckCircle2 size={22} />}
                label="Status"
                value={user?.is_active === false ? "Nonaktif" : "Aktif"}
              />
              <ProfileItem
                className="md:col-span-2 xl:col-span-4"
                icon={<Clock3 size={22} />}
                label="Login Terakhir"
                value={formatDate(user?.last_login_at)}
              />
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Aplikasi ini dibuat oleh</p>
          <Link
            href={authorUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-lg font-bold text-blue-700 transition hover:text-blue-800"
          >
            {authorName}
            <ExternalLink size={18} />
          </Link>
        </section>
      </div>
    </MainLayout>
  );
}

function formatRole(role?: string) {
  if (!role) {
    return "Administrator";
  }

  return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Belum tersedia";
  }

  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function ProfileItem({
  className = "",
  icon,
  label,
  value,
}: {
  className?: string;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className={`rounded-xl bg-slate-50 p-4 ${className}`}>
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 break-words font-bold text-slate-900">{value}</p>
    </div>
  );
}

