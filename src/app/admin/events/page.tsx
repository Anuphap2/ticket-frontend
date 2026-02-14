'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Pencil, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ManageEventsPage() {
  const [events, setEvents] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error("Fetch failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("พู่กันแน่ใจนะว่าจะลบงานนี้? ข้อมูลการจองจะหายหมดเลยนะ!")) {
      try {
        await api.delete(`/events/${id}`);
        // ลบเสร็จแล้วกรองตัวที่ลบออกเพื่อ update UI ทันที
        setEvents(events.filter((e: any) => e._id !== id));
      } catch (err) {
        alert("ลบไม่สำเร็จ!");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => router.push('/admin')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} /> กลับไปหน้า Dashboard
        </button>
        <button 
          onClick={() => router.push('/admin/events/create')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition"
        >
          <Plus size={20} /> เพิ่มคอนเสิร์ตใหม่
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-slate-800">จัดการคอนเสิร์ต</h1>

      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b text-slate-500 uppercase text-sm">
            <tr>
              <th className="px-6 py-4 font-semibold">ชื่อคอนเสิร์ต</th>
              <th className="px-6 py-4 font-semibold">สถานที่</th>
              <th className="px-6 py-4 font-semibold">วันที่</th>
              <th className="px-6 py-4 font-semibold">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {events.map((event: any) => (
              <tr key={event._id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-bold text-slate-700">{event.title}</td>
                <td className="px-6 py-4 text-slate-600">{event.location}</td>
                <td className="px-6 py-4 text-slate-600">
                  {new Date(event.date).toLocaleDateString('th-TH')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => router.push(`/admin/events/edit/${event._id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(event._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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
          <div className="text-center py-10 text-slate-400">ยังไม่มีข้อมูลคอนเสิร์ต</div>
        )}
      </div>
    </div>
  );
}