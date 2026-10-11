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
  title: "PadiKaltim - Evaluasi Kelayakan Tanam Padi Berbasis Fuzzy Mamdani",
  description:
    "Sistem Pendukung Keputusan Tanam Padi Kaltim berbasis Big Data dan Fuzzy Mamdani dengan prinsip desain GoPay yang bersih, presisi, dan responsif.",
  keywords: [
    "PadiKaltim",
    "Fuzzy Mamdani",
    "Pertanian Kaltim",
    "SPK Pertanian",
    "Big Data Padi",
    "Ultisol",
  ],
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

