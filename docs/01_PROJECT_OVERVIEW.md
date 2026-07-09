Set-Content -Path "docs\01_PROJECT_OVERVIEW.md" -Value @"

# 📌 Digital Attendance Management System

## 🏫 Sekolah

MTs Sunan Drajat Sugiwaras

---

# 🎯 Tujuan Sistem

Sistem ini dibuat untuk mengelola absensi siswa berbasis QR Code mulai dari:

- Apel pagi + masuk sekolah (Check In)
- Pulang sekolah (Check Out)
- Rekap laporan harian, mingguan, dan bulanan

Semua data harus real-time, akurat, dan dapat dipantau oleh admin sekolah.

---

# 👥 ROLE SISTEM

## 1. ADMIN

- Dashboard
- Manajemen Siswa
- Manajemen Guru
- Manajemen Kelas
- QR Code Generator
- Monitoring Absensi
- Laporan (Excel & PDF)
- Pengumuman
- Pengaturan Sistem
- User Management

---

## 2. USER (SISWA)

- Login
- Dashboard pribadi
- Riwayat absensi
- Persentase kehadiran
- Pengumuman
- Profil sekolah
- Logout

---

# ⏰ ATURAN ABSENSI

## CHECK IN (Apel + Masuk Sekolah)

- Jam normal: 06:45 - 07:00
- Jika lewat jam 07:00 → LATE

## CHECK OUT (Pulang Sekolah)

- Jam: 15:00

---

# 📊 STATUS KEHADIRAN

- PRESENT
- LATE
- PERMISSION
- SICK
- ABSENT

---

# 🔐 TEKNOLOGI

## Backend

- Laravel 12
- PHP 8.3
- Sanctum
- Spatie Permission
- MySQL

## Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- Shadcn UI

---

# 🚀 FITUR UTAMA

- Authentication
- QR Code Attendance
- Student Management
- Teacher Management
- Class Management
- Reports (Excel & PDF)
- Announcements
- Dashboard Admin & User

---

# 🧠 BUSINESS RULE

- 1 student = 1 user account
- 1 QR per student
- 1 hari = 1 attendance record
- Tidak boleh double check-in / check-out

---

# 🚀 GOAL

Sistem ini harus:

- Production ready
- Secure
- Scalable
- Mudah digunakan sekolah
- Real-time attendance tracking
  "@
