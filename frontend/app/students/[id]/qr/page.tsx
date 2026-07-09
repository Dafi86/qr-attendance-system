"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Download,
  GraduationCap,
  IdCard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  QrCode,
  UserRound,
} from "lucide-react";

import { apiUrl } from "@/lib/api";
import MainLayout from "@/src/components/layout/MainLayout";

type Student = {
  id: number | string;
  name?: string;
  nis?: string;
  gender?: "L" | "P";
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  birth_place?: string | null;
  birth_date?: string | null;
  school_class?: { name?: string } | null;
  schoolClass?: { name?: string } | null;
};

type ApiErrorResponse = {
  message?: string;
};

export default function StudentQrPage() {
  const params = useParams<{ id: string | string[] }>();
  const studentId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [student, setStudent] = useState<Student | null>(null);
  const [qrSvg, setQrSvg] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const qrDataUrl = useMemo(() => {
    if (!qrSvg) {
      return "";
    }

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg)}`;
  }, [qrSvg]);

  useEffect(() => {
    async function loadQrPage() {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Sesi login tidak ditemukan. Silakan login ulang.");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        };

        const [studentsResponse, qrResponse] = await Promise.all([
          fetch(apiUrl("/auth/students"), { headers }),
          fetch(apiUrl(`/auth/students/${studentId}/qr`), {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "image/svg+xml",
            },
          }),
        ]);

        const studentsData = await studentsResponse.json().catch(() => null);

        if (!studentsResponse.ok) {
          const apiError = studentsData as ApiErrorResponse | null;

          throw new Error(
            studentsResponse.status === 401
              ? "Sesi login sudah habis. Silakan login ulang."
              : apiError?.message ?? `Data siswa belum bisa dimuat. Status API: ${studentsResponse.status}.`,
          );
        }

        if (!qrResponse.ok) {
          const apiError = (await qrResponse.json().catch(() => null)) as ApiErrorResponse | null;

          throw new Error(
            qrResponse.status === 404
              ? "Siswa tidak ditemukan."
              : apiError?.message ?? `QR siswa belum bisa dimuat. Status API: ${qrResponse.status}.`,
          );
        }

        const students = Array.isArray(studentsData) ? studentsData : studentsData?.data ?? [];
        const selectedStudent = students.find((item: Student) => String(item.id) === String(studentId));

        setStudent(selectedStudent ?? null);
        setQrSvg(await qrResponse.text());
      } catch (err) {
        setStudent(null);
        setQrSvg("");
        setError(err instanceof Error ? err.message : "QR siswa gagal dimuat.");
      } finally {
        setLoading(false);
      }
    }

    if (studentId) {
      loadQrPage();
    }
  }, [studentId]);

  async function downloadStudentCard() {
    if (!qrDataUrl) {
      return;
    }

    setDownloading(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 680;

      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      const qrImage = await loadImage(qrDataUrl);
      const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#0f172a");
      gradient.addColorStop(0.58, "#1d4ed8");
      gradient.addColorStop(1, "#0891b2");

      context.fillStyle = gradient;
      roundRect(context, 0, 0, canvas.width, canvas.height, 42);
      context.fill();

      context.fillStyle = "rgba(255,255,255,0.12)";
      context.beginPath();
      context.arc(930, 76, 190, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.arc(130, 610, 210, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "#ffffff";
      roundRect(context, 44, 44, canvas.width - 88, canvas.height - 88, 32);
      context.fill();

      context.fillStyle = "#0f172a";
      context.font = "700 34px Arial";
      context.fillText("KARTU TANDA SISWA", 86, 104);
      context.font = "600 22px Arial";
      context.fillStyle = "#475569";
      context.fillText("MTs Sunan Drajat Sugiwaras", 86, 140);

      context.fillStyle = "#2563eb";
      roundRect(context, 86, 178, 170, 170, 28);
      context.fill();
      context.fillStyle = "#dbeafe";
      context.beginPath();
      context.arc(171, 240, 34, 0, Math.PI * 2);
      context.fill();
      roundRect(context, 124, 286, 94, 38, 19);
      context.fill();

      context.fillStyle = "#0f172a";
      context.font = "700 42px Arial";
      wrapCanvasText(context, student?.name ?? "Tanpa nama", 286, 224, 430, 48, 2);

      drawCanvasLabel(context, "NIS", student?.nis ?? "-", 286, 342);
      drawCanvasLabel(context, "Kelas", getClassName(student), 480, 342);
      drawCanvasLabel(context, "Jenis Kelamin", student?.gender === "P" ? "Perempuan" : "Laki-laki", 286, 438);
      drawCanvasLabel(context, "TTL", formatBirth(student?.birth_place, student?.birth_date), 480, 438);

      context.fillStyle = "#f8fafc";
      roundRect(context, 86, 510, 590, 86, 22);
      context.fill();
      context.fillStyle = "#475569";
      context.font = "600 21px Arial";
      wrapCanvasText(context, student?.address ?? "Alamat belum diisi", 116, 556, 530, 28, 2);

      context.fillStyle = "#ffffff";
      roundRect(context, 710, 164, 286, 286, 30);
      context.fill();
      context.strokeStyle = "#dbeafe";
      context.lineWidth = 6;
      roundRect(context, 724, 178, 258, 258, 24);
      context.stroke();
      context.drawImage(qrImage, 746, 200, 214, 214);

      context.fillStyle = "#0f172a";
      context.font = "700 24px Arial";
      context.textAlign = "center";
      context.fillText(student?.nis ?? "QR ABSENSI", 853, 492);
      context.textAlign = "left";

      context.fillStyle = "#64748b";
      context.font = "600 18px Arial";
      wrapCanvasText(context, "Scan satu QR ini untuk absensi masuk dan pulang.", 724, 548, 260, 25, 2);

      const anchor = document.createElement("a");
      anchor.href = canvas.toDataURL("image/png");
      anchor.download = `kartu-siswa-${student?.nis ?? studentId}.png`;
      anchor.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl">
          <div className="bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.38),_transparent_36%),linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_58%,_#0891b2_100%)] p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <Link
                  href="/students"
                  className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-blue-50 transition hover:bg-white/15"
                >
                  <ArrowLeft size={16} />
                  Kembali ke data siswa
                </Link>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  Kartu QR Absensi Siswa
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">
                  QR dibuat sebagai kartu tanda siswa lengkap dengan identitas dan satu kode scan utama.
                </p>
              </div>

              <button
                type="button"
                onClick={downloadStudentCard}
                disabled={!qrSvg || downloading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-lg transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                {downloading ? "Menyiapkan..." : "Download Kartu PNG"}
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

        <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.75fr)_minmax(0,1.25fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-slate-900">Detail Siswa</h2>
              <p className="mt-1 text-sm text-slate-500">Identitas pemilik QR absensi.</p>
            </div>

            {loading ? (
              <div className="grid gap-3 p-5">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : (
              <div className="grid gap-3 p-5">
                <InfoRow icon={<UserRound size={19} />} label="Nama" value={student?.name ?? "-"} />
                <InfoRow icon={<IdCard size={19} />} label="NIS" value={student?.nis ?? "-"} />
                <InfoRow icon={<GraduationCap size={19} />} label="Kelas" value={getClassName(student)} />
                <InfoRow icon={<CalendarDays size={19} />} label="TTL" value={formatBirth(student?.birth_place, student?.birth_date)} />
                <InfoRow icon={<Mail size={19} />} label="Email" value={student?.email ?? "-"} />
                <InfoRow icon={<Phone size={19} />} label="Telepon" value={student?.phone ?? "-"} />
                <InfoRow icon={<MapPin size={19} />} label="Alamat" value={student?.address ?? "-"} />
              </div>
            )}
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Preview Kartu</h2>
                <p className="mt-1 text-sm text-slate-500">Tampilan kartu yang akan diunduh sebagai PNG.</p>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                <QrCode size={18} />
                QR berbasis NIS
              </div>
            </div>

            <div className="flex min-h-[460px] items-center justify-center p-5 sm:p-8">
              {loading ? (
                <div className="flex flex-col items-center gap-3 text-slate-500">
                  <Loader2 className="animate-spin" size={34} />
                  <p className="text-sm font-semibold">Memuat kartu siswa...</p>
                </div>
              ) : qrDataUrl ? (
                <StudentCardPreview student={student} qrDataUrl={qrDataUrl} />
              ) : (
                <div className="text-center text-slate-500">
                  <QrCode className="mx-auto mb-3" size={42} />
                  <p className="text-sm font-semibold">QR belum tersedia.</p>
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </MainLayout>
  );
}

function getClassName(student: Student | null) {
  return student?.schoolClass?.name ?? student?.school_class?.name ?? "-";
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

function StudentCardPreview({
  qrDataUrl,
  student,
}: {
  qrDataUrl: string;
  student: Student | null;
}) {
  return (
    <article className="w-full max-w-3xl overflow-hidden rounded-2xl bg-slate-950 p-3 shadow-2xl">
      <div className="rounded-xl bg-[radial-gradient(circle_at_88%_10%,_rgba(14,165,233,0.28),_transparent_30%),linear-gradient(135deg,_#ffffff_0%,_#f8fafc_100%)] p-5 sm:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Kartu Tanda Siswa</p>
            <h3 className="mt-2 break-words text-2xl font-bold text-slate-950 sm:text-3xl">
              {student?.name ?? "Tanpa nama"}
            </h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">MTs Sunan Drajat Sugiwaras</p>
          </div>

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <UserRound size={34} />
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="grid gap-3 sm:grid-cols-2">
            <CardMeta label="NIS" value={student?.nis ?? "-"} />
            <CardMeta label="Kelas" value={getClassName(student)} />
            <CardMeta label="Jenis Kelamin" value={student?.gender === "P" ? "Perempuan" : "Laki-laki"} />
            <CardMeta label="TTL" value={formatBirth(student?.birth_place, student?.birth_date)} />
            <CardMeta className="sm:col-span-2" label="Alamat" value={student?.address ?? "-"} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-inner">
            <Image
              src={qrDataUrl}
              alt={`QR absensi ${student?.name ?? "siswa"}`}
              width={188}
              height={188}
              unoptimized
              className="mx-auto h-44 w-44"
            />
            <p className="mt-3 text-center text-xs font-semibold text-slate-500">QR absensi resmi</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function CardMeta({
  className = "",
  label,
  value,
}: {
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <div className={`rounded-xl bg-slate-50 p-3 ${className}`}>
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-bold leading-6 text-slate-900">{value}</p>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
        <p className="break-words font-bold leading-6 text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function drawCanvasLabel(
  context: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
) {
  context.fillStyle = "#64748b";
  context.font = "700 18px Arial";
  context.fillText(label.toUpperCase(), x, y);
  context.fillStyle = "#0f172a";
  context.font = "700 26px Arial";
  wrapCanvasText(context, value, x, y + 38, 178, 31, 2);
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(" ");
  let line = "";
  let lines = 0;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;

    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line, x, y + lines * lineHeight);
      line = word;
      lines += 1;

      if (lines >= maxLines) {
        return;
      }
    } else {
      line = testLine;
    }
  }

  if (line && lines < maxLines) {
    context.fillText(line, x, y + lines * lineHeight);
  }
}
