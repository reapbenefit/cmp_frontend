import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Record an action | SolveNinja",
  description: "SolveNinja is a platform for local, community-driven problem solving.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // You can set your backend URL here or use environment variables
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider backendUrl={backendUrl}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
