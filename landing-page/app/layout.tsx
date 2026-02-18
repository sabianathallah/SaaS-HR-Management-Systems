import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Salmon HRIS — Solusi HR Terlengkap untuk Perusahaan Modern",
  description:
    "Kelola seluruh kebutuhan HR perusahaan Anda dalam satu platform. Absensi, payroll, cuti, performance management, dan lebih banyak lagi — mudah, cepat, dan efisien.",
  keywords: [
    "HRIS",
    "HR software",
    "payroll",
    "absensi",
    "manajemen karyawan",
    "human resource",
    "salmon hris",
  ],
  authors: [{ name: "Salmon HRIS" }],
  openGraph: {
    title: "Salmon HRIS — Solusi HR Terlengkap untuk Perusahaan Modern",
    description:
      "Kelola seluruh kebutuhan HR perusahaan Anda dalam satu platform. Dari absensi, payroll, hingga performance management.",
    url: "https://salmonhris.com",
    siteName: "Salmon HRIS",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Salmon HRIS — Solusi HR Terlengkap untuk Perusahaan Modern",
    description:
      "Kelola seluruh kebutuhan HR perusahaan Anda dalam satu platform.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
