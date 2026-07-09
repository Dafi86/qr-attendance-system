"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  GraduationCap,
  IdCard,
  Loader2,
  LogOut,
  Search,
  School,
  UserRound,
} from "lucide-react";

import { apiUrl } from "@/lib/api";

type Student = {
  id: number | string;
  name?: string;
  nis?: string;
  gender?: "L" | "P";
  email?: string | null;
  school_class?: { name?: string } | null;
  schoolClass?: { name?: string } | null;
};

type Attendance = {
  id: number | string;
  date?: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  status?: string;
};

type Announcement = {
  title?: string;
  message?: string;
  date?: string;
};

type StudentDashboardResponse = {
  success?: boolean;
  message?: string;
  data?: {
    student?: Student;
    today_attendance?: Attendance | null;
    attendance_history?: Attendance[];
    announcements?: Announcement[];
    school?: {
      name?: string;
      description?: string;
    };
  };
};

const authorName = "AHMAD DAFI ZIDNI ALFARISI";
const authorUrl = "https://dafi-portfolio-chi.vercel.app/";
const dayOptions = [
  { value: "0", label: "Minggu" },
  { value: "1", label: "Senin" },
  { value: "2", label: "Selasa" },
  { value: "3", label: "Rabu" },
  { value: "4", label: "Kamis" },
  { value: "5", label: "Jumat" },
  { value: "6", label: "Sabtu" },
];

