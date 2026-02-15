'use client';

import React, { useState, useEffect } from 'react';
import { bookingService } from '@/services/bookingService';
import { Card, Button } from '@/components/ui';
import { ChevronLeft, ChevronRight, Ticket } from 'lucide-react';
import { Booking } from '@/types';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const ManageBookingsPage = () => {
    // State สำหรับ Pagination และ Filter
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // 1. เพิ่ม useEffect สำหรับ Debounce การค้นหา - ลบทิ้งเพราะ Backend ไม่รองรับ Search/Filter

    // 2. ปรับ fetchBookings 
    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await bookingService.getAllForAdmin(page, 10);
            setBookings(response.data || []);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            toast.error('ไม่สามารถดึงข้อมูลตั๋วได้');
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchBookings();
    }, [page]);

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await bookingService.updateStatus(id, status);
            toast.success(`อัปเดตสถานะเป็น ${status} แล้ว`);
            fetchBookings(); // Refresh ข้อมูล
        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการอัปเดต');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <Button variant="ghost" size="sm">
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900">Manage Bookings</h2>
                        <p className="text-zinc-500">Total {bookings.length} items on this page</p>
                    </div>
                </div>
            </div>

            {/* ส่วนค้นหาและ Pagination */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-lg border">
                <div></div>


                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium">หน้า {page} จาก {totalPages}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* List รายการตั๋ว */}
            <div className="space-y-4">
                {loading ? (
                    <p className="text-center py-10">กำลังโหลดข้อมูลแสนรายการ...</p>
                ) : (
                    bookings.map((booking) => (
                        <Card key={booking._id} className="hover:shadow-md transition-all border-l-4 border-l-indigo-500">
                            <div className="p-5 flex justify-between items-center">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-lg text-zinc-900">
                                            {booking.eventId && typeof booking.eventId === 'object' ? (booking.eventId as any).title || 'Unknown Event' : 'กิจกรรม'}
                                        </span>
                                        {/* Badge แยกตามสถานะ */}
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </div>

                                    <p className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                                        ID: {booking._id}
                                    </p>

                                    <div className="flex gap-4 text-sm text-zinc-600 pt-1">
                                        <span className="flex items-center gap-1 font-medium text-indigo-600">
                                            <Ticket className="w-4 h-4" /> {booking.quantity} ใบ
                                        </span>
                                        <span className="bg-zinc-100 px-2 rounded text-xs flex items-center">
                                            โซน: {booking.zoneName}
                                        </span>
                                        <span className="font-semibold">
                                            ฿{booking.totalPrice?.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons: อนุมัติ/ยกเลิก */}
                                <div className="flex gap-2">
                                    {booking.status !== 'confirmed' && booking.status !== 'cancelled' && (
                                        <Button size="sm" onClick={() => handleUpdateStatus(booking._id, 'confirmed')} className="bg-indigo-600 hover:bg-indigo-700">
                                            อนุมัติ
                                        </Button>
                                    )}
                                    {booking.status !== 'cancelled' && (
                                        <Button size="sm" variant="ghost" onClick={() => handleUpdateStatus(booking._id, 'cancelled')} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                                            ยกเลิก
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManageBookingsPage;