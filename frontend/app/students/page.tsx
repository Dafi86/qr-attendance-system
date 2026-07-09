"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  IdCard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  QrCode,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { apiUrl } from "@/lib/api";
import MainLayout from "@/src/components/layout/MainLayout";

type Student = {
  id: number | string;
  name?: string;
  nis?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  gender?: "L" | "P";
  birth_place?: string | null;
  birth_date?: string | null;
  school_class?: {
    name?: string;
  } | null;
  schoolClass?: {
    name?: string;
  } | null;
};

type StudentForm = {
  name: string;
  nis: string;
  class_name: string;
  gender: "L" | "P";
  birth_place: string;
  birth_date: string;
  address: string;
  phone: string;
  email: string;
};

type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

const initialForm: StudentForm = {
  name: "",
  nis: "",
  class_name: "",
  gender: "L",
  birth_place: "",
  birth_date: "",
  address: "",
  phone: "",
  email: "",
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState<StudentForm>(initialForm);
  const [search, setSearch] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return new URLSearchParams(window.location.search).get("search") ?? "";
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadStudents() {
    try {
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        setStudents([]);
        setError("Sesi login tidak ditemukan. Silakan login ulang.");
        return;
      }

      const response = await fetch(apiUrl("/auth/students"), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const apiError = data as ApiErrorResponse | null;

        setStudents([]);
        setError(
          response.status === 401
            ? "Sesi login sudah habis. Silakan login ulang."
            : apiError?.message ?? `Data siswa belum bisa dimuat. Status API: ${response.status}.`,
        );
        return;
      }

      setStudents(Array.isArray(data) ? data : data?.data ?? []);
    } catch (err) {
      setStudents([]);
      setError(
        err instanceof Error
          ? err.message
          : "Data siswa belum bisa dimuat. Coba refresh halaman.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchInitialStudents() {
      await loadStudents();
    }

    fetchInitialStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return students;
    }

    return students.filter((student) => {
      const className = getClassName(student).toLowerCase();
      const name = student.name?.toLowerCase() ?? "";
      const nis = student.nis?.toLowerCase() ?? "";

      return name.includes(keyword) || nis.includes(keyword) || className.includes(keyword);
    });
  }, [students, search]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Sesi login tidak ditemukan. Silakan login ulang.");
        return;
      }

      const response = await fetch(apiUrl("/auth/students"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const apiError = data as ApiErrorResponse | null;
        const firstError = apiError?.errors
          ? Object.values(apiError.errors).flat().at(0)
          : apiError?.message;

        throw new Error(String(firstError ?? "Siswa gagal ditambahkan"));
      }

      const createdStudent = (data as { data?: Student } | null)?.data;

      if (createdStudent) {
        setStudents((current) => [createdStudent, ...current]);
      } else {
        await loadStudents();
      }

      setForm(initialForm);
      setShowForm(false);
      setMessage("Siswa berhasil ditambahkan. QR absen sudah otomatis dibuat dari NIS.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Siswa gagal ditambahkan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl">
          <div className="bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.38),_transparent_36%),linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_58%,_#0891b2_100%)] p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-blue-50">
                  <Users size={16} />
                  Manajemen siswa
                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  Data Siswa dan QR Absensi
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">
                  Kelola identitas siswa, kelas, NIS, dan akses QR absen dalam satu tampilan yang nyaman di semua device.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm((value) => !value)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-lg transition hover:bg-blue-50"
              >
                {showForm ? <X size={18} /> : <Plus size={18} />}
                {showForm ? "Tutup Form" : "Tambah Siswa"}
              </button>
            </div>
          </div>
        </section>

        {(message || error) && (
          <div
            className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <p>{error || message}</p>
          </div>
        )}

        {showForm && (
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-slate-900">Tambah Siswa</h2>
              <p className="mt-1 text-sm text-slate-500">
                NIS akan dipakai sebagai kode QR absensi siswa.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
              <FormField label="Nama Siswa" required>
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className={inputClassName}
                  placeholder="Contoh: Budi Santoso"
                  required
                />
              </FormField>

              <FormField label="NIS" required>
                <input
                  value={form.nis}
                  onChange={(event) => setForm({ ...form, nis: event.target.value })}
                  className={inputClassName}
                  placeholder="Contoh: 2026001"
                  required
                />
              </FormField>

              <FormField label="Kelas" required>
                <input
                  value={form.class_name}
                  onChange={(event) => setForm({ ...form, class_name: event.target.value })}
                  className={inputClassName}
                  placeholder="Contoh: XII RPL 1"
                  required
                />
              </FormField>

              <FormField label="Jenis Kelamin" required>
                <select
                  value={form.gender}
                  onChange={(event) => setForm({ ...form, gender: event.target.value as "L" | "P" })}
                  className={inputClassName}
                  required
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </FormField>

              <FormField label="Tempat Lahir" required>
                <input
                  value={form.birth_place}
                  onChange={(event) => setForm({ ...form, birth_place: event.target.value })}
                  className={inputClassName}
                  placeholder="Contoh: Jakarta"
                  required
                />
              </FormField>

              <FormField label="Tanggal Lahir" required>
                <input
                  type="date"
                  value={form.birth_date}
                  onChange={(event) => setForm({ ...form, birth_date: event.target.value })}
                  className={inputClassName}
                  required
                />
              </FormField>

              <FormField label="Email" required>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className={inputClassName}
                  placeholder="siswa@email.com"
                  required
                />
              </FormField>

              <FormField label="Telepon">
                <input
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  className={inputClassName}
                  placeholder="Opsional"
                />
              </FormField>

              <FormField label="Alamat" className="md:col-span-2 xl:col-span-3" required>
                <textarea
                  value={form.address}
                  onChange={(event) => setForm({ ...form, address: event.target.value })}
                  className={`${inputClassName} min-h-24 resize-y`}
                  placeholder="Alamat lengkap siswa"
                  required
                />
              </FormField>

              <div className="flex flex-col gap-3 md:col-span-2 md:flex-row xl:col-span-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                  {saving ? "Menyimpan..." : "Simpan Siswa"}
                </button>

                <button
                  type="button"
                  onClick={() => setForm(initialForm)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Daftar Siswa</h2>
              <p className="mt-1 text-sm text-slate-500">
                Total {students.length} siswa terdaftar.
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama, NIS, atau kelas..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid gap-3 p-4 sm:p-5">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-20 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <EmptyStudents />
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-[1180px] table-fixed">
                  <colgroup>
                    <col className="w-16" />
                    <col className="w-64" />
                    <col className="w-36" />
                    <col className="w-32" />
                    <col className="w-44" />
                    <col className="w-56" />
                    <col className="w-56" />
                    <col className="w-32" />
                  </colgroup>
                  <thead className="bg-slate-50 text-sm text-slate-500">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">No</th>
                      <th className="px-6 py-4 text-left font-semibold">Nama</th>
                      <th className="px-6 py-4 text-left font-semibold">Kelas</th>
                      <th className="px-6 py-4 text-left font-semibold">NIS</th>
                      <th className="px-6 py-4 text-left font-semibold">TTL</th>
                      <th className="px-6 py-4 text-left font-semibold">Kontak</th>
                      <th className="px-6 py-4 text-left font-semibold">Alamat</th>
                      <th className="px-6 py-4 text-left font-semibold">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student, index) => (
                      <tr key={student.id} className="text-sm text-slate-700 transition hover:bg-blue-50/50">
                        <td className="px-6 py-4 font-semibold text-slate-500">{index + 1}</td>
                        <td className="px-6 py-4">
                          <StudentName student={student} />
                        </td>
                        <td className="break-words px-6 py-4 font-semibold">{getClassName(student)}</td>
                        <td className="break-words px-6 py-4 font-semibold text-slate-900">{student.nis ?? "-"}</td>
                        <td className="break-words px-6 py-4">
                          {formatBirth(student.birth_place, student.birth_date)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="break-words font-semibold text-slate-900">{student.email ?? "-"}</p>
                            <p className="break-words text-xs text-slate-500">{student.phone ?? "Telepon belum diisi"}</p>
                          </div>
                        </td>
                        <td className="break-words px-6 py-4 leading-6">{student.address ?? "-"}</td>
                        <td className="px-6 py-4">
                          <QrLink id={student.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-4 sm:p-5 lg:hidden">
                {filteredStudents.map((student) => (
                  <article key={student.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <StudentName student={student} />
                      <QrLink id={student.id} compact />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <InfoPill icon={<GraduationCap size={17} />} label="Kelas" value={getClassName(student)} />
                      <InfoPill icon={<IdCard size={17} />} label="NIS" value={student.nis ?? "-"} />
                      <InfoPill icon={<Mail size={17} />} label="Email" value={student.email ?? "-"} />
                      <InfoPill icon={<Phone size={17} />} label="Telepon" value={student.phone ?? "-"} />
                      <InfoPill icon={<MapPin size={17} />} label="Alamat" value={student.address ?? "-"} className="sm:col-span-2" />
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

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100";

function getClassName(student: Student) {
  return student.schoolClass?.name ?? student.school_class?.name ?? "Belum ada kelas";
}

function formatBirth(place?: string | null, date?: string | null) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  if (place && formattedDate) {
    return `${place}, ${formattedDate}`;
  }

  return place || formattedDate || "-";
}

function FormField({
  children,
  className = "",
  label,
  required = false,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function StudentName({ student }: { student: Student }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
        <UserRound size={21} />
      </div>
      <div className="min-w-0">
        <p className="break-words font-bold leading-6 text-slate-900">{student.name ?? "Tanpa nama"}</p>
        <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
          {student.gender === "P" ? "Perempuan" : "Laki-laki"}
        </p>
      </div>
    </div>
  );
}

function QrLink({ id, compact = false }: { id: number | string; compact?: boolean }) {
  return (
    <Link
      href={`/students/${id}/qr`}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 ${
        compact ? "h-10 w-10 px-0" : "px-4 py-2.5"
      }`}
      aria-label="Lihat QR siswa"
    >
      <QrCode size={18} />
      {!compact && "Lihat QR"}
    </Link>
  );
}

function InfoPill({
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
    <div className={`rounded-xl bg-slate-50 p-3 ${className}`}>
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        {icon}
        {label}
      </div>
      <p className="break-words text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function EmptyStudents() {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Users size={34} />
      </div>
      <h3 className="text-lg font-bold text-slate-900">Belum ada siswa</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Tambahkan data siswa terlebih dahulu agar QR absensi bisa digunakan.
      </p>
    </div>
  );
}




