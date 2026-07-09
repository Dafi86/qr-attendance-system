"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  IdCard,
  Lock,
  Mail,
  School,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { api } from "@/lib/api";

type LoginMode = "admin" | "student";

type LoginError = {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
};

type LoginResponse = {
  data?: {
    account_type?: LoginMode;
    token?: string;
  };
};

const authorName = "AHMAD DAFI ZIDNI ALFARISI";
const authorUrl = "https://dafi-portfolio-chi.vercel.app/";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<LoginMode>("admin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [studentName, setStudentName] = useState("");
  const [nis, setNis] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const accountType = localStorage.getItem("account_type");

    if (token) {
      router.replace(
        accountType === "student"
          ? "/student-dashboard"
          : "/dashboard"
      );
    }
  }, [router]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post<LoginResponse>(
        mode === "admin"
          ? "/auth/login"
          : "/auth/student-login",
        mode === "admin"
          ? {
              email,
              password,
            }
          : {
              name: studentName,
              nis,
            }
      );

      const token = response.data.data?.token;
      const accountType = response.data.data?.account_type ?? mode;

      if (!token) {
        throw new Error("Token login tidak ditemukan.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("account_type", accountType);

      await Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text:
          accountType === "student"
            ? "Selamat datang."
            : "Selamat datang Administrator.",
        timer: 1200,
        showConfirmButton: false,
      });

      router.replace(
        accountType === "student"
          ? "/student-dashboard"
          : "/dashboard"
      );
    } catch (error: unknown) {
      const loginError = error as LoginError;

      const firstError = loginError.response?.data?.errors
        ? Object.values(loginError.response.data.errors)
            .flat()
            .at(0)
        : undefined;

      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text:
          firstError ??
          loginError.response?.data?.message ??
          (error instanceof Error
            ? error.message
            : "Data login tidak sesuai."),
      });
    } finally {
      setLoading(false);
    }
  }

return (
  <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-6 py-10">

    {/* Background Blur */}
    <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
    <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .45 }}
      className="relative z-10 w-full max-w-md"
    >

      {/* Logo */}

      <div className="mb-8 text-center">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl">

          <School
            size={42}
            className="text-emerald-600"
          />

        </div>

        <h1 className="mt-6 text-3xl font-bold text-white">
          Digital Attendance
        </h1>

        <p className="mt-2 text-sm text-slate-300">
          MTs Sunan Drajat Sugiwaras
        </p>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          Sistem absensi digital berbasis QR Code
          untuk memudahkan pengelolaan kehadiran
          siswa secara cepat, aman, dan modern.
        </p>

      </div>

      {/* Card */}

      <div className="rounded-3xl border border-white/10 bg-white p-8 shadow-2xl">

        <div className="mb-6">

          <p className="text-sm font-semibold text-emerald-600">
            Selamat Datang
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            {mode === "admin"
              ? "Login Admin"
              : "Login Siswa"}
          </h2>

        </div>

        {/* Switch */}

        <div className="mb-7 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">

          <ModeButton
            active={mode === "admin"}
            onClick={() => setMode("admin")}
            icon={<ShieldCheck size={18} />}
            label="Admin"
          />

          <ModeButton
            active={mode === "student"}
            onClick={() => setMode("student")}
            icon={<UserRound size={18} />}
            label="Siswa"
          />

        </div>

        {/* Form */}

        <form
          onSubmit={login}
          className="space-y-5"
        >

          {mode === "admin" ? (
            <>

              <Field
                label="Email"
                icon={<Mail size={18} />}
              >

                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  placeholder="admin@school.test"
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className={inputClassName}
                />

              </Field>

              <PasswordField
                label="Password"
                value={password}
                show={showPassword}
                setShow={setShowPassword}
                onChange={setPassword}
                placeholder="Masukkan Password"
              />

            </>
          ) : (
            <>

              <Field
                label="Nama Siswa"
                icon={<UserRound size={18} />}
              >

                <input
                  required
                  autoFocus
                  value={studentName}
                  placeholder="Nama lengkap"
                  onChange={(e) =>
                    setStudentName(e.target.value)
                  }
                  className={inputClassName}
                />

              </Field>

              <Field
                label="NIS"
                icon={<IdCard size={18} />}
              >

                <input
                  required
                  value={nis}
                  placeholder="Masukkan NIS"
                  onChange={(e) =>
                    setNis(e.target.value)
                  }
                  className={inputClassName}
                />

              </Field>

            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-2xl bg-emerald-600 py-3.5 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >

            {loading ? (

              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />

            ) : (

              <>
                <ShieldCheck
                  size={18}
                  className="mr-2"
                />

                Login
              </>

            )}

          </button>

        </form>

        {/* Footer */}

        <div className="mt-8 border-t pt-5 text-center">

          <Link
            href={authorUrl}
            target="_blank"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >

            {authorName}

            <ArrowRight size={16} />

          </Link>

        </div>

      </div>

    </motion.div>

  </main>
);
}

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100";

function ModeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-emerald-600 text-white shadow-lg"
          : "text-slate-500 hover:bg-white hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Field({
  children,
  icon,
  label,
}: {
  children: ReactNode;
  icon: ReactNode;
  label: string;
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      <div className="relative">

        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        {children}

      </div>

    </label>
  );
}

function PasswordField({
  label,
  value,
  show,
  setShow,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  show: boolean;
  setShow: (value: boolean) => void;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      <div className="relative">

        <Lock
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          required
          value={value}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClassName} pr-12`}
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
        >
          {show ? (
            <EyeOff size={20} />
          ) : (
            <Eye size={20} />
          )}
        </button>

      </div>

    </label>
  );
}
