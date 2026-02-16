"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { CheckCircle, ArrowRight, Home, Ticket } from "lucide-react";

export default function SuccessPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  // แบ่ง State ให้ชัดเจน: loading -> ยิง API, success -> สำเร็จ, error -> พัง
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const hasCalledAPI = useRef(false);

  const paymentStatus = searchParams.get("redirect_status");

  useEffect(() => {
    const confirmPayment = async () => {
      // 1. ถ้า id ยังไม่มา (undefined) ให้รอแป๊บนึง เดี๋ยว useEffect จะรันใหม่เองเมื่อ id มา
      if (!id) return;

      // 2. ถ้ามี id แล้ว และยังไม่ได้ยิง API
      if (!hasCalledAPI.current) {
        hasCalledAPI.current = true;

        try {
          console.log("🆔 เริ่มยืนยันตั๋ว ID:", id);
          // ยิง Patch ทันที ไม่ต้องสน paymentStatus มากนักเพราะเรามาหน้านี้ได้แสดงว่า Stripe ส่งมาแล้ว
          await api.patch(`/bookings/${id}/confirm`);

          setStatus("success");
          toast.success("ชำระเงินสำเร็จ!");

          // พาไปหน้าตั๋วใน 3 วินาที
          setTimeout(() => router.push("/my-bookings"), 3000);
        } catch (err: any) {
          // ถ้าใน DB เป็น confirmed อยู่แล้ว (กรณี Refresh หน้าจอ) ให้ถือว่าสำเร็จ
          if (err.response?.status === 400 || err.response?.status === 409) {
            console.log("✅ ตั๋วถูกยืนยันไปก่อนหน้าแล้ว");
            setStatus("success");
          } else {
            console.error("🔥 Error:", err);
            setStatus("error");
          }
        }
      }
    };

    confirmPayment();
  }, [id, paymentStatus, router]); // 👈 ใส่ id ในนี้เพื่อให้มันทำงานทันทีที่ id เปลี่ยนจาก null เป็นค่าจริง
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-zinc-100 text-center">
        {status === "loading" && (
          <div className="space-y-4 py-8">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            <h2 className="text-xl font-semibold text-zinc-900">
              กำลังยืนยันยอดชำระ...
            </h2>
            <p className="text-sm text-zinc-500">
              กรุณาอย่าเพิ่งปิดหน้าต่างนี้
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="animate-in fade-in zoom-in duration-500 space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-zinc-900">สำเร็จแล้ว!</h1>
              <p className="text-zinc-600">
                ระบบได้รับเงินและยืนยันตั๋วให้พู่กันเรียบร้อย
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <button
                onClick={() => router.push("/my-bookings")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-lg font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Ticket className="h-5 w-5" /> ดูตั๋วของฉัน{" "}
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-50 px-6 py-3 text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <Home className="h-4 h-4" /> กลับหน้าหลัก
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              ระบบจะพาคุณไปหน้าตั๋วอัตโนมัติในครู่เดียว...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 py-8 text-red-600">
            <div className="mx-auto h-16 w-16 bg-red-50 rounded-full flex items-center justify-center font-bold text-2xl">
              !
            </div>
            <h2 className="text-xl font-bold">เกิดข้อผิดพลาด</h2>
            <p className="text-sm text-zinc-500">
              แต่ไม่ต้องกังวล หากคุณจ่ายเงินแล้ว ระบบจะใช้เวลาตรวจสอบครู่หนึ่ง
            </p>
            <button
              onClick={() => router.push("/my-bookings")}
              className="text-indigo-600 font-medium underline"
            >
              ลองไปเช็คหน้าประวัติการจอง
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
