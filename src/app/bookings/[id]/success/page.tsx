"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  CheckCircle,
  ArrowRight,
  Home,
  Ticket,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

function SuccessContent() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [countdown, setCountdown] = useState(5);
  const hasCalledAPI = useRef(false);

  const paymentStatus = searchParams.get("redirect_status");

  /* ---------------- CONFIRM PAYMENT ---------------- */
  useEffect(() => {
    const confirmPayment = async () => {
      if (!id || hasCalledAPI.current) return;
      hasCalledAPI.current = true;

      try {
        await api.patch(`/bookings/${id}/confirm`);
        setStatus("success");
        toast.success("ยืนยันตั๋วเรียบร้อย!");
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
  }, [id, paymentStatus]);

  /* ---------------- AUTO REDIRECT ---------------- */
  useEffect(() => {
    if (status !== "success") return;

    if (countdown <= 0) {
      router.push("/my-bookings");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [status, countdown, router]);

  const progress = (countdown / 5) * 100;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 overflow-hidden">
      {/* Sparkle Background */}
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

      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl border border-zinc-100 text-center relative z-10 overflow-hidden">
        {/* PROGRESS BAR */}
        {status === "success" && (
          <div className="absolute top-0 left-0 h-1 bg-zinc-100 w-full">
            <div
              className="h-1 bg-indigo-600 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* LOADING */}
        {status === "loading" && (
          <div className="space-y-6 py-8">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
            <h2 className="text-2xl font-black uppercase">
              Verifying Payment...
            </h2>
          </div>
        )}

        {/* SUCCESS */}
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <CheckCircle
              className="mx-auto h-20 w-20 text-green-600"
              strokeWidth={1.5}
            />
            <div className="space-y-3">
              <h1 className="text-4xl font-black uppercase">Payment Success</h1>
              <p className="text-zinc-500">ระบบได้ออกตั๋วให้เรียบร้อยแล้ว</p>
            </div>
            <div className="text-xs text-zinc-400 uppercase tracking-widest">
              Redirecting in {countdown}s
            </div>
            <div className="space-y-3 pt-4">
              <button
                onClick={() => router.push("/my-bookings")}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-zinc-900 px-6 py-5 text-lg font-black text-white hover:bg-black transition-all active:scale-95"
              >
                <Ticket className="h-6 w-6 text-indigo-400" />
                MY TICKETS
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-50 px-6 py-4 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <Home className="h-4 w-4" /> BACK TO HOME
              </button>
            </div>
          </motion.div>
        )}

        {/* ERROR */}
        {status === "error" && (
          <div className="space-y-6 py-6">
            <div className="mx-auto h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 text-4xl font-black">
              !
            </div>
            <h2 className="text-2xl font-black uppercase">
              Something went wrong
            </h2>
            <button
              onClick={() => router.push("/my-bookings")}
              className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm uppercase"
            >
              GO TO MY BOOKINGS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Page Component ---
export default function SuccessPage() {
  return (
    // การใช้ Suspense จะช่วยแก้ Error "Cannot update a component Router..."
    // ที่เกิดจากการใช้ useSearchParams ใน Client Component ของ Next.js
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
