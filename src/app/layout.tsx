import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ticket Booking System",
  description: "Book your tickets easily",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-50 text-zinc-900`}>
        <AuthProvider>
          <Toaster position="top-right" />

          {/* ระบบจะนำ Layout ย่อย หรือ Page มาเสียบตรงนี้ */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
