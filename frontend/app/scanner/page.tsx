"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  IdCard,
  Loader2,
  QrCode,
  ScanLine,
  UserRound,
} from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

import { apiUrl } from "@/lib/api";
import MainLayout from "@/src/components/layout/MainLayout";

const READER_ID = "reader";

let activeScanner: Html5QrcodeScanner | null = null;
let scannerCleanup: Promise<void> = Promise.resolve();

type ScanResult = {
  success?: boolean;
  message?: string;
  student?: {
    name?: string;
    nis?: string;
  };
};

export default function ScannerPage() {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanStatus, setScanStatus] = useState<"ready" | "loading" | "success" | "error">(
    "ready",
  );
  const resetTimerRef = useRef<number | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    let disposed = false;

    async function startScanner() {
      await scannerCleanup;

      if (disposed) {
        return;
      }

      const readerElement = document.getElementById(READER_ID);

      if (!readerElement) {
        setScanStatus("error");
        return;
      }

      readerElement.innerHTML = "";

      const scanner = new Html5QrcodeScanner(
        READER_ID,
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.max(180, Math.min(Math.floor(minEdge * 0.72), 280));

            return { width: size, height: size };
          },
        },
        false,
      );

      activeScanner = scanner;

      scanner.render(
        async (decodedText) => {
          if (submittingRef.current) {
            return;
          }

          submittingRef.current = true;
          setScanStatus("loading");

          try {
            const token = localStorage.getItem("token");

            const response = await fetch(
              apiUrl("/auth/attendance/scan"),
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  Authorization: `Bearer ${token ?? ""}`,
                },
                body: JSON.stringify({
                  qr_code: decodedText,
                }),
              },
            );

            const data = await response.json().catch(() => null);

            setResult(
              data ?? {
                success: false,
                message: "Respons API tidak valid.",
              },
            );
            setScanStatus(response.ok && data?.success !== false ? "success" : "error");
          } catch {
            setResult({
              success: false,
              message: "Scan gagal diproses. Periksa koneksi API lalu coba lagi.",
            });
            setScanStatus("error");
          } finally {
            if (resetTimerRef.current) {
              window.clearTimeout(resetTimerRef.current);
            }

            resetTimerRef.current = window.setTimeout(() => {
              submittingRef.current = false;
              setScanStatus((current) => (current === "loading" ? "ready" : current));
            }, 1200);
          }
        },
        () => {},
      );
    }

    startScanner();

    return () => {
      disposed = true;
      submittingRef.current = false;

      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }

      const scanner = activeScanner;
      activeScanner = null;

      scannerCleanup = scanner
        ? scanner.clear().catch(() => undefined)
        : Promise.resolve();

      scannerCleanup.finally(() => {
        const readerElement = document.getElementById(READER_ID);

        if (readerElement) {
          readerElement.innerHTML = "";
        }
      });
    };
  }, []);

  const isSuccess = scanStatus === "success";
  const isError = scanStatus === "error";

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl">
          <div className="bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.35),_transparent_34%),linear-gradient(135deg,_#0f172a_0%,_#075985_58%,_#047857_100%)] p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-emerald-50">
                  <ScanLine size={16} />
                  Scanner absensi
                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  QR Scanner Absensi
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50 sm:text-base">
                  Arahkan kamera ke QR siswa. Hasil scan akan langsung diproses
                  sebagai absen masuk atau pulang.
                </p>
              </div>

              <StatusPanel status={scanStatus} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(330px,0.85fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Kamera Scanner
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Pastikan QR berada di tengah bingkai.
                </p>
              </div>

              <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 sm:flex">
                <QrCode size={22} />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-2">
              <div
                id={READER_ID}
                className="min-h-[320px] w-full overflow-hidden rounded-xl bg-white text-slate-800 [&_button]:rounded-lg [&_button]:bg-blue-600 [&_button]:px-3 [&_button]:py-2 [&_button]:text-sm [&_button]:font-semibold [&_button]:text-white [&_button]:shadow-sm [&_img]:mx-auto [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-300 [&_select]:px-3 [&_select]:py-2 [&_video]:rounded-xl"
              />
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-slate-900">Hasil Scan</h2>
              <p className="mt-1 text-sm text-slate-500">
                Data terakhir yang berhasil dibaca scanner.
              </p>
            </div>

            {result ? (
              <div className="p-5">
                <div
                  className={`mb-5 flex items-start gap-3 rounded-xl p-4 ${
                    isSuccess
                      ? "bg-emerald-50 text-emerald-800"
                      : isError
                        ? "bg-red-50 text-red-800"
                        : "bg-blue-50 text-blue-800"
                  }`}
                >
                  {isSuccess ? (
                    <CheckCircle2 className="mt-0.5 shrink-0" size={22} />
                  ) : isError ? (
                    <AlertCircle className="mt-0.5 shrink-0" size={22} />
                  ) : (
                    <Clock3 className="mt-0.5 shrink-0" size={22} />
                  )}
                  <div>
                    <p className="font-bold">Status</p>
                    <p className="mt-1 text-sm leading-6">
                      {result.message ?? "Scan berhasil diproses."}
                    </p>
                  </div>
                </div>

                {result.student ? (
                  <div className="grid gap-3">
                    <InfoRow
                      icon={<UserRound size={19} />}
                      label="Nama"
                      value={result.student.name ?? "-"}
                    />
                    <InfoRow
                      icon={<IdCard size={19} />}
                      label="NIS"
                      value={result.student.nis ?? "-"}
                    />
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    Detail siswa belum tersedia dari respons API.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex min-h-[270px] flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <QrCode size={34} />
                </div>
                <h3 className="font-bold text-slate-900">Belum ada scan</h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  Hasil absensi akan muncul di sini setelah QR terbaca.
                </p>
              </div>
            )}
          </aside>
        </section>
      </div>
    </MainLayout>
  );
}

function StatusPanel({
  status,
}: {
  status: "ready" | "loading" | "success" | "error";
}) {
  const content = {
    ready: {
      icon: <QrCode size={22} />,
      label: "Siap scan",
      text: "Kamera aktif",
    },
    loading: {
      icon: <Loader2 className="animate-spin" size={22} />,
      label: "Memproses",
      text: "Mengirim data",
    },
    success: {
      icon: <CheckCircle2 size={22} />,
      label: "Berhasil",
      text: "Absensi tercatat",
    },
    error: {
      icon: <AlertCircle size={22} />,
      label: "Gagal",
      text: "Coba scan ulang",
    },
  }[status];

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur sm:min-w-[260px]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
        {content.icon}
      </div>
      <div>
        <p className="font-bold">{content.label}</p>
        <p className="text-sm text-emerald-50">{content.text}</p>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
        <p className="truncate font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
