"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Pencil, Trash2, Plus, ArrowLeft, Loader2, Music } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast"; // แนะนำให้ใช้ toast เพื่อความสวยงาม

export default function ManageEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/events");
      setEvents(res.data);
    } catch (err) {
      toast.error("ดึงข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // ใช้ confirm ที่ดูจริงจังขึ้นนิดนึง
    if (
      !window.confirm(
        "พู่กันแน่ใจนะว่าจะลบงานนี้? ข้อมูลการจองจะหายหมดและกู้คืนไม่ได้เลยนะ!",
      )
    )
      return;

    try {
      await api.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((e: any) => e._id !== id));
      toast.success("ลบกิจกรรมเรียบร้อยแล้ว");
    } catch (err) {
      toast.error("ลบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 min-h-screen bg-slate-50/30">
      {/* Header Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <button
            onClick={() => router.push("/admin")}
            className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-2"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            จัดการคอนเสิร์ต
          </h1>
        </div>

        <button
          onClick={() => router.push("/admin/events/create")}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span className="font-semibold">เพิ่มคอนเสิร์ตใหม่</span>
        </button>
      </div>

      {/* Main Content Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  ชื่องาน
                </th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  สถานที่
                </th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  วันที่จัดงาน
                </th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20">
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                      <Loader2 className="animate-spin" size={32} />
                      <p className="text-sm font-medium">
                        กำลังโหลดข้อมูลคอนเสิร์ต...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : events.length > 0 ? (
                events.map((event: any) => (
                  <tr
                    key={event._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {event.title}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-500 text-sm">
                      <div className="flex items-center gap-1">
                        {event.location}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-500 text-sm">
                      {new Date(event.date).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            router.push(`/admin/events/edit/${event._id}`)
                          }
                          className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all hover:scale-110"
                          title="แก้ไข"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all hover:scale-110"
                          title="ลบ"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-300 gap-2">
                      <Music size={48} strokeWidth={1} />
                      <p className="text-lg font-medium">
                        ยังไม่มีข้อมูลคอนเสิร์ตในระบบ
                      </p>
                      <button
                        onClick={() => router.push("/admin/events/create")}
                        className="text-indigo-500 hover:underline text-sm font-semibold mt-2"
                      >
                        เริ่มสร้างกิจกรรมแรกของคุณ
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
