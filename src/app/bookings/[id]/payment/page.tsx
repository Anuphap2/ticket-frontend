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
import { Timer, CreditCard, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import api from "@/lib/axios";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const hasStripeKey = stripeKey.startsWith("pk_");
const stripePromise = hasStripeKey ? loadStripe(stripeKey) : null;

function DemoCheckoutForm({
  bookingId,
  amount,
  timeLeft,
}: {
  bookingId: string;
  amount: number;
  timeLeft: number;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12 / 28");
  const [cardCvc, setCardCvc] = useState("888");
  const [cardHolder, setCardHolder] = useState("Somchai Prasert");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || timeLeft <= 0) return;

    setIsLoading(true);

    try {
      // Simulate real bank authorization delay
      await new Promise((r) => setTimeout(r, 900));

      // Confirm booking in mock store
      await api.patch(`/bookings/${bookingId}/confirm`);

      toast.success("Payment verified! Issuing ticket pass...");
      const returnUrl = ROUTES.bookingSuccess(bookingId);
      setTimeout(() => router.push(returnUrl), 600);
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Payment processing error. Redirecting...");
      router.push(ROUTES.bookingSuccess(bookingId));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Demo Mode Badge */}
        <div className="flex items-center justify-between p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-xs font-bold text-indigo-950">Portfolio Demo Payment</p>
              <p className="text-[11px] text-indigo-700/80">Simulated gateway • No real card needed</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-white px-2.5 py-1 rounded-full text-indigo-700 border border-indigo-200">
            TEST MODE
          </span>
        </div>

        {/* Card Mock Box */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 rounded-2xl text-white shadow-xl space-y-5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">Debit / Credit Card</span>
            <div className="w-8 h-5 rounded bg-amber-400/80 flex items-center justify-center font-bold text-[9px] text-zinc-950">CHIP</div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400 tracking-wider">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-base font-mono tracking-widest text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-zinc-400 tracking-wider">Expires</label>
              <input
                type="text"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-zinc-400 tracking-wider">CVC</label>
              <input
                type="text"
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400 tracking-wider">Cardholder Name</label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || timeLeft <= 0}
          className="w-full bg-indigo-600 text-white py-4.5 rounded-2xl font-black text-lg 
          hover:bg-indigo-700 disabled:bg-zinc-200 disabled:text-zinc-400 
          transition-all active:scale-[0.98] shadow-xl shadow-indigo-200 
          flex items-center justify-center gap-3 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              Processing Secure Payment...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              Pay ฿{amount.toLocaleString()} (Instant Demo)
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs text-zinc-400 hover:text-zinc-900 underline w-full text-center block cursor-pointer"
        >
          Cancel booking and return
        </button>
      </form>

      {isLoading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl text-center max-w-xs mx-4">
            <Loader2 className="animate-spin mx-auto mb-3 h-8 w-8 text-indigo-600" />
            <p className="text-sm font-bold text-zinc-900">Processing secure transaction...</p>
            <p className="text-xs text-zinc-500 mt-1">Simulating bank clearance & queue update</p>
          </div>
        </div>
      )}
    </>
  );
}

function StripeCheckoutForm({
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
        let remaining = Math.max(
          0,
          Math.floor((expireAt - Date.now()) / 1000),
        );

        // Fallback default 15 minutes if expired or invalid date
        if (remaining <= 0) {
          remaining = 15 * 60;
        }

        setInitialTime(remaining);
        setTimeLeft(remaining);
        setBooking(found);

        try {
          const res = await paymentService.createIntent(
            found._id,
            found.totalPrice,
          );
          setClientSecret(res.clientSecret || "demo_secret");
        } catch {
          setClientSecret("demo_secret");
        }
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

  if (!booking || timeLeft === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  const eventTitle =
    typeof booking.eventId === "string"
      ? "Live Concert Event"
      : (booking.eventId as any)?.title || "Live Concert Event";

  return (
    <div className="min-h-screen bg-zinc-50 py-16 px-6">
      <div className="max-w-xl mx-auto space-y-8">
        <Card className="relative rounded-3xl shadow-2xl border-0 overflow-hidden bg-white">
          {/* FLOATING TIMER */}
          <div className="absolute top-6 right-6 z-20">
            <div
              className={`px-4 py-2.5 rounded-2xl border shadow-lg transition-all ${
                timeLeft < 120
                  ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse"
                  : "bg-white border-zinc-200 text-zinc-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Timer
                  className={`h-4 w-4 ${timeLeft < 120 ? "text-rose-600" : "text-zinc-500"}`}
                />
                <div>
                  <p className="text-[9px] uppercase font-bold opacity-60">
                    Remaining
                  </p>
                  <p className="text-base font-mono font-black">
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
              Checkout & Payment
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="space-y-2">
              <p className="font-bold text-xl text-zinc-900">
                {eventTitle}
              </p>
              <div className="flex gap-2">
                <Badge variant="outline" className="font-semibold text-zinc-700">{booking.zoneName}</Badge>
                {booking.seatNumbers && booking.seatNumbers.length > 0 && (
                  <Badge variant="default" className="bg-zinc-800 text-white font-mono">
                    Seats: {booking.seatNumbers.join(", ")}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex justify-between items-baseline text-3xl font-black text-indigo-600 border-t border-dashed pt-6">
              <span className="text-lg font-bold text-zinc-500">Total Price</span>
              <span>฿{booking.totalPrice?.toLocaleString()}</span>
            </div>

            {hasStripeKey && stripePromise && clientSecret && clientSecret !== "demo_secret" ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripeCheckoutForm
                  bookingId={booking._id}
                  amount={booking.totalPrice}
                  timeLeft={timeLeft}
                />
              </Elements>
            ) : (
              <DemoCheckoutForm
                bookingId={booking._id}
                amount={booking.totalPrice}
                timeLeft={timeLeft}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
