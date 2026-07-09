"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import MainLayout from "@/src/components/layout/MainLayout";
import AttendanceChart from "@/src/components/dashboard/AttendanceChart";
import { apiUrl } from "@/lib/api";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  History,
  Loader2,
  LogOut,
  QrCode,
  RefreshCcw,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

interface DashboardStats {
  total_students: number;
  present_today: number;
  checked_out: number;
  absent: number;
}

interface AttendanceItem {
  id: number | string;
  date?: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  student?: {
    id?: number | string;
    name?: string;
    nis?: string;
  } | null;
}

type DashboardResponse = {
  success?: boolean;
  message?: string;
  statistics?: Partial<DashboardStats>;
  recent_attendance?: AttendanceItem[];
};

const emptyStats: DashboardStats = {
  total_students: 0,
  present_today: 0,
  checked_out: 0,
  absent: 0,
};

async function fetchDashboardData() {
  const token = localStorage.getItem("token");

  if (!token) {
    return {
      ok: false,
      status: 401,
      data: null,
      message: "Sesi login tidak ditemukan. Silakan login ulang.",
    };
  }

  const response = await fetch(apiUrl("/auth/dashboard"), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const data = (await response.json().catch(() => null)) as DashboardResponse | null;

  return {
    ok: response.ok,
    status: response.status,
    data,
    message: data?.message,
  };
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState("");
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [recent, setRecent] = useState<AttendanceItem[]>([]);

  const attendanceRate = useMemo(() => {
    if (stats.total_students === 0) {
      return 0;
    }

    return Math.round((stats.present_today / stats.total_students) * 100);
  }, [stats.present_today, stats.total_students]);

  async function applyDashboardData() {
    const result = await fetchDashboardData();

    if (!result.ok) {
      setStats(emptyStats);
      setRecent([]);
      setError(
        result.status === 401
          ? "Sesi login sudah habis. Silakan login ulang."
          : result.message ?? `Dashboard belum bisa dimuat. Status API: ${result.status}.`,
      );
      return;
    }

    setStats({
      total_students: result.data?.statistics?.total_students ?? 0,
      present_today: result.data?.statistics?.present_today ?? 0,
      checked_out: result.data?.statistics?.checked_out ?? 0,
      absent: result.data?.statistics?.absent ?? 0,
    });
    setRecent(Array.isArray(result.data?.recent_attendance) ? result.data.recent_attendance : []);
    setError("");
    setLastUpdate(
      new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    );
  }

  async function refreshDashboard() {
    setRefreshing(true);

    try {
      await applyDashboardData();
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadInitialDashboard() {
      try {
        await applyDashboardData();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadInitialDashboard();

    const interval = window.setInterval(() => {
      applyDashboardData();
    }, 10000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl">
          <div className="bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.42),_transparent_34%),linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_56%,_#0891b2_100%)] p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-blue-50">
                  <Clock3 size={16} />
                  {lastUpdate ? `Update ${lastUpdate}` : "Dashboard absensi"}
                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  Ringkasan Absensi Hari Ini
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">
                  Pantau siswa hadir, sudah pulang, dan yang belum melakukan absensi dari satu halaman yang lebih ringkas.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur sm:min-w-[250px]">
                  <p className="text-sm text-blue-50">Persentase hadir</p>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-4xl font-bold">{attendanceRate}%</span>
                    <span className="pb-1 text-sm text-blue-100">hari ini</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/20">
                    <div
                      className="h-2 rounded-full bg-white"
                      style={{ width: `${Math.min(attendanceRate, 100)}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={refreshDashboard}
                  disabled={refreshing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-lg transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {refreshing ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Siswa"
            value={stats.total_students}
            description="Siswa terdaftar"
            icon={<Users size={24} />}
            tone="blue"
          />
          <StatCard
            title="Hadir"
            value={stats.present_today}
            description="Sudah scan masuk"
            icon={<CheckCircle2 size={24} />}
            tone="emerald"
          />
          <StatCard
            title="Pulang"
            value={stats.checked_out}
            description="Sudah scan pulang"
            icon={<LogOut size={24} />}
            tone="amber"
          />
          <StatCard
            title="Belum Hadir"
            value={stats.absent}
            description="Belum tercatat"
            icon={<XCircle size={24} />}
            tone="red"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
          <AttendanceChart />

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900">Aksi Cepat</h2>
              <p className="mt-1 text-sm text-slate-500">Jalur utama yang paling sering dipakai.</p>
            </div>

            <div className="grid gap-3">
              <QuickAction
                href="/scanner"
                title="Scan QR"
                description="Catat masuk atau pulang"
                icon={<QrCode size={21} />}
                tone="blue"
              />
              <QuickAction
                href="/students"
                title="Data Siswa"
                description="Tambah dan lihat QR siswa"
                icon={<Users size={21} />}
                tone="emerald"
              />
              <QuickAction
                href="/attendance"
                title="Riwayat Absensi"
                description="Lihat catatan lengkap"
                icon={<History size={21} />}
                tone="amber"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Absensi Terbaru</h2>
              <p className="mt-1 text-sm text-slate-500">Aktivitas scan terbaru yang masuk hari ini.</p>
            </div>

            <Link
              href="/attendance"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Lihat Semua
              <ArrowRight size={17} />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-3 p-5">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-20 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <History size={32} />
              </div>
              <h3 className="font-bold text-slate-900">Belum ada absensi</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Data scan terbaru akan muncul setelah siswa melakukan absensi.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full">
                  <thead className="bg-slate-50 text-sm text-slate-500">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Nama</th>
                      <th className="px-6 py-4 text-left font-semibold">NIS</th>
                      <th className="px-6 py-4 text-left font-semibold">Masuk</th>
                      <th className="px-6 py-4 text-left font-semibold">Pulang</th>
                      <th className="px-6 py-4 text-left font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {recent.map((item) => (
                      <tr key={item.id} className="text-sm text-slate-700 transition hover:bg-blue-50/50">
                        <td className="px-6 py-4">
                          <StudentCell name={item.student?.name} />
                        </td>
                        <td className="px-6 py-4">{item.student?.nis ?? "-"}</td>
                        <td className="px-6 py-4">{item.check_in_time ?? "-"}</td>
                        <td className="px-6 py-4">{item.check_out_time ?? "-"}</td>
                        <td className="px-6 py-4">
                          <StatusBadge checkedOut={Boolean(item.check_out_time)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-4 sm:p-5 lg:hidden">
                {recent.map((item) => (
                  <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <StudentCell name={item.student?.name} nis={item.student?.nis} />
                      <StatusBadge checkedOut={Boolean(item.check_out_time)} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <TimeBox label="Masuk" value={item.check_in_time ?? "-"} />
                      <TimeBox label="Pulang" value={item.check_out_time ?? "-"} />
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </MainLayout>
  );
}

function StatCard({
  description,
  icon,
  title,
  tone,
  value,
}: {
  description: string;
  icon: ReactNode;
  title: string;
  tone: "blue" | "emerald" | "amber" | "red";
  value: number;
}) {
  const toneClass = {
    blue: "bg-blue-100 text-blue-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function QuickAction({
  description,
  href,
  icon,
  title,
  tone,
}: {
  description: string;
  href: string;
  icon: ReactNode;
  title: string;
  tone: "blue" | "emerald" | "amber";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  }[tone];

  return (
    <Link href={href} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <p className="mt-1 truncate text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <ArrowRight className="shrink-0 text-slate-400" size={19} />
    </Link>
  );
}

function StudentCell({ name, nis }: { name?: string; nis?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
        <UserRound size={20} />
      </div>
      <div className="min-w-0">
        <p className="truncate font-bold text-slate-900">{name ?? "Tanpa nama"}</p>
        {nis && <p className="mt-1 text-xs text-slate-500">NIS: {nis}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ checkedOut }: { checkedOut: boolean }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${
        checkedOut ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
      }`}
    >
      {checkedOut ? "Sudah Pulang" : "Masuk"}
    </span>
  );
}

function TimeBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 font-bold text-slate-900">{value}</p>
    </div>
  );
}
