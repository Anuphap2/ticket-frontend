'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { bookingService } from '@/services/bookingService';
import { Booking } from '@/types';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import toast from 'react-hot-toast';

// Make sure to add NEXT_PUBLIC_STRIPE_PUBLIC_KEY to your .env
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutForm({ bookingId, amount }: { bookingId: string, amount: number }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // พอกดจ่ายสำเร็จ ให้เด้งไปหน้า success ที่พู่กันสร้างไว้
                return_url: `${window.location.origin}/bookings/${bookingId}/success`,
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message || "An unexpected error occurred.");
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
            {message && <div className="text-red-500 text-sm">{message}</div>}
            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                        Processing...
                    </div>
                ) : (
                    `Pay THB ${amount.toLocaleString()}`
                )}
            </button>
        </form>
    );
}

export default function PaymentPage() {
    const { id } = useParams();
    const [clientSecret, setClientSecret] = useState('');
    const [booking, setBooking] = useState<Booking | null>(null);

    useEffect(() => {
        const fetchBookingAndCreateIntent = async () => {
            if (!id) return;
            console.log("🔍 Fetching booking for ID:", id);

            try {
                // 1. ลองใช้ getById โดยตรง (ถ้า Backend มี Endpoint รองรับ)
                // ถ้ายังไม่มี ให้ใช้ getMyBookings แบบเดิมแต่เช็ค Log ดูครับ
                const myBookings = await bookingService.getMyBookings();
                console.log("All My Bookings:", myBookings);

                const foundBooking = myBookings.find(b => b._id.toString() === id.toString());

                if (!foundBooking) {
                    console.error("❌ Booking not found in myBookings list");
                    toast.error('หาข้อมูลการจองไม่พบ หรือคุณไม่ใช่เจ้าของรายการนี้');
                    return;
                }

                console.log("✅ Found Booking:", foundBooking);
                setBooking(foundBooking);

                // 2. ขอ Client Secret จาก Backend
                console.log("📡 Creating Payment Intent for amount:", foundBooking.totalPrice);
                const res = await api.post('/payments/create-intent', {
                    amount: foundBooking.totalPrice
                });

                console.log("💳 Received Client Secret:", res.data.clientSecret);
                setClientSecret(res.data.clientSecret);

            } catch (error: any) {
                console.error("🔥 Error in Payment Page:", error);
                toast.error('ไม่สามารถเริ่มระบบชำระเงินได้: ' + (error.response?.data?.message || error.message));
            }
        };

        fetchBookingAndCreateIntent();
    }, [id]);

    const appearance = {
        theme: 'stripe' as const,
    };
    const options = {
        clientSecret,
        appearance,
    };

    if (!clientSecret || !booking) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-lg">
                <Card>
                    <CardHeader>
                        <CardTitle>Secure Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 bg-zinc-50 p-4 rounded-md border border-zinc-200">
                            <h3 className="font-medium text-zinc-900">Order Summary</h3>
                            <div className="mt-2 text-sm text-zinc-600 flex justify-between">
                                <span>Event</span>
                                <span className="font-medium">{(booking.eventId as any).title || 'Event Name'}</span>
                            </div>
                            <div className="mt-1 text-sm text-zinc-600 flex justify-between">
                                <span>Total Amount</span>
                                <span className="font-medium text-indigo-600">THB {booking.totalPrice?.toLocaleString() || 0}</span>
                            </div>
                        </div>

                        <Elements options={options} stripe={stripePromise}>
                            <CheckoutForm bookingId={booking._id} amount={booking.totalPrice} />
                        </Elements>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
