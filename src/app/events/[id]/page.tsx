'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { Event } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { bookingService } from '@/services/bookingService';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui';
import { Calendar, MapPin, Ticket } from 'lucide-react';

export default function EventDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedZone, setSelectedZone] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await api.get(`/events/${id}`);
                setEvent(response.data);
                if (response.data.zones.length > 0) {
                    setSelectedZone(response.data.zones[0].name);
                }
            } catch (error) {
                console.error('Failed to fetch event details', error);
                toast.error('Failed to load event details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEvent();
        }
    }, [id]);

    const handleBooking = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to book tickets');
            router.push('/login');
            return;
        }

        if (!selectedZone) {
            toast.error('Please select a zone');
            return;
        }

        setIsBooking(true);
        console.log("🚀 เริ่มต้นการจอง...");

        try {
            const res = await bookingService.create({
                eventId: id as string,
                zoneName: selectedZone,
                quantity: Number(quantity),
            });

            console.log("📦 ผลลัพธ์จาก API (Create):", res);

            // กรณีที่ 1: ได้รับการยืนยันทันที
            if (res.status === 'confirmed' || res.status === 'pending') {
                const bId = res.bookingId || res._id || (res as any).id;
                setIsBooking(false);

                if (bId) {
                    console.log("🔗 ย้ายหน้าไปที่ ID:", bId);
                    // ใช้ window.location.href ถ้า router.push ยังนิ่ง
                    router.push(`/bookings/${bId}/payment`);
                } else {
                    console.warn("⚠️ ไม่พบ ID ใน Response");
                    router.push('/my-bookings');
                }
                return;
            }

            // กรณีที่ 2: Processing (Polling)
            if (res.status === 'processing' && res.trackingId) {
                toast('กำลังเข้าคิวจอง...', { icon: '⏳' });

                const pollInterval = setInterval(async () => {
                    try {
                        console.log("🔄 กำลังเช็คสถานะคิว...");
                        const statusRes = await bookingService.checkStatus(res.trackingId);
                        console.log("📊 สถานะปัจจุบัน:", statusRes);

                        // 🎯 จุดสำคัญ: Backend ส่ง 'success' มา ไม่ใช่ 'confirmed'
                        if (statusRes.status === 'success') {
                            clearInterval(pollInterval);

                            // 🎯 จุดสำคัญ 2: ข้อมูลอยู่ใน statusRes.data
                            const bookingData = (statusRes as any).data;
                            const finalId = bookingData?._id || bookingData?.id;

                            console.log("✅ จองสำเร็จ! พบ ID:", finalId);

                            setIsBooking(false); // เลิกหมุน

                            if (finalId) {
                                console.log("🚀 กำลังพุ่งไปหน้าจ่ายเงิน...");
                                window.location.href = `/bookings/${finalId}/payment`;
                            } else {
                                console.warn("⚠️ พบ success แต่ไม่มี ID ใน data");
                                window.location.href = '/my-bookings';
                            }
                        } else if (statusRes.status === 'failed' || statusRes.status === 'error') {
                            clearInterval(pollInterval);
                            setIsBooking(false);
                            toast.error('การจองขัดข้องหรือที่นั่งเต็มแล้ว');
                        }
                    } catch (e) {
                        console.error("❌ Polling Error:", e);
                        clearInterval(pollInterval);
                        setIsBooking(false);
                    }
                }, 2000);
            } else {
                setIsBooking(false);
            }
        } catch (error: any) {
            console.error("🔥 Booking Error:", error);
            setIsBooking(false);
            const msg = error.response?.data?.message || 'การจองขัดข้อง';
            toast.error(msg);
        }
    };
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-zinc-500">Event not found.</p>
            </div>
        );
    }

    const selectedZoneDetails = event.zones.find(z => z.name === selectedZone);

    return (
        <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
                <Card>
                    {event.imageUrl && (
                        <div className="relative h-64 w-full overflow-hidden rounded-t-lg bg-zinc-100">
                            <img
                                src={event.imageUrl}
                                alt={event.title}
                                className="h-full w-full object-cover object-center"
                            />
                        </div>
                    )}
                    <CardHeader>
                        <CardTitle className="text-3xl">{event.title}</CardTitle>
                        <div className="mt-2 flex flex-col gap-2 text-zinc-600 sm:flex-row sm:items-center sm:gap-6">
                            <div className="flex items-center">
                                <Calendar className="mr-2 h-5 w-5" />
                                <span>{format(new Date(event.date), 'PPP p')}</span>
                            </div>
                            <div className="flex items-center">
                                <MapPin className="mr-2 h-5 w-5" />
                                <span>{event.location}</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium text-zinc-900">Description</h3>
                            <p className="mt-2 text-zinc-600">{event.description}</p>
                        </div>

                        <div className="space-y-4 rounded-lg bg-zinc-50 p-4 border border-zinc-200">
                            <h3 className="text-lg font-medium text-zinc-900">Select Tickets</h3>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-zinc-700">Zone</label>
                                    <select
                                        value={selectedZone}
                                        onChange={(e) => setSelectedZone(e.target.value)}
                                        className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                    >
                                        {event.zones.map((zone) => (
                                            <option key={zone.name} value={zone.name}>
                                                {zone.name} - ${zone.price} ({zone.totalSeats} seats)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-zinc-700">Quantity</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            {selectedZoneDetails && (
                                <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4">
                                    <span className="text-base font-medium text-zinc-900">Total Price</span>
                                    <span className="text-xl font-bold text-indigo-600">
                                        ${selectedZoneDetails.price * quantity}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full text-lg py-6"
                            onClick={handleBooking}
                            disabled={isBooking || !selectedZone}
                            isLoading={isBooking}
                        >
                            <Ticket className="mr-2 h-5 w-5" />
                            Confirm Booking
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
