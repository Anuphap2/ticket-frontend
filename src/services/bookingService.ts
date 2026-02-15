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
    getMyBookings: async (): Promise<Booking[]> => {
        const response = await api.get('/bookings/myBookings');
        return response.data;
    },

    getAllForAdmin: async (page: number = 1, limit: number = 20): Promise<AdminBookingsResponse> => {
        const response: any = await api.get(`/bookings/all-bookings?page=${page}&limit=${limit}`);
        return {
            data: response.data,
            total: response.meta?.total || 0,
            currentPage: Number(response.meta?.page) || 1,
            totalPages: Math.ceil((response.meta?.total || 0) / limit)
        };
    },

    updateStatus: async (id: string, status: string): Promise<Booking> => {
        const response = await api.patch(`/bookings/${id}/status`, { status });
        return response.data;
    },

    // 6. Generic getAll for hooks that expect a simple list (fetches first page with high limit)
    getAll: async (): Promise<Booking[]> => {
        const response: any = await api.get('/bookings/all-bookings?page=1&limit=1000');
        // Axios interceptor returns the body object { success, data, meta }
        return response.data;
    }
};