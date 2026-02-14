"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import api from "@/lib/axios";
import {
  LayoutDashboard,
  PlusCircle,
  Ticket,
  Users,
  TrendingUp,
  Settings,
  Pencil,
  Trash2,
} from "lucide-react";
import LogoutButton from "@/components/logout/page";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState([]); // เก็บรายการอีเวนต์

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
        fetchEvents(); // โหลดข้อมูลเมื่อยืนยันว่าเป็น Admin
      }
    } catch (error) {
      router.push("/login");
    }
  }, [router]);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Fetch failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("พู่กันแน่ใจนะว่าจะลบงานนี้? ข้อมูลหายถาวรนะ!")) {
      try {
        await api.delete(`/events/${id}`);
        setEvents(events.filter((e: any) => e._id !== id));
      } catch (err) {
        alert("ลบไม่สำเร็จ!");
      }
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* --- Sidebar --- */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col sticky top-0 h-screen">
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
            <h3 className="text-2xl font-bold text-slate-800">
              {events.length > 0 ? "1,240" : "0"} ใบ
            </h3>
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
        <div className="bg-indigo-600 rounded-3xl p-8 text-white flex justify-between items-center shadow-lg shadow-indigo-200 mb-10">
          <div>
            <h2 className="text-xl font-bold mb-2">
              เริ่มสร้างความสนุกให้แฟนคลับ!
            </h2>
            <p className="text-indigo-100">
              เพิ่มคอนเสิร์ตหรืออีเวนต์ใหม่ลงในระบบเพื่อเริ่มขายตั๋ว
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/events/create")}
            className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition shadow-md whitespace-nowrap"
          >
            สร้างอีเวนต์เลย
          </button>
        </div>

        {/* --- Manage Events Table --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-slate-800">
              จัดการรายการคอนเสิร์ต
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                  <th className="px-6 py-4 font-semibold">ชื่อคอนเสิร์ต</th>
                  <th className="px-6 py-4 font-semibold">สถานที่</th>
                  <th className="px-6 py-4 font-semibold">วันที่</th>
                  <th className="px-6 py-4 font-semibold text-center">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {events.map((event: any) => (
                  <tr key={event._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {event.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {event.location}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(event.date).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            router.push(`/admin/events/edit/${event._id}`)
                          }
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="แก้ไข"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="ลบ"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {events.length === 0 && (
              <div className="p-20 text-center text-slate-400">
                <Ticket size={48} className="mx-auto mb-4 opacity-20" />
                <p>ยังไม่มีรายการคอนเสิร์ตในระบบ</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