export default function StudentDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<StudentDashboardResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [time, setTime] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDay, setSelectedDay] = useState("all");

  const attendanceRate = useMemo(() => {
    const history = data?.attendance_history ?? [];

    if (history.length === 0) {
      return 0;
    }

    const present = history.filter((item) => item.status === "present" || item.check_in_time).length;

    return Math.round((present / history.length) * 100);
  }, [data?.attendance_history]);

  useEffect(() => {
    const updateClock = () => {
      setTime(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };

    updateClock();
    const interval = window.setInterval(updateClock, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const token = localStorage.getItem("token");
        const accountType = localStorage.getItem("account_type");

        if (!token || accountType !== "student") {
          router.replace("/login");
          return;
        }

        const response = await fetch(apiUrl("/auth/student-dashboard"), {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const result = (await response.json().catch(() => null)) as StudentDashboardResponse | null;

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("account_type");
            router.replace("/login");
            return;
          }

          throw new Error(result?.message ?? `Dashboard siswa belum bisa dimuat. Status API: ${response.status}.`);
        }

        setData(result?.data ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Dashboard siswa belum bisa dimuat.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
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
      localStorage.removeItem("account_type");
      router.replace("/login");
    }
  }

  const student = data?.student;
  const todayAttendance = data?.today_attendance;
  const history = useMemo(() => data?.attendance_history ?? [], [data?.attendance_history]);
  const filteredHistory = useMemo(() => {
    const keyword = historySearch.trim().toLowerCase();

    return history.filter((item) => {
      const date = item.date?.toLowerCase() ?? "";
      const status = formatStatus(item.status).toLowerCase();
      const matchesKeyword =
        !keyword ||
        date.includes(keyword) ||
        status.includes(keyword) ||
        (item.check_in_time ?? "").includes(keyword) ||
        (item.check_out_time ?? "").includes(keyword);
      const matchesDate = !selectedDate || item.date === selectedDate;
      const matchesDay = selectedDay === "all" || getDayKey(item.date) === selectedDay;

      return matchesKeyword && matchesDate && matchesDay;
    });
  }, [history, historySearch, selectedDate, selectedDay]);
  const announcements = data?.announcements ?? [];

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <School size={24} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-slate-900">Dashboard Siswa</h1>
              <p className="truncate text-sm text-slate-500">{data?.school?.name ?? "MTs Sunan Drajat Sugiwaras"}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <section className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl">
          <div className="bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.34),_transparent_34%),linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_58%,_#047857_100%)] p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-emerald-50">
                  <Clock3 size={16} />
                  {time}
                </div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  Halo, {student?.name ?? "Siswa"}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50 sm:text-base">
                  {data?.school?.description ?? "Pantau kehadiran pribadi dan informasi sekolah dari satu halaman."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur sm:min-w-[260px]">
                <p className="text-sm text-emerald-50">Kehadiran riwayat</p>
                <p className="mt-2 text-4xl font-bold">{attendanceRate}%</p>
                <p className="mt-1 text-sm text-emerald-50">berdasarkan {history.length} data terakhir</p>
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

        {loading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl bg-white text-slate-500 shadow-sm">
            <Loader2 className="animate-spin" size={34} />
            <p className="text-sm font-semibold">Memuat data siswa...</p>
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard icon={<UserRound size={22} />} label="Nama" value={student?.name ?? "-"} />
              <InfoCard icon={<IdCard size={22} />} label="NIS" value={student?.nis ?? "-"} />
              <InfoCard icon={<GraduationCap size={22} />} label="Kelas" value={getClassName(student)} />
              <InfoCard
                icon={todayAttendance?.check_in_time ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
                label="Status Hari Ini"
                value={todayAttendance?.check_in_time ? "Sudah absen" : "Belum absen"}
              />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Riwayat Absensi Saya</h2>
                      <p className="mt-1 text-sm text-slate-500">Sortir berdasarkan hari, tanggal, jam, atau status.</p>
                    </div>

                    <div className="grid gap-3 lg:w-[620px] lg:grid-cols-[minmax(160px,1fr)_160px_150px]">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                        <input
                          value={historySearch}
                          onChange={(event) => setHistorySearch(event.target.value)}
                          placeholder="Cari riwayat..."
                          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        />
                      </div>

                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(event) => setSelectedDate(event.target.value)}
                        className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      />

                      <div className="relative">
                        <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                        <select
                          value={selectedDay}
                          onChange={(event) => setSelectedDay(event.target.value)}
                          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        >
                          <option value="all">Semua hari</option>
                          {dayOptions.map((day) => (
                            <option key={day.value} value={day.value}>
                              {day.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {history.length === 0 ? (
                  <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center text-slate-500">
                    <CalendarDays className="mb-3" size={38} />
                    <p className="font-semibold">Belum ada riwayat absensi.</p>
                  </div>
                ) : filteredHistory.length === 0 ? (
                  <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center text-slate-500">
                    <CalendarDays className="mb-3" size={38} />
                    <p className="font-semibold">Tidak ada riwayat yang cocok.</p>
                    <p className="mt-2 text-sm">Ubah filter hari atau tanggal untuk melihat data lain.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-50 text-sm text-slate-500">
                        <tr>
                          <th className="px-5 py-4 text-left font-semibold">Tanggal</th>
                          <th className="px-5 py-4 text-left font-semibold">Masuk</th>
                          <th className="px-5 py-4 text-left font-semibold">Pulang</th>
                          <th className="px-5 py-4 text-left font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredHistory.map((item) => (
                          <tr key={item.id} className="text-sm text-slate-700">
                            <td className="px-5 py-4 font-semibold text-slate-900">{formatDate(item.date)}</td>
                            <td className="px-5 py-4">{item.check_in_time ?? "-"}</td>
                            <td className="px-5 py-4">{item.check_out_time ?? "-"}</td>
                            <td className="px-5 py-4">
                              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                {formatStatus(item.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <aside className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 p-5">
                    <h2 className="text-xl font-bold text-slate-900">Absensi Hari Ini</h2>
                    <p className="mt-1 text-sm text-slate-500">Ringkasan scan hari ini.</p>
                  </div>
                  <div className="grid gap-3 p-5">
                    <TimeBox label="Masuk" value={todayAttendance?.check_in_time ?? "-"} />
                    <TimeBox label="Pulang" value={todayAttendance?.check_out_time ?? "-"} />
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 p-5">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                      <Bell size={21} />
                      Pemberitahuan
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">Informasi dari admin sekolah.</p>
                  </div>
                  <div className="grid gap-3 p-5">
                    {announcements.map((item) => (
                      <div key={`${item.title}-${item.date}`} className="rounded-xl bg-slate-50 p-4">
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.message}</p>
                        <p className="mt-2 text-xs font-semibold text-slate-400">{formatDate(item.date)}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </aside>
            </section>

            <footer className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
              Aplikasi dibuat oleh{" "}
              <Link href={authorUrl} target="_blank" rel="noreferrer" className="font-bold text-blue-700 hover:text-blue-800">
                {authorName}
              </Link>
              .
            </footer>
          </>
        )}
      </div>
    </main>
  );
}

function getClassName(student?: Student | null) {
  return student?.schoolClass?.name ?? student?.school_class?.name ?? "-";
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDayKey(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "" : String(date.getDay());
}

function formatStatus(status?: string) {
  const labels: Record<string, string> = {
    present: "Hadir",
    late: "Terlambat",
    absent: "Tidak hadir",
  };

  return labels[status ?? ""] ?? "Hadir";
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 break-words text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function TimeBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
