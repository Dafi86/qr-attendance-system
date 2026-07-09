"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import { apiUrl } from "@/lib/api";
import MainLayout from "@/src/components/layout/MainLayout";

type Announcement = {
  id: number | string;
  title?: string;
  message?: string;
  published_at?: string | null;
};

type ApiListResponse = {
  success?: boolean;
  message?: string;
  data?: Announcement[];
};

type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function loadAnnouncements() {
    try {
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Sesi login tidak ditemukan. Silakan login ulang.");
        return;
      }

      const response = await fetch(apiUrl("/auth/announcements"), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = (await response.json().catch(() => null)) as ApiListResponse | null;

      if (!response.ok) {
        throw new Error(data?.message ?? `Pemberitahuan belum bisa dimuat. Status API: ${response.status}.`);
      }

      setAnnouncements(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pemberitahuan belum bisa dimuat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadAnnouncements();
    });
  }, []);

  async function submitAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFeedback("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Sesi login tidak ditemukan. Silakan login ulang.");
        return;
      }

      const response = await fetch(apiUrl("/auth/announcements"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ title, message }),
      });

      const data = (await response.json().catch(() => null)) as ApiErrorResponse | null;

      if (!response.ok) {
        const firstError = data?.errors ? Object.values(data.errors).flat().at(0) : data?.message;

        throw new Error(String(firstError ?? "Pemberitahuan gagal dibuat."));
      }

      setTitle("");
      setMessage("");
      setFeedback("Pemberitahuan berhasil dibuat dan akan tampil di dashboard siswa.");
      await loadAnnouncements();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pemberitahuan gagal dibuat.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAnnouncement(id: number | string) {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Sesi login tidak ditemukan. Silakan login ulang.");
      return;
    }

    setError("");
    setFeedback("");

    try {
      const response = await fetch(apiUrl(`/auth/announcements/${id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as ApiErrorResponse | null;

        throw new Error(data?.message ?? "Pemberitahuan gagal dihapus.");
      }

      setFeedback("Pemberitahuan berhasil dihapus.");
      await loadAnnouncements();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pemberitahuan gagal dihapus.");
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
                  <Bell size={16} />
                  Pemberitahuan admin
                </div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  Info untuk Dashboard Siswa
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">
                  Buat pengumuman singkat yang akan dibaca siswa setelah login.
                </p>
              </div>
            </div>
          </div>
        </section>

        {(feedback || error) && (
          <div
            className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
              error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <p>{error || feedback}</p>
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
          <form onSubmit={submitAnnouncement} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-slate-900">Tambah Info</h2>
              <p className="mt-1 text-sm text-slate-500">Pemberitahuan aktif langsung tampil untuk siswa.</p>
            </div>
            <div className="grid gap-4 p-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Judul</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  className={inputClassName}
                  placeholder="Contoh: Jadwal scan pagi"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Isi Pemberitahuan</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                  className={`${inputClassName} min-h-32 resize-y`}
                  placeholder="Tulis informasi untuk siswa..."
                />
              </label>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                {saving ? "Menyimpan..." : "Terbitkan Info"}
              </button>
            </div>
          </form>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-slate-900">Daftar Pemberitahuan</h2>
              <p className="mt-1 text-sm text-slate-500">Info yang sedang tampil untuk siswa.</p>
            </div>

            {loading ? (
              <div className="grid gap-3 p-5">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-20 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center p-6 text-center text-slate-500">
                <Bell className="mb-3" size={38} />
                <p className="font-semibold">Belum ada pemberitahuan.</p>
              </div>
            ) : (
              <div className="grid gap-3 p-5">
                {announcements.map((item) => (
                  <article key={item.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.message}</p>
                        <p className="mt-2 text-xs font-semibold text-slate-400">{formatDate(item.published_at)}</p>
                      </div>
                      {typeof item.id === "number" && (
                        <button
                          type="button"
                          onClick={() => deleteAnnouncement(item.id)}
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-red-600 transition hover:bg-red-50"
                          aria-label="Hapus pemberitahuan"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </MainLayout>
  );
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100";

function formatDate(value?: string | null) {
  if (!value) {
    return "Belum diterbitkan";
  }

  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  });
}
