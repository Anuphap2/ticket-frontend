import api from '@/lib/axios';
import { Booking } from '@/types';

// กำหนด Interface สำหรับผลลัพธ์ที่มี Pagination
export interface AdminBookingsResponse {
    data: Booking[];
    total: number;
    currentPage: number;
    totalPages: number;
}

export const bookingService = {
    // 1. จองตั๋ว (จะได้รับ trackingId กลับมา)
    create: async (data: { eventId: string; zoneName: string; quantity: number; seatNumbers?: string[] }): Promise<{
        trackingId: string;
        status: string;
        bookingId?: string;
        _id?: string;
    }> => {
        const response = await api.post('/bookings', data);
        return response.data;
    },

    // 2. เช็คสถานะคิว (สำหรับทำ Polling ในหน้า UI)
    checkStatus: async (trackingId: string): Promise<{ status: string; bookingId?: string; message?: string }> => {
        const response = await api.get(`/bookings/status/${trackingId}`);
        return response.data;
    },

    // 3. ดูประวัติการจองของตัวเอง
    getMyBookings: async (page: number = 1, limit: number = 10): Promise<Booking[]> => {
        const response = await api.get(`/bookings/myBookings?page=${page}&limit=${limit}`);
        return response.data;
    },

    getAll: async (isAdmin: boolean = false): Promise<Booking[]> => {
        // ถ้าเป็น Admin ให้เรียก all-bookings ถ้าไม่ใช่ให้เรียก myBookings
        const endpoint = isAdmin ? '/bookings/all-bookings' : '/bookings/myBookings';
        const response: any = await api.get(`${endpoint}?page=1&limit=1000`);

        // 🎯 หัวใจสำคัญ: เช็คโครงสร้างข้อมูลก่อนส่งกลับ
        // ถ้า response.data เป็น Array (แกะมาแล้วจาก Interceptor) ก็ส่งกลับเลย
        // ถ้าเป็น Object ให้ดึงฟิลด์ data ข้างในมาส่งกลับ
        const finalData = Array.isArray(response) ? response : response.data;

        return Array.isArray(finalData) ? finalData : [];
    },

    // getAllForAdmin สำหรับหน้า List ที่มี Pagination (คงเดิมแต่ทำให้ชัวร์)
    getAllForAdmin: async (page: number = 1, limit: number = 20): Promise<AdminBookingsResponse> => {
        const response: any = await api.get(`/bookings/all-bookings?page=${page}&limit=${limit}`);
        const data = Array.isArray(response.data) ? response.data : [];

        return {
            data: data,
            total: response.meta?.total || 0,
            currentPage: Number(response.meta?.page) || 1,
            totalPages: Math.ceil((response.meta?.total || 0) / (limit || 1))
        };
    },
    updateStatus: async (id: string, status: string): Promise<Booking> => {
        const response = await api.patch(`/bookings/${id}/status`, { status });
        return response.data;
    },

    // 6. Generic getAll for hooks that expect a simple list (fetches first page with high limit)

    refund: async (id: string) => {
        const response = await api.patch(`/bookings/${id}/status`, {
            status: 'refunded'
        });
        return response.data;
    },

    // อิงตาม @Patch(':id/status') หรือสร้าง Delete endpoint เพิ่มที่หลังบ้าน
    delete: async (id: string) => {
        const response = await api.delete(`/bookings/${id}`);
        return response.data;
    }
};