import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PadiKaltim - Sistem Pendukung Keputusan untuk Identifikasi Tumbuh Kembang Padi",
  description:
    "Bantu Anda menilai kelayakan sawah secara instan sebelum masa tanam. Cukup tentukan titik lokasi lahan untuk mengetahui potensi keberhasilan panen, estimasi risiko cuaca & tanah, serta panduan rekomendasi pemupukan dan perbaikan tanah yang tepat.",
  keywords: [
    "PadiKaltim",
    "Sistem Pendukung Keputusan",
    "SPK Tumbuh Kembang Padi",
    "Fuzzy Mamdani",
    "Pertanian Kaltim",
    "Big Data Padi",
    "Ultisol",
  ],
  metadataBase: new URL("https://padikaltim.vercel.app"),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "PadiKaltim - Sistem Pendukung Keputusan untuk Identifikasi Tumbuh Kembang Padi",
    description:
      "Bantu Anda menilai kelayakan sawah secara instan sebelum masa tanam. Cukup tentukan titik lokasi lahan untuk mengetahui potensi keberhasilan panen, estimasi risiko cuaca & tanah, serta panduan rekomendasi pemupukan dan perbaikan tanah yang tepat.",
    url: "https://padikaltim.vercel.app",
    siteName: "PadiKaltim",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PadiKaltim - Sistem Pendukung Keputusan untuk Identifikasi Tumbuh Kembang Padi",
    description:
      "Bantu Anda menilai kelayakan sawah secara instan sebelum masa tanam. Cukup tentukan titik lokasi lahan untuk mengetahui potensi keberhasilan panen, estimasi risiko cuaca & tanah, serta panduan rekomendasi pemupukan dan perbaikan tanah yang tepat.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

