import { Loader2, School } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white">
          <School size={28} />
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-900">Digital Attendance</h1>
        <div className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
          <Loader2 className="animate-spin text-blue-600" size={20} />
          Memuat halaman...
        </div>
      </div>
    </main>
  );
}
