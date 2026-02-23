import api from '@/lib/axios';
import { Booking, CreateBookingDto } from '@/types';
import { API_PATHS } from '@/lib/constants';

export interface AdminBookingsResponse {
    data: Booking[];
    total: number;
    currentPage: number;
    totalPages: number;
}

export const bookingService = {
    // Create a booking (returns trackingId for queue, or bookingId for direct)
    create: async (
        data: CreateBookingDto,
    ): Promise<{ trackingId?: string; bookingId?: string; _id?: string; status: string }> => {
        const response = await api.post(API_PATHS.bookings.base, data);
        return response.data;
    },

    // Poll queue status by trackingId
    checkStatus: async (
        trackingId: string,
    ): Promise<{ status: string; bookingId?: string; message?: string }> => {
        const response = await api.get(API_PATHS.bookings.status(trackingId));
        return response.data;
    },

    // Fetch current user's bookings — always returns Booking[]
    getMyBookings: async (page = 1, limit = 10): Promise<Booking[]> => {
        const response = await api.get(
            `${API_PATHS.bookings.myBookings}?page=${page}&limit=${limit}`,
        );
        // Normalise: backend may return array or { data: [] }
        const raw = Array.isArray(response) ? response : (response as any).data ?? response;
        return Array.isArray(raw) ? raw : [];
    },

    // Admin: fetch all bookings with pagination
    getAllForAdmin: async (
        page = 1,
        limit = 20,
    ): Promise<AdminBookingsResponse> => {
        const response: any = await api.get(
            `${API_PATHS.bookings.allBookings}?page=${page}&limit=${limit}`,
        );
        const data = Array.isArray(response.data) ? response.data : [];
        return {
            data,
            total: response.meta?.total ?? 0,
            currentPage: Number(response.meta?.page) || 1,
            totalPages: Math.ceil((response.meta?.total ?? 0) / limit),
        };
    },

    // Admin: fetch a large flat list (for dashboard stats)
    getAllFlat: async (): Promise<Booking[]> => {
        const response: any = await api.get(
            `${API_PATHS.bookings.allBookings}?page=1&limit=1000`,
        );
        const raw = Array.isArray(response) ? response : response.data;
        return Array.isArray(raw) ? raw : [];
    },

    updateStatus: async (id: string, status: string): Promise<Booking> => {
        const response = await api.patch(API_PATHS.bookings.updateStatus(id), { status });
        return response.data;
    },

    refund: async (id: string): Promise<Booking> => {
        const response = await api.patch(API_PATHS.bookings.updateStatus(id), {
            status: 'refunded',
        });
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(API_PATHS.bookings.delete(id));
    },
};