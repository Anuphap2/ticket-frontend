"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Calendar, MapPin, Ticket, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // เช็คว่ามี Token ไหม ถ้าไม่มีให้ดีดกลับไปหน้า Login
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchEvents = async () => {
      try {
        const res = await api.get("/events");
        setEvents(res.data);
      } catch (err) {
        console.error("Fetch events failed");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [router]);

  const handleLogout = async () => {
    try {
      // เรียก logout ที่หลังบ้าน (ท่าที่เราแก้เป็น @Get ไว้)
      await api.get("/auth/logout");
    } catch (err) {
      console.log("Logout backend error:", err);
    } finally {
      // เคลียร์เครื่องแล้วดีดออก
      localStorage.removeItem("access_token");
      router.push("/login");
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center text-indigo-600 font-medium">
        กำลังโหลดคอนเสิร์ตสุดมันส์...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- Navbar --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-2xl text-indigo-600">
            <Ticket size={28} />
            <span>TicketHub</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-sm">
              <User size={16} />
              <span>ยินดีต้อนรับคุณพู่กัน</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition font-medium"
            >
              <LogOut size={18} />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-10 mt-4">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">
            คอนเสิร์ตทั้งหมด
          </h1>
          <p className="text-slate-500 mt-2">
            เลือกชมและจองตั๋วคอนเสิร์ตที่คุณชื่นชอบได้ที่นี่
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event: any) => (
            <div
              key={event._id}
              className="group bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Poster Image */}
              <div className="h-52 bg-indigo-50 flex items-center justify-center relative overflow-hidden">
                {event.posterUrl ? (
                  <img
                    src={event.posterUrl}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <Ticket size={56} className="text-indigo-200" />
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-indigo-600 shadow-sm">
                  COMING SOON
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-3 line-clamp-1">
                  {event.title}
                </h2>

                <div className="space-y-3 text-slate-500 text-sm mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Calendar size={16} className="text-indigo-500" />
                    </div>
                    <span className="font-medium">
                      {new Date(event.date).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <MapPin size={16} className="text-indigo-500" />
                    </div>
                    <span className="font-medium">{event.location}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">
                      ราคาเริ่มต้น
                    </p>
                    <p className="text-indigo-600 font-black text-xl">
                      ฿
                      {event.zones && event.zones.length > 0
                        ? Math.min(
                            ...event.zones.map((z: any) => z.price),
                          ).toLocaleString()
                        : "0"}
                    </p>
                  </div>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">
                    จองตั๋ว
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <Ticket size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">
              ยังไม่มีรายการคอนเสิร์ตในขณะนี้
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
