"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  History,
  LogOut,
  Search,
  UserRound,
} from "lucide-react";

import { apiUrl } from "@/lib/api";
import MainLayout from "@/src/components/layout/MainLayout";

type AttendanceItem = {
  id: number | string;
  date?: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  student?: {
    name?: string;
  } | null;
};

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDay, setSelectedDay] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAttendance() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(apiUrl("/auth/attendance"), {
          headers: {
            Authorization: `Bearer ${token ?? ""}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Gagal memuat riwayat absensi");
        }

        const data = await response.json();
        const records = data?.data?.data ?? data?.data ?? [];

        setAttendance(Array.isArray(records) ? records : []);
      } catch (err) {
        console.log(err);
        setError("Riwayat absensi belum bisa dimuat. Coba refresh halaman.");
      } finally {
        setLoading(false);
      }
    }

    loadAttendance();
  }, []);

  const filteredAttendance = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return attendance.filter((item) => {
      const name = item.student?.name?.toLowerCase() ?? "";
      const date = item.date?.toLowerCase() ?? "";
      const matchesKeyword = !keyword || name.includes(keyword) || date.includes(keyword);
      const matchesDate = !selectedDate || item.date === selectedDate;
      const matchesDay = selectedDay === "all" || getDayKey(item.date) === selectedDay;

      return matchesKeyword && matchesDate && matchesDay;
    });
  }, [attendance, search, selectedDate, selectedDay]);

  const completedCount = attendance.filter((item) => item.check_out_time).length;
  const activeCount = attendance.length - completedCount;

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl">
          <div className="bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.45),_transparent_35%),linear-gradient(135deg,_#0f172a_0%,_#1e3a8a_55%,_#0369a1_100%)] p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-blue-50">
                  <History size={16} />
                  Riwayat absensi siswa
                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  Pantau Kehadiran dengan Lebih Rapi
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">
                  Data masuk dan pulang ditampilkan responsif, jadi tetap nyaman
                  dibaca dari laptop, tablet, sampai ponsel.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:min-w-[390px]">
                <SummaryCard label="Total" value={attendance.length} />
                <SummaryCard label="Masuk" value={activeCount} />
                <SummaryCard label="Pulang" value={completedCount} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Daftar Absensi</h2>
              <p className="mt-1 text-sm text-slate-500">
                Cari berdasarkan nama siswa atau tanggal.
              </p>
            </div>

            <div className="grid w-full gap-3 lg:max-w-3xl lg:grid-cols-[minmax(180px,1fr)_170px_170px]">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari nama atau tanggal..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="relative">
                <Filter
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <select
                  value={selectedDay}
                  onChange={(event) => setSelectedDay(event.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
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

          {loading ? (
            <div className="grid gap-3 p-4 sm:p-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              title="Data tidak tersedia"
              description={error}
              icon={<Clock3 size={34} />}
            />
          ) : filteredAttendance.length === 0 ? (
            <EmptyState
              title="Belum ada data"
              description="Tidak ada riwayat absensi yang cocok dengan pencarian."
              icon={<CalendarDays size={34} />}
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full">
                  <thead className="bg-slate-50 text-sm text-slate-500">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Nama</th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Tanggal
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">Masuk</th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Pulang
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredAttendance.map((item) => (
                      <tr
                        key={item.id}
                        className="text-sm text-slate-700 transition hover:bg-blue-50/50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                              <UserRound size={20} />
                            </div>
                            <span className="font-semibold text-slate-900">
                              {item.student?.name ?? "Tanpa nama"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{formatDate(item.date)}</td>
                        <td className="px-6 py-4">{item.check_in_time ?? "-"}</td>
                        <td className="px-6 py-4">
                          {item.check_out_time ?? "-"}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge checkedOut={Boolean(item.check_out_time)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-4 sm:p-5 lg:hidden">
                {filteredAttendance.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                          <UserRound size={20} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-slate-900">
                            {item.student?.name ?? "Tanpa nama"}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(item.date)}
                          </p>
                        </div>
                      </div>

                      <StatusBadge checkedOut={Boolean(item.check_out_time)} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <TimeBox
                        icon={<CheckCircle2 size={17} />}
                        label="Masuk"
                        value={item.check_in_time ?? "-"}
                      />
                      <TimeBox
                        icon={<LogOut size={17} />}
                        label="Pulang"
                        value={item.check_out_time ?? "-"}
                      />
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

const dayOptions = [
  { value: "0", label: "Minggu" },
  { value: "1", label: "Senin" },
  { value: "2", label: "Selasa" },
  { value: "3", label: "Rabu" },
  { value: "4", label: "Kamis" },
  { value: "5", label: "Jumat" },
  { value: "6", label: "Sabtu" },
];

function getDayKey(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "" : String(date.getDay());
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

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur">
      <p className="text-xs font-medium uppercase text-blue-100">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ checkedOut }: { checkedOut: boolean }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
        checkedOut
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {checkedOut ? "Selesai" : "Masih hadir"}
    </span>
  );
}

function TimeBox({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        {icon}
        {label}
      </div>
      <p className="font-bold text-slate-900">{value}</p>
    </div>
  );
}

function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}
