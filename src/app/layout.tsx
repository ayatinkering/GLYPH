import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lastikFont = localFont({
  src: "../../public/fonts/Lastik-Regular.otf",
  variable: "--font-lastik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GLYPH — Commit to touching grass",
  description:
    "A computational camera for movement. Every walk becomes a deterministic mathematical mandala — generated from your footsteps, shaped by the sky, committed to GitHub.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${lastikFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-text-primary">{children}</body>
    </html>
  );
}
