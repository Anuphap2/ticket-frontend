'use client';

import React, { useState, useEffect } from 'react';
import { bookingService } from '@/services/bookingService';
import { Card, Button } from '@/components/ui';
import { Search, ChevronLeft, ChevronRight, Ticket } from 'lucide-react';
import { Booking } from '@/types';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const ManageBookingsPage = () => {
    // State สำหรับ Pagination และ Filter
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // ดึงข้อมูลจาก Server ทุกครั้งที่ Page หรือ Filter เปลี่ยน
    const fetchBookings = async () => {
        setLoading(true);
        try {
            // เรียกใช้ getAllForAdmin ที่เราทำไว้ใน Service
            const response = await bookingService.getAllForAdmin(page, 10);
            setBookings(response.data);
            setTotalPages(response.totalPages);
        } catch (error) {
            toast.error('ไม่สามารถดึงข้อมูลตั๋วได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [page, filter]);

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
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="ค้นหาด้วย ID..."
                        className="w-full pl-9 h-9 rounded-md border text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

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
                        <Card key={booking._id} className="hover:shadow-md transition-shadow">
                            <div className="p-5 flex justify-between items-center">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg">{typeof booking.eventId === 'object' ? booking.eventId.title : 'กิจกรรม'}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-400 font-mono">{booking._id}</p>
                                    <div className="flex gap-3 text-sm text-zinc-600">
                                        <span className="flex items-center gap-1"><Ticket className="w-4 h-4" /> {booking.quantity} ใบ</span>
                                        <span>โซน: {booking.zoneName}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {booking.status !== 'confirmed' && (
                                        <Button size="sm" onClick={() => handleUpdateStatus(booking._id, 'confirmed')} className="bg-indigo-600">
                                            อนุมัติ
                                        </Button>
                                    )}
                                    <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(booking._id, 'cancelled')} className="text-red-500 border-red-200">
                                        ยกเลิก
                                    </Button>
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