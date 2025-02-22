import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/Toast";
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
  title: "Nexus Dashboard",
  description: "Smart home lighting control dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark:bg-gray-900">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-on-background selection:bg-primary/20`}
      >
        <ToastProvider>
          <main className="min-h-screen">
            {children}
          </main>
          {/* Portal container for modals */}
          <div id="modal-root" />
        </ToastProvider>
      </body>
    </html>
  );
}
