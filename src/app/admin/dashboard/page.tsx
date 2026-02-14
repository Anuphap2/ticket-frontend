"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import {
  LayoutDashboard,
  PlusCircle,
  Ticket,
  Users,
  TrendingUp,
  Settings,
} from "lucide-react";
import LogoutButton from "@/components/logout/page";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      if (decoded.role !== "admin") {
        alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
        router.push("/home");
      } else {
        setIsAdmin(true);
      }
    } catch (error) {
      router.push("/login");
    }
  }, [router]);

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* --- Sidebar --- */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2 font-bold text-xl text-indigo-600 border-b">
          <Ticket size={24} />
          <span>TicketAdmin</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button className="flex items-center gap-3 w-full p-3 bg-indigo-50 text-indigo-600 rounded-xl font-medium">
            <LayoutDashboard size={20} /> แดชบอร์ด
          </button>
          <button
            onClick={() => router.push("/admin/events/create")}
            className="flex items-center gap-3 w-full p-3 text-slate-600 hover:bg-slate-50 rounded-xl transition"
          >
            <PlusCircle size={20} /> เพิ่มอีเวนต์
          </button>
          <button className="flex items-center gap-3 w-full p-3 text-slate-600 hover:bg-slate-50 rounded-xl transition">
            <Users size={20} /> รายชื่อผู้ใช้งาน
          </button>
          <button className="flex items-center gap-3 w-full p-3 text-slate-600 hover:bg-slate-50 rounded-xl transition">
            <Settings size={20} /> ตั้งค่าระบบ
          </button>
        </nav>

        <div className="p-4 border-t">
          <LogoutButton />
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              แดชบอร์ดผู้ดูแลระบบ
            </h1>
            <p className="text-slate-500">
              สวัสดีคุณพู่กัน, นี่คือภาพรวมระบบวันนี้
            </p>
          </div>
        </header>

        {/* --- Stats Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <TrendingUp size={24} />
            </div>
            <p className="text-slate-500 text-sm font-medium">รายได้ทั้งหมด</p>
            <h3 className="text-2xl font-bold text-slate-800">฿450,200</h3>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Ticket size={24} />
            </div>
            <p className="text-slate-500 text-sm font-medium">ตั๋วที่ขายได้</p>
            <h3 className="text-2xl font-bold text-slate-800">1,240 ใบ</h3>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <p className="text-slate-500 text-sm font-medium">จำนวนสมาชิก</p>
            <h3 className="text-2xl font-bold text-slate-800">850 คน</h3>
          </div>
        </div>

        {/* --- Quick Actions --- */}
        <div className="bg-indigo-600 rounded-3xl p-8 text-white flex justify-between items-center shadow-lg shadow-indigo-200">
          <div>
            <h2 className="text-xl font-bold mb-2">
              เริ่มสร้างความสนุกให้แฟนคลับ!
            </h2>
            <p className="text-indigo-100">
              คลิกที่นี่เพื่อเพิ่มคอนเสิร์ตหรืออีเวนต์ใหม่ลงในระบบ
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/events/create")}
            className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition shadow-md"
          >
            สร้างอีเวนต์เลย
          </button>
        </div>
      </main>
    </div>
  );
}
