"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { bookingService } from "@/services/bookingService";
import { Booking } from "@/types";
import api from "@/lib/axios";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import toast from "react-hot-toast";
import { Timer, ShieldCheck, CreditCard, Loader2 } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

function CheckoutForm({
  bookingId,
  amount,
}: {
  bookingId: string;
  amount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || isLoading) return;

    setIsLoading(true);

    // 🎯 1. ตรวจสอบข้อมูลเบื้องต้น
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setMessage(submitError.message || "กรุณาตรวจสอบข้อมูลบัตร");
      setIsLoading(false);
      return;
    }

    // 🎯 2. ยืนยันการชำระเงิน
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/bookings/${bookingId}/success`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "การชำระเงินไม่สำเร็จ");
    } else {
      setMessage("เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง");
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
        <PaymentElement
          id="payment-element"
          options={{
            layout: "tabs",
            business: { name: "Pookan Tickets" },
          }}
        />
      </div>

      {message && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
          {message}
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-xl hover:bg-indigo-700 disabled:bg-zinc-200 disabled:text-zinc-400 transition-all active:scale-[0.98] shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-6 w-6" />
            กำลังประมวลผล...
          </>
        ) : (
          <>
            <CreditCard className="h-6 w-6" />
            ชำระเงิน ฿{amount.toLocaleString()}
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-zinc-400">
        <ShieldCheck size={14} />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          Secure Encrypted Transaction
        </span>
      </div>
    </form>
  );
}

export default function PaymentPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const initPayment = async () => {
      if (!id) return;
      try {
        const myBookings = await bookingService.getMyBookings();
        const foundBooking = myBookings.find(
          (b) => b._id.toString() === id.toString(),
        );

        if (!foundBooking) {
          toast.error("ไม่พบข้อมูลการจอง");
          router.push("/");
          return;
        }

        const expireAt = new Date(foundBooking.expiresAt).getTime();
        const remaining = Math.max(
          0,
          Math.floor((expireAt - Date.now()) / 1000),
        );

        if (remaining <= 0) {
          toast.error("หมดเวลาชำระเงินแล้ว");
          router.push(
            `/events/${(foundBooking.eventId as any)._id || foundBooking.eventId}`,
          );
          return;
        }

        setBooking(foundBooking);
        setTimeLeft(remaining);

        // ขอ Client Secret จาก Backend
        const res = await api.post("/payments/create-intent", {
          amount: foundBooking.totalPrice,
          bookingId: foundBooking._id,
        });
        setClientSecret(res.data.clientSecret);
      } catch (error) {
        toast.error("โหลดข้อมูลการชำระเงินไม่สำเร็จ");
      }
    };
    initPayment();
  }, [id, router]);

  // 🎯 รันนาฬิกาถอยหลัง
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(
      () => setTimeLeft((prev) => (prev ? prev - 1 : 0)),
      1000,
    );
    return () => clearInterval(timer);
  }, [timeLeft]);

  // 🎯 เมื่อเวลาหมด
  useEffect(() => {
    if (timeLeft === 0) {
      toast.error("หมดเวลาทำรายการ ระบบคืนที่นั่งแล้ว");
      const eventId =
        typeof booking?.eventId === "object"
          ? (booking.eventId as any)._id
          : booking?.eventId;
      router.push(`/events/${eventId || ""}`);
    }
  }, [timeLeft, booking, router]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!clientSecret || !booking || timeLeft === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        <p className="font-black text-zinc-400 tracking-tighter italic">
          INITIALIZING SECURE GATEWAY...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-16 px-6 antialiased">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Modern Timer Header */}
        <div
          className={`p-6 rounded-[32px] border-2 transition-all flex items-center justify-between shadow-sm ${
            timeLeft < 120
              ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse"
              : "bg-white border-zinc-100 text-zinc-900"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-2xl ${timeLeft < 120 ? "bg-rose-500 text-white" : "bg-zinc-100 text-zinc-500"}`}
            >
              <Timer size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">
                Time Remaining
              </p>
              <p className="text-3xl font-black font-mono leading-none">
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
          {timeLeft < 120 && (
            <span className="text-[10px] font-black uppercase tracking-tighter">
              Hurry up!
            </span>
          )}
        </div>

        <Card className="border-none shadow-[0_30px_80px_rgba(0,0,0,0.05)] rounded-[50px] overflow-hidden bg-white">
          <CardHeader className="bg-zinc-950 p-10 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl" />
            <CardTitle className="text-3xl font-black italic tracking-tighter uppercase">
              Payment Details
            </CardTitle>
            <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase mt-1">
              Complete your ticket purchase
            </p>
          </CardHeader>

          <CardContent className="p-10 space-y-10">
            {/* Order Summary Section */}
            <div className="space-y-6 bg-zinc-50/50 p-8 rounded-[35px] border border-zinc-100">
              <div className="flex justify-between items-start border-b border-zinc-100 pb-6">
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Event
                  </p>
                  <p className="text-xl font-black text-zinc-900 leading-tight">
                    {(booking.eventId as any).title}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Zone
                  </p>
                  <Badge className="bg-indigo-600 rounded-lg">
                    {booking.zoneName}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Selected Seats
                </p>
                <div className="flex flex-wrap gap-2 justify-end">
                  {(booking.tickets as any[]).map((t) => (
                    <span
                      key={t._id}
                      className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-900 rounded-xl text-xs font-black font-mono"
                    >
                      {t.seatNumber}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-dashed border-zinc-200 flex justify-between items-end">
                <span className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-1">
                  Total Due
                </span>
                <span className="text-5xl font-black text-indigo-600 font-mono tracking-tighter">
                  ฿{booking.totalPrice?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Stripe Elements Section */}
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#4f46e5", // Indigo-600
                    colorBackground: "#ffffff",
                    colorText: "#18181b",
                    borderRadius: "16px",
                    fontFamily: "Inter, system-ui, sans-serif",
                  },
                },
              }}
            >
              <CheckoutForm
                bookingId={booking._id}
                amount={booking.totalPrice}
              />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
