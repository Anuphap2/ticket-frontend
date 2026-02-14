'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save } from 'lucide-react';
import api from '@/lib/axios';

export default function CreateEventPage() {
  const router = useRouter();
  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      title: '',
      description: '',
      date: '',
      location: '',
      zones: [{ name: '', price: 0, totalSeats: 0 }]
    }
  });

  // ใช้ useFieldArray สำหรับจัดการ Array ของโซนที่นั่งแบบ Dynamic
  const { fields, append, remove } = useFieldArray({
    control,
    name: "zones"
  });

  const onSubmit = async (data: any) => {
    try {
      await api.post('/events', data);
      alert('สร้างอีเวนต์สำเร็จ!');
      router.push('/home'); // หรือหน้าจัดการอีเวนต์
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้าง');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-2xl my-10 border">
      <h1 className="text-2xl font-bold mb-8 text-slate-800">เพิ่มคอนเสิร์ตใหม่</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ข้อมูลพื้นฐาน */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-semibold">ชื่อคอนเสิร์ต</label>
            <input {...register('title')} className="p-2 border rounded-lg" required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">สถานที่</label>
            <input {...register('location')} className="p-2 border rounded-lg" required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">วันที่แสดง</label>
            <input {...register('date')} type="datetime-local" className="p-2 border rounded-lg" required />
          </div>
        </div>

        <div>
          <label className="font-semibold">รายละเอียด</label>
          <textarea {...register('description')} className="w-full p-2 border rounded-lg mt-1" rows={3} />
        </div>

        <hr />

        {/* ส่วนจัดการโซนที่นั่ง */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">โซนที่นั่งและราคา</h2>
            <button 
              type="button" 
              onClick={() => append({ name: '', price: 0, totalSeats: 0 })}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-100 transition"
            >
              <Plus size={18} /> เพิ่มโซน
            </button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end p-4 border rounded-xl mb-3 bg-slate-50">
              <div>
                <label className="text-sm">ชื่อโซน (เช่น Zone A)</label>
                <input {...register(`zones.${index}.name` as const)} className="w-full p-2 border rounded-lg" required />
              </div>
              <div>
                <label className="text-sm">ราคา (฿)</label>
                <input {...register(`zones.${index}.price` as const)} type="number" className="w-full p-2 border rounded-lg" required />
              </div>
              <div>
                <label className="text-sm">จำนวนที่นั่ง</label>
                <input {...register(`zones.${index}.totalSeats` as const)} type="number" className="w-full p-2 border rounded-lg" required />
              </div>
              <button 
                type="button" 
                onClick={() => remove(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition h-[42px] flex items-center justify-center"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <button 
          type="submit" 
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md"
        >
          <Save size={20} /> บันทึกและสร้างคอนเสิร์ต
        </button>
      </form>
    </div>
  );
}