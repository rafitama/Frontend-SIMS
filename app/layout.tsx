import type { Metadata } from "next";
import "./globals.css";

// Pengaturan judul dan deskripsi website
export const metadata: Metadata = {
  title: "SIMS Sekolah",
  description: "Sistem Informasi Manajemen Sekolah",
};

// Layout utama aplikasi
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

