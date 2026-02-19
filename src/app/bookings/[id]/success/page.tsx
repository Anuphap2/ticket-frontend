"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { CheckCircle, ArrowRight, Home, Ticket, Sparkles } from "lucide-react";
import { motion } from "framer-motion"; // ใช้สิ่งที่มีอยู่แล้ว

export default function SuccessPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const hasCalledAPI = useRef(false);
  const paymentStatus = searchParams.get("redirect_status");

  useEffect(() => {
    const confirmPayment = async () => {
      if (!id || hasCalledAPI.current) return;
      hasCalledAPI.current = true;

      try {
        await api.patch(`/bookings/${id}/confirm`);
        setStatus("success");
        toast.success("ยืนยันตั๋วเรียบร้อย!");

        const timer = setTimeout(() => router.push("/my-bookings"), 5000);
        return () => clearTimeout(timer);
      } catch (err: any) {
        if (err.response?.status === 400 || err.response?.status === 409) {
          setStatus("success");
        } else {
          setStatus("error");
          toast.error("เกิดข้อผิดพลาดในการยืนยันตั๋ว");
        }
      }
    };

    if (paymentStatus === "succeeded" || !paymentStatus) {
      confirmPayment();
    } else {
      setStatus("error");
    }
  }, [id, paymentStatus, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 antialiased overflow-hidden">
      {/* 🎇 สร้างอนุภาคแสงระยิบระยับด้วย Framer Motion (ไม่ต้องลง Lib เพิ่ม) */}
      {status === "success" && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-indigo-500/30"
              initial={{ x: "50vw", y: "50vh", scale: 0 }}
              animate={{
                x: `${Math.random() * 100}vw`,
                y: `${Math.random() * 100}vh`,
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.08)] border border-zinc-100 text-center relative z-10">
        {status === "loading" && (
          <div className="space-y-6 py-8">
            <div className="relative mx-auto h-20 w-20">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-100"></div>
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <Ticket className="absolute inset-0 m-auto h-8 w-8 text-indigo-600 opacity-20" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight italic uppercase">
                Verifying...
              </h2>
              <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest">
                กำลังออกตั๋วให้พู่กันครับ
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="relative mx-auto h-24 w-24">
              <motion.div
                className="absolute inset-0 bg-green-100 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
              />
              <CheckCircle
                className="absolute inset-0 m-auto h-14 w-14 text-green-600"
                strokeWidth={1.5}
              />
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-black text-zinc-900 tracking-tighter italic uppercase">
                Done!
              </h1>
              <p className="text-zinc-500 font-medium leading-relaxed">
                การชำระเงินเสร็จสมบูรณ์ <br />
                พู่กันเตรียมตัวไปสนุกกับคอนเสิร์ตได้เลย!
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <button
                onClick={() => router.push("/my-bookings")}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-zinc-900 px-6 py-5 text-lg font-black text-white hover:bg-black transition-all shadow-xl active:scale-95"
              >
                <Ticket className="h-6 w-6 text-indigo-400" />
                MY TICKETS
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push("/")}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-50 px-6 py-4 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <Home className="h-4 h-4" /> BACK TO HOME
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-300 font-bold uppercase tracking-[0.2em]">
              <Sparkles size={12} className="text-indigo-300" /> Redirecting
              shortly
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6 py-4"
          >
            <div className="mx-auto h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 text-4xl font-black italic">
              !
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight italic uppercase">
                Something went wrong
              </h2>
              <p className="text-zinc-500 text-sm font-medium">
                ไม่พบข้อมูลการยืนยัน <br />
                กรุณาตรวจสอบใน "ตั๋วของฉัน" อีกครั้งครับ
              </p>
            </div>
            <button
              onClick={() => router.push("/my-bookings")}
              className="inline-block bg-indigo-50 text-indigo-600 px-8 py-3 rounded-xl font-black text-xs tracking-widest uppercase hover:bg-indigo-100 transition-colors"
            >
              GO TO MY BOOKINGS
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
