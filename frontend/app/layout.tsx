import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Digital Attendance",
  description: "Sistem Absensi Digital",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="bg-slate-100 font-sans">{children}</body>
    </html>
  );
}

