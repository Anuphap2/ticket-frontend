"use client";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import { Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import api from "@/lib/axios";

export default function EditEventPage() {
  const router = useRouter();
  const { id } = useParams(); // ดึง ID จาก URL

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      zones: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "zones",
  });

  // 1. ดึงข้อมูลเก่ามาใส่ในฟอร์มตอนเปิดหน้า
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        const eventData = res.data;

        // แปลงฟอร์แมตวันที่ให้เข้ากับ input type="datetime-local"
        if (eventData.date) {
          eventData.date = new Date(eventData.date).toISOString().slice(0, 16);
        }

        reset(eventData); // ยัดข้อมูลใส่ฟอร์ม
      } catch (err) {
        alert("โหลดข้อมูลไม่สำเร็จ");
        router.push("/admin");
      }
    };
    fetchEvent();
  }, [id, reset, router]);

  // 2. ส่งข้อมูลที่แก้ไขกลับไปที่ Backend (ใช้ PATCH)
  const onSubmit = async (data: any) => {
    try {
      await api.patch(`/events/${id}`, data);
      alert("อัปเดตข้อมูลสำเร็จ!");
      router.push("/admin");
    } catch (err: any) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 my-10">
      <button
        onClick={() => router.push("/admin")}
        className="flex items-center gap-2 text-slate-500 mb-6 hover:text-slate-800"
      >
        <ArrowLeft size={20} /> กลับไปหน้า Dashboard
      </button>

      <div className="bg-white shadow-lg rounded-3xl p-8 border border-slate-200">
        <h1 className="text-2xl font-bold mb-8 text-slate-800">
          แก้ไขคอนเสิร์ต
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm">ชื่อคอนเสิร์ต</label>
              <input
                {...register("title")}
                className="p-3 border rounded-xl bg-slate-50"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm">สถานที่</label>
              <input
                {...register("location")}
                className="p-3 border rounded-xl bg-slate-50"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm">วันที่แสดง</label>
              <input
                {...register("date")}
                type="datetime-local"
                className="p-3 border rounded-xl bg-slate-50"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">รายละเอียด</label>
            <textarea
              {...register("description")}
              className="p-3 border rounded-xl bg-slate-50"
              rows={3}
            />
          </div>

          <hr className="border-slate-100" />

          {/* ส่วนจัดการโซนที่นั่ง (เหมือนหน้า Create) */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">จัดการโซนและราคา</h2>
              <button
                type="button"
                onClick={() => append({ name: "", price: 0, totalSeats: 0 })}
                className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-sm font-bold"
              >
                <Plus size={16} /> เพิ่มโซน
              </button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end p-4 border border-slate-100 rounded-2xl mb-3"
              >
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold">
                    ชื่อโซน
                  </label>
                  <input
                    {...register(`zones.${index}.name` as const)}
                    className="w-full p-2 border-b focus:border-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold">
                    ราคา
                  </label>
                  <input
                    {...register(`zones.${index}.price` as const)}
                    type="number"
                    className="w-full p-2 border-b focus:border-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold">
                    ที่นั่งทั้งหมด
                  </label>
                  <input
                    {...register(`zones.${index}.totalSeats` as const)}
                    type="number"
                    className="w-full p-2 border-b focus:border-indigo-500 outline-none"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 text-red-400 hover:text-red-600 transition"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
          >
            <Save size={20} /> บันทึกการเปลี่ยนแปลง
          </button>
        </form>
      </div>
    </div>
  );
}
