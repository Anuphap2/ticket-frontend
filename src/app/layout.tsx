import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import { DemoToolbar } from "@/components/DemoToolbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "🎟️ Concert Ticket Booking System | High Concurrency Demo",
  description: "Live interactive demo of the High Concurrency Concert Ticket Booking System featuring internal queue and atomic inventory updates.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-50 text-zinc-900 antialiased`}>
        <AuthProvider>
          <Toaster position="top-right" />
          {children}
          <DemoToolbar />
        </AuthProvider>
      </body>
    </html>
  );
}
