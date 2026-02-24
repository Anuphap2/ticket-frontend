"use client";

import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { bookingService } from "@/services/bookingService";
import { paymentService } from "@/services/paymentService";
import { Booking } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";
import toast from "react-hot-toast";
import { Timer, CreditCard, Loader2 } from "lucide-react";
import { ROUTES } from "@/lib/constants";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

function CheckoutForm({
  bookingId,
  amount,
  timeLeft,
}: {
  bookingId: string;
  amount: number;
  timeLeft: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || isLoading || timeLeft <= 0) return;

    setIsLoading(true);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setMessage(submitError.message || "Please check your card details.");
      setIsLoading(false);
      return;
    }

    const returnUrl = `${window.location.origin}${ROUTES.bookingSuccess(
      bookingId,
    )}`;

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "Payment failed.");
      setIsLoading(false);
    } else if (paymentIntent?.status === "succeeded") {
      setMessage("Payment successful! Redirecting...");
      setTimeout(() => router.push(returnUrl), 1200);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
          <PaymentElement
            options={{
              layout: "tabs",
              business: { name: "Pookan Tickets" },
            }}
          />
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-sm font-medium ${
              message.includes("successful")
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <button
          disabled={isLoading || !stripe || !elements || timeLeft <= 0}
          className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-xl 
          hover:bg-indigo-700 disabled:bg-zinc-200 disabled:text-zinc-400 
          transition-all active:scale-[0.98] shadow-2xl shadow-indigo-200 
          flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-6 w-6" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-6 w-6" />
              Pay ฿{amount.toLocaleString()}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs text-zinc-400 hover:text-zinc-900 underline w-full mt-4"
        >
          Cancel booking
        </button>
      </form>

      {isLoading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl text-center">
            <Loader2 className="animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold">Processing secure payment...</p>
          </div>
        </div>
      )}
    </>
  );
}

export default function PaymentPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [initialTime, setInitialTime] = useState<number>(0);

  useEffect(() => {
    const initPayment = async () => {
      if (!id) return;

      try {
        const myBookings = await bookingService.getMyBookings();
        const found = myBookings.find((b) => b._id === id);

        if (!found) {
          toast.error("Booking not found");
          router.push("/");
          return;
        }

        const expireAt = new Date(found.expiresAt).getTime();
        const remaining = Math.max(
          0,
          Math.floor((expireAt - Date.now()) / 1000),
        );

        if (remaining <= 0) {
          toast.error("Payment time expired");
          router.push("/");
          return;
        }

        setInitialTime(remaining);
        setTimeLeft(remaining);
        setBooking(found);

        const res = await paymentService.createIntent(
          found._id,
          found.totalPrice,
        );
        setClientSecret(res.clientSecret);
      } catch {
        toast.error("Failed to load payment data");
      }
    };

    initPayment();
  }, [id, router]);

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      toast.error("Payment time expired");
      router.push("/");
      return;
    }

    const timer = setInterval(
      () => setTimeLeft((prev) => (prev ? prev - 1 : 0)),
      1000,
    );

    return () => clearInterval(timer);
  }, [timeLeft, router]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progress =
    initialTime > 0 && timeLeft ? (timeLeft / initialTime) * 100 : 0;

  if (!clientSecret || !booking || timeLeft === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-16 px-6">
      <div className="max-w-xl mx-auto space-y-8">
        <Card className="relative rounded-3xl shadow-2xl border-0 overflow-hidden">
          {/* FLOATING TIMER */}
          <div className="absolute top-6 right-6 z-20">
            <div
              className={`px-5 py-3 rounded-2xl border shadow-xl transition-all ${
                timeLeft < 120
                  ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse"
                  : "bg-white border-zinc-200 text-zinc-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Timer
                  className={timeLeft < 120 ? "text-rose-600" : "text-zinc-500"}
                />
                <div>
                  <p className="text-[10px] uppercase font-bold opacity-60">
                    Time Remaining
                  </p>
                  <p className="text-lg font-mono font-black">
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="h-1 bg-zinc-100">
            <div
              className={`h-1 transition-all duration-1000 ${
                timeLeft < 120 ? "bg-rose-500" : "bg-indigo-600"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <CardHeader>
            <CardTitle className="text-2xl font-black">
              Secure Payment
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-10">
            <div className="space-y-2">
              <p className="font-bold text-xl">
                {(booking.eventId as any).title}
              </p>
              <Badge>{booking.zoneName}</Badge>
            </div>

            <div className="flex justify-between text-3xl font-black text-indigo-600 border-t pt-6">
              <span>Total</span>
              <span>฿{booking.totalPrice?.toLocaleString()}</span>
            </div>

            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm
                bookingId={booking._id}
                amount={booking.totalPrice}
                timeLeft={timeLeft}
              />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
