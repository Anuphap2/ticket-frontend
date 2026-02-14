'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Ticket, Calendar, MapPin } from 'lucide-react';
import api from '@/lib/axios';

export default function HomePage() {
  const router = useRouter();
  const [events, setEvents] = useState([]); // เตรียมไว้เก็บข้อมูลจากหลังบ้าน

  // เช็คสิทธิ์เบื้องต้น
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.get('/auth/logout'); // บอกหลังบ้าน
    } catch (err) {
      console.error('Logout error');
    } finally {
      localStorage.removeItem('access_token');
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-2xl text-indigo-600">
          <Ticket size={28} />
          <span>TicketHub</span>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-600 hover:text-red-600 font-medium transition"
        >
          <LogOut size={20} />
          ออกจากระบบ
        </button>
      </nav>

      {/* Hero Section */}
      <header className="py-12 px-6 text-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <h1 className="text-4xl font-bold mb-4">ค้นหาคอนเสิร์ตที่คุณต้องการ</h1>
        <p className="text-indigo-100 text-lg">จองตั๋วได้ง่ายๆ ในไม่กี่ขั้นตอน</p>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">อีเวนต์ยอดนิยม</h2>
          <span className="text-indigo-600 font-medium cursor-pointer">ดูทั้งหมด</span>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ตัวอย่างการ์ดอีเวนต์ (Mockup) */}
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="h-48 bg-slate-200 animate-pulse" /> {/* Placeholder รูปภาพ */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-slate-800 mb-2">ชื่อคอนเสิร์ต {item}</h3>
                <div className="space-y-2 text-slate-500 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>25 กุมภาพันธ์ 2026</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>สนามกีฬากลางเชียงใหม่</span>
                  </div>
                </div>
                <button 
                  className="w-full mt-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
                >
                  จองที่นั่ง
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}