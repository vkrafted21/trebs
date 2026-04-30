import type { Metadata } from "next";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/providers";
// @ts-ignore: CSS module import without declaration
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Paper Trace",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <html lang="en" className="dark">
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <Providers>
        <Header />

        {/* MAIN CONTENT WRAPPER (FIXES HEADER OVERLAP) */}
        <main className="pt-24">
          {children}
        </main>

        <Footer />
      </Providers>
    </body>
  </html>
);
}