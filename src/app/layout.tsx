import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CurtainLayout } from "@/components/CurtainLayout";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/Navbar";

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
      {/* เพิ่ม bg-zinc-950 ที่ body เพื่อป้องกันหน้าจอสีขาวกระพริบตอนโหลด */}
      <body className={`${inter.className} bg-zinc-950`}>
        <AuthProvider>
          <Navbar />

          {/* นำ Toaster วางไว้นอก CurtainLayout เพื่อให้การแสดงแจ้งเตือนติดอยู่บนหน้าจอเสมอ ไม่ถูก Scroll ทับ */}
          <Toaster position="top-right" />

          {/* ใช้ CurtainLayout เพียงตัวเดียว ซึ่งทำหน้าที่เป็นทั้ง SmoothScroll และ Effect ผ้าม่าน */}
          <CurtainLayout>{children}</CurtainLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
